import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

export const preferredRegion = "iad1";
export const maxDuration = 30;

type AdvisorLang = "ru" | "en";

type RouteSummaryInput = {
  name: string;
  score: number;
  status?: string;
  warning?: string;
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
  answers?: Record<string, string>;
  userNote?: string;
  routesSummary?: RouteSummaryInput[];
  followUpAnswers?: FollowUpInput[];
};

const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
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
    if (typeof v === "string" && v.trim() && Object.keys(result).length < 40) {
      result[k.slice(0, 48)] = v.slice(0, 120);
    }
  }
  return result;
}

function sanitizeRoutes(raw: unknown): RouteSummaryInput[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 8).map((item) => {
    const obj = (item ?? {}) as Record<string, unknown>;
    return {
      name: String(obj.name ?? "Route").slice(0, 100),
      score: Number.isFinite(Number(obj.score)) ? Number(obj.score) : 0,
      status:
        typeof obj.status === "string" ? obj.status.slice(0, 40) : undefined,
      warning:
        typeof obj.warning === "string" ? obj.warning.slice(0, 220) : undefined,
    };
  });
}

function sanitizeFollowUps(raw: unknown): FollowUpInput[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, 10)
    .map((item) => {
      const obj = (item ?? {}) as Record<string, unknown>;
      return {
        question: String(obj.question ?? "").trim().slice(0, 200),
        answer: String(obj.answer ?? "").trim().slice(0, 300),
      };
    })
    .filter((item) => item.question && item.answer);
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    headline: {
      type: Type.STRING,
      description: "Short 1-sentence headline summarizing the user's situation.",
    },
    verdict: {
      type: Type.STRING,
      description:
        "2-4 sentences explaining the realistic picture and key bottleneck.",
    },
    topRoutes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          country: {
            type: Type.STRING,
            description: "Country name in the response language.",
          },
          name: {
            type: Type.STRING,
            description: "Best matching visa/route name for that country.",
          },
          alternativeVisas: {
            type: Type.STRING,
            description:
              "1-3 alternative visa codes worth checking in this country (e.g. 'F-1, J-1, O-1' or 'Ausbildung, Студенческая').",
          },
          matchPercent: {
            type: Type.INTEGER,
            description:
              "Estimated compatibility percentage from 5 to 95 (integer only).",
          },
          why: { type: Type.STRING },
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
      description:
        "3 to 5 specific legal, status, sponsorship, salary, or documentation nuances.",
    },
    financialOverview: {
      type: Type.STRING,
      description:
        "Brief high-level note about typical proof-of-funds or fee expectations (not a full budget breakdown).",
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
      description: "Targeted follow-up questions (empty array if round >= 3).",
    },
    nextSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2 to 4 concrete immediate actions.",
    },
    disclaimer: {
      type: Type.STRING,
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
    "disclaimer",
  ],
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientError(message: string): boolean {
  return (
    message.includes("503") ||
    message.includes("UNAVAILABLE") ||
    message.includes("high demand") ||
    message.includes("429") ||
    message.includes("500") ||
    message.includes("502") ||
    message.includes("504")
  );
}

