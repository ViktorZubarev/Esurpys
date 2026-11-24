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