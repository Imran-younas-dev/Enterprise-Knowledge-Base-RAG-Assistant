import { Module } from '@nestjs/common'

import { DocumentsController } from './documents.controller'
import { GetService } from './get.service'
import { ViewService } from './view.service'

@Module({
    controllers: [DocumentsController],
    providers: [GetService, ViewService],
})
export class DocumentsModule {}
