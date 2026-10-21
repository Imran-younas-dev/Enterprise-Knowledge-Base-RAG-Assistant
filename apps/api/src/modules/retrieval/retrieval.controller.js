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
import { SearchService } from './search.service'

/* import guards */
import { CheckScopeGuard } from '../../guards/check-scope.guard'
import { AuthGuard } from '../../guards/jwt-auth.guard'
import { ValidateRequestGuard } from '../../guards/validate-request.guard'

/* import decorators */
import { CheckScope } from '../../decorators/check-scope.decorator'
import { ValidateRequest } from '../../decorators/validate-request.decorators'

/* import dto */
import { SearchDto } from './dto/search.dto'

@Controller('retrieval')
@Dependencies()
export class RetrievalController {
    constructor() {
        this.searchService = new SearchService()
    }

    @Post('search')
    @CheckScope(['member'])
    @ValidateRequest(SearchDto)
    @UseGuards(AuthGuard, CheckScopeGuard, ValidateRequestGuard)
    @Bind(Req(), Res())
    async search(request, response) {
        const data = await this.searchService.search(request)
        return response.json({ data })
    }
}
