import {
    Bind,
    Controller,
    Dependencies,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common'

/* import services */
import { LoginService } from './login.service'
import { RegisterService } from './register.service'

/* import guards */
import { ValidateRequestGuard } from '../../guards/validate-request.guard'

/* import decorators */
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
