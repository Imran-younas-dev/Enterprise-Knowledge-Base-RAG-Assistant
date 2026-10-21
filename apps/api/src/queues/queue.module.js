import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

/* import config */
import bullConfig from '../config/bull'

/* import queues */
import { IngestDocumentProcessor } from './ingest-document.processor'

@Module({
    imports: [
        BullModule.forRoot(bullConfig),
        BullModule.registerQueue({ name: 'ingestDocument' }),
    ],
    providers: [IngestDocumentProcessor],
})
export class QueueModule {}
