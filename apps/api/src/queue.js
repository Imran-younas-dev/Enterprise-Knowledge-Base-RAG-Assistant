import 'reflect-metadata'

import { NestFactory } from '@nestjs/core'

import { QueueModule } from './queues/queue.module'

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(QueueModule)
    await app.init()
}

bootstrap()
