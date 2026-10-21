import { Module } from '@nestjs/common'

import { AskService } from './ask.service'
import { ChatController } from './chat.controller'

@Module({
    controllers: [ChatController],
    providers: [AskService],
})
export class ChatModule {}
