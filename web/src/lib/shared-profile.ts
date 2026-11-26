export type WorldProfileAnswers = Record<string, string>;

const STORAGE_KEY = "esurpys-world-profile-v1";

export function saveWorldProfile(answers: WorldProfileAnswers): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  } catch {
    // Ignore storage quota or private-mode errors
  }
}

export function loadWorldProfile(): WorldProfileAnswers {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const clean: WorldProfileAnswers = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "string" && v.trim()) {
        clean[k] = v;
      }
    }
    return clean;
  } catch {
    return {};
  }
}

export function clearWorldProfile(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

const CITIZENSHIP_WORLD_TO_COUNTRY: Record<string, string> = {
  russia: "ru",
  ukraine: "ua",
  belarus: "by",
  kazakhstan: "kz",
  uzbekistan: "uz",
  armenia: "am",
  georgia: "ge",
  canada: "ca",
  us: "us",
  uk: "gb",
  germany: "de",
  france: "fr",
  australia: "au",
  "new-zealand": "nz",
  poland: "eu",
  netherlands: "eu",
  latvia: "eu",
  lithuania: "eu",
  estonia: "eu",
  eu: "eu",
  other: "other",
};

export function mapWorldToCountryAnswers(
  countryId: string,
  world: WorldProfileAnswers
): Record<string, string> {
  const mapped: Record<string, string> = {};

  if (world.citizenship && CITIZENSHIP_WORLD_TO_COUNTRY[world.citizenship]) {
    const code = CITIZENSHIP_WORLD_TO_COUNTRY[world.citizenship];
    if (countryId !== "de" || code !== "eu") {
      mapped.citizenship = code;
    } else {
      mapped.citizenship = "de";
    }
  }

  if (world.goal) {
    if (world.goal === "permanent") mapped.goal = "settle";
    else if (world.goal === "temporary") mapped.goal = "visit";
    else mapped.goal = world.goal;
  }

  if (world.job === "offer") mapped.jobOffer = "yes";
  else if (world.job === "none" || world.job === "unskilled") {
    mapped.jobOffer = "no";
  }

  if (world.experience === "none" || world.experience === "under2") {
    mapped.workExperience = world.experience === "none" ? "0" : "under2";
  } else if (world.experience === "2-5" || world.experience === "5plus") {
    mapped.workExperience = world.experience;
  }

  if (world.funds === "high" || world.funds === "medium") mapped.funds = "yes";
  else if (world.funds === "sponsor") mapped.funds = "sponsor";
  else if (world.funds === "low") mapped.funds = "no";

  if (world.immigrationHistory) {
    if (world.immigrationHistory === "criminal") {
      mapped.immigrationHistory = "other";
    } else if (world.immigrationHistory !== "prefer_not") {
      mapped.immigrationHistory = world.immigrationHistory;
    }
  }

  return mapped;
}
export function extractWorldAnswersFromNote(note: string): WorldProfileAnswers {
  const text = note.toLowerCase();
  const parsed: WorldProfileAnswers = {};

  if (/\bрф\b|росси|russia|паспорт рф/.test(text)) parsed.citizenship = "russia";
  else if (/украин|ukrain/.test(text)) parsed.citizenship = "ukraine";
  else if (/беларус|belarus/.test(text)) parsed.citizenship = "belarus";
  else if (/казахстан|kazakh/.test(text)) parsed.citizenship = "kazakhstan";
  else if (/узбекистан|uzbek/.test(text)) parsed.citizenship = "uzbekistan";
  else if (/армени|armenia/.test(text)) parsed.citizenship = "armenia";
  else if (/грузи|georgia/.test(text)) parsed.citizenship = "georgia";
  else if (/германи|german/.test(text)) parsed.citizenship = "germany";
  else if (/\bес\b|евросоюз|\beu\b/.test(text)) parsed.citizenship = "eu";
  else if (/\bсша\b|\busa\b|америк/.test(text)) parsed.citizenship = "us";
  else if (/канад|canada/.test(text)) parsed.citizenship = "canada";
  else if (/австрал|australia/.test(text)) parsed.citizenship = "australia";

  const ageMatch = text.match(/\b(1[6-9]|[2-6][0-9])\s*(?:лет|года|год|yo|y\.o\.|years?)?\b/);
  if (ageMatch) {
    const age = Number(ageMatch[1]);
    if (age < 30) parsed.age = "18-29";
    else if (age <= 35) parsed.age = "30-35";
    else if (age <= 44) parsed.age = "36-44";
    else parsed.age = "45plus";
  }

  if (/мало денег|без денег|нет денег|ограничен|небольш.*бюджет|малый бюджет|low budget|limited|no money/.test(text)) {
    parsed.funds = "low";
  } else if (/спонсор|sponsor|оплатит/.test(text)) {
    parsed.funds = "sponsor";
  } else if (/много денег|больш.*бюджет|high savings|инвестиц/.test(text)) {
    parsed.funds = "high";
  } else if (/средн.*бюджет|умерен|moderate/.test(text)) {
    parsed.funds = "medium";
  }

  const wantsStudy =
    /f-?1|учусь|уч[её]б|студент|вуз|универ|магистрат|бакалавриат|ausbildung|study|student/.test(
      text
    );

  if (wantsStudy) {
    parsed.goal = "study";
    parsed.study = "yes";
  } else if (/семь|жен|муж|брак|партн[её]р|spouse|partner|family/.test(text)) {
    parsed.goal = "family";
  } else if (/бизнес|стартап|entrepreneur|business|инвест/.test(text)) {
    parsed.goal = "business";
    parsed.job = "business";
  } else if (/туризм|временно|поездка|visit|temporary/.test(text)) {
    parsed.goal = "temporary";
  } else if (text.trim().length > 0) {
    parsed.goal = "work";
    if (parsed.age === "18-29") parsed.study = "maybe";
  }

  if (/оффер|offer|приглашение на работу/.test(text)) {
    parsed.job = "offer";
  } else if (/программист|разработ|айти|\bit\b|software|developer|engineer|дизайнер|аналитик|врач|инженер/.test(text)) {
    parsed.job = "skilled";
  } else if (/удален|удалён|фриланс|remote|freelance/.test(text)) {
    parsed.job = "remote";
  }

  if (/без диплома|нет высшего|незаконч|школа|учусь/.test(text)) {
    parsed.education = "school";
  } else if (/магистр|master/.test(text)) {
    parsed.education = "master";
  } else if (/бакалавр|высшее|bachelor/.test(text)) {
    parsed.education = "bachelor";
  } else if (/колледж|техникум|средне-спец|vocational/.test(text)) {
    parsed.education = "vocational";
  }

  if (/без опыта|нет опыта|no experience|junior|джун/.test(text)) {
    parsed.experience = "none";
  } else if (/\b[5-9]\s*(?:лет|года|years)|\b1[0-9]\s*(?:лет|years)/.test(text)) {
    parsed.experience = "5plus";
  } else if (/\b[2-4]\s*(?:года|лет|years)/.test(text)) {
    parsed.experience = "2-5";
  } else if (/\b1\s*(?:год|year)|менее\s*2/.test(text)) {
    parsed.experience = "under2";
  }

  if (/свободн|fluent|native|\bc1\b|\bc2\b/.test(text)) {
    parsed.language = "advanced";
  } else if (/средн|\bb1\b|\bb2\b|intermediate/.test(text)) {
    parsed.language = "intermediate";
  } else if (/начальн|базов|\ba1\b|\ba2\b|плох.*англ|не знаю яз/.test(text)) {
    parsed.language = "basic";
  }

  return parsed;
}