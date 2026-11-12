import type { ProfileSeedInput } from '../seed.schema.js';

/**
 * The CV itself. This file is the source of truth: the database is
 * rebuilt from it on every start. Order of arrays = display order.
 * Every technology referenced by experience/projects must be declared
 * in `skills` (enforced by the seed schema).
 */
export const profile = {
  slug: 'alexpanich',
  name: 'Александр Паниченко',
  headline: 'Fullstack-разработчик · TypeScript, Node.js, React · AI-first',
  description:
    'Fullstack-разработчик, 10 лет пишу на JavaScript и TypeScript: фронтенд и бэкенд ' +
    '(React, Vue, Node.js, NestJS, Fastify). Делал продукты для Avito, Сбербанка, ' +
    'Московской биржи и Эльдорадо: от SSR-магазина на Next.js до Excel-подобных ' +
    'редакторов на AG Grid для бэк-офиса биржи. С 2026 года работаю AI-first: ' +
    'Claude Code, spec-driven development, собственные skills, hooks и MCP-серверы. ' +
    'Ищу команду, где AI-агенты — часть процесса разработки, а не эксперимент.',
  location: 'Москва',
  links: [
    { type: 'GITHUB', label: 'GitHub', url: 'https://github.com/AlexPanich' },
    { type: 'TELEGRAM', label: 'Telegram', url: 'https://t.me/alexpanich' },
    { type: 'EMAIL', label: 'E-mail', url: 'mailto:nasada@yandex.ru' },
  ],
  skills: [
    { name: 'TypeScript', category: 'LANGUAGE' },
    { name: 'JavaScript', category: 'LANGUAGE' },
    { name: 'PHP', category: 'LANGUAGE' },

    { name: 'Node.js', category: 'BACKEND' },
    { name: 'NestJS', category: 'BACKEND' },
    { name: 'Fastify', category: 'BACKEND' },
    { name: 'Bun', category: 'BACKEND' },
    { name: 'Elysia', category: 'BACKEND' },
    { name: 'Laravel', category: 'BACKEND' },

    { name: 'GraphQL', category: 'API' },
    { name: 'OpenAPI', category: 'API' },

    { name: 'PostgreSQL', category: 'DATABASE' },
    { name: 'Prisma', category: 'DATABASE' },
    { name: 'Drizzle ORM', category: 'DATABASE' },
    { name: 'MySQL', category: 'DATABASE' },
    { name: 'SQLite', category: 'DATABASE' },

    { name: 'Docker', category: 'DEVOPS' },
    { name: 'CI/CD', category: 'DEVOPS' },

    { name: 'React', category: 'FRONTEND' },
    { name: 'Next.js', category: 'FRONTEND' },
    { name: 'Redux', category: 'FRONTEND' },
    { name: 'Zustand', category: 'FRONTEND' },
    { name: 'MobX', category: 'FRONTEND' },
    { name: 'TanStack Query', category: 'FRONTEND' },
    { name: 'TanStack Table', category: 'FRONTEND' },
    { name: 'React Hook Form', category: 'FRONTEND' },
    { name: 'Yup', category: 'FRONTEND' },
    { name: 'AG Grid', category: 'FRONTEND' },
    { name: 'Ant Design', category: 'FRONTEND' },
    { name: 'MUI', category: 'FRONTEND' },
    { name: 'Refine', category: 'FRONTEND' },
    { name: 'Tailwind CSS', category: 'FRONTEND' },
    { name: 'SCSS Modules', category: 'FRONTEND' },
    { name: 'styled-components', category: 'FRONTEND' },
    { name: 'i18n', category: 'FRONTEND' },
    { name: 'Vue.js', category: 'FRONTEND' },
    { name: 'Vuex', category: 'FRONTEND' },
    { name: 'React Native', category: 'FRONTEND' },
    { name: 'Expo', category: 'FRONTEND' },

    { name: 'Микрофронтенды', category: 'ARCHITECTURE' },
    { name: 'Module Federation', category: 'ARCHITECTURE' },
    { name: 'single-spa', category: 'ARCHITECTURE' },
    { name: 'SSR', category: 'ARCHITECTURE' },
    { name: 'FSD', category: 'ARCHITECTURE' },
    { name: 'CQRS', category: 'ARCHITECTURE' },

    { name: 'Vitest', category: 'TESTING' },
    { name: 'Jest', category: 'TESTING' },
    { name: 'Playwright', category: 'TESTING' },

    { name: 'Git', category: 'TOOLING' },
    { name: 'Zod', category: 'TOOLING' },
    { name: 'Vite', category: 'TOOLING' },
    { name: 'Webpack', category: 'TOOLING' },
    { name: 'Orval', category: 'TOOLING' },
    { name: 'Sentry', category: 'TOOLING' },

    { name: 'Claude Code', category: 'AI' },
    { name: 'AI-агенты', category: 'AI' },
    { name: 'MCP', category: 'AI' },
    { name: 'Spec-driven development', category: 'AI' },
  ],
  experience: [
    {
      company: 'Evrone',
      companyUrl: 'https://evrone.ru',
      position: 'Frontend-разработчик',
      location: 'Воронеж',
      description:
        'Проект «БлагоДаря» — платформа благотворительного фонда, где НКО создают ' +
        'целевые капиталы, а социальные инвесторы их поддерживают.',
      startDate: '2026-02',
      endDate: '2026-06',
      achievements: [
        'С нуля сделал сценарий создания целевого капитала: многошаговая форма с поиском ' +
          'организации, авторизацией в модалке, валидацией и прогрессом заявки.',
      ],
      technologies: [
        'Next.js',
        'React',
        'TypeScript',
        'TanStack Query',
        'Zustand',
        'React Hook Form',
        'Yup',
        'Ant Design',
        'SCSS Modules',
        'Jest',
        'Sentry',
      ],
    },
    {
      company: 'Evrone',
      companyUrl: 'https://evrone.ru',
      position: 'Frontend-разработчик',
      location: 'Воронеж',
      description:
        'Проект Avito — раздел «Мои объявления» для частных и профессиональных продавцов, ' +
        'мобильная и десктопная веб-версии. Команда фронтенда — 3 человека.',
      startDate: '2025-01',
      endDate: '2025-12',
      achievements: [
        'Перевёл мобильную версию раздела на новую дизайн-систему: шапка, виджеты, сниппет ' +
          'и карточка объявления, массовые действия, уведомления, фильтры, модалки; ' +
          'затем — десктопные модули.',
        'Вынес раздел из монолита в микрофронтенд, удалил старую реализацию после переезда ' +
          'и перевёл выкатку с A/B-тестов на фича-тогглы.',
        'Разобрал техдолг: убрал react-router, axios, старые провайдеры и темы из кодовой ' +
          'базы с хуками и легаси на классах; обновил платформенные библиотеки и линтеры ' +
          'до общих версий.',
        'Подключил локализацию в модулях раздела и в микрофронтенде мобильного кабинета ' +
          'pro-продавцов.',
        'Сделал логирование и массовую публикацию гео-объявлений в десктопном кабинете продавца.',
      ],
      technologies: [
        'React',
        'TypeScript',
        'Redux',
        'Микрофронтенды',
        'i18n',
        'Jest',
      ],
    },
    {
      company: 'Evrone',
      companyUrl: 'https://evrone.ru',
      position: 'Frontend-разработчик',
      location: 'Воронеж',
      description:
        'Проект Atom — HR-портал автопроизводителя «Атом»: цели и OKR, оценка сотрудников, ' +
        'опросники, грейды. Команда: 2 фронтенда, 2 бэкенда, дизайнер, QA.',
      startDate: '2024-05',
      endDate: '2024-12',
      achievements: [
        'Разрабатывал админку портала: пользователи, грейды, шаблоны опросников, оценки, инструкции.',
        'Переписал раздел пользователей: список с выгрузкой и загрузкой файлов, формы ' +
          'создания и редактирования, испытательный срок, должности.',
        'Сделал расширенный просмотр результатов оценки, сортировку и фильтры в таблицах, ' +
          'дублирование шаблонов опросников, WYSIWYG-редактор инструкций и переводы.',
      ],
      technologies: [
        'React',
        'TypeScript',
        'Refine',
        'Ant Design',
        'TanStack Query',
        'TanStack Table',
        'React Hook Form',
        'Zod',
        'Orval',
        'OpenAPI',
        'FSD',
        'Vite',
        'Vitest',
        'Playwright',
      ],
    },
    {
      company: 'АО «Бэлл Интегратор»',
      position: 'Ведущий инженер-программист',
      location: 'Москва',
      description:
        'Проект для Сбербанка — бэк-офис, модуль тиринга, микрофронтенды на Module ' +
        'Federation. Команда: 2 фронтенда, 3 бэкенда, 2 QA, PM.',
      startDate: '2023-02',
      endDate: '2024-02',
      achievements: [
        'Исправил общую таблицу из компонентной базы банка, на которой строили приложения все команды.',
        'Переписал несколько разделов и заметно ускорил их работу.',
      ],
      technologies: [
        'React',
        'Redux',
        'TypeScript',
        'Module Federation',
        'React Hook Form',
        'MUI',
      ],
    },
    {
      company: 'АО «Бэлл Интегратор»',
      position: 'Ведущий инженер-программист',
      location: 'Москва',
      description:
        'Проект для Московской биржи — веб-интерфейсы бэк-офиса. Команда: 2 фронтенда, ' +
        '4 бэкенда, DB-разработчик, 2 QA.',
      startDate: '2019-02',
      endDate: '2023-02',
      achievements: [
        'С нуля разработал редактор ценных бумаг и участников торгов — Excel-подобное ' +
          'веб-приложение на AG Grid; фронтенд полностью на мне.',
        'Внедрил AG Grid в проекты бэк-офиса.',
        'Сделал два десятка приложений для бизнес-процессов биржи (старт торгов, допуск ' +
          'участников и др.) на общей микрофронтенд-основе.',
      ],
      technologies: ['React', 'Redux', 'TypeScript', 'AG Grid', 'single-spa'],
    },
    {
      company: 'Эльдорадо',
      companyUrl: 'https://www.eldorado.ru',
      position: 'Ведущий Frontend-разработчик',
      location: 'Москва',
      description:
        'Розничная сеть электроники и бытовой техники, интернет-магазин.',
      startDate: '2017-03',
      endDate: '2018-12',
      achievements: [
        'Перевёл интернет-магазин с Bitrix на SSR-приложение на Next.js: главная, листинг, ' +
          'поиск, меню, регистрация и авторизация.',
        'Создал библиотеку UI-компонентов.',
        'Разработал админку управления товарами: категории, критерии, отзывы.',
        'Ставил задачи подрядчикам и проводил код-ревью.',
      ],
      technologies: [
        'React',
        'Redux',
        'Next.js',
        'SSR',
        'Node.js',
        'Webpack',
        'styled-components',
      ],
    },
    {
      company: 'ООО «АГРО24»',
      companyUrl: 'https://agro24.ru',
      position: 'Fullstack-разработчик',
      location: 'Москва',
      description:
        'Онлайн-биржа продуктов для оптовых поставщиков и покупателей.',
      startDate: '2016-02',
      endDate: '2017-03',
      achievements: [
        'Разработал приложение сбора цен для аналитиков.',
        'Участвовал в создании биржи продуктов для оптовых поставщиков и покупателей.',
      ],
      technologies: ['Vue.js', 'Vuex', 'PHP', 'Laravel', 'MySQL'],
    },
  ],
  projects: [
    {
      name: 'Portfolio API',
      description:
        'Эта цифровая визитка: GraphQL API на NestJS, Prisma и PostgreSQL. Вложенные ' +
        'связи через DataLoader (один SQL-запрос на связь при любом объёме данных), ' +
        'валидируемый идемпотентный сид, e2e-тесты с подсчётом SQL-запросов, Docker и CI.',
      repositoryUrl: 'https://github.com/AlexPanich/portfolio-api',
      technologies: [
        'TypeScript',
        'NestJS',
        'GraphQL',
        'Prisma',
        'PostgreSQL',
        'Docker',
        'Vitest',
        'CI/CD',
        'Claude Code',
      ],
    },
    {
      name: 'Video Meetings',
      description:
        'Сервис встреч с материалами (в разработке): потоковая загрузка файлов до 500 МиБ ' +
        'с прогрессом и повтором, JWT с отзывом токенов, rate limiting, Swagger. API на ' +
        'NestJS 12 (CQRS) + Prisma 7 + PostgreSQL, веб на Next.js 16 с BFF. Разработка в ' +
        'Ralph-цикле: агент закрывает GitHub Issues по одной, качество держат pre-commit ' +
        'и e2e-тесты на реальной БД.',
      repositoryUrl: 'https://github.com/AlexPanich/video-meetings',
      technologies: [
        'TypeScript',
        'NestJS',
        'CQRS',
        'Prisma',
        'PostgreSQL',
        'Next.js',
        'React',
        'Tailwind CSS',
        'Vitest',
        'Claude Code',
      ],
    },
    {
      name: 'Vibe — блог на Next.js',
      description:
        'Блог с кабинетом автора, модерацией и админкой: посты разных типов, комментарии, ' +
        'подписки, уведомления и личные сообщения в реальном времени (SSE). AI-first: ' +
        'спеки → план → реализация → проверка, свои skills для агента и MCP-сервер к базе.',
      url: 'https://vibe-blog-next.onrender.com',
      repositoryUrl: 'https://github.com/AlexPanich/vibe-blog-next',
      technologies: [
        'TypeScript',
        'Next.js',
        'React',
        'Drizzle ORM',
        'SQLite',
        'Zod',
        'Docker',
        'Claude Code',
        'MCP',
        'Spec-driven development',
      ],
    },
    {
      name: 'CMS',
      description:
        'Система управления сайтом, переписанная агентом с Laravel на Next.js и PostgreSQL. ' +
        'CI проверяет unit-, интеграционные и E2E-тесты, контракт темы и production-стек ' +
        'в Docker; релизы через release-please.',
      repositoryUrl: 'https://github.com/AlexPanich/cms',
      technologies: [
        'TypeScript',
        'Next.js',
        'React',
        'PostgreSQL',
        'Drizzle ORM',
        'Tailwind CSS',
        'Vitest',
        'Playwright',
        'Docker',
        'CI/CD',
        'Claude Code',
      ],
    },
    {
      name: 'Календарь звонков',
      description:
        'Учебный проект курса Хекслета «AI для разработчиков»: бронирование слотов звонков ' +
        'по спецификации, монорепо, тесты, CI и автоматические релизы.',
      url: 'https://hexlet-call-calendar.onrender.com',
      repositoryUrl:
        'https://github.com/AlexPanich/ai-for-developers-project-386',
      technologies: [
        'TypeScript',
        'Bun',
        'Elysia',
        'React',
        'Vite',
        'Playwright',
        'CI/CD',
        'Spec-driven development',
      ],
    },
  ],
} satisfies ProfileSeedInput;
