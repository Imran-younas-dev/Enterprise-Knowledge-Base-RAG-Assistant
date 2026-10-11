# NestJS structure and code rules

This API is **JavaScript**, not TypeScript. Babel compiles decorators. Nest is used for modules, controllers, guards, and background processes. Sequelize models and most services are plain classes wired by hand.

Copy this layout on the next project. Do not add TypeScript, a `src/` barrel for everything, or Nest dependency injection for feature services unless you are deliberately changing the standard.

## Processes

Three entry points. Each boots its own Nest application.

| Process | Dev entry | Boot file | What it runs |
|---------|-----------|-----------|--------------|
| HTTP API | `index.js` | `src/main.js` | `AppModule` |
| Cron | `cron.index.js` | `src/cron.js` | `CronModule` (no HTTP server) |
| Queue worker | `queue.index.js` | `src/queue.js` | `QueueModule` (no HTTP server) |

`index.js`, `cron.index.js`, and `queue.index.js` only load `@babel/register` (or `babel-node`) and then the boot file.

- Global prefix is `api`. A controller `@Controller('categories')` is `GET /api/categories`.
- Listen on `process.env.PORT` or `3000`.
- Dev scripts run ESLint `--fix`, then `babel-node`. See `package.json` scripts `dev`, `cron-dev`, `queue-dev`.
- Production build: `babel src --out-dir dist --copy-files`.

## Folder tree

```
index.js                      API entry (babel register)
cron.index.js                 cron entry
queue.index.js                queue entry
nest-cli.json                 { "language": "js" }
jsconfig.json                 experimentalDecorators
.babelrc                      preset-env, legacy decorators, class properties
.eslintrc.js
.prettierrc
.sequelizerc                  points sequelize-cli at src/config/database.js
migrations/                   sequelize-cli, CommonJS
seeders/                      sequelize-cli, CommonJS
src/
  main.js                     HTTP bootstrap
  app.module.js               root module
  cron.js                     cron bootstrap
  queue.js                    queue bootstrap
  config/                     database.js, redis.js, bull.js, uploads.js
  modules/
    index.js                  array of feature modules imported by AppModule
    <feature>/
      <feature>.module.js
      <feature>.controller.js
      <action>.service.js
      dto/
        <action>.dto.js
  models/
    index.js                  sequelize instance + models array
    AbstractModel.js          shared model base
    <ModelName>.js            one table per file, default export
  guards/                     *.guard.js
  decorators/                 *.decorator.js
  middlewares/                exception filter, request validation
  exceptions/                 AppValidationError
  helpers/                    plain functions, default export
  lang/en/                    errors, messages, validations, templates
  queues/
    queue.module.js
    <job-name>.processor.js
  crons/
    cron.module.js
    <job-name>.cron.service.js
  scripts/                    one-off babel-node scripts, not request handlers
  templates/                  handlebars
```

Feature code lives under `src/modules/<feature>/`. Shared code does not go inside a feature folder.

## A feature module

One folder per resource. The folder name is kebab-case and matches the URL prefix.

```
src/modules/categories/
  categories.module.js
  categories.controller.js
  get.service.js
  view.service.js
  create.service.js
  update.service.js
  dto/
    create.dto.js
    update.dto.js
```

Register the module class in `src/modules/index.js`. `AppModule` spreads that array into `imports`. Do not import feature modules one by one inside `app.module.js`.

`categories.module.js` only lists the controller and the services:

```js
@Module({
    controllers: [CategoriesController],
    providers: [GetService, ViewService, CreateService, UpdateService],
})
export class CategoriesModule {}
```

Services are still constructed with `new` inside the controller. Listing them in `providers` matches the existing modules. Do not switch a feature to constructor injection.

## Naming

| Kind | File | Class |
|------|------|--------|
| Module | `categories.module.js` | `CategoriesModule` |
| Controller | `categories.controller.js` | `CategoriesController` |
| Service | `get.service.js`, `create.service.js` | `GetService`, `CreateService` |
| Extra action | `invoice.resend.service.js` | `ResendInvoiceService` |
| DTO | `dto/create.dto.js` | `CreateDto` |
| Guard | `jwt-auth.guard.js` | `AuthGuard` |
| Decorator | `check-scope.decorator.js` | `CheckScope` |
| Model | `Category.js` | `Category` (default export) |
| Queue | `send-email.processor.js` | `SendEmailProcessor` |
| Cron | `renew-subscription.cron.service.js` | `RenewSubscriptionCronService` |
| Migration | `YYYYMMDDHHMMSS-create-<table>-table.js` | CommonJS `up` / `down` |
| Seeder | `YYYYMMDDHHMMSS-<description>-seed.js` | CommonJS |

