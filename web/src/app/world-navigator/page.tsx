"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import EsurpysNavigation from "@/shared/EsurpysNavigation";
import { useLanguage } from "@/shared/LanguageProvider";
import VisaAiAdvisor from "@/components/VisaAiAdvisor";
import {
  clearWorldProfile,
  extractWorldAnswersFromNote,
  loadWorldProfile,
  saveWorldProfile,
} from "@/lib/shared-profile";

type Answer = string;

type Option = {
  value: string;
  label: string;
  labelRu: string;
};

type Question = {
  id: string;
  label: string;
  labelRu: string;
  options: Option[];
};

type Country = {
  id: string;
  name: string;
  flag: string;
  region: string;
  regionRu: string;
  description: string;
  descriptionRu: string;
  website: string;
  quizHref?: string;
  pathways: string[];
  pathwaysRu: string[];
  requirements: Partial<Record<string, string[]>>;
};

type Assessment = {
  country: Country;
  score: number;
  matched: string[];
  concerns: string[];
  missing: string[];
  citizenshipNote?: string;
};

const EU_EEA_CITIZENSHIPS = new Set([
  "latvia",
  "lithuania",
  "estonia",
  "poland",
  "netherlands",
  "germany",
  "france",
  "eu",
]);

const EU_DESTINATIONS = new Set(["germany", "netherlands", "ireland"]);

