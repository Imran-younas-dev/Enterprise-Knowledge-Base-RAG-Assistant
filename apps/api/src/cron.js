import 'reflect-metadata'

import { NestFactory } from '@nestjs/core'

import { CronModule } from './crons/cron.module'

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(CronModule)
    await app.init()
}

bootstrap()
