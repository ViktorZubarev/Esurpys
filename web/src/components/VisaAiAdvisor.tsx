"use client";

import { useState } from "react";

export type AiRouteInput = {
  name: string;
  score: number;
  status?: string;
  warning?: string;
};

type ClarifyingQuestion = {
  id: string;
  question: string;
  hint: string;
  quickOptions: string[];
};

type FollowUpQA = {
  question: string;
  answer: string;
};

type AiAdvisorResult = {
  headline: string;
  verdict: string;
  topRoutes: Array<{
    country?: string;
    name: string;
    matchPercent: number;
    why: string;
  }>;
  importantNuances: string[];
  financialOverview: string;
  clarifyingQuestions: ClarifyingQuestion[];
  nextSteps: string[];
  disclaimer: string;
};

type VisaAiAdvisorProps = {
  lang: "ru" | "en";
  mode: "world" | "country";
  countryCode?: string;
  countryName?: string;
  answers: Record<string, string>;
  routesSummary: AiRouteInput[];
};

const MAX_ROUNDS = 2;

const TEXT = {
  ru: {
    badge: "БЕСПЛАТНЫЙ ИИ-СОВЕТНИК",
    title: "ИИ-подбор виз и важные нюансы",
    subtitle:
      "Опишите ситуацию в двух словах или сразу нажмите кнопку — ИИ оценит шансы в процентах по всем 6 странам и задаст 3 коротких уточняющих вопроса (максимум 2 раунда).",
    notePlaceholder:
      "Например: 20 лет, программист из РФ, опыт 1 год, бюджет небольшой...",
    startBtn: "Спросить ИИ",
    refreshBtn: "Обновить разбор с учётом ответов",
    loading: "ИИ анализирует профиль...",
    topRoutesWorld: "Оценка по всем 6 странам (в %)",
    topRoutesCountry: "Подходящие маршруты по стране (в %)",
    nuances: "Важные нюансы и подводные камни",
    finance: "Финансовые требования (ориентир)",
    questionsTitle: "Уточняющие вопросы от ИИ",
    questionsDone: "Все уточняющие вопросы заданы — итоговый разбор готов.",
    roundLabel: "Раунд",
    ofLabel: "из",
    answeredLabel: "Отвечено",
    questionLabel: "Вопрос",
    customPlaceholder: "Или напишите свой ответ...",
    nextSteps: "Ближайшие практические шаги",
    proTeaser:
      "Позже в Pro-версии: пошаговый калькулятор бюджета переезда, углублённый ИИ-разбор сложных кейсов и готовый PDF-отчёт.",
    errorPrefix: "Ошибка: ",
  },
  en: {
    badge: "FREE AI ADVISOR",
    title: "AI Visa Match & Key Nuances",
    subtitle:
      "Describe your situation briefly or click the button — AI estimates percentage fit across all 6 countries and asks 3 targeted follow-up questions (up to 2 rounds max).",
    notePlaceholder:
      "Example: 20yo software developer, 1 year experience, limited savings...",
    startBtn: "Ask AI Advisor",
    refreshBtn: "Update analysis with answers",
    loading: "AI is analyzing your profile...",
    topRoutesWorld: "Match Across All 6 Countries (%)",
    topRoutesCountry: "Matching Routes for This Country (%)",
    nuances: "Important Nuances & Pitfalls",
    finance: "Financial Expectations (High-Level)",
    questionsTitle: "Clarifying Questions from AI",
    questionsDone: "All clarifying rounds complete — final breakdown is ready.",
    roundLabel: "Round",
    ofLabel: "of",
    answeredLabel: "Answered",
    questionLabel: "Question",
    customPlaceholder: "Or type your own answer...",
    nextSteps: "Immediate Next Steps",
    proTeaser:
      "Coming later in Pro: full moving budget calculator, deep complex-case AI mode, and PDF preliminary report.",
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
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiAdvisorResult | null>(null);
  const [round, setRound] = useState(1);
  const [history, setHistory] = useState<FollowUpQA[]>([]);
  const [followUps, setFollowUps] = useState<Record<string, string>>({});

  async function runAdvisor(includeFollowUps: boolean) {
    setLoading(true);
    setError(null);

    const newEntries: FollowUpQA[] =
      includeFollowUps && result
        ? result.clarifyingQuestions
            .map((q) => ({
              question: q.question,
              answer: (followUps[q.id] ?? "").trim(),
            }))
            .filter((item) => item.answer.length > 0)
        : [];

    const nextRound = includeFollowUps ? Math.min(MAX_ROUNDS, round + 1) : 1;
    const mergedHistory = includeFollowUps ? [...history, ...newEntries] : [];

    try {
      const response = await fetch("/api/ai-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          mode,
          countryCode,
          countryName,
          round: nextRound,
          answers,
          userNote,
          routesSummary,
          followUpAnswers: mergedHistory,
        }),
      });

      const data = (await response.json()) as AiAdvisorResult & {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setResult(data);
      setRound(nextRound);
      setHistory(mergedHistory);
      setFollowUps({});
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unexpected error contacting AI."
      );
    } finally {
      setLoading(false);
    }
  }

  const questions = result?.clarifyingQuestions ?? [];
  const totalQuestions = questions.length;
  const answeredCount = questions.filter(
    (q) => (followUps[q.id] ?? "").trim().length > 0
  ).length;
  const questionsProgress =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

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

        <button
          type="button"
          disabled={loading}
          onClick={() => runAdvisor(false)}
          className="shrink-0 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? t.loading : t.startBtn}
        </button>
      </div>

      <div className="mt-4">
        <input
          type="text"
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
          placeholder={t.notePlaceholder}
          className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm leading-6 text-rose-200">
          {t.errorPrefix}
          {error}
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
                    {t.roundLabel} {round} {t.ofLabel} {MAX_ROUNDS} ·{" "}
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
                      key={q.id}
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

                      {q.quickOptions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {q.quickOptions.map((option) => {
                            const active = currentVal === option;
                            return (
                              <button
                                key={option}
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

              <button
                type="button"
                disabled={loading || answeredCount === 0}
                onClick={() => runAdvisor(true)}
                className="mt-4 rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-5 py-2.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? t.loading : t.refreshBtn}
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
                {result.topRoutes.map((route) => {
                  const pct = Math.max(
                    0,
                    Math.min(100, Math.round(Number(route.matchPercent) || 0))
                  );
                  return (
                    <div
                      key={`${route.country ?? ""}-${route.name}`}
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
                {result.importantNuances.map((item) => (
                  <li
                    key={item}
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
                  {result.nextSteps.map((step) => (
                    <li
                      key={step}
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

          <p className="text-xs leading-5 text-slate-500">
            {result.disclaimer}
          </p>
        </div>
      )}
    </section>
  );
}