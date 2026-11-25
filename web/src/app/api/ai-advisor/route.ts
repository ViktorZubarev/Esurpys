import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

export const preferredRegion = "iad1";
export const maxDuration = 30;

type AdvisorLang = "ru" | "en";
type PreferredModel = "gemini-4-hydrogen" | "gemini-3.1-flash-lite";

type RouteSummaryInput = {
  name: string;
  score: number;
};

type FollowUpInput = {
  question: string;
  answer: string;
};

type AdvisorRequestBody = {
  lang?: AdvisorLang;
  mode?: "world" | "country";
  countryCode?: string;
  countryName?: string;
  round?: number;
  preferredModel?: PreferredModel;
  answers?: Record<string, string>;
  userNote?: string;
  routesSummary?: RouteSummaryInput[];
  followUpAnswers?: FollowUpInput[];
};

const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 60;
const SINGLE_CALL_TIMEOUT_MS = 8_000;

const ipHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (ipHits.get(ip) ?? []).filter(
    (ts) => now - ts < RATE_WINDOW_MS
  );
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    ipHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  ipHits.set(ip, recent);
  return false;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") ?? "anonymous";
}

function sanitizeAnswers(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === "string" && v.trim() && Object.keys(result).length < 30) {
      result[k.slice(0, 48)] = v.slice(0, 100);
    }
  }
  return result;
}

function sanitizeRoutes(raw: unknown): RouteSummaryInput[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 6).map((item) => {
    const obj = (item ?? {}) as Record<string, unknown>;
    return {
      name: String(obj.name ?? "Route").slice(0, 60),
      score: Number.isFinite(Number(obj.score)) ? Number(obj.score) : 0,
    };
  });
}

function sanitizeFollowUps(raw: unknown): FollowUpInput[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, 8)
    .map((item) => {
      const obj = (item ?? {}) as Record<string, unknown>;
      return {
        question: String(obj.question ?? "").trim().slice(0, 160),
        answer: String(obj.answer ?? "").trim().slice(0, 200),
      };
    })
    .filter((item) => item.question && item.answer);
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    headline: {
      type: Type.STRING,
      description: "Short 1-sentence headline.",
    },
    verdict: {
      type: Type.STRING,
      description: "1-2 short sentences on realistic fit and main bottleneck.",
    },
    topRoutes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          country: { type: Type.STRING },
          name: { type: Type.STRING },
          alternativeVisas: {
            type: Type.STRING,
            description: "1-3 short visa codes, e.g. 'F-1, J-1, O-1'.",
          },
          matchPercent: { type: Type.INTEGER },
          why: {
            type: Type.STRING,
            description: "1 short sentence (max 14 words).",
          },
        },
        required: [
          "country",
          "name",
          "alternativeVisas",
          "matchPercent",
          "why",
        ],
      },
    },
    importantNuances: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 concise legal/practical nuances.",
    },
    financialOverview: {
      type: Type.STRING,
      description: "1 short sentence on typical proof-of-funds/fees.",
    },
    clarifyingQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          question: { type: Type.STRING },
          hint: { type: Type.STRING },
          quickOptions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["id", "question", "hint", "quickOptions"],
      },
    },
    nextSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2-3 concise action steps.",
    },
  },
  required: [
    "headline",
    "verdict",
    "topRoutes",
    "importantNuances",
    "financialOverview",
    "clarifyingQuestions",
    "nextSteps",
  ],
};

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error("504 Request timeout waiting for Gemini API"));
    }, ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function parseAiJson(rawText: string): unknown {
  const cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error("502 Invalid JSON returned by AI model.");
  }
}