const QUESTIONS: Question[] = [
  {
    id: "citizenship",
    label: "What is your citizenship?",
    labelRu: "Какое у вас гражданство?",
    options: [
      { value: "russia", label: "Russia", labelRu: "Россия" },
      { value: "ukraine", label: "Ukraine", labelRu: "Украина" },
      { value: "belarus", label: "Belarus", labelRu: "Беларусь" },
      { value: "kazakhstan", label: "Kazakhstan", labelRu: "Казахстан" },
      { value: "uzbekistan", label: "Uzbekistan", labelRu: "Узбекистан" },
      { value: "armenia", label: "Armenia", labelRu: "Армения" },
      { value: "azerbaijan", label: "Azerbaijan", labelRu: "Азербайджан" },
      { value: "georgia", label: "Georgia", labelRu: "Грузия" },
      { value: "moldova", label: "Moldova", labelRu: "Молдова" },
      { value: "kyrgyzstan", label: "Kyrgyzstan", labelRu: "Кыргызстан" },
      { value: "tajikistan", label: "Tajikistan", labelRu: "Таджикистан" },
      { value: "turkmenistan", label: "Turkmenistan", labelRu: "Туркменистан" },
      { value: "latvia", label: "Latvia", labelRu: "Латвия" },
      { value: "lithuania", label: "Lithuania", labelRu: "Литва" },
      { value: "estonia", label: "Estonia", labelRu: "Эстония" },
      { value: "poland", label: "Poland", labelRu: "Польша" },
      { value: "netherlands", label: "Netherlands", labelRu: "Нидерланды" },
      { value: "germany", label: "Germany", labelRu: "Германия" },
      { value: "france", label: "France", labelRu: "Франция" },
      { value: "eu", label: "Other EU / EEA country", labelRu: "Другая страна ЕС / ЕЭЗ" },
      { value: "uk", label: "United Kingdom", labelRu: "Великобритания" },
      { value: "us", label: "United States", labelRu: "США" },
      { value: "canada", label: "Canada", labelRu: "Канада" },
      { value: "australia", label: "Australia", labelRu: "Австралия" },
      { value: "new-zealand", label: "New Zealand", labelRu: "Новая Зеландия" },
      { value: "other", label: "Other country", labelRu: "Другая страна" },
    ],
  },
  {
    id: "age",
    label: "How old are you?",
    labelRu: "Сколько вам лет?",
    options: [
      { value: "under18", label: "Under 18", labelRu: "Меньше 18 лет" },
      { value: "18-29", label: "18–29", labelRu: "18–29 лет" },
      { value: "30-35", label: "30–35", labelRu: "30–35 лет" },
      { value: "36-44", label: "36–44", labelRu: "36–44 года" },
      { value: "45plus", label: "45+", labelRu: "45 лет и старше" },
    ],
  },
  {
    id: "residenceCountry",
    label: "Where do you currently live?",
    labelRu: "В какой стране вы сейчас живёте?",
    options: [
      { value: "russia", label: "Russia", labelRu: "Россия" },
      { value: "ukraine", label: "Ukraine", labelRu: "Украина" },
      { value: "belarus", label: "Belarus", labelRu: "Беларусь" },
      { value: "kazakhstan", label: "Kazakhstan", labelRu: "Казахстан" },
      { value: "uzbekistan", label: "Uzbekistan", labelRu: "Узбекистан" },
      { value: "armenia", label: "Armenia", labelRu: "Армения" },
      { value: "georgia", label: "Georgia", labelRu: "Грузия" },
      { value: "eu", label: "EU / EEA country", labelRu: "Страна ЕС / ЕЭЗ" },
      { value: "uk", label: "United Kingdom", labelRu: "Великобритания" },
      { value: "us", label: "United States", labelRu: "США" },
      { value: "canada", label: "Canada", labelRu: "Канада" },
      { value: "australia", label: "Australia", labelRu: "Австралия" },
      { value: "other", label: "Other country", labelRu: "Другая страна" },
    ],
  },
  {
    id: "immigrationHistory",
    label: "Have you had immigration or visa problems?",
    labelRu: "Были ли у вас проблемы с визами или миграционными правилами?",
    options: [
      { value: "none", label: "No previous problems", labelRu: "Нет, проблем не было" },
      { value: "refusal", label: "Visa refusal", labelRu: "Был отказ в визе" },
      { value: "overstay", label: "Overstay or status violation", labelRu: "Нарушение срока пребывания или статуса" },
      { value: "criminal", label: "Criminal or serious legal issue", labelRu: "Судимость или серьёзная юридическая проблема" },
      { value: "prefer_not", label: "Prefer not to say", labelRu: "Не хочу отвечать" },
    ],
  },
  {
    id: "goal",
    label: "What is your main goal?",
    labelRu: "Какова ваша главная цель переезда?",
    options: [
      { value: "work", label: "Work", labelRu: "Работа" },
      { value: "study", label: "Study", labelRu: "Учёба" },
      { value: "business", label: "Business / investment", labelRu: "Бизнес или инвестиции" },
      { value: "family", label: "Join family / partner", labelRu: "Воссоединение с семьёй или партнёром" },
      { value: "permanent", label: "Permanent residence", labelRu: "Постоянное проживание" },
      { value: "temporary", label: "Temporary stay", labelRu: "Временное пребывание" },
    ],
  },
  {
    id: "job",
    label: "What is your professional situation?",
    labelRu: "Какая у вас профессиональная ситуация?",
    options: [
      { value: "offer", label: "I have a job offer", labelRu: "У меня есть предложение о работе" },
      { value: "skilled", label: "Skilled professional, no offer yet", labelRu: "Квалифицированный специалист, предложения пока нет" },
      { value: "remote", label: "Remote worker / freelancer", labelRu: "Удалённый сотрудник или фрилансер" },
      { value: "business", label: "Business owner / entrepreneur", labelRu: "Предприниматель или владелец бизнеса" },
      { value: "unskilled", label: "Entry-level / other work", labelRu: "Начальная квалификация или другая работа" },
      { value: "none", label: "Not currently working", labelRu: "Сейчас не работаю" },
    ],
  },
  {
    id: "education",
    label: "What is your highest education level?",
    labelRu: "Какое у вас образование?",
    options: [
      { value: "school", label: "Secondary school", labelRu: "Среднее образование" },
      { value: "vocational", label: "Vocational / professional training", labelRu: "Среднее специальное или профессиональное" },
      { value: "bachelor", label: "Bachelor's degree", labelRu: "Степень бакалавра" },
      { value: "master", label: "Master's degree", labelRu: "Степень магистра" },
      { value: "phd", label: "Doctorate", labelRu: "Докторская степень" },
    ],
  },
  {
    id: "language",
    label: "What is your language level?",
    labelRu: "Какой у вас уровень языка страны или английского?",
    options: [
      { value: "none", label: "Beginner / no test", labelRu: "Начальный уровень, экзамен не сдавал(а)" },
      { value: "basic", label: "Basic", labelRu: "Базовый" },
      { value: "intermediate", label: "Intermediate", labelRu: "Средний" },
      { value: "advanced", label: "Advanced", labelRu: "Продвинутый" },
      { value: "native", label: "Native / near-native", labelRu: "Родной или почти свободный" },
    ],
  },
  {
    id: "funds",
    label: "How much money can you access for relocation?",
    labelRu: "Какие средства доступны вам для переезда?",
    options: [
      { value: "low", label: "Limited savings", labelRu: "Небольшие накопления" },
      { value: "medium", label: "Moderate savings", labelRu: "Средние накопления" },
      { value: "high", label: "Substantial savings", labelRu: "Значительные накопления" },
      { value: "sponsor", label: "Employer / family sponsor", labelRu: "Финансовая поддержка работодателя или семьи" },
      { value: "unknown", label: "Not sure yet", labelRu: "Пока не знаю" },
    ],
  },
  {
    id: "study",
    label: "Would you consider studying abroad as an immigration pathway?",
    labelRu: "Рассматриваете ли вы учёбу за границей как вариант переезда?",
    options: [
      { value: "yes", label: "Yes", labelRu: "Да" },
      { value: "maybe", label: "Maybe", labelRu: "Возможно" },
      { value: "no", label: "No", labelRu: "Нет" },
    ],
  },
  {
    id: "family",
    label: "Do you have a qualifying close family member abroad?",
    labelRu: "Есть ли у вас близкий родственник или партнёр за границей?",
    options: [
      { value: "yes", label: "Yes, close relative", labelRu: "Да, есть близкий родственник" },
      { value: "partner", label: "Spouse / partner abroad", labelRu: "Супруг, супруга или партнёр за границей" },
      { value: "no", label: "No", labelRu: "Нет" },
      { value: "unknown", label: "Not sure if eligible", labelRu: "Не знаю, подходит ли мой случай" },
    ],
  },
  {
    id: "experience",
    label: "How much relevant work experience do you have?",
    labelRu: "Сколько у вас опыта работы по специальности?",
    options: [
      { value: "none", label: "None yet", labelRu: "Пока нет опыта" },
      { value: "under2", label: "Less than 2 years", labelRu: "Меньше 2 лет" },
      { value: "2-5", label: "2–5 years", labelRu: "2–5 лет" },
      { value: "5plus", label: "5+ years", labelRu: "5 лет и больше" },
    ],
  },
  {
    id: "duration",
    label: "How long do you want to stay?",
    labelRu: "На какой срок вы хотите переехать?",
    options: [
      { value: "temporary", label: "A few months", labelRu: "На несколько месяцев" },
      { value: "years", label: "Several years", labelRu: "На несколько лет" },
      { value: "permanent", label: "Permanently", labelRu: "На постоянное проживание" },
      { value: "unsure", label: "Not sure yet", labelRu: "Пока не решил(а)" },
    ],
  },
];

