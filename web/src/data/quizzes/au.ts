import type {
  Answers,
  CountryQuizConfig,
  QuizOption,
  QuizQuestion,
  QuizRoute,
} from "@/lib/country-quiz-types";

const opt = (value: string, label: string, en: string): QuizOption => ({
  value,
  label,
  en,
});

const citizenshipOptions: QuizOption[] = [
  opt("ru", "Россия", "Russia"),
  opt("ua", "Украина", "Ukraine"),
  opt("by", "Беларусь", "Belarus"),
  opt("kz", "Казахстан", "Kazakhstan"),
  opt("uz", "Узбекистан", "Uzbekistan"),
  opt("am", "Армения", "Armenia"),
  opt("ge", "Грузия", "Georgia"),
  opt("in", "Индия", "India"),
  opt("cn", "Китай", "China"),
  opt("ph", "Филиппины", "Philippines"),
  opt("br", "Бразилия", "Brazil"),
  opt("mx", "Мексика", "Mexico"),
  opt("au", "Австралия", "Australia"),
  opt("nz", "Новая Зеландия", "New Zealand"),
  opt("jp", "Япония", "Japan"),
  opt("kr", "Южная Корея", "South Korea"),
  opt("ca", "Канада", "Canada"),
  opt("us", "США", "United States"),
  opt("gb", "Великобритания", "United Kingdom"),
  opt("de", "Германия", "Germany"),
  opt("fr", "Франция", "France"),
  opt("ie", "Ирландия", "Ireland"),
  opt("other", "Другое гражданство", "Other citizenship"),
  opt("unknown", "Не уверен(а)", "Not sure"),
];

