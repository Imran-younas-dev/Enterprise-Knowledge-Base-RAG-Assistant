import dotenv from 'dotenv'
import path from 'path'

import { Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'

import jwtOptions from './config/jwt'
import { AllExceptionsFilter } from './middlewares/exception-handler'
import modules from './modules'
import './models'

dotenv.config({
    path: path.resolve(__dirname, '../../../.env'),
})

@Module({
    imports: [...modules, JwtModule.register(jwtOptions())],
    providers: [
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
    ],
})
export class AppModule {}
