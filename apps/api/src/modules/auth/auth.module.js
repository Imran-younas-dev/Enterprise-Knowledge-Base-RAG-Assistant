import { Module } from '@nestjs/common'

import { AuthController } from './auth.controller'
import { LoginService } from './login.service'
import { RegisterService } from './register.service'

@Module({
    controllers: [AuthController],
    providers: [RegisterService, LoginService],
})
export class AuthModule {}