const questions: QuizQuestion[] = [
  {
    id: "goal",
    title: "Какова ваша основная цель?",
    en: "What is your main goal?",
    options: [
      opt("work", "Работа в Австралии", "Work in Australia"),
      opt("study", "Учёба", "Study"),
      opt("family", "Воссоединение с семьёй или партнёром", "Join family or partner"),
      opt("visit", "Туризм или краткий визит", "Tourism or short visit"),
      opt("business", "Развивать бизнес или инвестировать", "Develop a business or invest"),
      opt("talent", "Научная, профессиональная или выдающаяся карьера", "Research, professional or exceptional career"),
      opt("settle", "Переехать на постоянное проживание", "Settle permanently"),
      opt("protection", "Нужна международная защита", "I need international protection"),
    ],
  },
  {
    id: "citizenship",
    title: "Какое у вас гражданство?",
    en: "What is your citizenship?",
    description: "Гражданство влияет на визовые требования, программы Work and Holiday и другие специальные маршруты.",
    descriptionEn: "Nationality affects visa requirements, Work and Holiday and other special routes.",
    options: citizenshipOptions,
  },
  {
    id: "age",
    title: "Сколько вам лет?",
    en: "How old are you?",
    options: [
      opt("under18", "Меньше 18 лет", "Under 18"),
      opt("18-25", "18–25 лет", "18–25"),
      opt("26-30", "26–30 лет", "26–30"),
      opt("31-35", "31–35 лет", "31–35"),
      opt("36-44", "36–44 года", "36–44"),
      opt("45plus", "45 лет или старше", "45 or older"),
    ],
  },
  {
    id: "residence",
    title: "Где вы сейчас проживаете?",
    en: "Where do you currently live?",
    options: [
      opt("outside", "За пределами Австралии", "Outside Australia"),
      opt("au", "В Австралии", "In Australia"),
      opt("nz", "В Новой Зеландии", "In New Zealand"),
      opt("other", "В другой стране, временный статус", "Another country, temporary status"),
    ],
  },
  {
    id: "english",
    title: "Какой у вас уровень английского?",
    en: "What is your English level?",
    options: [
      opt("none", "Начальный или практически отсутствует", "Beginner or very limited"),
      opt("basic", "Базовый", "Basic"),
      opt("competent", "Достаточный для повседневного общения", "Competent for everyday communication"),
      opt("proficient", "Выше среднего / уверенный", "Proficient"),
      opt("superior", "Продвинутый", "Superior"),
      opt("test", "Есть действующий результат IELTS, PTE или другого теста", "I have a valid IELTS, PTE or other test result"),
      opt("exempt", "Возможно, есть основание для освобождения", "I may qualify for an exemption"),
    ],
  },
  {
    id: "education",
    title: "Какое у вас образование?",
    en: "What is your highest education level?",
    options: [
      opt("school", "Школа или ниже", "Secondary school or below"),
      opt("vocational", "Профессиональное образование / колледж", "Vocational qualification or college"),
      opt("bachelor", "Бакалавриат", "Bachelor's degree"),
      opt("master", "Магистратура", "Master's degree"),
      opt("phd", "Докторантура / PhD", "Doctorate / PhD"),
    ],
  },
  {
    id: "workExperience",
    title: "Сколько у вас профессионального опыта?",
    en: "How much professional work experience do you have?",
    options: [
      opt("none", "Нет опыта", "No experience"),
      opt("under1", "Меньше года", "Less than a year"),
      opt("1-3", "1–3 года", "1–3 years"),
      opt("3-5", "3–5 лет", "3–5 years"),
      opt("5plus", "Более 5 лет", "More than 5 years"),
    ],
  },
  {
    id: "occupation",
    title: "К какой сфере относится ваша профессия?",
    en: "Which field is your occupation in?",
    options: [
      opt("health", "Медицина и здравоохранение", "Healthcare and medicine"),
      opt("it", "IT, инженерия и технологии", "IT, engineering and technology"),
      opt("science", "Наука и исследования", "Science and research"),
      opt("education", "Образование", "Education"),
      opt("finance", "Финансы, бизнес и управление", "Finance, business and management"),
      opt("trade", "Строительство, производство и ремесленные специальности", "Construction, manufacturing and skilled trades"),
      opt("hospitality", "Гостиницы, рестораны и туризм", "Hospitality, restaurants and tourism"),
      opt("agriculture", "Сельское хозяйство", "Agriculture"),
      opt("creative", "Искусство и креативные индустрии", "Arts and creative industries"),
      opt("other", "Другая сфера", "Other field"),
      opt("none", "Пока нет профессии", "I do not have an occupation yet"),
    ],
  },
  {
    id: "skillsAssessment",
    title: "Есть ли у вас оценка квалификации для австралийской профессии?",
    en: "Do you have a skills assessment for an Australian occupation?",
    description: "Для многих skilled-виз требуется оценка квалификации уполномоченным органом. Конкретные правила зависят от профессии и визы.",
    descriptionEn: "Many skilled visas require an assessment by the relevant authority. Requirements depend on the occupation and visa.",
    options: [
      opt("yes", "Да, положительная оценка уже есть", "Yes, I have a positive assessment"),
      opt("applied", "Подал(а) документы, ожидаю результат", "I have applied and am waiting"),
      opt("no", "Нет, ещё не проходил(а)", "No, I have not applied"),
      opt("unknown", "Не знаю, нужна ли она мне", "I do not know whether I need one"),
      opt("na", "Не относится к моей ситуации", "Not applicable to my situation"),
    ],
  },
  {
    id: "jobOffer",
    title: "Есть ли у вас предложение работы от австралийского работодателя?",
    en: "Do you have a job offer from an Australian employer?",
    options: [
      opt("yes", "Да, предложение уже есть", "Yes, I have an offer"),
      opt("interview", "Прохожу собеседования", "I am interviewing"),
      opt("searching", "Пока ищу работу", "I am still looking"),
      opt("no", "Нет и пока не ищу работу", "No, and I am not looking for work"),
    ],
  },
  {
    id: "sponsor",
    title: "Готов ли работодатель выступить спонсором?",
    en: "Is the employer willing and able to sponsor you?",
    description: "Для спонсорских виз работодателю нужно соответствовать требованиям конкретного маршрута.",
    descriptionEn: "For sponsored visas, the employer must meet the requirements of the relevant route.",
    options: [
      opt("yes", "Да, работодатель подтвердил", "Yes, the employer confirmed"),
      opt("possible", "Возможно, нужно уточнить", "Possibly, I need to check"),
      opt("no", "Нет", "No"),
      opt("unknown", "Не знаю", "I do not know"),
      opt("na", "Нет предложения работы", "I do not have a job offer"),
    ],
  },
  {
    id: "salary",
    title: "Какова предполагаемая годовая зарплата в Австралии?",
    en: "What is the expected annual salary in Australia?",
    description: "Порог дохода и рыночная ставка зависят от типа визы, профессии и действующих правил.",
    descriptionEn: "Income thresholds and market salary rates depend on the visa, occupation and current rules.",
    options: [
      opt("unknown", "Пока неизвестно", "Not known yet"),
      opt("under50", "Менее AUD 50 000", "Under AUD 50,000"),
      opt("50-75", "AUD 50 000–74 999", "AUD 50,000–74,999"),
      opt("75-100", "AUD 75 000–99 999", "AUD 75,000–99,999"),
      opt("100plus", "AUD 100 000 или больше", "AUD 100,000 or more"),
    ],
  },
  {
    id: "regional",
    title: "Готовы ли вы жить и работать в региональной Австралии?",
    en: "Would you consider living and working in regional Australia?",
    description: "Региональные маршруты могут иметь отдельные требования и ограничения. Значение термина regional зависит от правил визы.",
    descriptionEn: "Regional routes can have separate requirements and restrictions. The definition of regional depends on the visa.",
    options: [
      opt("yes", "Да, готов(а)", "Yes, I would"),
      opt("maybe", "Рассмотрю подходящий вариант", "I would consider a suitable option"),
      opt("no", "Нет, только крупные города", "No, major cities only"),
    ],
  },
  {
    id: "stateNomination",
    title: "Есть ли у вас номинация штата или территории?",
    en: "Do you have state or territory nomination?",
    description: "Для визы 190 требуется номинация штата или территории. Для 491 также существуют отдельные варианты номинации и спонсорства.",
    descriptionEn: "Visa 190 requires state or territory nomination. Visa 491 also has nomination and sponsorship pathways.",
    options: [
      opt("yes", "Да, номинация получена", "Yes, I have been nominated"),
      opt("applied", "Подал(а) заявку", "I have applied"),
      opt("interested", "Пока изучаю программы штатов", "I am researching state programs"),
      opt("no", "Нет", "No"),
    ],
  },
  {
    id: "points",
    title: "Сколько баллов вы примерно набираете по австралийской points test?",
    en: "What is your approximate score under the Australian points test?",
    description: "Это ваша предварительная оценка, а не официальный расчёт. Порог для подачи EOI не гарантирует приглашение.",
    descriptionEn: "This is your estimate, not an official calculation. Meeting the EOI threshold does not guarantee an invitation.",
    options: [
      opt("unknown", "Не рассчитывал(а)", "I have not calculated it"),
      opt("under65", "Меньше 65", "Below 65"),
      opt("65-79", "65–79", "65–79"),
      opt("80-94", "80–94", "80–94"),
      opt("95plus", "95 или больше", "95 or more"),
    ],
  },
  {
    id: "studyOffer",
    title: "Есть ли у вас предложение о зачислении в австралийское учебное заведение?",
    en: "Do you have an offer from an Australian education provider?",
    options: [
      opt("yes", "Да, зачисление подтверждено", "Yes, my place is confirmed"),
      opt("conditional", "Есть условное предложение", "I have a conditional offer"),
      opt("searching", "Пока выбираю учебное заведение", "I am still choosing a provider"),
      opt("no", "Нет", "No"),
    ],
  },
  {
    id: "coe",
    title: "Получили ли вы Confirmation of Enrolment (CoE)?",
    en: "Have you received a Confirmation of Enrolment (CoE)?",
    description: "CoE обычно нужен для подачи на Student visa, если применяются стандартные требования к зачислению.",
    descriptionEn: "A CoE is generally required for a Student visa application where standard enrolment requirements apply.",
    options: [
      opt("yes", "Да", "Yes"),
      opt("no", "Нет", "No"),
      opt("unknown", "Не знаю, что это", "I am not sure what it is"),
      opt("na", "Пока нет предложения о зачислении", "I do not have an offer yet"),
    ],
  },
  {
    id: "funds",
    title: "Есть ли у вас средства на переезд и проживание?",
    en: "Do you have funds for relocation and living costs?",
    options: [
      opt("yes", "Да, достаточно средств", "Yes, sufficient funds"),
      opt("some", "Есть часть суммы", "I have some of the funds"),
      opt("sponsor", "Расходы покроет семья, работодатель или стипендия", "Family, employer or scholarship will cover costs"),
      opt("no", "Пока нет", "Not yet"),
    ],
  },
  {
    id: "family",
    title: "Есть ли у вас близкий член семьи в Австралии?",
    en: "Do you have a close family member in Australia?",
    options: [
      opt("partner", "Супруг или партнёр — гражданин или постоянный резидент Австралии", "My spouse or partner is an Australian citizen or permanent resident"),
      opt("eligibleNZ", "Партнёр — гражданин Новой Зеландии с подходящим статусом", "My partner is an eligible New Zealand citizen"),
      opt("parent", "Родитель или ребёнок живёт в Австралии", "My parent or child lives in Australia"),
      opt("sibling", "Брат или сестра живёт в Австралии", "My sibling lives in Australia"),
      opt("temporary", "Родственник временно находится в Австралии", "A relative is temporarily in Australia"),
      opt("none", "Нет", "No"),
    ],
  },
  {
    id: "relationship",
    title: "Каков ваш статус отношений с партнёром в Австралии?",
    en: "What is your relationship status with your partner in Australia?",
    options: [
      opt("married", "Мы официально женаты", "We are legally married"),
      opt("de facto", "Мы фактические партнёры (de facto)", "We are de facto partners"),
      opt("new", "Отношения начались недавно", "The relationship is recent"),
      opt("na", "Не относится к моей ситуации", "Not applicable"),
    ],
  },
  {
    id: "business",
    title: "Есть ли у вас предпринимательский проект или инвестиционный капитал?",
    en: "Do you have an entrepreneurial project or investment capital?",
    options: [
      opt("innovative", "Есть инновационный бизнес с потенциалом роста", "I have an innovative business with growth potential"),
      opt("existing", "Есть действующий бизнес", "I own an existing business"),
      opt("capital", "Есть значительный капитал для инвестиций", "I have substantial investment capital"),
      opt("no", "Нет", "No"),
    ],
  },
  {
    id: "talent",
    title: "Есть ли у вас значимые профессиональные достижения?",
    en: "Do you have significant professional achievements?",
    options: [
      opt("international", "Есть международное признание или награды", "I have international recognition or awards"),
      opt("research", "Есть научные публикации или исследовательская карьера", "I have research publications or an academic career"),
      opt("senior", "Есть значительный опыт на руководящих должностях", "I have substantial senior leadership experience"),
      opt("potential", "Есть потенциал, но мало подтверждений", "I have potential but limited evidence"),
      opt("no", "Нет", "No"),
    ],
  },
  {
    id: "passport",
    title: "Есть ли у вас действующий паспорт?",
    en: "Do you have a valid passport?",
    options: [
      opt("yes", "Да", "Yes"),
      opt("no", "Нет", "No"),
      opt("renew", "Нужно продлить или заменить", "I need to renew or replace it"),
    ],
  },
  {
    id: "visitDuration",
    title: "На какой срок вы хотите приехать?",
    en: "How long do you intend to stay?",
    options: [
      opt("short", "Краткий визит или отпуск", "Short visit or holiday"),
      opt("long", "Несколько месяцев", "Several months"),
      opt("permanent", "Переехать надолго или навсегда", "Long-term or permanent move"),
    ],
  },
  {
    id: "immigrationHistory",
    title: "Были ли у вас визовые отказы или нарушения иммиграционных правил?",
    en: "Have you had visa refusals or immigration breaches?",
    options: [
      opt("none", "Нет", "No"),
      opt("refusal", "Был отказ в визе", "I have had a visa refusal"),
      opt("overstay", "Было превышение срока пребывания", "I have overstayed"),
      opt("cancellation", "Визу отменяли или отказывали во въезде", "A visa was cancelled or I was refused entry"),
      opt("unknown", "Не уверен(а)", "Not sure"),
    ],
  },
  {
    id: "status",
    title: "Если вы уже в Австралии, какой у вас статус?",
    en: "If you are already in Australia, what is your status?",
    options: [
      opt("outside", "Я нахожусь за пределами Австралии", "I am outside Australia"),
      opt("valid", "Есть действующая виза", "I have a valid visa"),
      opt("student", "У меня Student visa", "I hold a Student visa"),
      opt("work", "У меня рабочая виза", "I hold a work visa"),
      opt("expired", "Виза истекла или статус неясен", "My visa has expired or my status is unclear"),
      opt("nzSpecial", "Я гражданин Новой Зеландии и проверяю специальный маршрут", "I am a New Zealand citizen checking a special route"),
    ],
  },
  {
    id: "protection",
    title: "Нуждаетесь ли вы в убежище или защите от преследования?",
    en: "Do you need asylum or protection from persecution?",
    description: "Вопросы защиты рассматриваются индивидуально. Анкета не может определить право на защиту.",
    descriptionEn: "Protection claims are assessed individually. This questionnaire cannot determine eligibility.",
    options: [
      opt("yes", "Да", "Yes"),
      opt("unsure", "Не уверен(а), нужна консультация", "I am unsure and need advice"),
      opt("no", "Нет", "No"),
    ],
  },
];
const ROUTES: QuizRoute[] = [
  {
    id: "189",
    title: "Skilled Independent visa — subclass 189",
    titleEn: "Skilled Independent visa — subclass 189",
    category: "Квалифицированная миграция",
    categoryEn: "Skilled migration",
    description:
      "Постоянная виза для подходящих квалифицированных специалистов без необходимости спонсорства работодателя или номинации штата по этому маршруту.",
    descriptionEn:
      "A permanent visa for eligible skilled workers without employer sponsorship or state nomination under this route.",
    requirements: [
      "Профессия должна соответствовать действующим требованиям и спискам для выбранного потока.",
      "Обычно требуется положительная оценка квалификации соответствующим органом.",
      "Необходимо подать Expression of Interest через SkillSelect и получить приглашение.",
      "Применяются возрастные ограничения, требования к английскому и points test.",
      "65 баллов — минимальный порог для рассмотрения по points test, но приглашение не гарантируется.",
    ],
    requirementsEn: [
      "Your occupation must meet the current requirements and lists for the relevant stream.",
      "A positive skills assessment from the relevant authority is generally required.",
      "You generally need to submit an Expression of Interest through SkillSelect and receive an invitation.",
      "Age, English language and points-test requirements apply.",
      "65 points is the minimum points-test threshold, but an invitation is not guaranteed.",
    ],
    limitations: [
      "Набор 65 баллов сам по себе не гарантирует приглашение.",
      "Требования к профессиям, приглашениям и оценке квалификации нужно перепроверить перед подачей.",
      "Анкета не рассчитывает официальный балл и не подтверждает соответствие критериям.",
    ],
    limitationsEn: [
      "Scoring 65 points alone does not guarantee an invitation.",
      "Occupation, invitation and skills-assessment rules must be checked before applying.",
      "This questionnaire does not calculate an official score or confirm eligibility.",
    ],
    officialUrl:
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189",
  },
  {
    id: "190",
    title: "Skilled Nominated visa — subclass 190",
    titleEn: "Skilled Nominated visa — subclass 190",
    category: "Номинация штата",
    categoryEn: "State nomination",
    description: "Постоянная квалифицированная виза с номинацией австралийского штата или территории.",
    descriptionEn:
      "A permanent skilled visa requiring nomination by an Australian state or territory.",
    requirements: [
      "Нужна номинация штата или территории по применимым критериям.",
      "Обычно требуются подходящая профессия, оценка квалификации и Expression of Interest.",
      "Применяются требования к возрасту, английскому и баллам.",
      "Штаты могут устанавливать собственные приоритеты и дополнительные условия.",
    ],
    requirementsEn: [
      "You need nomination from a state or territory under its applicable criteria.",
      "An eligible occupation, skills assessment and Expression of Interest are generally required.",
      "Age, English language and points requirements apply.",
      "States may set their own priorities and additional conditions.",
    ],
    limitations: [
      "Правила номинации различаются между штатами и могут меняться.",
      "Интерес к программе или поданная заявка не означают, что номинация будет выдана.",
    ],
    limitationsEn: [
      "Nomination rules vary between states and can change.",
      "Interest in a program or an application does not guarantee nomination.",
    ],
    officialUrl:
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-nominated-190",
  },
  {
    id: "491",
    title: "Skilled Work Regional visa — subclass 491",
    titleEn: "Skilled Work Regional visa — subclass 491",
    category: "Региональная миграция",
    categoryEn: "Regional migration",
    description:
      "Временная квалифицированная региональная виза с подходящей номинацией штата или спонсорством допустимого родственника.",
    descriptionEn:
      "A provisional skilled regional visa requiring eligible state nomination or sponsorship by an eligible relative.",
    requirements: [
      "Нужен подходящий путь номинации штата или спонсорства родственником, если он доступен.",
      "Обычно требуются профессия из применимого списка и оценка квалификации.",
      "Применяются возрастные ограничения, английский и points test.",
      "Необходимо соблюдать региональные условия проживания и работы.",
    ],
    requirementsEn: [
      "An eligible state nomination or family sponsorship pathway is required where available.",
      "An occupation on the relevant list and a skills assessment are generally needed.",
      "Age, English language and points-test requirements apply.",
      "Regional residence and work conditions must be followed.",
    ],
    limitations: [
      "Это не немедленная постоянная виза; дальнейший путь зависит от выполнения условий.",
      "Не вся территория Австралии считается regional для каждой визовой цели.",
    ],
    limitationsEn: [
      "This is not an immediate permanent visa; later pathways depend on meeting requirements.",
      "Not every part of Australia is considered regional for every visa purpose.",
    ],
    officialUrl:
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-work-regional-provisional-491",
  },
  {
    id: "482",
    title: "Skills in Demand visa — subclass 482",
    titleEn: "Skills in Demand visa — subclass 482",
    category: "Работа со спонсором",
    categoryEn: "Employer-sponsored work",
    description:
      "Рабочая виза для квалифицированного специалиста, которого номинирует подходящий австралийский работодатель.",
    descriptionEn:
      "A work visa for a skilled worker nominated by an eligible Australian employer.",
    requirements: [
      "Нужен работодатель, готовый выступить спонсором и номинировать должность.",
      "Должность, опыт работы, квалификация и зарплата должны отвечать правилам применимого потока.",
      "Могут требоваться английский, лицензия или регистрация для регулируемой профессии.",
      "Нужно выполнить требования к здоровью, характеру и документам.",
    ],
    requirementsEn: [
      "An eligible employer must be willing to sponsor and nominate the position.",
      "The position, work experience, qualifications and salary must meet the relevant stream requirements.",
      "English, licensing or registration may be required for regulated occupations.",
      "Health, character and documentary requirements apply.",
    ],
    limitations: [
      "Предложение работы само по себе не означает, что работодатель может спонсировать визу.",
      "Условия, зарплатные пороги и доступность отдельных потоков необходимо проверять по актуальным правилам.",
    ],
    limitationsEn: [
      "A job offer alone does not mean the employer can sponsor a visa.",
      "Conditions, salary thresholds and stream availability must be checked against current rules.",
    ],
    officialUrl:
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-visa-subclass-482",
  },
  {
    id: "186",
    title: "Employer Nomination Scheme — subclass 186",
    titleEn: "Employer Nomination Scheme — subclass 186",
    category: "Постоянная работа",
    categoryEn: "Permanent employer-sponsored",
    description:
      "Постоянная виза по номинации работодателя при выполнении требований конкретного потока.",
    descriptionEn:
      "A permanent employer-sponsored visa for applicants who meet the relevant stream requirements.",
    requirements: [
      "Требуется номинация подходящего работодателя.",
      "Применяются требования к должности, навыкам и, в зависимости от потока, опыту работы.",
      "Могут потребоваться оценка квалификации, английский и профессиональная регистрация.",
      "Необходимо соответствовать требованиям конкретного потока визы.",
    ],
    requirementsEn: [
      "Nomination by an eligible employer is required.",
      "Position, skills and, depending on the stream, work-experience requirements apply.",
      "A skills assessment, English and professional registration may be required.",
      "You must meet the requirements of the relevant visa stream.",
    ],
    limitations: [
      "Наличие работодателя не гарантирует одобрение номинации или визы.",
      "Потоки и требования различаются; проверьте официальные условия перед подачей.",
    ],
    limitationsEn: [
      "Having an employer does not guarantee approval of the nomination or visa.",
      "Streams and requirements differ; check the official criteria before applying.",
    ],
    officialUrl:
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/employer-nomination-scheme-186",
  },
  {
    id: "494",
    title: "Skilled Employer Sponsored Regional — subclass 494",
    titleEn: "Skilled Employer Sponsored Regional — subclass 494",
    category: "Региональная работа",
    categoryEn: "Regional employer-sponsored",
    description:
      "Региональный рабочий маршрут для квалифицированных специалистов с подходящим работодателем-спонсором.",
    descriptionEn:
      "A regional employer-sponsored route for skilled workers with an eligible sponsoring employer.",
    requirements: [
      "Нужен подходящий работодатель в региональной части Австралии.",
      "Требуются соответствующая должность, квалификация и опыт согласно правилам визы.",
      "Могут применяться требования к возрасту, английскому и оценке квалификации.",
      "Нужно соблюдать условия регионального маршрута.",
    ],
    requirementsEn: [
      "An eligible employer in regional Australia is required.",
      "The position, qualifications and experience must meet visa requirements.",
      "Age, English and skills-assessment requirements may apply.",
      "Regional visa conditions must be followed.",
    ],
    limitations: [
      "Работа должна соответствовать условиям региональной визы.",
      "Необходимо проверить, соответствует ли конкретное место работы определению regional.",
    ],
    limitationsEn: [
      "The job must meet the regional visa conditions.",
      "Check whether the specific work location qualifies as regional.",
    ],
    officialUrl:
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-employer-sponsored-regional-494",
  },
  {
    id: "500",
    title: "Student visa — subclass 500",
    titleEn: "Student visa — subclass 500",
    category: "Учёба",
    categoryEn: "Study",
    description:
      "Виза для обучения в Австралии на подходящей программе при выполнении требований к зачислению и заявителю.",
    descriptionEn:
      "A visa for eligible study in Australia, subject to enrolment and applicant requirements.",
    requirements: [
      "Обычно требуется зачисление и Confirmation of Enrolment (CoE).",
      "Нужно выполнить требования Genuine Student и предоставить соответствующие объяснения и доказательства.",
      "Требуются средства на обучение и проживание по действующим правилам.",
      "Могут применяться требования к английскому, медицинской страховке OSHC и здоровью.",
    ],
    requirementsEn: [
      "Enrolment and a Confirmation of Enrolment (CoE) are generally required.",
      "You must meet the Genuine Student requirement and provide relevant explanations and evidence.",
      "Funds for tuition and living costs must meet current requirements.",
      "English, OSHC health insurance and health requirements may apply.",
    ],
    limitations: [
      "Зачисление не гарантирует выдачу визы.",
      "Условия работы и обучения зависят от визовых правил.",
      "Перед подачей проверяйте актуальные финансовые и документальные требования.",
    ],
    limitationsEn: [
      "Enrolment does not guarantee a visa grant.",
      "Work and study conditions depend on visa rules.",
      "Check current financial and documentary requirements before applying.",
    ],
    officialUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
  },
  {
    id: "485",
    title: "Temporary Graduate visa — subclass 485",
    titleEn: "Temporary Graduate visa — subclass 485",
    category: "После учёбы",
    categoryEn: "Post-study",
    description:
      "Временный маршрут для некоторых выпускников, отвечающих актуальным требованиям к австралийскому образованию и заявлению.",
    descriptionEn:
      "A temporary route for certain graduates who meet current Australian study and application requirements.",
    requirements: [
      "Нужно соответствовать требованиям выбранного потока и образовательной квалификации.",
      "Применяются возрастные, временные и другие условия на дату подачи.",
      "Могут требоваться английский, страховка и документы о квалификации.",
    ],
    requirementsEn: [
      "You must meet the requirements of the relevant stream and qualification.",
      "Age, timing and other conditions apply at the date of application.",
      "English, insurance and qualification evidence may be required.",
    ],
    limitations: [
      "Не каждый выпускник австралийского учебного заведения имеет право на эту визу.",
      "Возрастные ограничения, сроки и доступные потоки нужно проверять по актуальным правилам.",
    ],
    limitationsEn: [
      "Not every graduate of an Australian institution qualifies for this visa.",
      "Check current age limits, timing rules and available streams.",
    ],
    officialUrl:
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-graduate-485",
  },
  {
    id: "462",
    title: "Work and Holiday visa — subclass 462",
    titleEn: "Work and Holiday visa — subclass 462",
    category: "Молодёжный обмен",
    categoryEn: "Youth mobility",
    description:
      "Временная виза для граждан участвующих стран, отвечающих возрастным и другим условиям программы.",
    descriptionEn:
      "A temporary visa for eligible nationals of participating countries who meet age and other program requirements.",
    requirements: [
      "Паспорт должен соответствовать требованиям страны-участницы программы.",
      "Обычно применяются возрастные ограничения, чаще всего 18–30 лет включительно, но для некоторых стран правила отличаются.",
      "Могут потребоваться образование, английский, средства и дополнительные документы.",
      "Для некоторых стран действуют квоты или предварительные процедуры.",
    ],
    requirementsEn: [
      "Your passport must meet the requirements for a participating country.",
      "Age limits commonly apply, often 18–30 inclusive, but some countries have different rules.",
      "Education, English, funds and additional documents may be required.",
      "Some countries have quotas or preliminary procedures.",
    ],
    limitations: [
      "Виза доступна не для всех гражданств.",
      "Нельзя считать гражданство подходящим без проверки официального списка и текущих условий.",
    ],
    limitationsEn: [
      "This visa is not available to all nationalities.",
      "Do not assume eligibility without checking the official country list and current conditions.",
    ],
    officialUrl:
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462",
  },
  {
    id: "417",
    title: "Working Holiday visa — subclass 417",
    titleEn: "Working Holiday visa — subclass 417",
    category: "Молодёжный обмен",
    categoryEn: "Youth mobility",
    description:
      "Временная рабочая и туристическая виза для граждан стран, участвующих в программе Working Holiday.",
    descriptionEn:
      "A temporary work-and-holiday visa for eligible nationals of countries participating in the Working Holiday program.",
    requirements: [
      "Нужно иметь паспорт страны, участвующей в программе subclass 417.",
      "Применяются возрастные, финансовые и другие требования.",
      "Для последующих виз могут требоваться определённые виды работы и соблюдение условий программы.",
    ],
    requirementsEn: [
      "You need a passport from a country participating in the subclass 417 program.",
      "Age, financial and other requirements apply.",
      "Further visas may require specified work and compliance with program conditions.",
    ],
    limitations: [
      "Subclass 417 и subclass 462 предназначены для разных списков гражданств.",
      "Доступность нужно проверять по паспорту и действующим правилам.",
    ],
    limitationsEn: [
      "Subclass 417 and subclass 462 have different eligible nationality lists.",
      "Eligibility must be checked against your passport and current rules.",
    ],
    officialUrl:
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/working-holiday-417",
  },
  {
    id: "partner",
    title: "Partner visa — subclasses 820/801 или 309/100",
    titleEn: "Partner visa — subclasses 820/801 or 309/100",
    category: "Семья и партнёрство",
    categoryEn: "Family and partner",
    description:
      "Маршрут для супруга или фактического партнёра гражданина Австралии, постоянного резидента или подходящего гражданина Новой Зеландии.",
    descriptionEn:
      "A route for the spouse or de facto partner of an Australian citizen, permanent resident or eligible New Zealand citizen.",
    requirements: [
      "Нужен подходящий спонсор, отвечающий требованиям Home Affairs.",
      "Нужно доказать подлинность и соответствие требованиям отношений.",
      "Требуются документы о совместной жизни, финансах, социальной стороне отношений и обязательствах — в зависимости от ситуации.",
      "Подкласс подачи зависит, в частности, от того, находится ли заявитель в Австралии или за её пределами.",
    ],
    requirementsEn: [
      "An eligible sponsor who meets Home Affairs requirements is needed.",
      "You must demonstrate that the relationship is genuine and meets the criteria.",
      "Evidence may cover shared life, finances, social aspects and mutual commitment.",
      "The application subclass depends partly on whether you are inside or outside Australia.",
    ],
    limitations: [
      "Брак сам по себе не гарантирует одобрение визы.",
      "Требования к доказательствам и процедуре зависят от конкретных обстоятельств.",
    ],
    limitationsEn: [
      "Marriage alone does not guarantee a visa grant.",
      "Evidence and process requirements depend on the circumstances.",
    ],
    officialUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/partner-onshore",
  },
  {
    id: "visitor",
    title: "Visitor visa — subclass 600",
    titleEn: "Visitor visa — subclass 600",
    category: "Краткий визит",
    categoryEn: "Short visit",
    description:
      "Виза для подходящих краткосрочных туристических, семейных или некоторых деловых визитов.",
    descriptionEn: "A visa for eligible short-term tourist, family or certain business visits.",
    requirements: [
      "Нужно объяснить цель поездки и предоставить требуемые документы.",
      "Необходимо соответствовать финансовым и другим условиям посетителя.",
      "Могут потребоваться доказательства намерения покинуть Австралию после визита.",
      "Требования зависят от гражданства, истории поездок и выбранного потока.",
    ],
    requirementsEn: [
      "You must explain the purpose of the visit and provide required documents.",
      "Visitor financial and other requirements must be met.",
      "Evidence that you intend to leave Australia after the visit may be required.",
      "Requirements depend on nationality, travel history and the selected stream.",
    ],
    limitations: [
      "Visitor visa обычно не предназначена для работы в Австралии.",
      "Для учёбы и длительного проживания могут потребоваться другие визы.",
      "Проверьте, требуется ли вам Visitor visa или другой тип разрешения.",
    ],
    limitationsEn: [
      "A Visitor visa is generally not intended for working in Australia.",
      "Study and long-term residence may require a different visa.",
      "Check whether you need a Visitor visa or another type of permission.",
    ],
    officialUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600",
  },
  {
    id: "business",
    title: "Business and investment pathways",
    titleEn: "Business and investment pathways",
    category: "Бизнес",
    categoryEn: "Business",
    description:
      "Для предпринимателей и инвесторов важно проверить, открыт ли подходящий бизнес-маршрут и выполняются ли условия конкретной программы.",
    descriptionEn:
      "Entrepreneurs and investors should check whether a suitable business pathway is open and whether its specific criteria are met.",
    requirements: [
      "Доступность зависит от действующих программ и категории заявителя.",
      "Могут потребоваться доказательства деловой истории, источника средств, активов или результатов бизнеса.",
      "Нужно отдельно проверить возможность подачи новых заявлений по подходящей категории.",
    ],
    requirementsEn: [
      "Availability depends on current programs and the applicant category.",
      "Evidence of business history, source of funds, assets or business results may be required.",
      "Check whether new applications are currently available under a suitable category.",
    ],
    limitations: [
      "Наличие капитала или компании само по себе не создаёт права на визу.",
      "Некоторые прежние бизнес- и инвестиционные потоки могли закрыться для новых заявителей или измениться.",
    ],
    limitationsEn: [
      "Having capital or a company does not automatically qualify you for a visa.",
      "Some former business and investment streams may have closed to new applicants or changed.",
    ],
    officialUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing",
  },
  {
    id: "talent",
    title: "National Innovation visa — subclass 858",
    titleEn: "National Innovation visa — subclass 858",
    category: "Выдающиеся достижения",
    categoryEn: "Exceptional achievement",
    description:
      "Постоянный маршрут для некоторых выдающихся специалистов, исследователей, предпринимателей и других кандидатов с международно значимыми достижениями.",
    descriptionEn:
      "A permanent route for certain exceptional professionals, researchers, entrepreneurs and other candidates with internationally significant achievements.",
    requirements: [
      "Нужно соответствовать строгим критериям достижений и приоритетов программы.",
      "Применяются требования к номинации и подтверждающим документам.",
      "Нужно проверить действующую процедуру приглашения и подачи заявления.",
    ],
    requirementsEn: [
      "You must meet strict achievement and program-priority criteria.",
      "Nomination and supporting-document requirements apply.",
      "Check the current invitation and application process.",
    ],
    limitations: [
      "Высокая квалификация или учёная степень сами по себе не гарантируют соответствие.",
      "Этот маршрут не является универсальной заменой обычной skilled-визе.",
    ],
    limitationsEn: [
      "High qualifications or a doctorate alone do not guarantee eligibility.",
      "This route is not a universal replacement for ordinary skilled visas.",
    ],
    officialUrl:
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/national-innovation-858",
  },
  {
    id: "nz",
    title: "Special Category visa — subclass 444",
    titleEn: "Special Category visa — subclass 444",
    category: "Граждане Новой Зеландии",
    categoryEn: "New Zealand citizens",
    description:
      "Специальный визовый маршрут для подходящих граждан Новой Зеландии, прибывающих в Австралию.",
    descriptionEn:
      "A special visa pathway for eligible New Zealand citizens arriving in Australia.",
    requirements: [
      "Нужно иметь гражданство Новой Зеландии и выполнить применимые требования при въезде.",
      "Статус и права зависят от обстоятельств и действующих правил.",
      "Для постоянного проживания и гражданства могут действовать отдельные критерии.",
    ],
    requirementsEn: [
      "You must be a New Zealand citizen and meet applicable entry requirements.",
      "Status and rights depend on circumstances and current rules.",
      "Separate criteria may apply to permanent residence and citizenship.",
    ],
    limitations: [
      "Этот маршрут не предназначен для граждан других стран только потому, что они живут в Новой Зеландии.",
      "Права и возможные дальнейшие маршруты необходимо проверять отдельно.",
    ],
    limitationsEn: [
      "This route is not for nationals of other countries merely because they live in New Zealand.",
      "Rights and possible future pathways should be checked separately.",
    ],
    officialUrl:
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/special-category-444",
  },
  {
    id: "protection",
    title: "Protection visa — subclass 866",
    titleEn: "Protection visa — subclass 866",
    category: "Защита",
    categoryEn: "Protection",
    description:
      "Постоянный защитный маршрут для некоторых людей, которые находятся в Австралии и соответствуют строгим критериям защиты.",
    descriptionEn:
      "A permanent protection pathway for certain people in Australia who meet strict protection criteria.",
    requirements: [
      "Доступность зависит от местонахождения заявителя и конкретных требований визы.",
      "Обстоятельства рассматриваются индивидуально, с учётом применимых критериев защиты.",
      "Нужно предоставлять правдивую информацию и доступные подтверждающие документы.",
      "Рекомендуется квалифицированная юридическая помощь.",
    ],
    requirementsEn: [
      "Eligibility depends on the applicant's location and the specific visa requirements.",
      "Circumstances are assessed individually against the applicable protection criteria.",
      "You must provide truthful information and available supporting evidence.",
      "Qualified legal assistance is recommended.",
    ],
    limitations: [
      "Анкета не определяет право на защиту и не заменяет юридическую оценку.",
      "Нельзя делать вывод о праве на визу только по гражданству или одному ответу.",
    ],
    limitationsEn: [
      "This questionnaire does not determine protection eligibility or replace legal assessment.",
      "Eligibility cannot be inferred from nationality or a single answer.",
    ],
    officialUrl:
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/protection-866",
  },
];
const tRu = {
  title: "Навигатор иммиграции в Австралию",
  subtitle:
    "Ответьте на вопросы, чтобы изучить возможные визовые маршруты, основные условия и официальные источники для дальнейшей проверки.",
  reset: "Сбросить ответы",
  progress: "Прогресс",
  of: "из",
  questions: "вопросов",
  allQuestions: "Ваша ситуация",
  answered: "Заполнено",
  notAnswered: "Не заполнено",
  choose: "Выберите ответ",
  showResults: "Показать подходящие маршруты",
  results: "Возможные маршруты",
  resultsDescription:
    "Маршруты отсортированы по ориентировочному соответствию вашим ответам.",
  scoreDisclaimer:
    "Баллы — ориентир для навигации, а не вероятность одобрения и не юридическое заключение. Окончательные требования определяет Department of Home Affairs.",
  noResults: "Пока нет подходящих результатов",
  noResultsDescription:
    "Ответьте на вопросы о цели поездки, работе, образовании, семье и финансах. Не все визовые критерии можно определить по краткой анкете.",
  top: "Наиболее подходящий",
  requirements: "Основные требования",
  limitations: "Ограничения и что проверить",
  official: "Официальные требования",
  showAll: "Показать все маршруты",
  showFewer: "Показать меньше",
  noticeTitle: "Важная информация",
  noticeText:
    "Иммиграционные правила Австралии меняются. Перед подачей проверяйте актуальные условия, сборы, сроки и доступность маршрута на официальном сайте.",
  rulesLink: "Официальный каталог виз Австралии",
  passportTitle: "Проверка въезда",
  passportText:
    "Тип визы и требования зависят от гражданства и цели поездки. Проверьте правила для своего паспорта до покупки билетов.",
  historyTitle: "Предыдущие отказы или нарушения",
  historyText:
    "Визовые отказы, отмены виз и нарушения условий могут повлиять на заявление. Предоставляйте правдивые сведения и проверяйте, какие документы нужны.",
  expiredTitle: "Истёкшая виза или неясный статус",
  expiredText:
    "Если виза истекла или ваш статус неясен, не полагайтесь на общие результаты анкеты. Проверьте официальные требования и при необходимости срочно обратитесь к квалифицированному специалисту.",
  protectionTitle: "Защита и гуманитарные вопросы",
  protectionText:
    "Если вы опасаетесь преследования или серьёзного вреда при возвращении, обратитесь к официальной информации и квалифицированному специалисту. Этот инструмент не оценивает обоснованность заявления.",
  generalDisclaimer:
    "Инструмент предназначен для общей навигации и не является иммиграционной или юридической консультацией. Баллы не отражают вероятность одобрения. Проверяйте актуальные правила на сайте Department of Home Affairs.",
  footer: "Вернуться к World Navigator",
};

