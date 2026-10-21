import { Module } from '@nestjs/common'

import { ChunksService } from './chunks.service'
import { CreateService } from './create.service'
import { DocumentsController } from './documents.controller'
import { GetService } from './get.service'
import { ViewService } from './view.service'

@Module({
    controllers: [DocumentsController],
    providers: [GetService, ViewService, CreateService, ChunksService],
})
export class DocumentsModule {}
