import { Module } from '@nestjs/common'

import { AuthController } from './auth.controller'
import { LoginService } from './login.service'
import { MeService } from './me.service'
import { RegisterService } from './register.service'

@Module({
    controllers: [AuthController],
    providers: [RegisterService, LoginService, MeService],
})
export class AuthModule {}
