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
  opt("other", "Другое гражданство", "Other citizenship"),
  opt("unknown", "Не уверен(а)", "Not sure"),
];

const questions: QuizQuestion[] = [
  {
    id: "goal",
    title: "Какова ваша главная цель в Германии?",
    en: "What is your main goal in Germany?",
    description: "Выберите основную цель предполагаемого пребывания.",
    descriptionEn: "Select the main purpose of your intended stay.",
    options: [
      opt("work", "Работа по найму", "Employment"),
      opt("bluecard", "EU Blue Card для квалифицированного специалиста", "EU Blue Card for highly qualified employment"),
      opt("jobsearch", "Поиск работы без предложения работодателя", "Job search without a job offer"),
      opt("study", "Учёба в университете", "University studies"),
      opt("ausbildung", "Профессиональное обучение Ausbildung", "Vocational training (Ausbildung)"),
      opt("family", "Воссоединение семьи", "Family reunification"),
      opt("business", "Собственный бизнес или фриланс", "Self-employment or freelancing"),
      opt("visit", "Туризм или краткосрочный визит", "Tourism or short visit"),
      opt("permanent", "Постоянное проживание", "Permanent residence"),
      opt("citizenship", "Получение немецкого гражданства", "German citizenship"),
      opt("protection", "Убежище или гуманитарная защита", "Asylum or humanitarian protection"),
      opt("recognition", "Признание квалификации", "Recognition of qualifications"),
      opt("unsure", "Пока не определился", "Not sure yet"),
    ],
  },
  {
    id: "citizenship",
    title: "Какое у вас гражданство?",
    en: "What is your citizenship?",
    description: "Граждане ЕС/ЕЭЗ и Швейцарии пользуются другими правилами передвижения и проживания.",
    descriptionEn: "EU/EEA and Swiss citizens benefit from different residence and mobility rules.",
    options: citizenshipOptions,
  },
  {
    id: "age",
    title: "Сколько вам лет?",
    en: "How old are you?",
    options: [
      opt("under18", "Младше 18 лет", "Under 18"),
      opt("18-29", "18–29 лет", "18–29"),
      opt("30-34", "30–34 года", "30–34"),
      opt("35-44", "35–44 года", "35–44"),
      opt("45plus", "45 лет и старше", "45 or older"),
    ],
  },
  {
    id: "residence",
    title: "Где вы сейчас проживаете?",
    en: "Where do you currently live?",
    options: [
      opt("outside", "За пределами Германии", "Outside Germany"),
      opt("germany", "В Германии на законных основаниях", "In Germany with lawful status"),
      opt("eu", "В другой стране ЕС/ЕЭЗ или Швейцарии", "In another EU/EEA country or Switzerland"),
      opt("uncertain", "Статус проживания неясен", "Residence status is uncertain"),
    ],
  },
  {
    id: "german",
    title: "Какой у вас уровень немецкого языка?",
    en: "What is your German language level?",
    description: "Требуемый уровень зависит от визового маршрута, профессии и программы.",
    descriptionEn: "The required level depends on the immigration route, profession and programme.",
    options: [
      opt("none", "Нет подтверждённого уровня", "No certified level"),
      opt("a1", "A1 — начальный", "A1 — beginner"),
      opt("a2", "A2 — базовый", "A2 — elementary"),
      opt("b1", "B1 — средний", "B1 — intermediate"),
      opt("b2", "B2 — выше среднего", "B2 — upper intermediate"),
      opt("c1", "C1 или выше", "C1 or higher"),
    ],
  },
  {
    id: "english",
    title: "Какой у вас уровень английского?",
    en: "What is your English language level?",
    options: [
      opt("none", "Не владею или начальный", "None or beginner"),
      opt("basic", "Базовый", "Basic"),
      opt("b1", "B1", "B1"),
      opt("b2", "B2", "B2"),
      opt("c1", "C1 или выше", "C1 or higher"),
    ],
  },
  {
    id: "education",
    title: "Какое у вас образование или профессиональная квалификация?",
    en: "What education or professional qualification do you have?",
    options: [
      opt("none", "Нет завершённого профессионального образования", "No completed professional qualification"),
      opt("school", "Среднее образование", "Secondary education"),
      opt("vocational", "Профессиональное образование / диплом колледжа", "Vocational qualification"),
      opt("bachelor", "Степень бакалавра или эквивалент", "Bachelor's degree or equivalent"),
      opt("master", "Магистратура или выше", "Master's degree or higher"),
      opt("regulated", "Квалификация в регулируемой профессии", "Qualification in a regulated profession"),
    ],
  },
  {
    id: "workExperience",
    title: "Каков ваш профессиональный опыт?",
    en: "How much professional experience do you have?",
    options: [
      opt("none", "Нет опыта", "No experience"),
      opt("under2", "Менее 2 лет", "Less than 2 years"),
      opt("2-5", "2–5 лет", "2–5 years"),
      opt("5plus", "Более 5 лет", "More than 5 years"),
    ],
  },
  {
    id: "germanyExperience",
    title: "Есть ли у вас опыт работы или обучения в Германии?",
    en: "Do you have work or study experience in Germany?",
    options: [
      opt("yes", "Да", "Yes"),
      opt("no", "Нет", "No"),
      opt("current", "Сейчас работаю или учусь в Германии", "Currently working or studying in Germany"),
    ],
  },
  {
    id: "jobOffer",
    title: "Есть ли у вас предложение работы от немецкого работодателя?",
    en: "Do you have a job offer from a German employer?",
    options: [
      opt("yes", "Да, есть конкретное предложение или договор", "Yes, I have a concrete offer or contract"),
      opt("interview", "Есть переговоры или собеседования", "I have interviews or ongoing discussions"),
      opt("no", "Нет", "No"),
      opt("self", "Планирую работать на себя", "I plan to be self-employed"),
    ],
  },
  {
    id: "profession",
    title: "В какой сфере вы планируете работать?",
    en: "In which field do you plan to work?",
    options: [
      opt("it", "IT, технологии или цифровые профессии", "IT, technology or digital professions"),
      opt("engineering", "Инженерия или технические специальности", "Engineering or technical occupations"),
      opt("health", "Медицина или уход", "Healthcare or nursing"),
      opt("craft", "Ремесло, производство или строительство", "Trades, manufacturing or construction"),
      opt("business", "Бизнес, финансы или управление", "Business, finance or management"),
      opt("education", "Образование или наука", "Education or research"),
      opt("other", "Другая сфера", "Other field"),
      opt("none", "Пока не планирую работать", "I do not plan to work yet"),
    ],
  },
  {
    id: "recognition",
    title: "Как обстоят дела с признанием вашей квалификации в Германии?",
    en: "What is the status of recognition of your qualifications in Germany?",
    description: "Для некоторых профессий признание диплома или лицензия обязательны.",
    descriptionEn: "Recognition of qualifications or a licence is mandatory for some professions.",
    options: [
      opt("recognized", "Квалификация признана или сопоставима", "Recognised or comparable"),
      opt("pending", "Процесс признания начат", "Recognition process has started"),
      opt("notstarted", "Ещё не обращался за признанием", "Not yet applied for recognition"),
      opt("notneeded", "Для моей профессии признание не требуется", "Recognition is not required for my occupation"),
      opt("unknown", "Не знаю", "Not sure"),
    ],
  },
  {
    id: "state",
    title: "В какой федеральной земле Германии вы планируете жить?",
    en: "In which German federal state do you plan to live?",
    options: [
      opt("berlin", "Берлин", "Berlin"),
      opt("bavaria", "Бавария", "Bavaria"),
      opt("baden", "Баден-Вюртемберг", "Baden-Württemberg"),
      opt("nrw", "Северный Рейн — Вестфалия", "North Rhine-Westphalia"),
      opt("hesse", "Гессен", "Hesse"),
      opt("hamburg", "Гамбург", "Hamburg"),
      opt("other", "Другая земля", "Another state"),
      opt("unknown", "Пока не знаю", "Not decided yet"),
    ],
  },
  {
    id: "studyOffer",
    title: "Есть ли у вас подтверждение о зачислении в немецкое учебное заведение?",
    en: "Have you been admitted to a German educational institution?",
    options: [
      opt("yes", "Да, университет или вуз подтвердил зачисление", "Yes, a university has admitted me"),
      opt("conditional", "Есть условное зачисление или подготовительная программа", "Conditional admission or preparatory programme"),
      opt("training", "Есть предложение места Ausbildung", "I have an Ausbildung offer"),
      opt("no", "Нет", "No"),
      opt("planning", "Пока выбираю программу", "I am still choosing a programme"),
    ],
  },
  {
    id: "institution",
    title: "Проверяли ли вы требования к учебному заведению и вашему аттестату?",
    en: "Have you checked the institution and school-leaving qualification requirements?",
    options: [
      opt("yes", "Да, требования проверены", "Yes, I have checked the requirements"),
      opt("partial", "Проверил частично", "Partially checked"),
      opt("no", "Нет", "No"),
      opt("na", "Не относится к моей ситуации", "Not applicable to me"),
    ],
  },
  {
    id: "family",
    title: "Есть ли у вас близкий родственник, проживающий в Германии?",
    en: "Do you have a close family member living in Germany?",
    description: "Возможность воссоединения зависит от родства и статуса родственника.",
    descriptionEn: "Family reunification depends on the relationship and the relative's residence status.",
    options: [
      opt("spouse", "Супруг или зарегистрированный партнёр", "Spouse or registered partner"),
      opt("child", "Несовершеннолетний ребёнок", "Minor child"),
      opt("parent", "Родитель ребёнка, проживающего в Германии", "Parent of a child living in Germany"),
      opt("other", "Другой родственник", "Another relative"),
      opt("no", "Нет", "No"),
    ],
  },
  {
    id: "familyStatus",
    title: "Каков статус родственника в Германии?",
    en: "What is your relative's status in Germany?",
    options: [
      opt("citizen", "Гражданин Германии", "German citizen"),
      opt("eu", "Гражданин другой страны ЕС/ЕЭЗ", "Citizen of another EU/EEA country"),
      opt("permanent", "Постоянный вид на жительство", "Permanent residence permit"),
      opt("work", "Временный ВНЖ для работы", "Temporary work residence permit"),
      opt("study", "ВНЖ для учёбы", "Student residence permit"),
      opt("protection", "Статус защиты или убежища", "Protection or asylum status"),
      opt("unknown", "Не знаю", "Not sure"),
      opt("na", "Нет родственника в Германии", "No relative in Germany"),
    ],
  },
  {
    id: "funds",
    title: "Можете ли вы подтвердить наличие средств на проживание?",
    en: "Can you prove that you have sufficient funds for living expenses?",
    description: "Способы подтверждения зависят от типа визы: например, блокированный счёт, стипендия или обязательство спонсора.",
    descriptionEn: "Accepted proof depends on the visa type and may include a blocked account, scholarship or formal sponsorship.",
    options: [
      opt("yes", "Да, средства или подтверждение финансирования есть", "Yes, funds or financial proof are available"),
      opt("partial", "Есть часть средств", "I have some funds"),
      opt("sponsor", "Есть спонсор или стипендия", "I have a sponsor or scholarship"),
      opt("no", "Пока нет", "Not yet"),
      opt("unknown", "Не знаю, сколько требуется", "I do not know the required amount"),
    ],
  },
  {
    id: "business",
    title: "Планируете ли вы открыть бизнес или работать как фрилансер?",
    en: "Do you plan to start a business or work as a freelancer?",
    options: [
      opt("business", "Открыть компанию или коммерческий бизнес", "Start a company or commercial business"),
      opt("freelance", "Работать как фрилансер", "Work as a freelancer"),
      opt("existing", "У меня уже есть бизнес", "I already have a business"),
      opt("no", "Нет", "No"),
      opt("considering", "Рассматриваю такую возможность", "I am considering it"),
    ],
  },
  {
    id: "visitDuration",
    title: "Как долго вы планируете находиться в Германии?",
    en: "How long do you plan to stay in Germany?",
    options: [
      opt("short", "До 90 дней", "Up to 90 days"),
      opt("long", "Более 90 дней", "More than 90 days"),
      opt("permanent", "Переезд на постоянной основе", "Long-term relocation"),
      opt("unknown", "Пока не знаю", "Not sure yet"),
    ],
  },
  {
    id: "passport",
    title: "Есть ли у вас действующий паспорт?",
    en: "Do you have a valid passport?",
    options: [
      opt("yes", "Да", "Yes"),
      opt("expiring", "Скоро истекает срок действия", "It expires soon"),
      opt("no", "Нет", "No"),
      opt("refugee", "У меня особые документы или документ беженца", "I have special travel documents or a refugee travel document"),
    ],
  },
  {
    id: "immigrationHistory",
    title: "Были ли у вас отказы в визе, нарушения или проблемы с миграционным статусом?",
    en: "Have you had visa refusals, violations or immigration status issues?",
    options: [
      opt("no", "Нет", "No"),
      opt("refusal", "Был отказ в визе или ВНЖ", "I had a visa or residence permit refusal"),
      opt("overstay", "Было превышение разрешённого срока пребывания", "I overstayed a permitted period"),
      opt("violation", "Было другое нарушение миграционных правил", "Another immigration violation"),
      opt("pending", "Есть незавершённое дело или апелляция", "A case or appeal is pending"),
      opt("prefer", "Предпочитаю обсудить это с юристом", "I prefer to discuss this with a lawyer"),
    ],
  },
  {
    id: "status",
    title: "Если вы уже в Германии, какой у вас текущий статус?",
    en: "If you are already in Germany, what is your current status?",
    options: [
      opt("none", "Я за пределами Германии", "I am outside Germany"),
      opt("visa", "Действующая национальная виза D", "Valid national D visa"),
      opt("permit", "Действующий вид на жительство", "Valid residence permit"),
      opt("eu", "Гражданство ЕС/ЕЭЗ или Швейцарии", "EU/EEA or Swiss citizenship"),
      opt("temporary", "Временная защита или другой специальный статус", "Temporary protection or another special status"),
      opt("expired", "Срок действия визы или ВНЖ истёк", "My visa or residence permit has expired"),
      opt("uncertain", "Не уверен в своём статусе", "I am unsure of my status"),
    ],
  },
  {
    id: "protection",
    title: "Связана ли ваша ситуация с преследованием, войной или угрозой безопасности?",
    en: "Is your situation related to persecution, war or a safety threat?",
    description: "Убежище и гуманитарная защита рассматриваются индивидуально компетентными органами.",
    descriptionEn: "Asylum and humanitarian protection are assessed individually by the competent authorities.",
    options: [
      opt("yes", "Да, мне может требоваться защита", "Yes, I may need protection"),
      opt("temporary", "Возможно, мне подходит временная защита", "Temporary protection may be relevant"),
      opt("no", "Нет", "No"),
      opt("unsure", "Не уверен", "Not sure"),
    ],
  },
];
const ROUTES: QuizRoute[] = [
  {
    id: "work",
    title: "Виза для квалифицированных специалистов",
    titleEn: "Visa for qualified professionals",
    category: "Работа",
    categoryEn: "Employment",
    description: "Маршрут для квалифицированных специалистов с признанным или сопоставимым профессиональным образованием и подходящим предложением работы.",
    descriptionEn: "A route for qualified professionals with a recognised or comparable qualification and suitable employment.",
    requirements: [
      "Подходящая квалификация: профессиональное образование или высшее образование в соответствии с правилами конкретного разрешения.",
      "Для многих случаев требуется конкретное предложение квалифицированной работы в Германии.",
      "Для регулируемых профессий может понадобиться признание квалификации и разрешение на профессиональную деятельность.",
      "Для граждан стран вне ЕС/ЕЭЗ обычно необходимо заранее проверить визовые требования.",
    ],
    requirementsEn: [
      "A suitable qualification, depending on the specific residence permit.",
      "A concrete offer of qualified employment is required in many cases.",
      "Regulated professions may require recognition and a professional licence.",
      "Nationals of countries outside the EU/EEA generally need to check visa requirements before travelling.",
    ],
    limitations: [
      "Одного трудового договора может быть недостаточно: проверяются квалификация, условия работы и применимые нормы.",
      "Для отдельных категорий действуют дополнительные требования, включая возрастные или финансовые.",
      "Разрешение на работу не следует считать автоматическим правом на постоянное проживание.",
    ],
    limitationsEn: [
      "An employment contract alone may not be sufficient; qualifications and employment conditions are assessed.",
      "Additional age or financial requirements may apply to certain categories.",
      "A work permit does not automatically grant permanent residence.",
    ],
    officialUrl: "https://www.make-it-in-germany.com/en/visa-residence/types/work-qualified-professionals",
  },
  {
    id: "bluecard",
    title: "Голубая карта ЕС (EU Blue Card)",
    titleEn: "EU Blue Card",
    category: "Квалифицированная работа",
    categoryEn: "Qualified employment",
    description: "Специальный вариант для подходящих специалистов с высшим образованием или соответствующей квалификацией, отвечающих требованиям к работе и заработной плате.",
    descriptionEn: "A route for eligible professionals who meet the qualification, employment and salary requirements.",
    requirements: [
      "Подходящее предложение работы в Германии.",
      "Высшее образование или другая допустимая квалификационная основа согласно действующим правилам.",
      "Зарплата должна соответствовать установленному порогу; он зависит от категории и ежегодно может меняться.",
      "Для регулируемых профессий могут потребоваться признание и лицензия.",
    ],
    requirementsEn: [
      "A suitable job offer in Germany.",
      "A qualifying higher education degree or another permitted qualification basis.",
      "The salary must meet the applicable threshold, which can vary by category and year.",
      "Recognition and a licence may be required for regulated professions.",
    ],
    limitations: [
      "Не каждое рабочее предложение подходит для Голубой карты.",
      "Порог заработной платы и правила для дефицитных профессий необходимо проверять на дату подачи.",
      "Срок получения постоянного проживания зависит от выполнения дополнительных условий, в том числе требований к немецкому языку.",
    ],
    limitationsEn: [
      "Not every job offer qualifies for an EU Blue Card.",
      "Salary thresholds and shortage-occupation rules must be checked at the time of application.",
      "Permanent residence depends on additional conditions, including German language requirements.",
    ],
    officialUrl: "https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card",
  },
  {
    id: "opportunity",
    title: "Карта возможностей (Chancenkarte)",
    titleEn: "Opportunity Card (Chancenkarte)",
    category: "Поиск работы",
    categoryEn: "Job search",
    description: "Возможность приехать для поиска работы без заранее оформленного трудового договора, если выполнены соответствующие квалификационные, языковые и финансовые условия.",
    descriptionEn: "A route to come to Germany to search for work without a prior job offer if the qualification, language and financial conditions are met.",
    requirements: [
      "Нужно соответствовать одному из оснований получения карты возможностей.",
      "В зависимости от основания могут учитываться признание квалификации либо баллы за образование, опыт, язык и другие факторы.",
      "Необходимо подтвердить обеспечение средств на проживание.",
      "Следует проверить допустимость работы во время поиска и ограничения конкретного разрешения.",
    ],
    requirementsEn: [
      "You must qualify under one of the Opportunity Card pathways.",
      "Depending on the pathway, recognised qualifications or points for education, experience, language and other factors may apply.",
      "You must demonstrate sufficient funds for living expenses.",
      "Check the permitted work and restrictions of the specific residence title.",
    ],
    limitations: [
      "Это не гарантия трудоустройства и не автоматическое разрешение на любую работу.",
      "Балльный вариант предполагает соблюдение минимальных условий и требуемого количества баллов.",
      "Финансовые требования и допустимые виды занятости необходимо перепроверить перед подачей.",
    ],
    limitationsEn: [
      "It does not guarantee employment or unrestricted permission to work.",
      "The points-based pathway has minimum eligibility requirements and a required points total.",
      "Financial requirements and permitted work must be checked before applying.",
    ],
    officialUrl: "https://www.make-it-in-germany.com/en/visa-recognition/opportunity-card",
  },
  {
    id: "study",
    title: "Виза для учёбы в Германии",
    titleEn: "Visa for studying in Germany",
    category: "Образование",
    categoryEn: "Education",
    description: "Маршрут для поступления в признанное немецкое высшее учебное заведение или для соответствующей подготовительной программы.",
    descriptionEn: "A route for admission to a recognised German higher education institution or an eligible preparatory programme.",
    requirements: [
      "Подтверждение зачисления или подходящего подготовительного этапа.",
      "Документы об образовании, соответствующие условиям поступления.",
      "Подтверждение средств на проживание и требуемая медицинская страховка.",
      "Подтверждение языковых навыков, если этого требует программа.",
    ],
    requirementsEn: [
      "Proof of admission or an eligible preparatory measure.",
      "Educational documents that meet admission requirements.",
      "Proof of sufficient living funds and required health insurance.",
      "Proof of language proficiency where required by the programme.",
    ],
    limitations: [
      "Поступление и получение визы — отдельные процессы.",
      "Финансовые нормативы меняются; проверяйте актуальные суммы перед подачей.",
      "Правила работы студентов ограничены условиями разрешения на проживание.",
    ],
    limitationsEn: [
      "Admission and visa approval are separate processes.",
      "Financial thresholds change and must be checked before applying.",
      "Student work is subject to the applicable residence permit rules.",
    ],
    officialUrl: "https://www.make-it-in-germany.com/en/visa-recognition/visa-types/studying",
  },
  {
    id: "ausbildung",
    title: "Профессиональное обучение (Ausbildung)",
    titleEn: "Vocational training (Ausbildung)",
    category: "Образование и профессия",
    categoryEn: "Training",
    description: "Маршрут для прохождения профессионального обучения в Германии, в том числе дуального обучения в компании и профессиональной школе.",
    descriptionEn: "A route for vocational training in Germany, including dual training in a company and vocational school.",
    requirements: [
      "Как правило, необходимо подтверждение места обучения.",
      "Обычно требуется немецкий язык, часто на уровне B1, если не применимо исключение.",
      "Нужно подтвердить возможность финансировать проживание.",
      "В зависимости от программы могут требоваться документы об образовании и дополнительные согласования.",
    ],
    requirementsEn: [
      "A confirmed training place is generally required.",
      "German language skills are usually required, often at B1 unless an exception applies.",
      "You must demonstrate sufficient funds for living expenses.",
      "Educational documents and additional approvals may be required depending on the programme.",
    ],
    limitations: [
      "Требования различаются между школьным и дуальным профессиональным обучением.",
      "Наличие места обучения не гарантирует выдачу визы.",
      "Если места ещё нет, проверьте отдельные правила въезда для поиска места Ausbildung.",
    ],
    limitationsEn: [
      "Requirements differ between school-based and dual vocational training.",
      "A training offer does not guarantee visa approval.",
      "If you do not yet have a place, check the separate rules for seeking vocational training.",
    ],
    officialUrl: "https://www.make-it-in-germany.com/en/visa-recognition/visa-types/training",
  },
  {
    id: "family",
    title: "Воссоединение семьи",
    titleEn: "Family reunification",
    category: "Семья",
    categoryEn: "Family",
    description: "Возможный маршрут для определённых членов семьи человека, который живёт в Германии. Требования зависят от статуса родственника и конкретного родства.",
    descriptionEn: "A possible route for eligible family members of a person living in Germany. Requirements depend on the sponsor's status and the family relationship.",
    requirements: [
      "Документальное подтверждение семейной связи.",
      "Проверка вида на жительство или гражданства принимающего родственника.",
      "Могут требоваться документы о жилье, средствах и знании языка; существуют исключения.",
      "Для несовершеннолетних детей и отдельных категорий действуют специальные правила.",
    ],
    requirementsEn: [
      "Documentary proof of the family relationship.",
      "Verification of the sponsor's citizenship or residence permit.",
      "Housing, financial or language evidence may be required, subject to exceptions.",
      "Special rules apply to minor children and certain categories.",
    ],
    limitations: [
      "Не каждый родственник имеет право на воссоединение по стандартной процедуре.",
      "Требования зависят от статуса принимающего лица и обстоятельств дела.",
      "Необходимо проверить документы и процедуру в компетентном немецком представительстве.",
    ],
    limitationsEn: [
      "Not every relative qualifies under the standard family reunification procedure.",
      "Requirements depend on the sponsor's status and individual circumstances.",
      "Check documents and procedures with the competent German mission.",
    ],
    officialUrl: "https://www.make-it-in-germany.com/en/visa-residence/types/family-reunification",
  },
  {
    id: "business",
    title: "Предпринимательство или самостоятельная деятельность",
    titleEn: "Self-employment or freelancing",
    category: "Бизнес",
    categoryEn: "Business",
    description: "Вариант для предпринимателей и фрилансеров, если деятельность соответствует немецким требованиям и есть основания для соответствующего разрешения.",
    descriptionEn: "A route for entrepreneurs and freelancers whose planned activity meets the German requirements for the relevant residence permit.",
    requirements: [
      "Описание деятельности и подходящий бизнес-план, если он необходим.",
      "Подтверждение финансирования и способности обеспечивать собственное проживание.",
      "Для коммерческого бизнеса могут оцениваться экономический интерес и региональная потребность.",
      "Для регулируемой деятельности могут потребоваться разрешения или профессиональная лицензия.",
    ],
    requirementsEn: [
      "A description of the activity and a suitable business plan where required.",
      "Proof of financing and ability to support yourself.",
      "Commercial businesses may be assessed for economic interest and regional demand.",
      "Regulated activities may require permits or professional licences.",
    ],
    limitations: [
      "Регистрация компании сама по себе не предоставляет право на проживание.",
      "Правила для Freiberufler и Gewerbe различаются.",
      "Планируемый доход и финансовые доказательства оцениваются индивидуально.",
    ],
    limitationsEn: [
      "Registering a company alone does not grant residence rights.",
      "Rules for freelancers and commercial businesses differ.",
      "Projected income and financial evidence are assessed individually.",
    ],
    officialUrl: "https://www.make-it-in-germany.com/en/working-in-germany/starting-business/visa/visa-for-self-employed-business",
  },
  {
    id: "recognition",
    title: "Признание иностранной квалификации",
    titleEn: "Recognition of foreign qualifications",
    category: "Квалификация",
    categoryEn: "Qualifications",
    description: "Если для вашей профессии требуется признание диплома или дополнительная квалификация, стоит проверить процедуру до выбора рабочего маршрута.",
    descriptionEn: "If your profession requires qualification recognition or additional training, check the process before choosing a work route.",
    requirements: [
      "Документы об образовании и профессиональном опыте.",
      "Определение компетентного органа для конкретной профессии.",
      "Для регулируемых профессий могут требоваться лицензия, языковые экзамены или адаптационные мероприятия.",
      "В зависимости от результата могут быть доступны дополнительные визовые варианты.",
    ],
    requirementsEn: [
      "Educational documents and professional experience evidence.",
      "Identification of the competent authority for your profession.",
      "Regulated professions may require a licence, language exams or adaptation measures.",
      "Additional visa routes may be available depending on the result.",
    ],
    limitations: [
      "Признание не является единым процессом для всех профессий.",
      "Процедура может занять время и потребовать перевода документов.",
      "Результат зависит от конкретной квалификации и регулирующих правил.",
    ],
    limitationsEn: [
      "Recognition is not a single process for every occupation.",
      "The process can take time and may require translated documents.",
      "The outcome depends on the qualification and applicable rules.",
    ],
    officialUrl: "https://www.make-it-in-germany.com/en/visa-residence/recognition",
  },
  {
    id: "visitor",
    title: "Краткосрочная поездка в Германию",
    titleEn: "Short stay in Germany",
    category: "Визит",
    categoryEn: "Visit",
    description: "Для краткосрочного туризма, посещения семьи или деловой поездки может подойти безвизовый режим либо шенгенская виза — в зависимости от гражданства и цели поездки.",
    descriptionEn: "For short tourism, family visits or business trips, visa-free entry or a Schengen visa may apply depending on nationality and purpose.",
    requirements: [
      "Проверка визовых требований по гражданству и документу для поездки.",
      "Действительный проездной документ и соблюдение допустимого срока пребывания.",
      "При необходимости — подтверждение цели поездки, средств и условий размещения.",
      "Для работы или длительного проживания обычно нужен другой правовой маршрут.",
    ],
    requirementsEn: [
      "Check visa requirements based on nationality and travel document.",
      "A valid travel document and compliance with the permitted stay period.",
      "Where required, evidence of purpose, funds and accommodation.",
      "Work or long-term residence usually requires a different legal route.",
    ],
    limitations: [
      "Краткосрочный визит обычно не даёт права работать.",
      "Безвизовый въезд зависит от гражданства и других условий.",
      "Правило 90 дней из 180 дней применяется к соответствующим краткосрочным поездкам в Шенгенской зоне.",
    ],
    limitationsEn: [
      "A short-stay visit generally does not authorise employment.",
      "Visa-free entry depends on nationality and other conditions.",
      "The 90-days-in-any-180-day-period rule applies to relevant short stays in the Schengen Area.",
    ],
    officialUrl: "https://www.auswaertiges-amt.de/en/visa-service",
  },
  {
    id: "permanent",
    title: "Постоянный вид на жительство (Niederlassungserlaubnis)",
    titleEn: "Settlement permit (Niederlassungserlaubnis)",
    category: "Постоянное проживание",
    categoryEn: "Permanent residence",
    description: "Постоянное разрешение на проживание может быть доступно после выполнения требований, которые зависят от вашего текущего статуса и истории проживания.",
    descriptionEn: "A settlement permit may be available after meeting requirements that depend on your current status and residence history.",
    requirements: [
      "Подходящий текущий вид на жительство и необходимый период проживания, если он предусмотрен соответствующей нормой.",
      "Как правило, учитываются средства к существованию и пенсионные взносы в применимых случаях.",
      "Могут требоваться немецкий язык, базовые знания правового и общественного устройства, жильё.",
      "Для отдельных категорий, включая некоторых обладателей Голубой карты, предусмотрены специальные условия.",
    ],
    requirementsEn: [
      "An eligible current residence permit and the required residence period where applicable.",
      "Livelihood and pension contributions are generally assessed where required.",
      "German language, knowledge of the legal and social system, and housing may be required.",
      "Special rules apply to certain categories, including some EU Blue Card holders.",
    ],
    limitations: [
      "Единого срока для всех категорий нет.",
      "Временная защита и некоторые специальные статусы регулируются отдельно.",
      "Перед подачей необходимо проверить условия для вашего конкретного разрешения.",
    ],
    limitationsEn: [
      "There is no single qualifying period for every category.",
      "Temporary protection and certain special statuses are subject to separate rules.",
      "Check the requirements for your specific residence permit before applying.",
    ],
    officialUrl: "https://www.make-it-in-germany.com/en/visa-residence/living-permanently-in-germany",
  },
  {
    id: "citizenship",
    title: "Натурализация и гражданство Германии",
    titleEn: "German naturalisation and citizenship",
    category: "Гражданство",
    categoryEn: "Citizenship",
    description: "Натурализация возможна при соблюдении требований немецкого законодательства к сроку проживания, статусу, языку и другим условиям.",
    descriptionEn: "Naturalisation may be possible if you meet German legal requirements for residence, status, language and other conditions.",
    requirements: [
      "Необходимый срок законного обычного проживания; стандартные сроки и исключения нужно проверять по действующему закону.",
      "Подходящий статус проживания и подтверждение личности и гражданства.",
      "Как правило, требуется немецкий язык на уровне B1 и знание правового и общественного устройства, если не применяется исключение.",
      "Обычно проверяются способность обеспечивать себя, отсутствие определённых судимостей и другие законные условия.",
    ],
    requirementsEn: [
      "The required period of lawful habitual residence; standard periods and exceptions must be checked under current law.",
      "Eligible residence status and proof of identity and nationality.",
      "German at B1 and knowledge of the legal and social system are generally required unless an exception applies.",
      "Livelihood, certain criminal convictions and other statutory conditions are generally assessed.",
    ],
    limitations: [
      "Заполнение анкеты не подтверждает право на гражданство.",
      "Срок проживания сам по себе не гарантирует положительное решение.",
      "Правила могут меняться; решение принимает компетентный орган по гражданству.",
    ],
    limitationsEn: [
      "Completing this questionnaire does not establish eligibility for citizenship.",
      "The residence period alone does not guarantee approval.",
      "Rules can change; the competent naturalisation authority makes the decision.",
    ],
    officialUrl: "https://www.einbuergerung.de/",
  },
  {
    id: "protection",
    title: "Убежище и международная защита",
    titleEn: "Asylum and international protection",
    category: "Защита",
    categoryEn: "Protection",
    description: "Если вы опасаетесь преследования или серьёзного вреда при возвращении, изучите официальную процедуру убежища и доступные консультационные службы.",
    descriptionEn: "If you fear persecution or serious harm upon return, review the official asylum process and available advice services.",
    requirements: [
      "Рассмотрение проводится компетентными органами на основании индивидуальных обстоятельств.",
      "Важно сообщать правдивую информацию и по возможности сохранять относящиеся к делу документы.",
      "Для людей с временной защитой могут действовать отдельные правила.",
      "При необходимости следует получить квалифицированную правовую консультацию.",
    ],
    requirementsEn: [
      "The competent authorities assess each case based on individual circumstances.",
      "Provide truthful information and preserve relevant documents where possible.",
      "Separate rules may apply to people covered by temporary protection.",
      "Seek qualified legal advice where necessary.",
    ],
    limitations: [
      "Нельзя заранее гарантировать предоставление убежища или определённого статуса.",
      "Процедура зависит от обстоятельств, применимого права и компетенции органов.",
      "Не следует выбирать этот маршрут только как альтернативу обычной миграции.",
    ],
    limitationsEn: [
      "Asylum or a particular protection status cannot be guaranteed in advance.",
      "The process depends on the circumstances, applicable law and competent authorities.",
      "This route should not be used merely as an alternative to ordinary immigration.",
    ],
    officialUrl: "https://www.bamf.de/EN/Themen/AsylFluechtlingsschutz/asylfluechtlingsschutz-node.html",
  },
];
const tRu = {
  title: "Навигатор иммиграции в Германию",
  subtitle:
    "Ответьте на вопросы, чтобы предварительно определить подходящие визовые маршруты, варианты проживания, учёбы, работы и натурализации в Германии.",
  reset: "Сбросить ответы",
  progress: "Заполнено",
  of: "из",
  questions: "вопросов",
  allQuestions: "Ваша ситуация",
  answered: "Заполнено",
  notAnswered: "Не заполнено",
  choose: "Выберите ответ",
  showResults: "Подобрать варианты",
  results: "Возможные маршруты",
  resultsDescription:
    "Результаты ранжированы по совпадению ваших ответов с общими признаками маршрутов.",
  scoreDisclaimer:
    "Баллы показывают ориентировочное совпадение ответов, а не вероятность одобрения, юридическое заключение или подтверждение права на визу.",
  noResults: "Пока недостаточно данных",
  noResultsDescription:
    "Ответьте на несколько вопросов, чтобы получить предварительный список маршрутов.",
  top: "Наиболее подходящий",
  requirements: "Основные требования",
  limitations: "Ограничения и что проверить",
  official: "Официальный источник",
  showAll: "Показать все варианты",
  showFewer: "Свернуть список",
  noticeTitle: "Важная информация",
  noticeText:
    "Навигатор предназначен для первичной ориентации. Требования зависят от гражданства, цели въезда, индивидуальных обстоятельств и действующего законодательства Германии. Перед подачей документов сверяйтесь с официальными источниками и компетентным ведомством.",
  rulesLink: "Официальный портал миграции",
  passportTitle: "Проверьте требования для въезда",
  passportText:
    "Необходимость визы зависит от гражданства, проездного документа, цели поездки и продолжительности пребывания. Правила краткосрочного въезда отличаются от правил работы и долгосрочного проживания.",
  historyTitle: "Предыдущие миграционные решения",
  historyText:
    "Отказы, нарушения сроков пребывания и незавершённые дела могут влиять на дальнейшие действия. В сложной ситуации полезна консультация квалифицированного миграционного юриста.",
  expiredTitle: "Истёкший статус пребывания",
  expiredText:
    "Если срок визы или вида на жительство истёк, не полагайтесь на общий результат анкеты. Незамедлительно уточните ситуацию в компетентной Ausländerbehörde и при необходимости получите юридическую консультацию.",
  protectionTitle: "Вопросы защиты и убежища",
  protectionText:
    "Если вам угрожает опасность, обратитесь за официальной информацией и квалифицированной консультацией. Не отправляйте через эту анкету документы, содержащие чувствительные сведения.",
  generalDisclaimer:
    "Информация предоставляется только для общей ориентации и не является юридической консультацией. Миграционные правила Германии могут меняться. Решение о визе, разрешении на проживание, натурализации или защите принимает компетентный государственный орган.",
  footer: "Вернуться к мировому навигатору",
};

