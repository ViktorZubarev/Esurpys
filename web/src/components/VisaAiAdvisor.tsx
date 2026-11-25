"use client";

import { useEffect, useRef, useState } from "react";

export type AiRouteInput = {
  name: string;
  score: number;
  status?: string;
  warning?: string;
};

type AiTopRoute = {
  country?: string;
  name: string;
  alternativeVisas?: string;
  matchPercent: number;
  why: string;
};

type AiQuestion = {
  id: string;
  question: string;
  hint: string;
  quickOptions: string[];
};

type AiAdvisorResult = {
  headline: string;
  verdict: string;
  topRoutes: AiTopRoute[];
  importantNuances: string[];
  financialOverview: string;
  clarifyingQuestions: AiQuestion[];
  nextSteps: string[];
};

type FollowUpQA = {
  question: string;
  answer: string;
};

type PreferredModel = "gemini-4-hydrogen" | "gemini-3.1-flash-lite";

type VisaAiAdvisorProps = {
  lang: "ru" | "en";
  mode: "world" | "country";
  countryCode: string;
  countryName: string;
  answers: Record<string, string>;
  routesSummary: AiRouteInput[];
};

const MAX_ROUNDS = 2;

const WAVE_DELAYS_MS = [0, 900, 1800, 3000, 4500, 6500] as const;

const MODELS_DEFAULT: readonly PreferredModel[] = [
  "gemini-4-hydrogen",
  "gemini-3.1-flash-lite",
  "gemini-4-hydrogen",
  "gemini-3.1-flash-lite",
  "gemini-4-hydrogen",
  "gemini-3.1-flash-lite",
];

const MODELS_LITE_FIRST: readonly PreferredModel[] = [
  "gemini-3.1-flash-lite",
  "gemini-4-hydrogen",
  "gemini-3.1-flash-lite",
  "gemini-4-hydrogen",
  "gemini-3.1-flash-lite",
  "gemini-4-hydrogen",
];

const TEXT = {
  ru: {
    badge: "БЕСПЛАТНЫЙ ИИ-СОВЕТНИК",
    title: "ИИ-подбор виз и важные нюансы",
    subtitle:
      "Опишите ситуацию в двух словах или сразу нажмите кнопку — ИИ оценит шансы в процентах по всем 6 странам и проведёт 2 коротких раунда уточняющих вопросов.",
    notePlaceholder:
      "Например: 20 лет, программист из РФ, учусь, мало денег (интересует в т.ч. учёба/F-1)...",
    startBtn: "Спросить ИИ",
    cancelBtn: "Отменить",
    nextRoundBtn: "Перейти к раунду 2 (уточнить детали) →",
    finishBtn: "Получить итоговый разбор →",
    retryBtn: "Повторить сейчас",
    loading: "ИИ анализирует профиль...",
    retrying: "Высокая нагрузка на Google ИИ — пробую резервный канал",
    timeoutError:
      "Сервер не успел ответить за отведённое время. Нажмите «Повторить сейчас».",
    topRoutesWorld: "Оценка по всем 6 странам (в %)",
    topRoutesCountry: "Подходящие маршруты по стране (в %)",
    altVisasLabel: "Также рассмотреть:",
    nuances: "Важные нюансы и подводные камни",
    finance: "Финансовые требования (ориентир)",
    questionsTitle: "Уточняющие вопросы от ИИ",
    questionsDone: "Оба раунда вопросов пройдены — ниже ваш итоговый разбор.",
    readyHint: "Ответы выбраны — нажмите кнопку внизу, чтобы продолжить.",
    roundLabel: "Раунд",
    ofLabel: "из",
    answeredLabel: "Отвечено",
    questionLabel: "Вопрос",
    customPlaceholder: "Или напишите свой ответ...",
    nextSteps: "Ближайшие практические шаги",
    proTeaser:
      "Позже в Pro-версии: пошаговый калькулятор бюджета переезда, углублённый ИИ-разбор сложных кейсов и готовый PDF-отчёт.",
    disclaimer:
      "ИИ-разбор носит справочный характер, не гарантирует одобрение визы и не заменяет консультацию лицензированного иммиграционного юриста. Проверяйте актуальные пороги на официальных правительственных порталах.",
    errorPrefix: "Ошибка: ",
  },
  en: {
    badge: "FREE AI ADVISOR",
    title: "AI Visa Match & Key Nuances",
    subtitle:
      "Describe your situation briefly or click the button — AI estimates percentage fit across all 6 countries and runs 2 short rounds of clarifying questions.",
    notePlaceholder:
      "Example: 20yo software developer, student, limited budget (also open to F-1 / study)...",
    startBtn: "Ask AI Advisor",
    cancelBtn: "Cancel",
    nextRoundBtn: "Continue to Round 2 →",
    finishBtn: "Get Final Analysis →",
    retryBtn: "Retry now",
    loading: "AI is analyzing your profile...",
    retrying: "Google AI is busy — switching to backup channel",
    timeoutError:
      "The server did not respond in time. Please click Retry now.",
    topRoutesWorld: "Match Across All 6 Countries (%)",
    topRoutesCountry: "Matching Routes for This Country (%)",
    altVisasLabel: "Also consider:",
    nuances: "Important Nuances & Pitfalls",
    finance: "Financial Expectations (High-Level)",
    questionsTitle: "Clarifying Questions from AI",
    questionsDone: "Both clarifying rounds complete — final breakdown is below.",
    readyHint: "Answers selected — click the button below to continue.",
    roundLabel: "Round",
    ofLabel: "of",
    answeredLabel: "Answered",
    questionLabel: "Question",
    customPlaceholder: "Or type your own answer...",
    nextSteps: "Immediate Next Steps",
    proTeaser:
      "Coming later in Pro: full moving budget calculator, deep complex-case AI mode, and PDF preliminary report.",
    disclaimer:
      "This AI summary is informational only, does not guarantee visa approval, and is not legal advice. Always verify current eligibility rules on official government websites.",
    errorPrefix: "Error: ",
  },
} as const;

