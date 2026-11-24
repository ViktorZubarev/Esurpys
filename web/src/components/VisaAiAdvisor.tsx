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

type AiAdvisorResult = {
  headline: string;
  verdict: string;
  topRoutes: Array<{
    name: string;
    fit: string;
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

const TEXT = {
  ru: {
    badge: "БЕСПЛАТНЫЙ ИИ-СОВЕТНИК",
    title: "ИИ-подбор виз и важные нюансы",
    subtitle:
      "Не обязательно заполнять всю анкету вручную: опишите ситуацию в двух словах или сразу нажмите кнопку — нейросеть сама задаст уточняющие вопросы.",
    notePlaceholder:
      "Например: 27 лет, программист, 4 года опыта, английский B2, хочу переехать с женой без оффера...",
    startBtn: "Спросить ИИ",
    refreshBtn: "Обновить разбор с учётом ответов",
    loading: "ИИ анализирует профиль...",
    topRoutes: "Подходящие направления и маршруты",
    nuances: "Важные нюансы и подводные камни",
    finance: "Финансовые требования (ориентир)",
    questionsTitle: "Уточняющие вопросы от ИИ",
    questionsNote:
      "Выберите готовый вариант или напишите свой ответ и нажмите «Обновить разбор».",
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
      "No need to finish every question first: describe your goal briefly or click the button — the assistant will ask targeted follow-up questions.",
    notePlaceholder:
      "Example: 27yo software engineer, 4 years experience, good English, relocating with spouse without a job offer yet...",
    startBtn: "Ask AI Advisor",
    refreshBtn: "Update analysis with answers",
    loading: "AI is analyzing your profile...",
    topRoutes: "Priority Routes & Destinations",
    nuances: "Important Nuances & Pitfalls",
    finance: "Financial Expectations (High-Level)",
    questionsTitle: "Clarifying Questions from AI",
    questionsNote:
      "Pick a quick option or type your own answer, then click Update analysis.",
    customPlaceholder: "Or type your own answer...",
    nextSteps: "Immediate Next Steps",
    proTeaser:
      "Coming later in Pro: full moving budget calculator, deep complex-case AI mode, and PDF preliminary report.",
    errorPrefix: "Error: ",
  },
} as const;

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
  const [followUps, setFollowUps] = useState<Record<string, string>>({});

  async function runAdvisor(includeFollowUps: boolean) {
    setLoading(true);
    setError(null);

    const followUpPayload =
      includeFollowUps && result
        ? result.clarifyingQuestions
            .map((q) => ({
              question: q.question,
              answer: (followUps[q.id] ?? "").trim(),
            }))
            .filter((item) => item.answer.length > 0)
        : [];

    try {
      const response = await fetch("/api/ai-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          mode,
          countryCode,
          countryName,
          answers,
          userNote,
          routesSummary,
          followUpAnswers: followUpPayload,
        }),
      });

      const data = (await response.json()) as AiAdvisorResult & {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setResult(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unexpected error contacting AI."
      );
    } finally {
      setLoading(false);
    }
  }

  const hasFollowUpInput = Object.values(followUps).some(
    (v) => v.trim().length > 0
  );

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

          {result.clarifyingQuestions.length > 0 && (
            <div className="rounded-2xl border border-cyan-400/25 bg-cyan-500/5 p-5">
              <h3 className="text-base font-semibold text-cyan-200">
                {t.questionsTitle}
              </h3>
              <p className="mt-1 text-xs text-slate-400">{t.questionsNote}</p>

              <div className="mt-4 space-y-4">
                {result.clarifyingQuestions.map((q) => {
                  const currentVal = followUps[q.id] ?? "";
                  return (
                    <div
                      key={q.id}
                      className="rounded-xl border border-white/10 bg-slate-900/80 p-4"
                    >
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
                disabled={loading || !hasFollowUpInput}
                onClick={() => runAdvisor(true)}
                className="mt-4 rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-5 py-2.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? t.loading : t.refreshBtn}
              </button>
            </div>
          )}

          {result.topRoutes.length > 0 && (
            <div>
              <h3 className="mb-3 text-base font-semibold text-white">
                {t.topRoutes}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {result.topRoutes.map((route) => (
                  <div
                    key={route.name}
                    className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white">
                        {route.name}
                      </span>
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-0.5 text-xs font-medium text-cyan-300">
                        {route.fit}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-300">
                      {route.why}
                    </p>
                  </div>
                ))}
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