const tEn = {
  title: "Germany Immigration Navigator",
  subtitle:
    "Answer a few questions to identify potentially relevant German visa routes, residence options, work, study and naturalisation pathways.",
  reset: "Reset answers",
  progress: "Completed",
  of: "of",
  questions: "questions",
  allQuestions: "Your situation",
  answered: "Answered",
  notAnswered: "Not answered",
  choose: "Choose an answer",
  showResults: "Find possible routes",
  results: "Possible routes",
  resultsDescription:
    "Results are ranked according to how closely your answers match general route characteristics.",
  scoreDisclaimer:
    "Scores indicate approximate alignment with your answers. They are not approval probabilities, legal advice or confirmation of visa eligibility.",
  noResults: "Not enough information yet",
  noResultsDescription:
    "Answer a few questions to see a preliminary list of routes.",
  top: "Best match",
  requirements: "Main requirements",
  limitations: "Limitations and items to check",
  official: "Official source",
  showAll: "Show all routes",
  showFewer: "Show fewer",
  noticeTitle: "Important information",
  noticeText:
    "This navigator is for initial orientation only. Requirements depend on nationality, purpose of entry, individual circumstances and current German law. Check official sources and the competent authority before applying.",
  rulesLink: "Official immigration portal",
  passportTitle: "Check entry requirements",
  passportText:
    "Visa requirements depend on nationality, travel document, purpose and length of stay. Short visits are subject to different rules from employment and long-term residence.",
  historyTitle: "Previous immigration decisions",
  historyText:
    "Refusals, overstays and pending cases may affect your next steps. In complex situations, consider consulting a qualified immigration lawyer.",
  expiredTitle: "Expired residence status",
  expiredText:
    "If your visa or residence permit has expired, do not rely on this questionnaire. Contact the competent Ausländerbehörde promptly and obtain legal advice if necessary.",
  protectionTitle: "Protection and asylum",
  protectionText:
    "If you face danger, seek official information and qualified advice. Do not submit sensitive personal documents through this questionnaire.",
  generalDisclaimer:
    "This information is for general orientation only and is not legal advice. German immigration rules can change. Decisions on visas, residence permits, naturalisation and protection are made by the competent public authority.",
  footer: "Back to the world navigator",
};

