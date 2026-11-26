"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import CountryFlag from "@/components/CountryFlag";
import VisaAiAdvisor from "@/components/VisaAiAdvisor";
import type {
  Answers,
  CountryQuizConfig,
  QuizOption,
  QuizQuestion,
  QuizRoute,
} from "@/lib/country-quiz-types";
import {
  evaluateCountryRoute,
  getFilteredOptions,
  isQuestionVisible,
  normalizeWorldAnswersForCountry,
} from "@/lib/quiz-intelligence";
import {
  extractWorldAnswersFromNote,
  loadWorldProfile,
} from "@/lib/shared-profile";
import EsurpysNavigation from "@/shared/EsurpysNavigation";
import { useLanguage } from "@/shared/LanguageProvider";

function isAnswered(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

function getOptionText(option: QuizOption, isEnglish: boolean) {
  const ruText = option.ru ?? option.label ?? option.en ?? option.value;
  if (isEnglish) return option.en ?? ruText;
  return ruText;
}

function getQuestionText(question: QuizQuestion, isEnglish: boolean) {
  if (isEnglish) return question.en;
  return question.ru ?? question.title ?? question.en;
}

function getQuestionDescription(question: QuizQuestion, isEnglish: boolean) {
  const ruDesc = question.descriptionRu ?? question.description;
  if (isEnglish) return question.descriptionEn ?? ruDesc;
  return ruDesc;
}

function getRouteField(
  route: QuizRoute,
  field: "title" | "category" | "description",
  isEnglish: boolean
) {
  if (field === "title") {
    return isEnglish
      ? route.titleEn
      : (route.titleRu ?? route.title ?? route.titleEn);
  }
  if (field === "category") {
    return isEnglish
      ? route.categoryEn
      : (route.categoryRu ?? route.category ?? route.categoryEn);
  }
  return isEnglish
    ? route.descriptionEn
    : (route.descriptionRu ?? route.description ?? route.descriptionEn);
}

function getRouteList(
  route: QuizRoute,
  field: "requirements" | "limitations",
  isEnglish: boolean
) {
  if (field === "requirements") {
    return isEnglish
      ? route.requirementsEn
      : (route.requirementsRu ?? route.requirements ?? route.requirementsEn);
  }
  return isEnglish
    ? route.limitationsEn
    : (route.limitationsRu ?? route.limitations ?? route.limitationsEn);
}

export default function CountryVisaQuiz({
  config,
}: {
  config: CountryQuizConfig;
}) {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const lang: "en" | "ru" = isEnglish ? "en" : "ru";
  const t = isEnglish ? config.copy.en : config.copy.ru;

  const [answers, setAnswers] = useState<Answers>({});
  const [prefilledFromWorld, setPrefilledFromWorld] = useState(false);
  const [smartMode, setSmartMode] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);
  const questionsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const world = loadWorldProfile();
      if (Object.keys(world).length === 0) return;
      const normalized = normalizeWorldAnswersForCountry(config.id, world);
      const validIds = new Set(config.questions.map((q) => q.id));
      const matched: Answers = {};

      for (const [k, v] of Object.entries(normalized)) {
        if (!validIds.has(k)) continue;
        const question = config.questions.find((q) => q.id === k);
        if (question?.options.some((o) => o.value === v)) {
          matched[k] = v;
        }
      }

      if (Object.keys(matched).length > 0) {
        setAnswers((current) =>
          Object.keys(current).length === 0 ? matched : current
        );
        setPrefilledFromWorld(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [config.id, config.questions]);

  useEffect(() => {
    function closeOpenDropdowns(target: EventTarget | null) {
      const container = questionsListRef.current;
      if (!container) return;
      const openDetails = container.querySelectorAll<HTMLDetailsElement>(
        "details[open]"
      );
      openDetails.forEach((details) => {
        if (!(target instanceof Node) || !details.contains(target)) {
          details.open = false;
        }
      });
    }

    function handlePointerDown(event: PointerEvent) {
      closeOpenDropdowns(event.target);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeOpenDropdowns(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const visibleQuestions = useMemo(() => {
    if (!smartMode) return config.questions;
    return config.questions.filter((q) =>
      isQuestionVisible(config.id, q, answers)
    );
  }, [answers, config.id, config.questions, smartMode]);

  const hiddenCount = config.questions.length - visibleQuestions.length;

  const answered = useMemo(
    () =>
      visibleQuestions.filter((question) => isAnswered(answers[question.id]))
        .length,
    [answers, visibleQuestions]
  );

  const progress =
    visibleQuestions.length > 0
      ? Math.round((answered / visibleQuestions.length) * 100)
      : 0;

  const results = useMemo(
    () =>
      config.routes
        .map((route) => {
          const evaluation = evaluateCountryRoute(
            config,
            route,
            answers,
            isEnglish
          );
          return {
            ...route,
            score: evaluation.score,
            evaluation,
          };
        })
        .filter((route) => route.score > 0)
        .sort((a, b) => b.score - a.score),
    [answers, config, isEnglish]
  );

  const visibleResults = showAll ? results : results.slice(0, 8);

  const hasImmigrationHistory = config.conditions?.hasImmigrationHistory
    ? config.conditions.hasImmigrationHistory(answers)
    : Boolean(answers.immigrationHistory) &&
      !["none", "no", "unknown", "prefer"].includes(answers.immigrationHistory);

  const hasExpiredStatus = config.conditions?.hasExpiredStatus
    ? config.conditions.hasExpiredStatus(answers)
    : answers.status === "expired";

  const protectionRelevant = config.conditions?.protectionRelevant
    ? config.conditions.protectionRelevant(answers)
    : answers.goal === "protection" ||
      answers.protection === "yes" ||
      answers.protection === "unsure";

  const visitRelevant = config.conditions?.visitRelevant
    ? config.conditions.visitRelevant(answers)
    : answers.goal === "visit";

  function updateAnswer(questionId: string, value: string) {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
  }

  function resetAnswers() {
    setAnswers({});
    setPrefilledFromWorld(false);
    setShowAll(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function getSelectedOptionLabel(question: QuizQuestion, value: string) {
    const option = question.options.find((item) => item.value === value);
    return option ? getOptionText(option, isEnglish) : value;
  }

  function showResultsAndScroll() {
    setShowAll(false);
    window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  function scrollToAi() {
    aiRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function applyNoteToQuiz(note: string) {
    const worldParsed = extractWorldAnswersFromNote(note);
    const mapped = normalizeWorldAnswersForCountry(config.id, worldParsed);
    if (Object.keys(mapped).length > 0) {
      setAnswers((current) => ({ ...current, ...mapped }));
    }
    showResultsAndScroll();
  }

  function statusBadge(status: "strong" | "conditional" | "low") {
    if (status === "strong") {
      return {
        label: isEnglish ? "Strong match" : "Высокий шанс",
        className: "bg-emerald-400/15 text-emerald-300 border-emerald-400/25",
      };
    }
    if (status === "conditional") {
      return {
        label: isEnglish ? "Conditional" : "Есть условия",
        className: "bg-amber-400/15 text-amber-200 border-amber-400/25",
      };
    }
    return {
      label: isEnglish ? "Needs review" : "Низкий / требует проверки",
      className: "bg-slate-700/50 text-slate-300 border-slate-600/40",
    };
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <EsurpysNavigation />

      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/30 p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex items-center gap-3">
                <CountryFlag
                  code={config.flagCode}
                  name={config.countryNameEn}
                  className="h-12 w-18 rounded-md ring-1 ring-white/10"
                />
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {t.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                {t.subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={resetAnswers}
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/10"
            >
              {t.reset}
            </button>
          </div>

          {prefilledFromWorld && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-2.5 text-xs text-cyan-100">
              <span>
                {isEnglish
                  ? "Pre-filled overlapping answers from your World Navigator profile — feel free to adjust any item."
                  : "Мы подставили подходящие ответы из вашей анкеты World Navigator — любой пункт можно изменить."}
              </span>
              <button
                type="button"
                onClick={() => setPrefilledFromWorld(false)}
                className="font-semibold text-cyan-300 hover:underline"
              >
                {isEnglish ? "Hide" : "Скрыть"}
              </button>
            </div>
          )}

          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-400">
              <span>
                {t.progress}: {answered} {t.of} {visibleQuestions.length}{" "}
                {t.questions}
              </span>
              <span>{progress}%</span>
            </div>

            <div
              className="h-2 overflow-hidden rounded-full bg-slate-800"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${t.progress}: ${progress}%`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </header>

        {/* Бесплатный ИИ-советник сразу на первом экране под шапкой */}
        <div ref={aiRef} className="mb-8 scroll-mt-6">
          <VisaAiAdvisor
            lang={lang}
            mode="country"
            countryCode={config.flagCode}
            countryName={config.countryNameEn}
            answers={answers}
            routesSummary={results.slice(0, 6).map((route) => ({
              name: getRouteField(route, "title", isEnglish),
              score: route.score,
              status: route.evaluation.status,
              warning:
                config.getRouteWarning(route.id, answers, isEnglish) ??
                undefined,
            }))}
            onQuickCalculate={applyNoteToQuiz}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_430px]">
          <section aria-label={t.allQuestions} className="min-w-0">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {t.allQuestions}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {isEnglish
                    ? "Choose the answer that best describes your situation."
                    : "Выберите ответы, которые лучше всего описывают вашу ситуацию."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSmartMode((v) => !v)}
                className="self-start rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-400/40 sm:self-auto"
              >
                {smartMode
                  ? isEnglish
                    ? `Smart filter ON (${hiddenCount} irrelevant hidden)`
                    : `Умный фильтр: скрыто лишних (${hiddenCount})`
                  : isEnglish
                  ? "Showing all questions"
                  : "Показаны все вопросы"}
              </button>
            </div>

            <div ref={questionsListRef} className="space-y-4">
              {visibleQuestions.map((question, index) => {
                const value = answers[question.id] ?? "";
                const description = getQuestionDescription(question, isEnglish);
                const filteredOptions = getFilteredOptions(
                  config.id,
                  question,
                  answers
                );

                return (
                  <fieldset
                    key={question.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 transition hover:border-white/20 sm:p-6"
                  >
                    <legend className="sr-only">
                      {getQuestionText(question, isEnglish)}
                    </legend>

                    <div className="mb-4 flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/25 bg-cyan-400/10 text-sm font-semibold text-cyan-300">
                        {index + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold leading-6 text-white">
                          {getQuestionText(question, isEnglish)}
                        </h3>

                        {description && (
                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            {description}
                          </p>
                        )}
                      </div>

                      <span
                        className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs sm:inline-flex ${
                          value
                            ? "bg-emerald-400/10 text-emerald-300"
                            : "bg-white/5 text-slate-500"
                        }`}
                      >
                        {value ? t.answered : t.notAnswered}
                      </span>
                    </div>

                    <div className="relative mt-4">
                      <details className="group">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm transition hover:border-cyan-400/40 hover:bg-white/[0.05]">
                          <span className={value ? "text-white" : "text-slate-400"}>
                            {value
                              ? getSelectedOptionLabel(question, value)
                              : t.choose}
                          </span>
                          <span className="text-slate-400 transition group-open:rotate-180">
                            ▾
                          </span>
                        </summary>

                        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-slate-900 p-2 shadow-2xl">
                          {filteredOptions.map((option) => {
                            const selected = value === option.value;

                            return (
                              <label
                                key={option.value}
                                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                                  selected
                                    ? "bg-cyan-400/10 text-white"
                                    : "text-slate-300 hover:bg-white/[0.05]"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={question.id}
                                  value={option.value}
                                  checked={selected}
                                  onChange={(event) => {
                                    updateAnswer(question.id, option.value);
                                    const details =
                                      event.currentTarget.closest("details");
                                    if (details) details.open = false;
                                  }}
                                  className="h-4 w-4 shrink-0 accent-cyan-400"
                                />
                                <span>{getOptionText(option, isEnglish)}</span>
                                {selected && (
                                  <span className="ml-auto text-cyan-300">
                                    ✓
                                  </span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </details>
                    </div>
                  </fieldset>
                );
              })}
            </div>

            <button
              type="button"
              onClick={showResultsAndScroll}
              className="mt-6 w-full rounded-xl bg-cyan-400 px-5 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-300"
            >
              {t.showResults}
            </button>
          </section>

          <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
            <div
              ref={resultsRef}
              className="scroll-mt-6 rounded-2xl border border-white/10 bg-slate-900/70 p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {t.results}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {t.resultsDescription}
                  </p>
                </div>
                <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm font-semibold text-slate-300">
                  {results.length}
                </span>
              </div>

              <button
                type="button"
                onClick={scrollToAi}
                className="mt-4 w-full rounded-xl border border-cyan-400/35 bg-cyan-400/10 px-4 py-2.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
              >
                {isEnglish
                  ? "Update AI review with these answers ↑"
                  : "Обновить разбор в ИИ с учётом этих ответов ↑"}
              </button>

              <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/5 p-3 text-xs leading-5 text-amber-100/80">
                {t.scoreDisclaimer}
              </p>

              {results.length === 0 ? (
                <div className="mt-5 rounded-xl border border-dashed border-white/15 p-5">
                  <h3 className="font-semibold text-slate-200">
                    {t.noResults}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {t.noResultsDescription}
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {visibleResults.map((route, index) => {
                    const warning = config.getRouteWarning(
                      route.id,
                      answers,
                      isEnglish
                    );
                    const badge = statusBadge(route.evaluation.status);

                    return (
                      <article
                        key={route.id}
                        className="rounded-xl border border-white/10 bg-slate-950/70 p-4 transition hover:border-cyan-400/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className="rounded-md bg-cyan-400/10 px-2 py-1 text-[11px] font-medium text-cyan-300">
                                {getRouteField(route, "category", isEnglish)}
                              </span>
                              <span
                                className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${badge.className}`}
                              >
                                {badge.label}
                              </span>
                              {index === 0 && (
                                <span className="rounded-md bg-emerald-400/10 px-2 py-1 text-[11px] font-medium text-emerald-200">
                                  {t.top}
                                </span>
                              )}
                            </div>

                            <h3 className="font-semibold leading-6 text-white">
                              {getRouteField(route, "title", isEnglish)}
                            </h3>
                          </div>

                          <div className="shrink-0 text-right">
                            <div className="text-xl font-bold tabular-nums text-cyan-300">
                              {route.score}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              /100
                            </div>
                          </div>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-400">
                          {getRouteField(route, "description", isEnglish)}
                        </p>

                        {(route.evaluation.met.length > 0 ||
                          route.evaluation.missing.length > 0 ||
                          route.evaluation.blockers.length > 0) && (
                          <div className="mt-3 space-y-1.5 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs">
                            {route.evaluation.met.map((item) => (
                              <p key={item} className="text-emerald-300">
                                ✓ {item}
                              </p>
                            ))}
                            {route.evaluation.missing.map((item) => (
                              <p key={item} className="text-amber-200">
                                ○ {item}
                              </p>
                            ))}
                            {route.evaluation.blockers.map((item) => (
                              <p key={item} className="text-rose-300">
                                ! {item}
                              </p>
                            ))}
                          </div>
                        )}

                        {warning && (
                          <p className="mt-3 rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-xs leading-5 text-amber-100/80">
                            {warning}
                          </p>
                        )}

                        <details className="group mt-4">
                          <summary className="cursor-pointer list-none text-sm font-medium text-cyan-300 marker:hidden">
                            <span className="inline-flex items-center gap-2">
                              {t.requirements}
                              <span className="text-slate-500 transition group-open:rotate-180">
                                ▾
                              </span>
                            </span>
                          </summary>

                          <ul className="mt-3 space-y-2 pl-4 text-sm leading-6 text-slate-300">
                            {getRouteList(
                              route,
                              "requirements",
                              isEnglish
                            ).map((requirement) => (
                              <li key={requirement} className="list-disc">
                                {requirement}
                              </li>
                            ))}
                          </ul>

                          <h4 className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {t.limitations}
                          </h4>

                          <ul className="mt-2 space-y-2 pl-4 text-sm leading-6 text-slate-400">
                            {getRouteList(
                              route,
                              "limitations",
                              isEnglish
                            ).map((limitation) => (
                              <li key={limitation} className="list-disc">
                                {limitation}
                              </li>
                            ))}
                          </ul>
                        </details>

                        <a
                          href={route.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                        >
                          {t.official}
                          <span aria-hidden="true">↗</span>
                        </a>
                      </article>
                    );
                  })}

                  {results.length > 8 && (
                    <button
                      type="button"
                      onClick={() => setShowAll((current) => !current)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06]"
                    >
                      {showAll ? t.showFewer : `${t.showAll} (${results.length})`}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 space-y-4">
              <section className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.04] p-5">
                <h3 className="font-semibold text-amber-100">
                  {t.noticeTitle}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {t.noticeText}
                </p>
                <a
                  href={config.officialLinks.noticeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-amber-200 hover:text-amber-100"
                >
                  {t.rulesLink}
                  <span aria-hidden="true">↗</span>
                </a>
              </section>

              {visitRelevant && (
                <section className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.04] p-5">
                  <h3 className="font-semibold text-cyan-100">
                    {t.passportTitle}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {t.passportText}
                  </p>
                  <a
                    href={config.officialLinks.visit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-cyan-200 hover:text-cyan-100"
                  >
                    {isEnglish
                      ? config.officialLinks.visit.labelEn
                      : config.officialLinks.visit.labelRu}
                    <span aria-hidden="true">↗</span>
                  </a>
                </section>
              )}

              {hasImmigrationHistory && (
                <section className="rounded-2xl border border-orange-300/20 bg-orange-300/[0.04] p-5">
                  <h3 className="font-semibold text-orange-100">
                    {t.historyTitle}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {t.historyText}
                  </p>
                  <a
                    href={config.officialLinks.history.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-orange-200 hover:text-orange-100"
                  >
                    {isEnglish
                      ? config.officialLinks.history.labelEn
                      : config.officialLinks.history.labelRu}
                    <span aria-hidden="true">↗</span>
                  </a>
                </section>
              )}

              {hasExpiredStatus && (
                <section className="rounded-2xl border border-red-300/20 bg-red-300/[0.04] p-5">
                  <h3 className="font-semibold text-red-100">
                    {t.expiredTitle}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {t.expiredText}
                  </p>
                  <a
                    href={config.officialLinks.expired.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-red-200 hover:text-red-100"
                  >
                    {isEnglish
                      ? config.officialLinks.expired.labelEn
                      : config.officialLinks.expired.labelRu}
                    <span aria-hidden="true">↗</span>
                  </a>
                </section>
              )}

              {protectionRelevant && (
                <section className="rounded-2xl border border-purple-300/20 bg-purple-300/[0.04] p-5">
                  <h3 className="font-semibold text-purple-100">
                    {t.protectionTitle}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {t.protectionText}
                  </p>
                  <a
                    href={config.officialLinks.protection.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-purple-200 hover:text-purple-100"
                  >
                    {isEnglish
                      ? config.officialLinks.protection.labelEn
                      : config.officialLinks.protection.labelRu}
                    <span aria-hidden="true">↗</span>
                  </a>
                </section>
              )}

              {answered > 0 && (
                <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                  <h3 className="font-semibold text-white">
                    {isEnglish ? "Your answers" : "Ваши ответы"}
                  </h3>

                  <div className="mt-4 space-y-3">
                    {visibleQuestions
                      .filter((question) => isAnswered(answers[question.id]))
                      .map((question) => (
                        <div
                          key={question.id}
                          className="border-b border-white/[0.06] pb-3 last:border-0 last:pb-0"
                        >
                          <p className="text-xs leading-5 text-slate-500">
                            {getQuestionText(question, isEnglish)}
                          </p>
                          <p className="mt-1 text-sm leading-5 text-slate-300">
                            {getSelectedOptionLabel(
                              question,
                              answers[question.id]
                            )}
                          </p>
                        </div>
                      ))}
                  </div>
                </section>
              )}
            </div>
          </aside>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-xs leading-6 text-slate-500">
            {t.generalDisclaimer}
          </p>

          <Link
            href="/world-navigator"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
          >
            <span aria-hidden="true">←</span>
            {t.footer}
          </Link>
        </div>
      </div>
    </main>
  );
}