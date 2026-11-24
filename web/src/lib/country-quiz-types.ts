export type Answers = Record<string, string>;

export type FlagCode = "US" | "DE" | "GB" | "CA" | "AU" | "NL";

export type QuizOption = {
  value: string;
  label?: string;
  ru?: string;
  en?: string;
};

export type QuizQuestion = {
  id: string;
  title?: string;
  ru?: string;
  en: string;
  description?: string;
  descriptionRu?: string;
  descriptionEn?: string;
  options: QuizOption[];
  visibleWhen?: (answers: Answers) => boolean;
};

export type QuizRoute = {
  id: string;
  title?: string;
  titleRu?: string;
  titleEn: string;
  category?: string;
  categoryRu?: string;
  categoryEn: string;
  description?: string;
  descriptionRu?: string;
  descriptionEn: string;
  requirements?: string[];
  requirementsRu?: string[];
  requirementsEn: string[];
  limitations?: string[];
  limitationsRu?: string[];
  limitationsEn: string[];
  officialUrl: string;
};

export type RouteStatus = "strong" | "conditional" | "low";

export type RouteEvaluation = {
  score: number;
  status: RouteStatus;
  met: string[];
  missing: string[];
  blockers: string[];
};

export type QuizCopy = {
  title: string;
  subtitle: string;
  reset: string;
  progress: string;
  of: string;
  questions: string;
  allQuestions: string;
  answered: string;
  notAnswered: string;
  choose: string;
  showResults: string;
  results: string;
  resultsDescription: string;
  scoreDisclaimer: string;
  noResults: string;
  noResultsDescription: string;
  top: string;
  requirements: string;
  limitations: string;
  official: string;
  showAll: string;
  showFewer: string;
  noticeTitle: string;
  noticeText: string;
  rulesLink: string;
  passportTitle: string;
  passportText: string;
  historyTitle: string;
  historyText: string;
  expiredTitle: string;
  expiredText: string;
  protectionTitle: string;
  protectionText: string;
  generalDisclaimer: string;
  footer: string;
};

export type QuizSidebarLink = {
  url: string;
  labelEn: string;
  labelRu: string;
};

export type CountryQuizConfig = {
  id: string;
  flagCode: FlagCode;
  countryNameEn: string;
  questions: QuizQuestion[];
  routes: QuizRoute[];
  copy: {
    ru: QuizCopy;
    en: QuizCopy;
  };
  officialLinks: {
    noticeUrl: string;
    visit: QuizSidebarLink;
    history: QuizSidebarLink;
    expired: QuizSidebarLink;
    protection: QuizSidebarLink;
  };
  conditions?: {
    hasImmigrationHistory?: (answers: Answers) => boolean;
    hasExpiredStatus?: (answers: Answers) => boolean;
    protectionRelevant?: (answers: Answers) => boolean;
    visitRelevant?: (answers: Answers) => boolean;
  };
  getRouteScore: (routeId: string, answers: Answers) => number;
  getRouteWarning: (
    routeId: string,
    answers: Answers,
    isEnglish: boolean
  ) => string | null;
  evaluateRoute?: (
    routeId: string,
    answers: Answers,
    isEnglish: boolean
  ) => RouteEvaluation;
};