const COUNTRIES: Country[] = [
  {
    id: "canada",
    name: "Canada",
    flag: "🇨🇦",
    region: "North America",
    regionRu: "Северная Америка",
    description: "Skilled-worker, provincial, study and family immigration routes.",
    descriptionRu: "Иммиграция квалифицированных специалистов, провинциальные программы, учёба и воссоединение семьи.",
    website: "https://www.canada.ca/en/immigration-refugees-citizenship.html",
    quizHref: "/ca",
    pathways: [
      "Express Entry and eligible economic programs",
      "Provincial nominee programs",
      "Study permits and eligible post-study routes",
      "Family sponsorship where eligible",
    ],
    pathwaysRu: [
      "Express Entry и подходящие экономические программы",
      "Провинциальные иммиграционные программы",
      "Разрешение на учёбу и доступные варианты после неё",
      "Семейное спонсорство при соблюдении требований",
    ],
    requirements: {
      goal: ["work", "study", "family", "permanent", "business"],
      age: ["18-29", "30-35", "36-44"],
      job: ["offer", "skilled", "business"],
      education: ["vocational", "bachelor", "master", "phd"],
      language: ["intermediate", "advanced", "native"],
      funds: ["medium", "high", "sponsor"],
      study: ["yes", "maybe"],
      family: ["yes", "partner"],
      experience: ["2-5", "5plus"],
      duration: ["years", "permanent"],
    },
  },
  {
    id: "germany",
    name: "Germany",
    flag: "🇩🇪",
    region: "Europe",
    regionRu: "Европа",
    description: "Employment, EU Blue Card, Opportunity Card, vocational training, study and family routes.",
    descriptionRu: "Работа, Голубая карта ЕС, Карта возможностей, профессиональное обучение, учёба и воссоединение семьи.",
    website: "https://www.make-it-in-germany.com/en/",
    quizHref: "/de",
    pathways: [
      "EU Blue Card if salary and qualification criteria are met",
      "Skilled-worker residence permits",
      "Opportunity Card (Chancenkarte) for job search",
      "Study, Ausbildung and family routes",
    ],
    pathwaysRu: [
      "Голубая карта ЕС при выполнении требований к зарплате и квалификации",
      "ВНЖ для квалифицированных специалистов",
      "Карта возможностей для поиска работы",
      "Учёба, Ausbildung и семейные программы",
    ],
    requirements: {
      goal: ["work", "study", "family", "permanent", "business"],
      age: ["18-29", "30-35", "36-44", "45plus"],
      job: ["offer", "skilled", "business", "remote"],
      education: ["vocational", "bachelor", "master", "phd"],
      language: ["basic", "intermediate", "advanced", "native"],
      funds: ["medium", "high", "sponsor"],
      study: ["yes", "maybe"],
      family: ["yes", "partner"],
      experience: ["under2", "2-5", "5plus"],
      duration: ["years", "permanent", "temporary"],
    },
  },
  {
    id: "netherlands",
    name: "Netherlands",
    flag: "🇳🇱",
    region: "Europe",
    regionRu: "Европа",
    description: "Highly skilled migrant, EU Blue Card, startup, study and family routes.",
    descriptionRu: "ВНЖ для высококвалифицированных мигрантов (HSM), Голубая карта ЕС, стартап-виза, учёба и семья.",
    website: "https://ind.nl/en",
    quizHref: "/nl",
    pathways: [
      "Highly Skilled Migrant route with a recognised sponsor",
      "EU Blue Card where criteria are met",
      "Orientation Year / Startup visa",
      "Partner and family residence",
    ],
    pathwaysRu: [
      "ВНЖ высококвалифицированного мигранта через признанного спонсора",
      "Голубая карта ЕС при соблюдении требований",
      "Orientation Year или стартап-виза",
      "ВНЖ для партнёров и членов семьи",
    ],
    requirements: {
      goal: ["work", "study", "family", "permanent", "business"],
      age: ["18-29", "30-35", "36-44", "45plus"],
      job: ["offer", "skilled", "business"],
      education: ["bachelor", "master", "phd"],
      language: ["basic", "intermediate", "advanced", "native"],
      funds: ["medium", "high", "sponsor"],
      study: ["yes", "maybe"],
      family: ["yes", "partner"],
      experience: ["2-5", "5plus"],
      duration: ["years", "permanent"],
    },
  },
  {
    id: "uk",
    name: "United Kingdom",
    flag: "🇬🇧",
    region: "Europe",
    regionRu: "Европа",
    description: "Skilled Worker, Global Talent, Innovator Founder, study and family routes.",
    descriptionRu: "Виза Skilled Worker, Global Talent, Innovator Founder, учебные и семейные маршруты.",
    website: "https://www.gov.uk/government/organisations/uk-visas-and-immigration",
    quizHref: "/uk",
    pathways: [
      "Skilled Worker visa with a licensed UK sponsor",
      "Global Talent / High Potential Individual",
      "Student visa and Graduate route",
      "Family visas where criteria are met",
    ],
    pathwaysRu: [
      "Виза квалифицированного работника при наличии спонсора",
      "Global Talent и High Potential Individual",
      "Студенческая виза и Graduate route",
      "Семейные визы при соблюдении требований",
    ],
    requirements: {
      goal: ["work", "study", "family", "permanent", "business"],
      age: ["18-29", "30-35", "36-44", "45plus"],
      job: ["offer", "skilled", "business"],
      education: ["vocational", "bachelor", "master", "phd"],
      language: ["intermediate", "advanced", "native"],
      funds: ["medium", "high", "sponsor"],
      study: ["yes", "maybe"],
      family: ["yes", "partner"],
      experience: ["2-5", "5plus"],
      duration: ["years", "permanent"],
    },
  },
  {
    id: "australia",
    name: "Australia",
    flag: "🇦🇺",
    region: "Oceania",
    regionRu: "Океания",
    description: "Skilled migration (189/190/491), employer sponsorship (482), study and partner visas.",
    descriptionRu: "Балльная иммиграция (189/190/491), спонсорство работодателя (482), учёба и визы партнёров.",
    website: "https://immi.homeaffairs.gov.au/",
    quizHref: "/au",
    pathways: [
      "Points-tested skilled migration (189/190/491, under age 45)",
      "Employer-sponsored visas (Subclass 482 / 186)",
      "Student visas and Post-Study Work options",
      "Family and partner visas",
    ],
    pathwaysRu: [
      "Балльные программы 189/190/491 (возраст до 45 лет)",
      "Рабочие визы через спонсора (482 / 186)",
      "Студенческие визы и варианты после выпуска",
      "Семейные визы и визы партнёров",
    ],
    requirements: {
      goal: ["work", "study", "family", "permanent"],
      age: ["18-29", "30-35", "36-44"],
      job: ["offer", "skilled"],
      education: ["vocational", "bachelor", "master", "phd"],
      language: ["intermediate", "advanced", "native"],
      funds: ["medium", "high", "sponsor"],
      study: ["yes", "maybe"],
      family: ["yes", "partner"],
      experience: ["2-5", "5plus"],
      duration: ["years", "permanent"],
    },
  },
  {
    id: "usa",
    name: "United States",
    flag: "🇺🇸",
    region: "North America",
    regionRu: "Северная Америка",
    description: "H-1B, O-1, EB-2 NIW, E-2 treaty investor, study and family immigration categories.",
    descriptionRu: "Категории H-1B, O-1, EB-2 NIW, E-2, учебные визы и семейная иммиграция.",
    website: "https://www.uscis.gov/",
    quizHref: "/us",
    pathways: [
      "Employer-sponsored categories (H-1B, L-1) or O-1 / EB-2 NIW",
      "Family-based immigration, if eligible",
      "Student visas (F-1) with OPT",
      "E-2 / EB-5 business & investment routes",
    ],
    pathwaysRu: [
      "Рабочие визы H-1B / L-1 или O-1 / EB-2 NIW",
      "Семейная иммиграция при наличии права",
      "Студенческая виза F-1 с практикой OPT",
      "Бизнес и инвестиции (E-2 для стран договора / EB-5)",
    ],
    requirements: {
      goal: ["work", "study", "family", "permanent", "business"],
      age: ["18-29", "30-35", "36-44", "45plus"],
      job: ["offer", "skilled", "business"],
      education: ["bachelor", "master", "phd"],
      language: ["intermediate", "advanced", "native"],
      funds: ["medium", "high", "sponsor"],
      study: ["yes", "maybe"],
      family: ["yes", "partner"],
      experience: ["2-5", "5plus"],
      duration: ["years", "permanent", "temporary"],
    },
  },
  {
    id: "ireland",
    name: "Ireland",
    flag: "🇮🇪",
    region: "Europe",
    regionRu: "Европа",
    description: "Critical Skills employment permits, study and family immigration options.",
    descriptionRu: "Разрешения на работу Critical Skills, учёба и семейная иммиграция.",
    website: "https://www.irishimmigration.ie/",
    pathways: [
      "Critical Skills Employment Permit",
      "General Employment Permit, if eligible",
      "Study routes",
      "Family reunification where permitted",
    ],
    pathwaysRu: [
      "Разрешение Critical Skills Employment Permit",
      "Общее разрешение на работу при соблюдении требований",
      "Учебные программы",
      "Воссоединение семьи в предусмотренных случаях",
    ],
    requirements: {
      goal: ["work", "study", "family", "permanent"],
      age: ["18-29", "30-35", "36-44", "45plus"],
      job: ["offer", "skilled"],
      education: ["vocational", "bachelor", "master", "phd"],
      language: ["intermediate", "advanced", "native"],
      funds: ["medium", "high", "sponsor"],
      study: ["yes", "maybe"],
      family: ["yes", "partner"],
      experience: ["2-5", "5plus"],
      duration: ["years", "permanent"],
    },
  },
  {
    id: "new-zealand",
    name: "New Zealand",
    flag: "🇳🇿",
    region: "Oceania",
    regionRu: "Океания",
    description: "Accredited employer work, Straight to Residence, study and family routes.",
    descriptionRu: "Рабочие визы через аккредитованного работодателя, Green List, учёба и семья.",
    website: "https://www.immigration.govt.nz/",
    pathways: [
      "Accredited Employer Work Visa (AEWV)",
      "Skilled Migrant & Green List residence pathways",
      "Student visas",
      "Partner and family visas",
    ],
    pathwaysRu: [
      "Рабочая виза AEWV через аккредитованного работодателя",
      "Программы ВНЖ для специалистов (Skilled Migrant / Green List)",
      "Студенческие визы",
      "Визы партнёров и членов семьи",
    ],
    requirements: {
      goal: ["work", "study", "family", "permanent"],
      age: ["18-29", "30-35", "36-44"],
      job: ["offer", "skilled"],
      education: ["vocational", "bachelor", "master", "phd"],
      language: ["intermediate", "advanced", "native"],
      funds: ["medium", "high", "sponsor"],
      study: ["yes", "maybe"],
      family: ["yes", "partner"],
      experience: ["2-5", "5plus"],
      duration: ["years", "permanent"],
    },
  },
];