function formatFriendlyError(
  rawMessage: string,
  lang: AdvisorLang
): { status: number; message: string } {
  const statusMatch = rawMessage.match(
    /\b(400|401|403|404|429|500|502|503|504)\b/
  );
  const status = statusMatch ? Number(statusMatch[1]) : 500;

  if (rawMessage.includes("User location is not supported")) {
    return {
      status: 400,
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
      message:
        lang === "ru"
          ? "Серверы Google ИИ временно перегружены (503). Нажмите кнопку ещё раз через пару секунд."
          : "Google AI servers are temporarily busy (503). Please try again in a few seconds.",
    };
  }

  if (status === 429) {
    return {
      status: 429,
      message:
        lang === "ru"
          ? "Превышен бесплатный лимит запросов в минуту (429). Подождите 30–60 секунд."
          : "Free-tier rate limit reached (429). Please wait a minute and try again.",
    };
  }

  return { status, message: rawMessage };
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "AI advisor is not configured on the server (missing GEMINI_API_KEY).",
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
      },
      { status: 429 }
    );
  }

  let body: AdvisorRequestBody;
  try {
    body = (await request.json()) as AdvisorRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
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
  const answers = sanitizeAnswers(body.answers);
  const userNote = String(body.userNote ?? "").trim().slice(0, 600);
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
        ? "In topRoutes you MUST evaluate and return ALL 6 countries of this platform: Германия, Нидерланды, Великобритания, Канада, Австралия, США — sorted from highest matchPercent to lowest."
        : "In topRoutes you MUST evaluate and return ALL 6 countries of this platform: Germany, Netherlands, United Kingdom, Canada, Australia, United States — sorted from highest matchPercent to lowest."
      : `In topRoutes return 4 to 6 specific visa routes for ${countryName}, sorted from highest matchPercent (5 to 95) to lowest.`;

  const questionCountRule =
    round >= 3
      ? "This is the final wrap-up (round >= 3). Return an EMPTY clarifyingQuestions array [] because both rounds of clarifying questions are complete."
      : round === 2
      ? "This is Round 2 of 2. Ask EXACTLY 2 deeper clarifyingQuestions (do NOT repeat any topic already answered in userFollowUpAnswers; focus on willingness to study/F-1/Ausbildung vs job search, timeline, or portfolio/sponsors)."
      : "This is Round 1 of 2. Return EXACTLY 3 targeted clarifyingQuestions (each with 2-4 short quickOptions) to identify education, language, and work/study status.";

  const profileNuanceRule =
    "IMPORTANT: When the user is young (e.g. 18-24), currently studying, or lacks a completed university degree, do NOT ignore study/training/exchange visas. Actively include options like F-1 Student (with OPT) and J-1 in the US, paid Ausbildung or Studienvisum in Germany, Study Permit + PGWP in Canada, Student Visa 500 in Australia, UK Student/Graduate, and NL Study/Orientation Year — either as the top route or clearly in alternativeVisas, noting scholarships/sponsors or paid training when funds are limited.";

  const systemInstruction = [
    "You are an immigration & visa information assistant inside the Esurpys navigator app.",
    `Respond strictly in ${lang === "ru" ? "Russian" : "English"}.`,
    coverageRule,
    questionCountRule,
    profileNuanceRule,
    "Stay grounded in the user's questionnaire answers, userNote, userFollowUpAnswers, and deterministic route scores.",
    "Never guarantee visa approval, never invent exact legal fees if uncertain, and never give false citizenship privileges.",
    "Explain key nuances (employer sponsorship, degree recognition, salary thresholds, visa history, status expiration, age cutoffs, proof of funds).",
    "For financialOverview: give only a concise high-level mention of typical proof-of-funds or government fees (do NOT build a multi-item moving budget).",
  ].join(" ");

  const prompt = JSON.stringify(
    {
      mode,
      round,
      target: { countryCode, countryName },
      userNote: userNote || undefined,
      questionnaireAnswers: answers,
      deterministicMatches: routesSummary,
      userFollowUpAnswers: followUpAnswers,
    },
    null,
    2
  );

  const contents = `Analyze this immigration profile and return structured guidance:\n\n${prompt}`;

  const attempts: Array<{
    model: string;
    useLowThinking: boolean;
    delayMs: number;
  }> = [
    { model: "gemini-4-hydrogen", useLowThinking: true, delayMs: 0 },
    { model: "gemini-3.1-flash-lite", useLowThinking: false, delayMs: 900 },
    { model: "gemini-4-hydrogen", useLowThinking: true, delayMs: 1800 },
  ];

  let lastErrorMessage = "Failed to generate AI advice.";

  for (const attempt of attempts) {
    if (attempt.delayMs > 0) {
      await sleep(attempt.delayMs);
    }

    try {
      const response = await ai.models.generateContent({
        model: attempt.model,
        contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          ...(attempt.useLowThinking
            ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
            : {}),
        },
      });

      const rawText = (response.text ?? "").trim();
      if (!rawText) {
        lastErrorMessage = "The AI service returned an empty response.";
        continue;
      }

      const parsed = JSON.parse(rawText);
      return NextResponse.json(parsed);
    } catch (err: unknown) {
      lastErrorMessage =
        err instanceof Error ? err.message : "Failed to generate AI advice.";
      console.error(`[ai-advisor] ${attempt.model} failed:`, lastErrorMessage);
      if (!isTransientError(lastErrorMessage)) {
        break;
      }
    }
  }

  const formatted = formatFriendlyError(lastErrorMessage, lang);
  return NextResponse.json(
    { error: formatted.message },
    { status: formatted.status }
  );
}