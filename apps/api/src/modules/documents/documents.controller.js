import {
    Bind,
    Controller,
    Dependencies,
    Get,
    Post,
    Req,
    Res,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'

/* import services */
import { ChunksService } from './chunks.service'
import { CreateService } from './create.service'
import { GetService } from './get.service'
import { ViewService } from './view.service'

/* import guards */
import { CheckScopeGuard } from '../../guards/check-scope.guard'
import { AuthGuard } from '../../guards/jwt-auth.guard'

/* import decorators */
import { CheckScope } from '../../decorators/check-scope.decorator'

/* import config */
import uploads from '../../config/uploads'

@Controller('documents')
@Dependencies()
export class DocumentsController {
    constructor() {
        this.getService = new GetService()
        this.viewService = new ViewService()
        this.createService = new CreateService()
        this.chunksService = new ChunksService()
    }

    @Post()
    @CheckScope(['member'])
    @UseGuards(AuthGuard, CheckScopeGuard)
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: uploads.maxBytes },
        })
    )
    @Bind(Req(), Res())
    async create(request, response) {
        const data = await this.createService.create(request)
        return response.status(202).json({ data })
    }

    @Get()
    @CheckScope(['member'])
    @UseGuards(AuthGuard, CheckScopeGuard)
    @Bind(Req(), Res())
    async get(request, response) {
        const data = await this.getService.get(request)
        return response.json({ data })
    }

    @Get(':id/chunks')
    @CheckScope(['member'])
    @UseGuards(AuthGuard, CheckScopeGuard)
    @Bind(Req(), Res())
    async chunks(request, response) {
        const data = await this.chunksService.chunks(request)
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
