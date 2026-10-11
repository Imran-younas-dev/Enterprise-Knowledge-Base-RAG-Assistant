import { Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'

import { AllExceptionsFilter } from './middlewares/exception-handler'
import modules from './modules'

@Module({
    imports: [...modules],
    providers: [
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
    ],
})
export class AppModule {}
