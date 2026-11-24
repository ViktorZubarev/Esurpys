import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

export const preferredRegion = "iad1";

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
    .slice(0, 6)
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
          name: { type: Type.STRING },
          fit: {
            type: Type.STRING,
            description:
              "Short status badge like 'High fit', 'Conditional', or 'Low fit'.",
          },
          why: { type: Type.STRING },
        },
        required: ["name", "fit", "why"],
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
      description:
        "1 to 3 targeted follow-up questions to narrow down visa eligibility.",
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

  const systemInstruction = [
    "You are an immigration & visa information assistant inside the Esurpys navigator app.",
    `Respond strictly in ${lang === "ru" ? "Russian" : "English"}.`,
    "If questionnaireAnswers is empty or sparse, start by briefly listing likely routes for the target country/global options and immediately ask 3 high-impact clarifyingQuestions (goal, citizenship, profession/job offer or study/family) so the user can get tailored results through conversation.",
    "Stay grounded in the user's questionnaire answers, userNote, follow-up answers, and deterministic route scores.",
    "Never guarantee visa approval, never invent exact legal fees if uncertain, and never give false citizenship privileges.",
    "Explain key nuances (employer sponsorship, degree recognition, salary thresholds, visa history, status expiration, age cutoffs).",
    "For financialOverview: give only a concise high-level mention of typical proof-of-funds or government fees (do NOT build a multi-item moving budget).",
    "Always return 1 to 3 targeted clarifyingQuestions with 2-4 short quickOptions each.",
  ].join(" ");

  const prompt = JSON.stringify(
    {
      mode,
      target: { countryCode, countryName },
      userNote: userNote || undefined,
      questionnaireAnswers: answers,
      deterministicMatches: routesSummary,
      userFollowUpAnswers: followUpAnswers,
    },
    null,
    2
  );

  try {
    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `Analyze this immigration profile and return structured guidance:\n\n${prompt}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const rawText = (response.text ?? "").trim();
    if (!rawText) {
      return NextResponse.json(
        { error: "The AI service returned an empty response." },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(rawText);
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const rawMessage =
      err instanceof Error ? err.message : "Failed to generate AI advice.";
    const statusMatch = rawMessage.match(/\b(400|401|403|404|429|500|503)\b/);
    const status = statusMatch ? Number(statusMatch[1]) : 500;

    if (rawMessage.includes("User location is not supported")) {
      const friendly =
        lang === "ru"
          ? "Запрос к Gemini API отклонён по региону вашего локального IP (локальный компьютер). После публикации на Vercel серверный маршрут настроен на регион США (iad1) и будет работать без этой ошибки; для теста с домашнего ПК нужен VPN."
          : "Gemini API rejected the request due to your local machine's region/IP. Once deployed on Vercel, this route runs in US East (iad1) where Gemini API is supported.";
      return NextResponse.json({ error: friendly }, { status: 400 });
    }

    return NextResponse.json({ error: rawMessage }, { status });
  }
}