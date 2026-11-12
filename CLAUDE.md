# CLAUDE.md — portfolio-api

GraphQL API цифровой визитки: NestJS 12 (ESM), Apollo Server 5 (code-first), Prisma 7 + PostgreSQL, S3 (MinIO локально, Cloudflare R2 на проде). Архитектурные решения и их обоснование — в README.md.

## Команды

```bash
docker compose up -d db minio      # PostgreSQL :5434, MinIO :9100 (консоль :9101)
npm run start:dev                  # API :3000, Sandbox на /graphql; LOG_SQL=true печатает SQL
npm run db:migrate:dev -- --name <name>   # новая миграция + prisma generate
npm run db:seed:dev                # пересидить из src/seed/data/profile.data.ts
npm test                           # unit (vitest)
npm run test:e2e                   # e2e: реальные Postgres (portfolio_test) и MinIO
npm run lint && npm run typecheck && npm run format
```

Перед завершением задачи всегда: `npm run format && npm run lint && npm run typecheck && npm test && npm run test:e2e`.

## Соглашения

- **ESM:** относительные импорты заканчиваются на `.js` (`import { X } from './x.js'`). `__dirname` не существует, есть `import.meta.dirname`.
- **Слои:** Resolver (только GraphQL) → Service (бизнес-правила; отсутствует, если правил нет) → Repository (единственное место с запросами Prisma) → PrismaService.
- **Связи — только через DataLoader.** Метод репозитория принимает список id родителей и делает ОДИН запрос. Лоадер регистрируется в `src/graphql/loaders.factory.ts` (`createGroupedLoader` для 1:N и M:N, `createEntityLoader` для 1:1). Резолвер поля вызывает `loaders.xxx.load(parent.id)`. Никаких `include` в корневых резолверах.
- **GraphQL-модели** (`models/*.model.ts`) отделены от Prisma-моделей. Enum'ы Prisma регистрируются через `registerEnumType`.
- **Сид — источник истины.** Данные правятся в `src/seed/data/profile.data.ts`, схема валидации — `src/seed/seed.schema.ts`. При старте профиль пересоздаётся.
- **Конфиг** — только через zod-схему `src/config/env.schema.ts` и геттер в `AppConfig`; `process.env` в коде не читаем.
- Имена в БД — snake_case через `@map` / `@@map`; PK — `@id @default(uuid(7)) @db.Uuid`; дочерние таблицы — `onDelete: Cascade` + индекс `(profile_id, position)`.

## Рецепт: новая связь профиля (пример — Education)

1. `prisma/schema.prisma`: модель + обратное поле в `Profile` → `npm run db:migrate:dev -- --name add_x`.
2. `src/seed/seed.schema.ts` (zod) + `seed.service.ts` (nested `create` в `profile.create`) + данные в `profile.data.ts`.
3. `src/modules/x/`: `x.repository.ts` (`findByProfileIds`), `models/x.model.ts`, `x.module.ts` (export repository).
4. `loaders.factory.ts` + импорт модуля в `loaders.module.ts`.
5. `@ResolveField` в `profile.resolver.ts`.
6. При добавлении поля в `src/graphql/example-query.ts` увеличить `EXPECTED_QUERIES` в e2e (+1 SQL на связь).
7. e2e-тест в `test/profile.e2e-spec.ts`.

## Рецепт: мутация

`@InputType` DTO → сервис (zod для бизнес-правил, ошибки `GraphQLError` с `extensions.code`: `BAD_USER_INPUT` / `CONFLICT` / `FORBIDDEN`) → `@Mutation` в резолвере под guard'ом. Уникальность — constraint в БД + перехват `Prisma.PrismaClientKnownRequestError` с кодом `P2002`. Учитывать: сид перезапишет изменения при следующем старте.

## Подводные камни

- После изменения `schema.prisma` нужен `prisma generate` (`db:migrate:dev` делает его сам; Prisma 7 не генерирует автоматически).
- `prisma migrate dev` в неинтерактивной оболочке может зависнуть: тогда `npx prisma migrate dev --create-only --name x`, затем `npx prisma migrate dev`.
- `prisma migrate reset` деструктивен: не запускать без явного разрешения пользователя.
- При переключении на ветку без чьей-то миграции локальная БД расходится с историей: `docker compose down -v && docker compose up -d` (данные восстанавливает сид).
- `schema.gql` перегенерируется при старте вне production: коммитить его вместе с изменениями API.
- У `useFragment` в клиенте (`../portfolio-client`) нужен `fragmentName`, если в документе вложенные фрагменты; после изменения схемы — `npm run codegen` в клиенте.