- Files and folders: kebab-case.
- Classes: PascalCase.
- Methods on a service match the file: `get`, `view`, `create`, `update`, `remove`.
- One action per service file. Do not put list, create, and update in one service.
- Queue names in `@Processor('queueName')` and `new Queue('queueName', bullConfig)` are camelCase and must match.
- Database tables: snake_case plural (`carrier_profiles`). Model file: PascalCase singular (`CarrierProfile.js`).

## Controller

```js
@Controller('categories')
@Dependencies()
export class CategoriesController {
    constructor() {
        this.getService = new GetService()
        this.createService = new CreateService()
    }

    @Post()
    @CheckScope(['admin-access'])
    @ValidateRequest(CreateDto)
    @UseGuards(AuthGuard, CheckScopeGuard, ValidateRequestGuard)
    @Bind(Req(), Res())
    async create(request, response) {
        const data = await this.createService.create(request)
        return response.json({ data })
    }
}
```

Rules:

- Pass the Express `request` into the service. Read `request.user`, `request.body`, `request.query`, `request.params` inside the service.
- Return `response.json({ data })`. Do not return the object from the controller method and let Nest serialize it.
- Decorator order on a route: HTTP verb, `@CheckScope`, `@ValidateRequest`, `@UseGuards`, `@Bind(Req(), Res())`.
- Guard order: `AuthGuard`, then `CheckScopeGuard`, then `ValidateRequestGuard` when the route has a body or params DTO.
- `@CheckScope([...])` lists scopes. The guard passes if the token has any one of them. A `super-admin` scope skips the check.
- Public routes omit `AuthGuard` and `CheckScope`.
- Static paths (`GET options`) stay above param paths (`GET :id`).

## Service

```js
@Injectable()
export class CreateService {
    async create(request) {
        const { body, user } = request
        // query models, throw AppValidationError on failure
        return createdRow
    }
}
```

- `@Injectable()` on the class.
- Empty `constructor() {}` is fine. Do not inject models through Nest.
- Import models as default imports from `src/models/<Model>`.
- Throw `AppValidationError` from `src/exceptions/AppValidationError.js` for business failures. Second argument is the HTTP status (`404`, `403`, `422`).
- User-facing strings go through `translate('errors' | 'messages' | 'validations', key, replacements)`, not hard-coded English, when a lang key already exists.
- Data scoping (which rows this user may see) belongs in the service. Guards only check that the token and scope exist.

## DTO

DTOs are `class-validator` classes. They are not Nest pipes.

```js
export class CreateDto {
    @IsString(createValidationMessage({ key: 'string' }))
    @IsNotEmpty(createValidationMessage({ key: 'required' }))
    name
}
```

- Class properties have no TypeScript types.
- Messages come from `createValidationMessage` or `translate('validations', ...)`.
- `@ValidateRequest(CreateDto)` plus `ValidateRequestGuard` copies matching keys from `body`, `params`, and `query` onto a DTO instance and runs `class-validator`.
- `page`, `limit`, `order`, `orderBy`, and `attributes` are not validated by that middleware. Do not require them on the DTO.

## Models

- One Sequelize model per file, `export default class`, extending `AbstractModel`.
- Decorators from `sequelize-typescript`: `@Table`, `@Column`, `@PrimaryKey`, `@AutoIncrement`, `@AllowNull`, associations.
- `@Table({ tableName: 'categories', timestamps: true })`.
- Register every model in the `models` array in `src/models/index.js`. `AppModule` passes that array to `SequelizeModule.forRoot`.
- `src/config/database.js` is CommonJS (`module.exports`) because `sequelize-cli` loads it. App code imports it as ESM. Do not convert it to `export`.

## Migrations and seeders