function getRouteScore(id: string, a: Answers): number {
  let score = 0;
  const euCitizen = a.citizenship === "eu";

  if (euCitizen) {
    if (["work", "study", "family", "business", "permanent"].includes(id)) score += 42;
    if (["bluecard", "opportunity", "visitor"].includes(id)) score += 10;
  } else {
    if (id === "work" && a.goal === "work") score += 30;
    if (id === "bluecard" && a.goal === "bluecard") score += 35;
    if (id === "opportunity" && (a.goal === "jobsearch" || a.jobOffer === "no")) score += 28;
    if (id === "study" && a.goal === "study") score += 35;
    if (id === "ausbildung" && a.goal === "ausbildung") score += 35;
    if (id === "family" && a.goal === "family") score += 35;
    if (id === "business" && a.goal === "business") score += 35;
    if (id === "visitor" && a.goal === "visit") score += 35;
    if (id === "permanent" && a.goal === "permanent") score += 35;
    if (id === "citizenship" && a.goal === "citizenship") score += 35;
    if (id === "protection" && a.goal === "protection") score += 40;
    if (
      id === "recognition" &&
      (a.goal === "recognition" || a.recognition === "pending" || a.recognition === "notstarted")
    ) {
      score += 25;
    }
  }

  if (id === "work") {
    if (a.jobOffer === "yes") score += 25;
    if (["vocational", "bachelor", "master", "regulated"].includes(a.education)) score += 14;
    if (["recognized", "notneeded"].includes(a.recognition)) score += 12;
    if (["2-5", "5plus"].includes(a.workExperience)) score += 8;
    if (a.jobOffer === "no") score -= 8;
  }

  if (id === "bluecard") {
    if (["bachelor", "master"].includes(a.education)) score += 20;
    if (a.jobOffer === "yes") score += 24;
    if (["recognized", "notneeded"].includes(a.recognition)) score += 8;
    if (a.profession === "it" && ["2-5", "5plus"].includes(a.workExperience)) score += 5;
    if (a.jobOffer === "no") score -= 15;
  }

  if (id === "opportunity") {
    if (a.jobOffer === "no") score += 18;
    if (["vocational", "bachelor", "master"].includes(a.education)) score += 14;
    if (["2-5", "5plus"].includes(a.workExperience)) score += 8;
    if (["a2", "b1", "b2", "c1"].includes(a.german)) score += 8;
    if (["b2", "c1"].includes(a.english)) score += 5;
    if (a.funds === "no") score -= 15;
  }

  if (id === "study") {
    if (["yes", "conditional"].includes(a.studyOffer)) score += 25;
    if (["bachelor", "master"].includes(a.education)) score += 5;
    if (a.funds === "yes" || a.funds === "sponsor") score += 12;
    if (a.funds === "no") score -= 12;
    if (a.studyOffer === "no") score -= 8;
  }

  if (id === "ausbildung") {
    if (a.studyOffer === "training") score += 28;
    if (["a2", "b1", "b2", "c1"].includes(a.german)) score += 8;
    if (a.age === "under18" || a.age === "18-29" || a.age === "30-34") score += 4;
    if (a.funds === "yes" || a.funds === "sponsor") score += 5;
  }

  if (id === "family") {
    if (["spouse", "child", "parent"].includes(a.family)) score += 25;
    if (["citizen", "eu", "permanent", "work", "protection"].includes(a.familyStatus)) score += 12;
    if (a.family === "no") score -= 20;
  }

  if (id === "business") {
    if (["business", "freelance", "existing", "considering"].includes(a.business)) score += 25;
    if (a.funds === "yes" || a.funds === "sponsor") score += 10;
    if (a.business === "no") score -= 15;
  }

  if (id === "recognition") {
    if (a.recognition === "pending") score += 20;
    if (a.recognition === "notstarted") score += 15;
    if (a.education === "regulated") score += 20;
    if (a.profession === "health") score += 10;
  }

  if (id === "visitor") {
    if (a.visitDuration === "short") score += 22;
    if (a.goal === "visit") score += 20;
    if (a.visitDuration === "long" || a.visitDuration === "permanent") score -= 25;
  }

  if (id === "permanent") {
    if (a.status === "permit") score += 10;
    if (a.residence === "germany") score += 10;
    if (a.germanyExperience === "current" || a.germanyExperience === "yes") score += 8;
    if (a.status === "none") score -= 8;
  }

  if (id === "citizenship") {
    if (a.status === "permit") score += 8;
    if (a.residence === "germany") score += 8;
    if (a.german === "b1" || a.german === "b2" || a.german === "c1") score += 10;
    if (a.residence === "outside") score -= 20;
  }

  if (id === "protection") {
    if (a.protection === "yes") score += 40;
    if (a.protection === "temporary") score += 20;
    if (a.protection === "no") score -= 30;
  }

  if (a.status === "expired" || a.status === "uncertain") score -= 10;
  if (a.passport === "no") score -= 5;

  return Math.max(0, Math.min(100, score));
}

