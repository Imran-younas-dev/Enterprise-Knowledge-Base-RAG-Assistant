import { Module } from '@nestjs/common'

import { HealthController } from './health.controller'
import { CheckService } from './check.service'

@Module({
    controllers: [HealthController],
    providers: [CheckService],
})
export class HealthModule {}