function formatFriendlyError(
  rawMessage: string,
  lang: AdvisorLang
): { status: number; message: string; retryable: boolean } {
  const statusMatch = rawMessage.match(
    /\b(400|401|403|404|429|500|502|503|504)\b/
  );
  const status = statusMatch ? Number(statusMatch[1]) : 500;

  if (rawMessage.includes("User location is not supported")) {
    return {
      status: 400,
      retryable: false,
      message:
        lang === "ru"
          ? "Запрос отклонён по региону IP (обычно при локальном запуске без VPN)."
          : "Request rejected due to local IP region.",
    };
  }

  if (
    status === 503 ||
    rawMessage.includes("UNAVAILABLE") ||
    rawMessage.includes("high demand")
  ) {
    return {
      status: 503,
      retryable: true,
      message:
        lang === "ru"
          ? "Серверы Google ИИ временно перегружены (503). Нажмите «Повторить сейчас»."
          : "Google AI servers are temporarily busy (503). Please click Retry now.",
    };
  }

  if (status === 504 || status === 502 || status === 500) {
    return {
      status,
      retryable: true,
      message:
        lang === "ru"
          ? "Модель не успела ответить вовремя. Нажмите «Повторить сейчас»."
          : "The AI model timed out. Please click Retry now.",
    };
  }

  if (status === 429) {
    return {
      status: 429,
      retryable: true,
      message:
        lang === "ru"
          ? "Временный лимит бесплатного тарифа (429). Подождите 15–30 секунд и повторите."
          : "Free-tier rate limit reached (429). Please wait 15-30 seconds and retry.",
    };
  }

  return { status, retryable: false, message: rawMessage };
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "AI advisor is not configured on the server (missing GEMINI_API_KEY).",
        retryable: false,
      },
      { status: 503 }
    );
  }

  const clientIp = getClientIp(request);
  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      {
        error:
          "Too many AI requests. Please wait a minute before asking again.",
        retryable: true,
      },
      { status: 429 }
    );
  }

  let body: AdvisorRequestBody;
  try {
    body = (await request.json()) as AdvisorRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body.", retryable: false },
      { status: 400 }
    );
  }

  const lang: AdvisorLang = body.lang === "ru" ? "ru" : "en";
  const mode = body.mode === "country" ? "country" : "world";
  const countryName = String(body.countryName ?? "Global comparison").slice(
    0,
    80
  );
  const countryCode = String(body.countryCode ?? "GLOBAL").slice(0, 16);
  const round = Math.max(1, Math.min(3, Number(body.round) || 1));
  const modelName: PreferredModel =
    body.preferredModel === "gemini-3.1-flash-lite"
      ? "gemini-3.1-flash-lite"
      : "gemini-4-hydrogen";

  const answers = sanitizeAnswers(body.answers);
  const userNote = String(body.userNote ?? "").trim().slice(0, 500);
  const routesSummary = sanitizeRoutes(body.routesSummary);
  const followUpAnswers = sanitizeFollowUps(body.followUpAnswers);

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const coverageRule =
    mode === "world"
      ? lang === "ru"
        ? "In topRoutes return ALL 6 countries: Германия, Нидерланды, Великобритания, Канада, Австралия, США — sorted from highest matchPercent (5-95) to lowest."
        : "In topRoutes return ALL 6 countries: Germany, Netherlands, United Kingdom, Canada, Australia, United States — sorted from highest matchPercent (5-95) to lowest."
      : `In topRoutes return 4 to 6 visa routes for ${countryName}, sorted from highest matchPercent (5-95) to lowest.`;

  const questionCountRule =
    round >= 3
      ? "Round >= 3: return EMPTY clarifyingQuestions array []."
      : round === 2
      ? "Round 2 of 2: return EXACTLY 2 short clarifyingQuestions (do not repeat topics from userFollowUpAnswers; check study/F-1/Ausbildung openness, timeline, or sponsors)."
      : "Round 1 of 2: return EXACTLY 3 short clarifyingQuestions (2-4 short quickOptions each) covering education, language, and work/study status.";

  const profileNuanceRule =
    "If user is young (18-24), studying, or has no bachelor's degree, actively include study/training visas (F-1 + OPT / J-1 in US, Ausbildung / Studienvisum in Germany, Study Permit in Canada, Student 500 in Australia, UK Student/Graduate, NL Study) in the route or alternativeVisas, noting scholarship/sponsor nuances when budget is low.";

  const systemInstruction = [
    "You are a fast, concise visa assistant inside Esurpys.",
    `Respond strictly in ${lang === "ru" ? "Russian" : "English"}.`,
    "Keep every field ultra-short and crisp so JSON returns quickly.",
    coverageRule,
    questionCountRule,
    profileNuanceRule,
    "Never guarantee approval. Keep financialOverview to 1 brief sentence on proof-of-funds/fees.",
  ].join(" ");

  const promptPayload = {
    mode,
    round,
    target: { countryCode, countryName },
    userNote: userNote || undefined,
    answers,
    matches: routesSummary,
    followUps: followUpAnswers,
  };

  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: modelName,
        contents: `Analyze:\n${JSON.stringify(promptPayload)}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          ...(modelName === "gemini-4-hydrogen"
            ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
            : {}),
        },
      }),
      SINGLE_CALL_TIMEOUT_MS
    );

    const rawText = (response.text ?? "").trim();
    if (!rawText) {
      throw new Error("502 Empty response from AI.");
    }

    const parsed = parseAiJson(rawText);
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const rawMessage =
      err instanceof Error ? err.message : "Failed to generate AI advice.";
    console.error(`[ai-advisor] ${modelName} failed:`, rawMessage);

    const formatted = formatFriendlyError(rawMessage, lang);
    return NextResponse.json(
      {
        error: formatted.message,
        retryable: formatted.retryable,
        model: modelName,
      },
      { status: formatted.status }
    );
  }
}