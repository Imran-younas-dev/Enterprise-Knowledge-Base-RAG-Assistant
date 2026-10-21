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
import { AskService } from './ask.service'

/* import guards */
import { CheckScopeGuard } from '../../guards/check-scope.guard'
import { AuthGuard } from '../../guards/jwt-auth.guard'
import { ValidateRequestGuard } from '../../guards/validate-request.guard'

/* import decorators */
import { CheckScope } from '../../decorators/check-scope.decorator'
import { ValidateRequest } from '../../decorators/validate-request.decorators'

/* import dto */
import { AskDto } from './dto/ask.dto'

@Controller('chat')
@Dependencies()
export class ChatController {
    constructor() {
        this.askService = new AskService()
    }

    @Post('ask')
    @CheckScope(['member'])
    @ValidateRequest(AskDto)
    @UseGuards(AuthGuard, CheckScopeGuard, ValidateRequestGuard)
    @Bind(Req(), Res())
    async ask(request, response) {
        const data = await this.askService.ask(request)
        return response.json({ data })
    }
}
