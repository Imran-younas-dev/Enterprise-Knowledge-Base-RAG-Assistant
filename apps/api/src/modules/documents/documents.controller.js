import {
    Bind,
    Controller,
    Dependencies,
    Get,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common'

/* import services */
import { GetService } from './get.service'
import { ViewService } from './view.service'

/* import guards */
import { CheckScopeGuard } from '../../guards/check-scope.guard'
import { AuthGuard } from '../../guards/jwt-auth.guard'

/* import decorators */
import { CheckScope } from '../../decorators/check-scope.decorator'

@Controller('documents')
@Dependencies()
export class DocumentsController {
    constructor() {
        this.getService = new GetService()
        this.viewService = new ViewService()
    }

    @Get()
    @CheckScope(['member'])
    @UseGuards(AuthGuard, CheckScopeGuard)
    @Bind(Req(), Res())
    async get(request, response) {
        const data = await this.getService.get(request)
        return response.json({ data })
    }

    @Get(':id')
    @CheckScope(['member'])
    @UseGuards(AuthGuard, CheckScopeGuard)
    @Bind(Req(), Res())
    async view(request, response) {
        const data = await this.viewService.view(request)
        return response.json({ data })
    }
}
