import type {
  Answers,
  CountryQuizConfig,
  QuizOption,
  QuizQuestion,
  QuizRoute,
  RouteEvaluation,
  RouteStatus,
} from "@/lib/country-quiz-types";
import {
  mapWorldToCountryAnswers,
  type WorldProfileAnswers,
} from "@/lib/shared-profile";

const CORE_QUESTIONS = new Set([
  "goal",
  "citizenship",
  "age",
  "residence",
  "passport",
  "immigrationHistory",
]);

const WORK_GOALS = new Set([
  "work",
  "settle",
  "permanent",
  "talent",
  "bluecard",
  "jobsearch",
  "orientation",
  "recognition",
  "exchange",
  "citizenship",
]);

const STUDY_GOALS = new Set(["study", "ausbildung", "orientation"]);
const FAMILY_GOALS = new Set(["family", "settle", "permanent"]);
const BUSINESS_GOALS = new Set(["business", "settle", "permanent"]);
const VISIT_ONLY_FIELDS = new Set(["visitDuration", "travelPurpose"]);

const STUDY_ONLY_FIELDS = new Set([
  "studyOffer",
  "i20",
  "cas",
  "dli",
  "coe",
  "studySponsor",
  "institution",
  "graduation",
]);

const WORK_ONLY_FIELDS = new Set([
  "jobOffer",
  "sponsor",
  "salary",
  "occupation",
  "profession",
  "workExperience",
  "experience",
  "skillsAssessment",
  "points",
  "stateNomination",
  "provincialNomination",
  "regional",
  "transfer",
  "recognition",
  "canadianExperience",
  "ukExperience",
  "germanyExperience",
  "province",
  "state",
]);

const FAMILY_ONLY_FIELDS = new Set(["family", "relationship", "familyStatus"]);
const BUSINESS_ONLY_FIELDS = new Set(["business", "investment"]);

const SUB_FIELD_WITH_NA = new Set([
  "sponsor",
  "salary",
  "i20",
  "cas",
  "dli",
  "coe",
  "studySponsor",
  "institution",
  "relationship",
  "familyStatus",
]);

const SELF_CITIZENSHIP_BY_COUNTRY: Record<string, string> = {
  us: "us",
  uk: "gb",
  ca: "ca",
  au: "au",
  de: "de",
};

export function isOutsideTargetCountry(
  countryId: string,
  answers: Answers
): boolean {
  const r = answers.residence;
  if (!r) return false;
  switch (countryId) {
    case "us":
      return r === "outside";
    case "de":
      return r === "outside" || r === "eu";
    case "nl":
      return r === "outside" || r === "eu" || r === "uk";
    case "ca":
      return ["citizenship", "temporary", "legal"].includes(r);
    case "au":
      return ["outside", "nz", "other"].includes(r);
    case "uk":
      return ["outside", "ireland", "other"].includes(r);
    default:
      return r === "outside";
  }
}

export function getFilteredOptions(
  countryId: string,
  question: QuizQuestion,
  answers: Answers
): QuizOption[] {
  let options = question.options;

  if (question.id === "citizenship") {
    const selfCode = SELF_CITIZENSHIP_BY_COUNTRY[countryId];
    if (selfCode) {
      options = options.filter((o) => o.value !== selfCode);
    }
  }

  if (SUB_FIELD_WITH_NA.has(question.id)) {
    options = options.filter((o) => o.value !== "na");
  }

  if (countryId === "de" && question.id === "status") {
    options = options.filter((o) => o.value !== "eu");
  }

  if (question.id === "travelPurpose" && answers.goal === "visit") {
    options = options.filter((o) => o.value !== "work" && o.value !== "study");
  }

  return options;
}

