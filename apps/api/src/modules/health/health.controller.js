import { Bind, Controller, Dependencies, Get, Req, Res } from '@nestjs/common'

/* import services */
import { CheckService } from './check.service'

@Controller('health')
@Dependencies()
export class HealthController {
    constructor() {
        this.checkService = new CheckService()
    }

    @Get()
    @Bind(Req(), Res())
    async check(_request, response) {
        const data = await this.checkService.check(request)
        return response.json({ data })
    }
}