function percentBadgeStyle(pct: number): string {
  if (pct >= 65) {
    return "border-emerald-400/30 bg-emerald-400/15 text-emerald-300";
  }
  if (pct >= 35) {
    return "border-amber-400/30 bg-amber-400/15 text-amber-200";
  }
  return "border-slate-600/40 bg-slate-800/80 text-slate-300";
}

function percentBarColor(pct: number): string {
  if (pct >= 65) return "from-emerald-500 to-cyan-400";
  if (pct >= 35) return "from-amber-400 to-cyan-400";
  return "from-slate-500 to-slate-400";
}

function waitWithSignal(ms: number, signal: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    function onAbort() {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    }
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export default function VisaAiAdvisor({
  lang,
  mode,
  countryCode,
  countryName,
  answers,
  routesSummary,
}: VisaAiAdvisorProps) {
  const t = TEXT[lang];
  const [userNote, setUserNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastIncludeFollowUps, setLastIncludeFollowUps] = useState(false);
  const [result, setResult] = useState<AiAdvisorResult | null>(null);
  const [round, setRound] = useState(1);
  const [history, setHistory] = useState<FollowUpQA[]>([]);
  const [followUps, setFollowUps] = useState<Record<string, string>>({});

  const preferLiteRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  function cancelActiveRequest() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setLoading(false);
    setStatusText(null);
  }

  async function runAdvisor(includeFollowUps: boolean) {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setStatusText(t.loading);
    setLastIncludeFollowUps(includeFollowUps);

    const newEntries: FollowUpQA[] =
      includeFollowUps && result
        ? result.clarifyingQuestions
            .map((q) => ({
              question: q.question,
              answer: (followUps[q.id] ?? "").trim(),
            }))
            .filter((item) => item.answer.length > 0)
        : [];

    const nextRound = includeFollowUps ? round + 1 : 1;
    const mergedHistory = includeFollowUps ? [...history, ...newEntries] : [];
    const modelSequence = preferLiteRef.current
      ? MODELS_LITE_FIRST
      : MODELS_DEFAULT;

    try {
      for (let i = 0; i < modelSequence.length; i++) {
        const preferredModel = modelSequence[i];
        const delayMs = WAVE_DELAYS_MS[i] ?? 4000;

        if (i > 0) {
          setStatusText(`${t.retrying} (${i + 1}/${modelSequence.length})...`);
          await waitWithSignal(delayMs, controller.signal);
        }

        const response = await fetch("/api/ai-advisor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            lang,
            mode,
            countryCode,
            countryName,
            round: nextRound,
            preferredModel,
            answers,
            userNote,
            routesSummary: routesSummary.slice(0, 6).map((r) => ({
              name: r.name,
              score: r.score,
            })),
            followUpAnswers: mergedHistory,
          }),
        });

        const rawText = await response.text();
        let data: (Partial<AiAdvisorResult> & {
          error?: string;
          retryable?: boolean;
        }) | null = null;

        try {
          data = JSON.parse(rawText) as Partial<AiAdvisorResult> & {
            error?: string;
            retryable?: boolean;
          };
        } catch {
          data = null;
        }

        if (response.ok && data) {
          preferLiteRef.current = preferredModel === "gemini-3.1-flash-lite";
          const normalized: AiAdvisorResult = {
            headline: String(data.headline ?? ""),
            verdict: String(data.verdict ?? ""),
            topRoutes: Array.isArray(data.topRoutes) ? data.topRoutes : [],
            importantNuances: Array.isArray(data.importantNuances)
              ? data.importantNuances
              : [],
            financialOverview: String(data.financialOverview ?? ""),
            clarifyingQuestions: Array.isArray(data.clarifyingQuestions)
              ? data.clarifyingQuestions
              : [],
            nextSteps: Array.isArray(data.nextSteps) ? data.nextSteps : [],
          };
          setResult(normalized);
          setRound(nextRound);
          setHistory(mergedHistory);
          setFollowUps({});
          return;
        }

        if (
          preferredModel === "gemini-4-hydrogen" &&
          response.status === 503
        ) {
          preferLiteRef.current = true;
        }

        const errorMsg =
          data?.error ??
          (response.status === 504 || response.status === 502
            ? t.timeoutError
            : `HTTP ${response.status}`);

        const isRetryable =
          (data?.retryable ?? [429, 500, 502, 503, 504].includes(response.status)) &&
          !errorMsg.includes("GEMINI_API_KEY") &&
          i < modelSequence.length - 1;

        if (!isRetryable) {
          throw new Error(errorMsg);
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setError(
        err instanceof Error ? err.message : "Unexpected error contacting AI."
      );
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        setLoading(false);
        setStatusText(null);
      }
    }
  }

  const questions = result?.clarifyingQuestions ?? [];
  const totalQuestions = questions.length;
  const answeredCount = questions.filter(
    (q) => (followUps[q.id] ?? "").trim().length > 0
  ).length;
  const questionsProgress =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const displayRound = Math.min(round, MAX_ROUNDS);

  return (
    <section className="rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 p-5 shadow-xl shadow-black/25 sm:p-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <span className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold tracking-wider text-cyan-300">
            {t.badge}
          </span>
          <h2 className="mt-2.5 text-xl font-bold text-white sm:text-2xl">
            {t.title}
          </h2>
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-300">
            {t.subtitle}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => runAdvisor(false)}
            className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? statusText ?? t.loading : t.startBtn}
          </button>

          {loading && (
            <button
              type="button"
              onClick={cancelActiveRequest}
              className="rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-3 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              {t.cancelBtn}
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        <input
          type="text"
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) {
              e.preventDefault();
              void runAdvisor(false);
            }
          }}
          placeholder={t.notePlaceholder}
          className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
      </div>

      {error && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm leading-6 text-rose-200">
          <span>
            {t.errorPrefix}
            {error}
          </span>
          <button
            type="button"
            disabled={loading}
            onClick={() => runAdvisor(lastIncludeFollowUps)}
            className="shrink-0 rounded-lg border border-rose-400/40 bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/30 disabled:opacity-50"
          >
            {t.retryBtn}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-6 border-t border-white/10 pt-6">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <h3 className="text-lg font-bold text-white">{result.headline}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {result.verdict}
            </p>
          </div>

          {totalQuestions > 0 ? (
            <div className="rounded-2xl border border-cyan-400/25 bg-cyan-500/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-cyan-200">
                    {t.questionsTitle}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {t.roundLabel} {displayRound} {t.ofLabel} {MAX_ROUNDS} ·{" "}
                    {t.answeredLabel}: {answeredCount} {t.ofLabel}{" "}
                    {totalQuestions}
                  </p>
                </div>

                <span className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold tabular-nums text-cyan-200">
                  {answeredCount} / {totalQuestions}
                </span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                  style={{ width: `${questionsProgress}%` }}
                />
              </div>

              <div className="mt-4 space-y-4">
                {questions.map((q, index) => {
                  const currentVal = followUps[q.id] ?? "";
                  return (
                    <div
                      key={`${index}-${q.id}`}
                      className="rounded-xl border border-white/10 bg-slate-900/80 p-4"
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                          {t.questionLabel} {index + 1} {t.ofLabel}{" "}
                          {totalQuestions}
                        </span>
                        {currentVal.trim().length > 0 && (
                          <span className="text-[11px] font-medium text-emerald-300">
                            ✓
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-medium text-white">
                        {q.question}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{q.hint}</p>

                      {Array.isArray(q.quickOptions) && q.quickOptions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {q.quickOptions.map((option, optIdx) => {
                            const active = currentVal === option;
                            return (
                              <button
                                key={`${optIdx}-${option}`}
                                type="button"
                                onClick={() =>
                                  setFollowUps((prev) => ({
                                    ...prev,
                                    [q.id]: option,
                                  }))
                                }
                                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                                  active
                                    ? "border-cyan-400 bg-cyan-400/15 text-cyan-200"
                                    : "border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-500"
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <input
                        type="text"
                        value={currentVal}
                        onChange={(e) =>
                          setFollowUps((prev) => ({
                            ...prev,
                            [q.id]: e.target.value,
                          }))
                        }
                        placeholder={t.customPlaceholder}
                        className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  );
                })}
              </div>

              {answeredCount === totalQuestions && (
                <p className="mt-4 text-xs font-medium text-emerald-300">
                  ✓ {t.readyHint}
                </p>
              )}

              <button
                type="button"
                disabled={loading || answeredCount === 0}
                onClick={() => runAdvisor(true)}
                className={`mt-3 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  answeredCount === totalQuestions
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-lg shadow-cyan-950/30 hover:opacity-90"
                    : "border border-cyan-400/40 bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25"
                }`}
              >
                {loading
                  ? statusText ?? t.loading
                  : round < MAX_ROUNDS
                  ? t.nextRoundBtn
                  : t.finishBtn}
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/5 px-4 py-3 text-xs font-medium text-emerald-200">
              ✓ {t.questionsDone}
            </div>
          )}

          {result.topRoutes.length > 0 && (
            <div>
              <h3 className="mb-3 text-base font-semibold text-white">
                {mode === "world" ? t.topRoutesWorld : t.topRoutesCountry}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {result.topRoutes.map((route, idx) => {
                  const pct = Math.max(
                    0,
                    Math.min(100, Math.round(Number(route.matchPercent) || 0))
                  );
                  return (
                    <div
                      key={`${idx}-${route.country ?? ""}-${route.name}`}
                      className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {route.country && (
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                              {route.country}
                            </p>
                          )}
                          <h4 className="mt-0.5 font-semibold leading-5 text-white">
                            {route.name}
                          </h4>
                        </div>
                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold tabular-nums ${percentBadgeStyle(
                            pct
                          )}`}
                        >
                          {pct}%
                        </span>
                      </div>

                      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${percentBarColor(
                            pct
                          )} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <p className="mt-2.5 text-xs leading-5 text-slate-300">
                        {route.why}
                      </p>

                      {route.alternativeVisas && (
                        <p className="mt-2 text-[11px] leading-4 text-cyan-300/90">
                          <span className="text-slate-400">
                            {t.altVisasLabel}{" "}
                          </span>
                          {route.alternativeVisas}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <h3 className="text-base font-semibold text-amber-200">
                {t.nuances}
              </h3>
              <ul className="mt-3 space-y-2">
                {result.importantNuances.map((item, idx) => (
                  <li
                    key={`${idx}-${item}`}
                    className="flex gap-2 text-sm leading-6 text-slate-300"
                  >
                    <span className="text-amber-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <h3 className="text-base font-semibold text-emerald-300">
                  {t.nextSteps}
                </h3>
                <ul className="mt-3 space-y-2">
                  {result.nextSteps.map((step, idx) => (
                    <li
                      key={`${idx}-${step}`}
                      className="flex gap-2 text-sm leading-6 text-slate-300"
                    >
                      <span className="text-emerald-400">→</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <h3 className="text-sm font-semibold text-slate-200">
                  {t.finance}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {result.financialOverview}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-xs text-slate-400">
            {t.proTeaser}
          </div>

          <p className="text-xs leading-5 text-slate-500">{t.disclaimer}</p>
        </div>
      )}
    </section>
  );
}