function getGoalWeights(goal?: string): Record<string, number> {
  switch (goal) {
    case "study":
      return {
        goal: 3,
        study: 3,
        language: 2,
        funds: 3,
        education: 2,
        duration: 1,
      };
    case "family":
      return {
        goal: 3,
        family: 4,
        funds: 2,
        language: 1,
        duration: 1,
      };
    case "business":
      return {
        goal: 3,
        job: 3,
        funds: 3,
        language: 1,
        experience: 2,
        duration: 1,
      };
    case "temporary":
      return {
        goal: 3,
        funds: 2,
        language: 1,
        duration: 2,
      };
    default:
      return {
        goal: 3,
        job: 3,
        education: 2,
        language: 2,
        funds: 2,
        experience: 2,
        age: 1,
        duration: 1,
      };
  }
}

const UI = {
  en: {
    eyebrow: "GLOBAL IMMIGRATION GUIDE",
    title: "Find your path",
    subtitle: "Compare destinations based on your goals, work, education and circumstances.",
    progress: "Your progress",
    question: "Question",
    of: "of",
    next: "Next",
    back: "Back",
    results: "See my results",
    restart: "Start over",
    resultsTitle: "Your country comparison",
    resultsSubtitle: "Preliminary goal-aware profile comparison with AI advisor follow-up.",
    answered: "Answered",
    mainGoal: "Main goal",
    countries: "Countries considered",
    match: "Profile match",
    matched: "Aligned factors",
    concerns: "Gaps or risks to check",
    missing: "Not answered",
    pathways: "Possible routes to investigate",
    official: "Official site",
    deepQuiz: "Open full country quiz",
    showAll: "Show all countries",
    showLess: "Show fewer countries",
    disclaimer: "This tool provides general information only. Verify all criteria with the official immigration authority.",
    reviewTitle: "Important factors to verify",
    reviewText: "Previous visa refusals, overstays, age limits, or employer sponsorship requirements can materially change your eligibility.",
    noMatch: "No matching factors identified yet.",
    matchNote: "Goal-weighted profile match based on your answers.",
    best: "Top profile match",
    noAnswers: "No answers yet",
    noConcerns: "No obvious mismatches flagged in the answered criteria.",
    disclaimerLabel: "Disclaimer: ",
  },
  ru: {
    eyebrow: "ГЛОБАЛЬНЫЙ ИММИГРАЦИОННЫЙ ГИД",
    title: "Найдите свой путь",
    subtitle: "Сравните страны с учётом ваших целей, работы, образования и обстоятельств.",
    progress: "Ваш прогресс",
    question: "Вопрос",
    of: "из",
    next: "Далее",
    back: "Назад",
    results: "Показать результаты",
    restart: "Начать заново",
    resultsTitle: "Сравнение стран для вас",
    resultsSubtitle: "Предварительное сравнение с учётом вашей цели и бесплатным ИИ-разбором нюансов.",
    answered: "Отвечено",
    mainGoal: "Главная цель",
    countries: "Страны в сравнении",
    match: "Соответствие профиля",
    matched: "Подходящие факторы",
    concerns: "На что обратить внимание",
    missing: "Без ответа",
    pathways: "Возможные варианты для изучения",
    official: "Официальный сайт",
    deepQuiz: "Пройти детальный тест по стране",
    showAll: "Показать все страны",
    showLess: "Показать меньше стран",
    disclaimer: "Сервис предоставляет общую информацию. Проверяйте требования на официальном сайте миграционного ведомства.",
    reviewTitle: "Что важно проверить",
    reviewText: "Отказы в визе, нарушения статуса, возрастные пороги или необходимость спонсора могут существенно изменить выбор маршрута.",
    noMatch: "Подходящие факторы пока не определены.",
    matchNote: "Оценка взвешена под выбранную вами цель переезда.",
    best: "Лучшее совпадение",
    noAnswers: "Ответов пока нет",
    noConcerns: "По заполненным ответам явных несоответствий не отмечено.",
    disclaimerLabel: "Важно: ",
  },
};

