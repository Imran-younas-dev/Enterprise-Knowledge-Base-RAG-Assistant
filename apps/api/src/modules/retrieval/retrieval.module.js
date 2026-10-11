import { Module } from '@nestjs/common'

import { RetrievalController } from './retrieval.controller'

@Module({
    controllers: [RetrievalController],
})
export class RetrievalModule {}