function getRouteWarning(id: string, a: Answers, isEnglish: boolean): string | null {
  const warnings: Record<string, { ru: string; en: string }> = {
    expired: {
      ru: "В ваших ответах указан истёкший или неясный статус. Сначала уточните свои права и обязанности в Ausländerbehörde или у квалифицированного юриста.",
      en: "Your answers indicate an expired or uncertain status. First clarify your rights and obligations with the Ausländerbehörde or a qualified lawyer.",
    },
    history: {
      ru: "Вы указали предыдущий отказ или миграционную проблему. Она может повлиять на заявление; оцените обстоятельства индивидуально.",
      en: "You indicated a previous refusal or immigration issue. It may affect an application and should be assessed individually.",
    },
    funds: {
      ru: "Подтверждение средств может быть обязательным. Проверьте актуальные требования именно для этого маршрута.",
      en: "Proof of funds may be mandatory. Check the current requirements for this specific route.",
    },
  };

  if (a.status === "expired" || a.status === "uncertain") {
    return warnings.expired[isEnglish ? "en" : "ru"];
  }
  if (["refusal", "overstay", "violation", "pending", "prefer"].includes(a.immigrationHistory)) {
    if (["work", "bluecard", "opportunity", "study", "family", "visitor"].includes(id)) {
      return warnings.history[isEnglish ? "en" : "ru"];
    }
  }
  if (["study", "ausbildung", "opportunity"].includes(id) && a.funds === "no") {
    return warnings.funds[isEnglish ? "en" : "ru"];
  }
  if (id === "bluecard" && a.jobOffer !== "yes") {
    return isEnglish
      ? "An eligible job offer and the applicable salary threshold are central to the EU Blue Card route."
      : "Для Голубой карты важны подходящее предложение работы и соблюдение применимого порога заработной платы.";
  }
  if (id === "family" && !["spouse", "child", "parent"].includes(a.family)) {
    return isEnglish
      ? "Family reunification is generally limited to eligible family relationships. Other relatives are subject to special rules."
      : "Воссоединение обычно доступно для определённых членов семьи. Для других родственников действуют специальные правила.";
  }
  if (id === "visitor" && a.visitDuration === "long") {
    return isEnglish
      ? "A short-stay visa is generally not suitable for long-term residence or employment."
      : "Краткосрочная виза обычно не подходит для длительного проживания или работы.";
  }
  if (id === "protection" && a.protection === "unsure") {
    return isEnglish
      ? "Protection eligibility requires an individual assessment. Contact an authorised counselling service."
      : "Право на защиту оценивается индивидуально. Обратитесь в квалифицированную консультационную службу.";
  }

  return null;
}