function getOptionLabel(questionId: string, value: string, lang: "en" | "ru") {
  const question = QUESTIONS.find((item) => item.id === questionId);
  const option = question?.options.find((item) => item.value === value);
  if (!option) return value;
  return lang === "ru" ? option.labelRu : option.label;
}

function calculateScore(
  country: Country,
  answers: Record<string, Answer>,
  lang: "en" | "ru"
): Assessment {
  let earned = 0;
  let possible = 0;
  const matched: string[] = [];
  const concerns: string[] = [];
  const missing: string[] = [];
  const weights = getGoalWeights(answers.goal);

  const citizenship = answers.citizenship;
  const isEuCitizen = Boolean(citizenship && EU_EEA_CITIZENSHIPS.has(citizenship));
  let citizenshipNote: string | undefined;

  if (isEuCitizen && EU_DESTINATIONS.has(country.id)) {
    citizenshipNote =
      lang === "ru"
        ? "Граждане ЕС/ЕЭЗ пользуются правом свободного передвижения и работы без рабочей визы."
        : "EU/EEA citizens benefit from free movement and work rights without a visa.";
  } else if (citizenship === "new-zealand" && country.id === "australia") {
    citizenshipNote =
      lang === "ru"
        ? "Граждане Новой Зеландии обычно въезжают и работают в Австралии по Special Category Visa (subclass 444)."
        : "New Zealand citizens typically live and work in Australia under the Special Category Visa (subclass 444).";
  } else if (citizenship === "uk" && country.id === "ireland") {
    citizenshipNote =
      lang === "ru"
        ? "Граждане Великобритании имеют право жить и работать в Ирландии по Common Travel Area."
        : "UK citizens have residence and work rights in Ireland under the Common Travel Area.";
  }

  for (const question of QUESTIONS) {
    const { id } = question;
    const answer = answers[id];
    const weight = weights[id] ?? 0;

    if (id === "immigrationHistory") {
      if (answer === "none") matched.push(id);
      else if (answer && answer !== "prefer_not") concerns.push(id);
      continue;
    }

    if (weight <= 0) continue;

    if (!answer) {
      missing.push(id);
      continue;
    }

    const eligibleValues = country.requirements[id];
    if (!eligibleValues) continue;

    possible += weight;
    if (eligibleValues.includes(answer)) {
      earned += weight;
      matched.push(id);
    } else {
      concerns.push(id);
    }
  }

  let score = possible > 0 ? Math.round((earned / possible) * 100) : 0;

  if (citizenshipNote) {
    score = Math.min(98, Math.max(score, 85));
  }

  if (
    (country.id === "australia" || country.id === "new-zealand") &&
    answers.age === "45plus" &&
    answers.goal === "work" &&
    answers.job !== "offer"
  ) {
    score = Math.max(10, score - 18);
  }

  if (answers.goal === "work" && answers.job === "remote" && country.id === "usa") {
    score = Math.max(10, score - 15);
  }

  if (answers.immigrationHistory === "overstay") {
    score = Math.max(5, score - 15);
  } else if (answers.immigrationHistory === "criminal") {
    score = Math.max(5, score - 22);
  } else if (answers.immigrationHistory === "refusal") {
    score = Math.max(10, score - 6);
  }

  return {
    country,
    score: Math.max(0, Math.min(100, score)),
    matched,
    concerns,
    missing,
    citizenshipNote,
  };
}