- CommonJS only: `'use strict'` and `module.exports = { up, down }`.
- Filename: `YYYYMMDDHHMMSS-kebab-description.js`.
- Create or alter tables here. Do not rely on `sync()` in application code.
- Integer primary keys are `Sequelize.INTEGER.UNSIGNED`.
- Commands: `npm run migrate`, `npm run seed`, `npm run undo`, `npm run rollback`.

## Queues

A cron or a service enqueues work. The queue process runs it.

```js
// producer (service or cron)
this.sendEmail = new Queue('sendEmail', bullConfig)
this.sendEmail.add(payload)

// consumer
@Processor('sendEmail')
export class SendEmailProcessor {
    @Process()
    async handleJob(job) {
        // job.data
    }
}
```

- Register every processor in `src/queues/queue.module.js` `providers`.
- Bull config is `src/config/bull.js` (Redis host, port, prefix).
- Cron classes only enqueue. They do not do the heavy work. See `src/crons/*.cron.service.js` and `@Cron('5 0 * * *')` from `@nestjs/schedule`.
- Register cron classes in `src/crons/cron.module.js`.

## Auth pieces

| File | Role |
|------|------|
| `src/guards/jwt-auth.guard.js` | Read `Authorization: Bearer`, verify JWT with `CLIENT_SECRET`, set `request.user` |
| `src/decorators/check-scope.decorator.js` | `CheckScope` metadata |
| `src/guards/check-scope.guard.js` | Compare token scopes to the route |
| `src/decorators/validate-request.decorators.js` | `ValidateRequest` metadata |
| `src/guards/validate-request.guard.js` | Run the DTO |
| `src/middlewares/exception-handler.js` | Global `AllExceptionsFilter`, registered as `APP_FILTER` |
| `src/helpers/translate.js` | `translate(type, key, replacements)` |
| `src/lang/en/*.js` | String tables |

`AppModule` also registers `ThrottlerGuard` globally and `JwtModule`.

## Import order

Group imports with a comment line. External packages first, then local groups, blank line between groups.

```js
import { Injectable } from '@nestjs/common'

/* import models */
import CategoryModel from '../../models/Category'

/* import helpers */
import translate from '../../helpers/translate'

/* import exceptions */
import AppValidationError from '../../exceptions/AppValidationError'
```

Use that same comment style in controllers: `/* import services */`, `/* import guards */`, `/* import decorators */`, `/* import dto */`.

## Formatting and lint

From `.prettierrc` and `.eslintrc.js`:

- No semicolons.
- Single quotes.
- 4-space indent, no tabs.
- Trailing commas where ES5 allows them (`es5`).
- Print width 80. ESLint `max-len` is 120 and ignores strings, comments, and template literals.
- `const` when the binding is not reassigned.
- `no-console` and `no-var` are errors. A deliberate log needs `// eslint-disable-next-line` on the line above.
- Object curly spacing: `{ data }`, not `{data}`.
- Camelcase for identifiers. Object properties are exempt (`babel/camelcase` `properties: 'never'`), so database and external API fields may stay snake_case.
- Parser is `@babel/eslint-parser` with legacy decorators. Do not turn on the TypeScript parser.

Run `npm run lintfix` or `npm run format` before handing code over. `npm run dev` already runs `eslint src --fix` on each restart.

## Language rules

- `import` / `export` in `src/`. Babel transpiles this to CommonJS.
- Legacy decorators (`@babel/plugin-proposal-decorators`, `{ legacy: true }`) and `@babel/plugin-proposal-class-properties`.
- Class fields are assigned in the constructor (`this.getService = new GetService()`), which is the style already in controllers.
- Migrations, seeders, and `src/config/database.js` stay CommonJS.
- Do not add `.ts` files. `nest-cli.json` sets `"language": "js"`.

## New feature checklist

1. Add `src/modules/<feature>/<feature>.module.js` and `<feature>.controller.js`.
2. Add one `<action>.service.js` per action and `dto/<action>.dto.js` when the route accepts input.
3. Export the module from `src/modules/index.js`.
4. If there is a new table: model in `src/models/`, register it in `src/models/index.js`, add a migration.
5. If work is slow or scheduled: a `*.processor.js` in `src/queues/` (and a `*.cron.service.js` if it is on a clock). Register both.
6. Put reusable functions in `src/helpers/`, not in the service file, once a second feature needs them.
7. Put new user-facing strings in `src/lang/en/`.
