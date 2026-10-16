import 'reflect-metadata'

import { NestFactory } from '@nestjs/core'

import { QueueModule } from './queues/queue.module'

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(QueueModule)
    app.enableShutdownHooks()
    await app.init()

    // No HTTP server and no queue processors yet, so the event loop would otherwise end.
    const keepAlive = setInterval(() => {}, 60 * 60 * 1000)

    const close = async () => {
        clearInterval(keepAlive)
        await app.close()
        process.exit(0)
    }

    process.on('SIGINT', () => {
        void close()
    })
    process.on('SIGTERM', () => {
        void close()
    })
}

bootstrap()