export default function WorldNavigatorPage() {
  const { language } = useLanguage();
  const lang: "en" | "ru" = String(language ?? "en")
    .toLowerCase()
    .startsWith("ru")
    ? "ru"
    : "en";
  const t = UI[lang];

  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [step, setStep] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = loadWorldProfile();
      if (Object.keys(saved).length > 0) {
        setAnswers(saved);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const visibleQuestions = useMemo(() => {
    return QUESTIONS.filter((q) => {
      if (q.id === "study" && answers.goal === "study") return false;
      if (q.id === "duration" && answers.goal === "permanent") return false;
      if (q.id === "job" && answers.goal === "temporary") return false;
      if (q.id === "experience" && answers.goal === "temporary") return false;
      return true;
    });
  }, [answers.goal]);

  const safeStep = Math.min(step, Math.max(0, visibleQuestions.length - 1));
  const currentQuestion = visibleQuestions[safeStep];
  const progress =
    visibleQuestions.length > 0
      ? ((safeStep + 1) / visibleQuestions.length) * 100
      : 0;

  const assessments = useMemo(
    () =>
      COUNTRIES.map((country) => calculateScore(country, answers, lang)).sort(
        (a, b) => b.score - a.score
      ),
    [answers, lang]
  );

  const visibleAssessments = showAll ? assessments : assessments.slice(0, 4);

  function chooseAnswer(value: string) {
    if (!currentQuestion) return;
    setAnswers((previous) => {
      const next: Record<string, Answer> = {
        ...previous,
        [currentQuestion.id]: value,
      };
      if (currentQuestion.id === "goal" && value === "study") {
        next.study = "yes";
      }
      if (currentQuestion.id === "goal" && value === "permanent") {
        next.duration = "permanent";
      }
      saveWorldProfile(next);
      return next;
    });
  }

  function reset() {
    clearWorldProfile();
    setAnswers({});
    setStep(0);
    setShowAll(false);
    setShowResults(false);
  }

  function applyNoteToWorld(note: string) {
    const extracted = extractWorldAnswersFromNote(note);
    setAnswers((previous) => {
      const next: Record<string, Answer> = {
        ...previous,
        ...extracted,
      };
      saveWorldProfile(next);
      return next;
    });
    setShowAll(true);
    setShowResults(true);
  }

  const aiAdvisorBlock = (
    <div className="mx-auto mb-8 max-w-4xl">
      <VisaAiAdvisor
        lang={lang}
        mode="world"
        countryCode="GLOBAL"
        countryName="World Comparison"
        answers={answers}
        routesSummary={assessments.slice(0, 5).map((item) => ({
          name: item.country.name,
          score: item.score,
          warning: item.citizenshipNote,
        }))}
        onQuickCalculate={applyNoteToWorld}
      />
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <EsurpysNavigation />
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <header className="mx-auto mb-8 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-blue-300">
            {t.eyebrow}
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {showResults ? t.resultsTitle : t.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            {showResults ? t.resultsSubtitle : t.subtitle}
          </p>
        </header>

        {/* Бесплатный ИИ-советник сразу виден сверху страницы */}
        {aiAdvisorBlock}

        {!showResults && currentQuestion ? (
          <section className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/20 sm:p-8">
            <div className="mb-7 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-400">{t.progress}</p>
                <p className="mt-1 text-lg font-semibold">
                  {t.question} {safeStep + 1} {t.of} {visibleQuestions.length}
                </p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300">
                {Math.round(progress)}%
              </div>
            </div>

            <div className="mb-8 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div key={currentQuestion.id}>
              <p className="mb-2 text-sm font-medium text-blue-300">
                {t.question} {safeStep + 1}
              </p>
              <h2 className="mb-6 text-2xl font-semibold leading-snug sm:text-3xl">
                {lang === "ru" ? currentQuestion.labelRu : currentQuestion.label}
              </h2>

              <div className="grid gap-3">
                {currentQuestion.options.map((option) => {
                  const selected = answers[currentQuestion.id] === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => chooseAnswer(option.value)}
                      aria-pressed={selected}
                      className={`group flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-blue-400 bg-blue-500/10 ring-1 ring-blue-400/30"
                          : "border-slate-700 bg-slate-950/40 hover:border-slate-500 hover:bg-slate-800/80"
                      }`}
                    >
                      <span className="pr-3 text-sm font-medium leading-6 text-slate-100 sm:text-base">
                        {lang === "ru" ? option.labelRu : option.label}
                      </span>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          selected
                            ? "border-blue-400 bg-blue-400"
                            : "border-slate-600"
                        }`}
                      >
                        {selected && (
                          <span className="h-2 w-2 rounded-full bg-slate-950" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-800 pt-6">
              <button
                type="button"
                disabled={safeStep === 0}
                onClick={() => setStep((previous) => Math.max(0, previous - 1))}
                className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← {t.back}
              </button>
              {safeStep < visibleQuestions.length - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setStep((previous) =>
                      Math.min(visibleQuestions.length - 1, previous + 1)
                    )
                  }
                  className="rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
                >
                  {t.next} →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResults(true)}
                  className="rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
                >
                  {t.results} →
                </button>
              )}
            </div>

            <p className="mt-5 text-xs leading-5 text-slate-500">
              {t.disclaimer}
            </p>
          </section>
        ) : (
          <section>
            <div className="mb-7 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">{t.countries}</p>
                <p className="mt-2 text-3xl font-bold">{COUNTRIES.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">{t.answered}</p>
                <p className="mt-2 text-3xl font-bold">
                  {Object.keys(answers).length}/{visibleQuestions.length}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">{t.mainGoal}</p>
                <p className="mt-2 text-xl font-bold">
                  {answers.goal
                    ? getOptionLabel("goal", answers.goal, lang)
                    : t.noAnswers}
                </p>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <h2 className="font-semibold text-amber-200">{t.reviewTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {t.reviewText}
              </p>
            </div>

            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-bold">{t.resultsTitle}</h2>
                <p className="mt-2 text-sm text-slate-400">{t.matchNote}</p>
              </div>
              <button
                type="button"
                onClick={reset}
                className="self-start rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 sm:self-auto"
              >
                ↻ {t.restart}
              </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {visibleAssessments.map((assessment, index) => {
                const {
                  country,
                  score,
                  matched,
                  concerns,
                  missing,
                  citizenshipNote,
                } = assessment;
                return (
                  <article
                    key={country.id}
                    className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 transition hover:border-slate-700"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-4xl">
                          {country.flag}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-bold">{country.name}</h3>
                            {index === 0 && (
                              <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 text-xs font-semibold text-blue-300">
                                {t.best}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-slate-400">
                            {lang === "ru" ? country.regionRu : country.region}
                          </p>
                          <p className="mt-3 text-sm leading-6 text-slate-300">
                            {lang === "ru"
                              ? country.descriptionRu
                              : country.description}
                          </p>
                        </div>
                      </div>

                      {citizenshipNote && (
                        <div className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-2.5 text-xs leading-5 text-emerald-200">
                          {citizenshipNote}
                        </div>
                      )}

                      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-slate-300">
                            {t.match}
                          </span>
                          <span className="text-2xl font-bold tabular-nums">
                            {score}%
                          </span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <p className="mt-3 text-xs leading-5 text-slate-500">
                          {t.matchNote}
                        </p>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div>
                          <h4 className="mb-3 text-sm font-semibold text-emerald-300">
                            ✓ {t.matched}
                          </h4>
                          {matched.length ? (
                            <ul className="space-y-2">
                              {matched.map((id) => (
                                <li
                                  key={id}
                                  className="flex gap-2 text-sm text-slate-300"
                                >
                                  <span className="text-emerald-400">•</span>
                                  {questionLabel(id)}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm leading-6 text-slate-500">
                              {t.noMatch}
                            </p>
                          )}
                        </div>

                        <div>
                          <h4 className="mb-3 text-sm font-semibold text-amber-300">
                            ! {t.concerns}
                          </h4>
                          {concerns.length ? (
                            <ul className="space-y-2">
                              {concerns.map((id) => (
                                <li
                                  key={id}
                                  className="flex gap-2 text-sm text-slate-300"
                                >
                                  <span className="text-amber-400">•</span>
                                  {questionLabel(id)}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm leading-6 text-slate-500">
                              {t.noConcerns}
                            </p>
                          )}
                        </div>
                      </div>

                      {missing.length > 0 && (
                        <div className="mt-5">
                          <h4 className="mb-2 text-sm font-semibold text-slate-400">
                            {t.missing}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {missing.map((id) => (
                              <span
                                key={id}
                                className="rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1.5 text-xs text-slate-400"
                              >
                                {questionLabel(id)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-6 border-t border-slate-800 pt-5">
                        <h4 className="mb-3 text-sm font-semibold text-slate-200">
                          {t.pathways}
                        </h4>
                        <ul className="space-y-2">
                          {(lang === "ru"
                            ? country.pathwaysRu
                            : country.pathways
                          ).map((pathway) => (
                            <li
                              key={pathway}
                              className="flex gap-2 text-sm leading-6 text-slate-300"
                            >
                              <span className="text-blue-400">↗</span>
                              <span>{pathway}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-5 flex flex-wrap gap-3">
                          {country.quizHref && (
                            <Link
                              href={country.quizHref}
                              className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
                            >
                              {t.deepQuiz} →
                            </Link>
                          )}
                          <a
                            href={country.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-400/5 px-4 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-400/10"
                          >
                            {t.official} ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-7 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll((previous) => !previous)}
                className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                {showAll ? t.showLess : t.showAll}
              </button>
            </div>

            <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <p className="text-sm leading-6 text-slate-300">
                <span className="font-semibold text-amber-200">
                  {t.disclaimerLabel}
                </span>
                {t.disclaimer}
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}