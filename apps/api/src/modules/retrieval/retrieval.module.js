import { Module } from '@nestjs/common'

import { RetrievalController } from './retrieval.controller'
import { SearchService } from './search.service'

@Module({
    controllers: [RetrievalController],
    providers: [SearchService],
})
export class RetrievalModule {}
