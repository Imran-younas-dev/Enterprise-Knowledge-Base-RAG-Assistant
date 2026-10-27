import {
    Bind,
    Controller,
    Delete,
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
import { RemoveService } from './remove.service'
import { ReprocessService } from './reprocess.service'
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
        this.reprocessService = new ReprocessService()
        this.removeService = new RemoveService()
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
        const status = data.duplicate ? 200 : 202
        return response.status(status).json({ data })
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

    @Post(':id/reprocess')
    @CheckScope(['member'])
    @UseGuards(AuthGuard, CheckScopeGuard)
    @Bind(Req(), Res())
    async reprocess(request, response) {
        const data = await this.reprocessService.reprocess(request)
        return response.status(202).json({ data })
    }

    @Delete(':id')
    @CheckScope(['member'])
    @UseGuards(AuthGuard, CheckScopeGuard)
    @Bind(Req(), Res())
    async remove(request, response) {
        const data = await this.removeService.remove(request)
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