export const deQuizConfig: CountryQuizConfig = {
  id: "de",
  flagCode: "DE",
  countryNameEn: "Germany",
  questions,
  routes: ROUTES,
  copy: { ru: tRu, en: tEn },
  getRouteScore,
  getRouteWarning,
  officialLinks: {
    noticeUrl: "https://www.make-it-in-germany.com/en/",
    visit: {
      url: "https://www.auswaertiges-amt.de/en/visa-service",
      labelEn: "Check official entry requirements",
      labelRu: "Проверить официальные требования для въезда",
    },
    history: {
      url: "https://www.bamf.de/EN/Startseite/startseite_node.html",
      labelEn: "Official BAMF website",
      labelRu: "Официальный сайт BAMF",
    },
    expired: {
      url: "https://www.make-it-in-germany.com/en/visa-residence",
      labelEn: "Check official residence information",
      labelRu: "Проверить официальную информацию о проживании",
    },
    protection: {
      url: "https://www.bamf.de/EN/Themen/AsylFluechtlingsschutz/asylfluechtlingsschutz-node.html",
      labelEn: "Official protection information",
      labelRu: "Официальная информация о защите",
    },
  },
  conditions: {
    hasImmigrationHistory: (answers) =>
      ["refusal", "overstay", "violation", "pending", "prefer"].includes(answers.immigrationHistory),
    hasExpiredStatus: (answers) => ["expired", "uncertain"].includes(answers.status),
    protectionRelevant: (answers) => ["yes", "temporary", "unsure"].includes(answers.protection),
    visitRelevant: (answers) => answers.goal === "visit" || answers.visitDuration === "short",
  },
};