export function isQuestionVisible(
  countryId: string,
  question: QuizQuestion,
  answers: Answers
): boolean {
  if (question.visibleWhen) {
    return question.visibleWhen(answers);
  }

  const id = question.id;

  // Hide redundant "status inside the country" if user is already outside
  if (id === "status") {
    return !isOutsideTargetCountry(countryId, answers);
  }

  if (CORE_QUESTIONS.has(id)) return true;

  const goal = answers.goal;
  if (!goal || goal === "unsure") {
    return applySubFieldDependencies(id, answers);
  }

  if (goal === "visit") {
    if (VISIT_ONLY_FIELDS.has(id) || id === "funds") return true;
    return false;
  }

  if (goal === "protection") {
    return id === "protection" || id === "english" || id === "german";
  }

  if (STUDY_ONLY_FIELDS.has(id)) {
    if (!STUDY_GOALS.has(goal)) return false;
    return applySubFieldDependencies(id, answers);
  }

  if (VISIT_ONLY_FIELDS.has(id) || id === "protection") {
    return false;
  }

  if (BUSINESS_ONLY_FIELDS.has(id)) {
    if (!BUSINESS_GOALS.has(goal)) return false;
    return applySubFieldDependencies(id, answers);
  }

  if (FAMILY_ONLY_FIELDS.has(id)) {
    if (!FAMILY_GOALS.has(goal)) return false;
    return applySubFieldDependencies(id, answers);
  }

  if (WORK_ONLY_FIELDS.has(id)) {
    if (!WORK_GOALS.has(goal)) return false;
    return applySubFieldDependencies(id, answers);
  }

  if (id === "talent") {
    return goal === "talent" || goal === "work" || goal === "settle";
  }

  if (id === "lottery") {
    return goal === "settle" || goal === "work";
  }

  return applySubFieldDependencies(id, answers);
}

function applySubFieldDependencies(id: string, answers: Answers): boolean {
  if ((id === "sponsor" || id === "salary") && answers.jobOffer === "no") {
    return false;
  }
  if (
    ["i20", "cas", "dli", "coe", "studySponsor", "institution"].includes(id) &&
    answers.studyOffer === "no"
  ) {
    return false;
  }
  if (
    (id === "relationship" || id === "familyStatus") &&
    answers.family === "none"
  ) {
    return false;
  }
  if (id === "investment" && answers.business === "no") {
    return false;
  }
  return true;
}

export function normalizeWorldAnswersForCountry(
  countryId: string,
  world: WorldProfileAnswers
): Answers {
  const mapped = mapWorldToCountryAnswers(countryId, world);

  if ((countryId === "ca" || countryId === "de") && world.goal === "permanent") {
    mapped.goal = "permanent";
  }

  if (countryId === "nl" && mapped.workExperience) {
    mapped.experience = mapped.workExperience;
    delete mapped.workExperience;
  }

  return mapped;
}

function getAdjustedCountryScore(
  countryId: string,
  routeId: string,
  answers: Answers,
  baseScore: number
): number {
  let score = baseScore;
  const c = answers.citizenship;
  const goal = answers.goal;

  if (countryId === "us") {
    const vwpCitizens = ["gb", "de", "fr", "au", "nz", "jp", "kr"];
    if (
      routeId === "esta" &&
      score === 0 &&
      goal === "visit" &&
      answers.visitDuration === "short" &&
      vwpCitizens.includes(c) &&
      answers.travelPurpose !== "work" &&
      answers.travelPurpose !== "study"
    ) {
      score = 42;
      if (answers.passport === "yes") score += 18;
      if (answers.immigrationHistory === "none") score += 18;
      if (answers.funds === "yes" || answers.funds === "sponsor") score += 10;
      if (answers.immigrationHistory === "refusal") score -= 35;
      if (["overstay", "removal", "fraud"].includes(answers.immigrationHistory)) {
        score -= 45;
      }
      score = Math.max(0, Math.min(score, 90));
    }

    const treatyExtraCitizens = ["gb", "de", "fr"];
    if (
      routeId === "e2" &&
      ["business", "work", "settle"].includes(goal) &&
      treatyExtraCitizens.includes(c)
    ) {
      score = Math.min(90, Math.max(score, 35) + 20);
    }
  }

  if (countryId === "de" && (c === "de" || c === "fr")) {
    if (["work", "study", "family", "business", "permanent"].includes(routeId)) {
      score = Math.max(score, 80);
    }
  }

  return Math.max(0, Math.min(100, score));
}

