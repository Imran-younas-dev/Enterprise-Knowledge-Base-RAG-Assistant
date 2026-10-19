import {
    Bind,
    Controller,
    Dependencies,
    Get,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common'

/* import services */
import { LoginService } from './login.service'
import { MeService } from './me.service'
import { RegisterService } from './register.service'

/* import guards */
import { CheckScopeGuard } from '../../guards/check-scope.guard'
import { AuthGuard } from '../../guards/jwt-auth.guard'
import { ValidateRequestGuard } from '../../guards/validate-request.guard'

/* import decorators */
import { CheckScope } from '../../decorators/check-scope.decorator'
import { ValidateRequest } from '../../decorators/validate-request.decorators'

/* import dto */
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Controller('auth')
@Dependencies()
export class AuthController {
    constructor() {
        this.registerService = new RegisterService()
        this.loginService = new LoginService()
        this.meService = new MeService()
    }

    @Get('me')
    @CheckScope(['member'])
    @UseGuards(AuthGuard, CheckScopeGuard)
    @Bind(Req(), Res())
    async me(request, response) {
        const data = await this.meService.me(request)
        return response.json({ data })
    }

    @Post('register')
    @ValidateRequest(RegisterDto)
    @UseGuards(ValidateRequestGuard)
    @Bind(Req(), Res())
    async register(request, response) {
        const data = await this.registerService.register(request)
        return response.status(201).json({ data })
    }

    @Post('login')
    @ValidateRequest(LoginDto)
    @UseGuards(ValidateRequestGuard)
    @Bind(Req(), Res())
    async login(request, response) {
        const data = await this.loginService.login(request)
        return response.status(200).json({ data })
    }
}