const tEn = {
  title: "Australia Immigration Navigator",
  subtitle:
    "Answer the questions to explore possible visa routes, key requirements and official sources for further checks.",
  reset: "Reset answers",
  progress: "Progress",
  of: "of",
  questions: "questions",
  allQuestions: "Your situation",
  answered: "Answered",
  notAnswered: "Not answered",
  choose: "Choose an answer",
  showResults: "Show possible routes",
  results: "Possible routes",
  resultsDescription:
    "Routes are sorted by indicative fit with your answers.",
  scoreDisclaimer:
    "Scores are navigation aids, not approval probabilities or legal advice. The Department of Home Affairs sets the definitive requirements.",
  noResults: "No matching results yet",
  noResultsDescription:
    "Answer questions about your visit, work, education, family and funds. Not every visa criterion can be assessed by a short questionnaire.",
  top: "Best match",
  requirements: "Main requirements",
  limitations: "Limitations and checks",
  official: "Official requirements",
  showAll: "Show all routes",
  showFewer: "Show fewer",
  noticeTitle: "Important information",
  noticeText:
    "Australian immigration rules change. Check current criteria, fees, processing times and route availability on the official website before applying.",
  rulesLink: "Official Australian visa directory",
  passportTitle: "Check entry requirements",
  passportText:
    "Visa type and requirements depend on nationality and purpose of travel. Check the rules for your passport before booking.",
  historyTitle: "Previous refusals or breaches",
  historyText:
    "Visa refusals, cancellations and breaches of conditions can affect an application. Provide truthful information and check which documents are needed.",
  expiredTitle: "Expired visa or unclear status",
  expiredText:
    "If your visa has expired or your status is unclear, do not rely on general questionnaire results. Check the official requirements and seek qualified advice promptly if needed.",
  protectionTitle: "Protection and humanitarian matters",
  protectionText:
    "If you fear persecution or serious harm on return, consult official information and a qualified specialist. This tool does not assess the merits of a claim.",
  generalDisclaimer:
    "This tool provides general navigation and is not immigration or legal advice. Scores do not represent the probability of approval. Check current rules on the Department of Home Affairs website.",
  footer: "Back to World Navigator",
};