export function evaluateCountryRoute(
  config: CountryQuizConfig,
  route: QuizRoute,
  answers: Answers,
  isEnglish: boolean
): RouteEvaluation {
  if (config.evaluateRoute) {
    return config.evaluateRoute(route.id, answers, isEnglish);
  }

  const rawScore = config.getRouteScore(route.id, answers);
  const score = getAdjustedCountryScore(config.id, route.id, answers, rawScore);

  const met: string[] = [];
  const missing: string[] = [];
  const blockers: string[] = [];

  const text = (ru: string, en: string) => (isEnglish ? en : ru);

  if (answers.passport === "yes") {
    met.push(text("Действующий паспорт", "Valid passport"));
  } else if (answers.passport === "no") {
    blockers.push(text("Нет действующего паспорта", "No valid passport"));
  }

  if (answers.status === "expired" || answers.residence === "usexpired") {
    blockers.push(
      text(
        "Истёкший статус может ограничивать подачу",
        "Expired status may restrict eligibility"
      )
    );
  }

  if (
    answers.immigrationHistory &&
    !["none", "no", "unknown", "prefer", ""].includes(
      answers.immigrationHistory
    )
  ) {
    blockers.push(
      text(
        "Есть отказ или миграционное нарушение в истории",
        "Prior visa refusal or immigration history issue"
      )
    );
  }

  const r = route.id;
  const isWorkRoute = [
    "h1b",
    "l1",
    "o1",
    "eb2",
    "eb3",
    "skilled",
    "health",
    "hsm",
    "bluecard",
    "work",
    "482",
    "186",
    "494",
    "pnp",
    "atlantic",
    "fsw",
    "cec",
    "expressEntry",
  ].includes(r);

  if (isWorkRoute) {
    if (answers.jobOffer === "yes") {
      met.push(text("Есть предложение о работе", "Job offer in hand"));
    } else if (answers.jobOffer === "no") {
      missing.push(
        text("Нужен оффер от работодателя", "Employer job offer needed")
      );
    }

    if (answers.sponsor === "yes") {
      met.push(
        text("Работодатель готов спонсировать", "Sponsoring employer confirmed")
      );
    } else if (answers.sponsor === "no") {
      missing.push(
        text(
          "Требуется лицензированный визовый спонсор",
          "Licensed visa sponsor required"
        )
      );
    }

    if (["bachelor", "master", "phd"].includes(answers.education)) {
      met.push(
        text("Подходящее высшее образование", "Qualifying degree level")
      );
    }
  }

  if (["student", "500", "study"].includes(r)) {
    if (answers.studyOffer === "yes" || answers.studyOffer === "conditional") {
      met.push(text("Есть приглашение от вуза", "University offer received"));
    } else {
      missing.push(
        text(
          "Нужно зачисление (I-20 / CAS / DLI / CoE)",
          "School admission (I-20 / CAS / DLI / CoE) required"
        )
      );
    }
  }

  if (answers.funds === "yes" || answers.funds === "sponsor") {
    met.push(
      text("Финансовая база подтверждена", "Proof of funds / sponsorship noted")
    );
  } else if (answers.funds === "no") {
    missing.push(
      text("Недостаточно средств на счету", "Insufficient liquid proof of funds")
    );
  }

  if (config.id === "au" && ["189", "190", "491"].includes(r)) {
    if (answers.age === "45plus") {
      blockers.push(
        text(
          "Возраст 45+ закрывает стандартные балльные потоки 189/190/491",
          "Age 45+ is over the general skilled migration cutoff"
        )
      );
    }
    if (answers.skillsAssessment === "no") {
      missing.push(
        text("Требуется Skills Assessment", "Skills Assessment required")
      );
    }
  }

  let status: RouteStatus = "low";
  if (score >= 65 && blockers.length === 0) {
    status = "strong";
  } else if (score >= 35) {
    status = "conditional";
  }

  return { score, status, met, missing, blockers };
}