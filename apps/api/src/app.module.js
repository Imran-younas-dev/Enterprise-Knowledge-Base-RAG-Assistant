import dotenv from 'dotenv'
import path from 'path'

import { Module } from '@nestjs/common'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

import jwtOptions from './config/jwt'
import throttle from './config/throttle'
import { AllExceptionsFilter } from './middlewares/exception-handler'
import modules from './modules'
import './models'

dotenv.config({
    path: path.resolve(__dirname, '../../../.env'),
})

@Module({
    imports: [
        ...modules,
        JwtModule.register(jwtOptions()),
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    name: 'default',
                    ttl: throttle.ttlMs,
                    limit: throttle.defaultLimit,
                },
            ],
        }),
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