function getRouteScore(id: string, a: Answers): number {
  const goal = a.goal;
  let score = 0;

  const hasJobOffer = a.jobOffer === "yes";
  const hasSponsor = a.sponsor === "yes";
  const hasStudyOffer = ["yes", "conditional"].includes(a.studyOffer);
  const hasCoE = a.coe === "yes";
  const hasFunds = ["yes", "sponsor"].includes(a.funds);
  const hasSomeFunds = ["yes", "some", "sponsor"].includes(a.funds);
  const hasPassport = a.passport === "yes";
  const hasEnglish = ["competent", "proficient", "superior", "test", "exempt"].includes(a.english);
  const strongEnglish = ["proficient", "superior", "test", "exempt"].includes(a.english);
  const experienced = ["1-3", "3-5", "5plus"].includes(a.workExperience);
  const highlyExperienced = ["3-5", "5plus"].includes(a.workExperience);
  const hasDegree = ["bachelor", "master", "phd"].includes(a.education);
  const advancedDegree = ["master", "phd"].includes(a.education);
  const hasSkillsAssessment = a.skillsAssessment === "yes";
  const hasNomination = a.stateNomination === "yes";
  const consideringNomination = ["yes", "applied", "interested"].includes(a.stateNomination);
  const regionalWilling = ["yes", "maybe"].includes(a.regional);
  const familyPartner = ["partner", "eligibleNZ"].includes(a.family);
  const young = ["18-25", "26-30"].includes(a.age);

  const eligible462Nationality = ["in", "cn", "ph", "jp", "kr", "gb", "de", "fr", "ie"].includes(
    a.citizenship,
  );
  const eligible417Nationality = ["gb", "de", "fr", "ie", "jp", "kr", "ca", "nz"].includes(
    a.citizenship,
  );

  switch (id) {
    case "189": {
      if (!["work", "settle", "talent"].includes(goal)) return 0;
      if (["none", "other"].includes(a.occupation)) return 0;
      score = 15;
      if (hasSkillsAssessment) score += 20;
      else if (a.skillsAssessment === "applied") score += 10;
      else if (a.skillsAssessment === "no") score -= 5;
      if (["65-79", "80-94"].includes(a.points)) score += 15;
      if (a.points === "95plus") score += 20;
      if (a.points === "under65") score -= 15;
      if (hasDegree) score += 8;
      if (advancedDegree) score += 4;
      if (strongEnglish) score += 10;
      else if (hasEnglish) score += 5;
      if (experienced) score += 7;
      if (a.age === "45plus") score -= 25;
      if (a.age === "36-44") score += 2;
      if (a.citizenship === "unknown") score -= 2;
      if (a.status === "expired") score -= 20;
      if (a.immigrationHistory === "refusal" || a.immigrationHistory === "cancellation") score -= 5;
      return Math.max(0, Math.min(score, 95));
    }

    case "190": {
      if (!["work", "settle", "talent"].includes(goal)) return 0;
      if (["none", "other"].includes(a.occupation)) return 0;
      score = 18;
      if (hasNomination) score += 25;
      else if (consideringNomination) score += 10;
      if (hasSkillsAssessment) score += 15;
      else if (a.skillsAssessment === "applied") score += 7;
      if (["65-79", "80-94"].includes(a.points)) score += 12;
      if (a.points === "95plus") score += 15;
      if (a.points === "under65") score -= 12;
      if (hasDegree) score += 6;
      if (strongEnglish) score += 8;
      else if (hasEnglish) score += 4;
      if (experienced) score += 5;
      if (a.age === "45plus") score -= 25;
      if (a.status === "expired") score -= 20;
      return Math.max(0, Math.min(score, 95));
    }

    case "491": {
      if (!["work", "settle"].includes(goal)) return 0;
      if (["none", "other"].includes(a.occupation)) return 0;
      score = 20;
      if (regionalWilling) score += 18;
      if (hasNomination) score += 20;
      else if (consideringNomination) score += 10;
      if (hasSkillsAssessment) score += 15;
      else if (a.skillsAssessment === "applied") score += 7;
      if (["65-79", "80-94"].includes(a.points)) score += 10;
      if (a.points === "95plus") score += 13;
      if (a.points === "under65") score -= 10;
      if (experienced) score += 5;
      if (hasEnglish) score += 5;
      if (a.age === "45plus") score -= 20;
      if (a.status === "expired") score -= 20;
      if (a.regional === "no") score -= 15;
      return Math.max(0, Math.min(score, 95));
    }

    case "482": {
      if (!["work", "settle"].includes(goal)) return 0;
      if (a.occupation === "none") return 0;
      score = 12;
      if (hasJobOffer) score += 25;
      else if (a.jobOffer === "interview") score += 12;
      else if (a.jobOffer === "searching") score += 5;
      if (hasSponsor) score += 25;
      else if (a.sponsor === "possible") score += 12;
      else if (a.sponsor === "no") score -= 12;
      if (experienced) score += 10;
      if (highlyExperienced) score += 5;
      if (["75-100", "100plus"].includes(a.salary)) score += 8;
      if (a.salary === "unknown") score += 2;
      if (hasEnglish) score += 5;
      if (a.skillsAssessment === "yes") score += 4;
      if (a.occupation === "health" || a.occupation === "it" || a.occupation === "trade") {
        score += 4;
      }
      if (a.jobOffer === "no") score -= 15;
      if (a.status === "expired") score -= 20;
      return Math.max(0, Math.min(score, 95));
    }

    case "186": {
      if (!["work", "settle"].includes(goal)) return 0;
      if (a.occupation === "none") return 0;
      score = 10;
      if (hasJobOffer) score += 20;
      if (hasSponsor) score += 25;
      else if (a.sponsor === "possible") score += 10;
      if (highlyExperienced) score += 12;
      else if (experienced) score += 7;
      if (hasSkillsAssessment) score += 10;
      if (hasEnglish) score += 5;
      if (["75-100", "100plus"].includes(a.salary)) score += 5;
      if (a.age === "45plus") score -= 15;
      if (a.jobOffer === "no") score -= 15;
      if (a.status === "expired") score -= 20;
      return Math.max(0, Math.min(score, 95));
    }

    case "494": {
      if (!["work", "settle"].includes(goal)) return 0;
      if (a.occupation === "none") return 0;
      score = 12;
      if (hasJobOffer) score += 22;
      if (hasSponsor) score += 25;
      else if (a.sponsor === "possible") score += 10;
      if (regionalWilling) score += 15;
      if (experienced) score += 8;
      if (hasEnglish) score += 5;
      if (hasSkillsAssessment) score += 8;
      if (["75-100", "100plus"].includes(a.salary)) score += 5;
      if (a.regional === "no") score -= 20;
      if (a.jobOffer === "no") score -= 12;
      if (a.status === "expired") score -= 20;
      return Math.max(0, Math.min(score, 95));
    }

    case "500": {
      if (goal !== "study") return 0;
      score = 15;
      if (hasStudyOffer) score += 20;
      if (hasCoE) score += 25;
      if (hasFunds) score += 15;
      else if (a.funds === "some") score += 5;
      if (hasEnglish) score += 5;
      if (hasPassport) score += 5;
      if (a.education === "bachelor" || a.education === "master" || a.education === "phd") {
        score += 3;
      }
      if (a.studyOffer === "no") score -= 5;
      if (a.funds === "no") score -= 15;
      if (a.passport === "no") score -= 20;
      if (a.status === "expired") score -= 20;
      if (a.immigrationHistory === "cancellation") score -= 10;
      return Math.max(0, Math.min(score, 95));
    }

    case "485": {
      if (!["work", "settle", "study"].includes(goal)) return 0;
      if (a.residence !== "au" && a.status !== "student") return 0;
      score = 15;
      if (a.status === "student") score += 25;
      if (a.education !== "school") score += 12;
      if (hasDegree) score += 10;
      if (hasEnglish) score += 5;
      if (hasPassport) score += 5;
      if (a.residence === "au") score += 8;
      if (a.age === "45plus") score -= 20;
      if (a.status === "expired") score -= 30;
      return Math.max(0, Math.min(score, 85));
    }

    case "462": {
      if (!["work", "visit", "settle"].includes(goal)) return 0;
      if (!eligible462Nationality) return 0;
      score = 30;
      if (young) score += 25;
      if (a.age === "31-35") score += 8;
      if (hasPassport) score += 10;
      if (hasSomeFunds) score += 10;
      if (hasEnglish) score += 5;
      if (hasDegree) score += 5;
      if (a.age === "under18" || a.age === "36-44" || a.age === "45plus") score = 0;
      if (a.passport === "no") score -= 25;
      if (a.funds === "no") score -= 10;
      return Math.max(0, Math.min(score, 85));
    }

    case "417": {
      if (!["work", "visit", "settle"].includes(goal)) return 0;
      if (!eligible417Nationality) return 0;
      score = 30;
      if (young) score += 25;
      if (a.age === "31-35") score += 8;
      if (hasPassport) score += 10;
      if (hasSomeFunds) score += 10;
      if (a.age === "under18" || a.age === "36-44" || a.age === "45plus") score = 0;
      if (a.passport === "no") score -= 25;
      if (a.funds === "no") score -= 10;
      return Math.max(0, Math.min(score, 85));
    }

    case "partner": {
      if (!["family", "settle"].includes(goal)) return 0;
      if (!familyPartner) return 0;
      score = 30;
      if (a.relationship === "married") score += 20;
      if (a.relationship === "de facto") score += 18;
      if (a.relationship === "new") score += 3;
      if (hasPassport) score += 5;
      if (hasSomeFunds) score += 5;
      if (a.family === "eligibleNZ") score += 5;
      if (a.immigrationHistory === "refusal" || a.immigrationHistory === "cancellation") score -= 5;
      if (a.status === "expired") score -= 10;
      return Math.max(0, Math.min(score, 90));
    }

    case "visitor": {
      if (goal !== "visit") return 0;
      if (a.visitDuration === "permanent") return 0;
      score = 35;
      if (hasPassport) score += 15;
      if (hasSomeFunds) score += 15;
      if (a.visitDuration === "short") score += 10;
      if (a.residence === "outside") score += 5;
      if (a.family !== "none" && a.family) score += 3;
      if (a.passport === "no") score -= 25;
      if (a.funds === "no") score -= 15;
      if (a.status === "expired") score -= 15;
      if (a.immigrationHistory === "overstay" || a.immigrationHistory === "cancellation") {
        score -= 10;
      }
      return Math.max(0, Math.min(score, 85));
    }

    case "business": {
      if (goal !== "business") return 0;
      score = 10;
      if (a.business === "innovative") score += 25;
      if (a.business === "existing") score += 20;
      if (a.business === "capital") score += 20;
      if (hasFunds) score += 15;
      if (a.education === "bachelor" || a.education === "master" || a.education === "phd") {
        score += 5;
      }
      if (a.talent === "international" || a.talent === "senior") score += 10;
      if (a.business === "no") score = 0;
      if (a.funds === "no") score -= 15;
      return Math.max(0, Math.min(score, 80));
    }

    case "talent": {
      if (!["talent", "work", "settle"].includes(goal)) return 0;
      score = 10;
      if (a.talent === "international") score += 40;
      if (a.talent === "research") score += 30;
      if (a.talent === "senior") score += 25;
      if (a.talent === "potential") score += 8;
      if (a.education === "phd") score += 10;
      if (a.workExperience === "5plus") score += 8;
      if (a.occupation === "science") score += 5;
      if (a.talent === "no") score = 0;
      return Math.max(0, Math.min(score, 90));
    }

    case "nz": {
      if (a.citizenship !== "nz") return 0;
      if (!["work", "settle", "family", "visit"].includes(goal)) return 0;
      score = 60;
      if (a.status === "nzSpecial") score += 15;
      if (a.residence === "nz" || a.residence === "au") score += 5;
      if (hasPassport) score += 5;
      if (a.passport === "no") score -= 20;
      return Math.max(0, Math.min(score, 85));
    }

    case "protection": {
      if (goal !== "protection" && !["yes", "unsure"].includes(a.protection)) return 0;
      score = a.protection === "yes" ? 70 : 40;
      if (a.residence === "au") score += 10;
      if (a.residence === "outside") score -= 10;
      if (a.protection === "no" && goal !== "protection") return 0;
      return Math.max(0, Math.min(score, 80));
    }

    default:
      return 0;
  }
}

function getRouteWarning(id: string, a: Answers, isEnglish: boolean): string | null {
  const warning = (ru: string, en: string) => (isEnglish ? en : ru);

  if (id === "189") {
    if (a.age === "45plus") {
      return warning(
        "Для многих skilled-виз действует возрастное ограничение на момент приглашения. Проверьте официальные исключения и критерии.",
        "Many skilled visas have an age limit at the time of invitation. Check the official criteria and any exemptions.",
      );
    }
    if (a.skillsAssessment !== "yes") {
      return warning(
        "Для выбранной профессии может требоваться положительная оценка квалификации. Баллы анкеты не заменяют официальную оценку.",
        "A positive skills assessment may be required for your occupation. Questionnaire scores do not replace an official assessment.",
      );
    }
    if (a.points === "under65") {
      return warning(
        "По вашему предварительному ответу результат ниже базового порога 65 баллов. Перепроверьте официальный расчёт и требования.",
        "Your estimated score is below the basic 65-point threshold. Recheck the official calculation and requirements.",
      );
    }
    return warning(
      "Нужно соответствовать критериям профессии, оценке квалификации и приглашению через SkillSelect. Минимум 65 баллов не гарантирует приглашение.",
      "You must meet occupation, skills-assessment and SkillSelect invitation criteria. The 65-point minimum does not guarantee an invitation.",
    );
  }
  if (id === "190") {
    return warning(
      "Для subclass 190 необходима номинация штата или территории. У каждого штата могут быть собственные критерии и приоритеты.",
      "Subclass 190 requires state or territory nomination. Each state may have its own criteria and priorities.",
    );
  }
  if (id === "491" || id === "494") {
    return warning(
      "Региональные маршруты имеют отдельные правила по месту проживания и работы. Проверьте, соответствует ли выбранный регион официальному определению.",
      "Regional routes have specific residence and work rules. Check whether the intended location meets the official definition.",
    );
  }
  if (id === "482" && (!a.jobOffer || a.jobOffer !== "yes" || a.sponsor !== "yes")) {
    return warning(
      "Для Skills in Demand visa нужен подходящий спонсирующий работодатель и номинация должности. Уточните, готов ли работодатель выполнить эти требования.",
      "A Skills in Demand visa requires an eligible sponsoring employer and position nomination. Confirm the employer can meet these requirements.",
    );
  }
  if (id === "186") {
    return warning(
      "Для постоянной employer-sponsored визы нужно соответствовать условиям конкретного потока и требованиям к номинации работодателя.",
      "A permanent employer-sponsored visa requires meeting the relevant stream and employer nomination requirements.",
    );
  }
  if (id === "500" && a.coe !== "yes") {
    return warning(
      "Обычно для Student visa нужен Confirmation of Enrolment (CoE). Также проверьте Genuine Student, финансовые требования и OSHC.",
      "A Confirmation of Enrolment (CoE) is generally required for a Student visa. Also check Genuine Student, financial and OSHC requirements.",
    );
  }
  if (id === "485") {
    return warning(
      "Temporary Graduate visa доступна не всем выпускникам. Проверьте текущие требования к возрасту, квалификации, срокам и выбранному потоку.",
      "The Temporary Graduate visa is not available to every graduate. Check current age, qualification, timing and stream requirements.",
    );
  }
  if (id === "462" || id === "417") {
    return warning(
      "Право на Work and Holiday зависит от гражданства, возраста и дополнительных условий. Проверьте официальный список стран именно для этого подкласса.",
      "Work and Holiday eligibility depends on nationality, age and additional conditions. Check the official country list for this specific subclass.",
    );
  }
  if (id === "partner") {
    return warning(
      "Нужно подтвердить, что спонсор соответствует требованиям, а отношения являются подлинными и отвечают критериям партнёрской визы.",
      "You must show that the sponsor is eligible and the relationship is genuine and meets partner visa criteria.",
    );
  }
  if (id === "visitor") {
    return warning(
      "Тип разрешения для визита зависит от гражданства и цели поездки. Visitor visa обычно не даёт права работать в Австралии.",
      "The visitor permission you need depends on nationality and travel purpose. A Visitor visa generally does not allow work in Australia.",
    );
  }
  if (id === "business") {
    return warning(
      "Австралийские бизнес- и инвестиционные программы менялись. Проверьте, открыт ли подходящий маршрут для новых заявителей и какие правила действуют сейчас.",
      "Australian business and investment programs have changed. Check whether a suitable route is open to new applicants and what rules currently apply.",
    );
  }
  if (id === "talent") {
    return warning(
      "National Innovation visa — специализированный маршрут с высокими критериями достижений и приоритетов. Обычного диплома или стажа недостаточно.",
      "The National Innovation visa is a specialised route with high achievement and priority criteria. A degree or work experience alone is not enough.",
    );
  }
  if (id === "nz") {
    return warning(
      "Subclass 444 предназначен для подходящих граждан Новой Зеландии. Проверьте условия въезда, статус и права на официальном сайте.",
      "Subclass 444 is for eligible New Zealand citizens. Check entry conditions, status and rights on the official website.",
    );
  }
  if (id === "protection") {
    return warning(
      "Этот результат не определяет право на защиту. Доступность конкретной визы зависит от местонахождения, обстоятельств и применимых критериев.",
      "This result does not determine protection eligibility. Availability depends on location, circumstances and applicable criteria.",
    );
  }

  return null;
}

export const auQuizConfig: CountryQuizConfig = {
  id: "au",
  flagCode: "AU",
  countryNameEn: "Australia",
  questions,
  routes: ROUTES,
  copy: { ru: tRu, en: tEn },
  getRouteScore,
  getRouteWarning,
  officialLinks: {
    noticeUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing",
    visit: {
      url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing",
      labelEn: "Check official entry requirements",
      labelRu: "Проверить официальные требования для въезда",
    },
    history: {
      url: "https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/character",
      labelEn: "Official immigration information",
      labelRu: "Официальная информация об иммиграционных требованиях",
    },
    expired: {
      url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing",
      labelEn: "Check official visa information",
      labelRu: "Проверить официальную информацию о визах",
    },
    protection: {
      url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/protection-866",
      labelEn: "Official protection visa information",
      labelRu: "Официальная информация о визе защиты",
    },
  },
};