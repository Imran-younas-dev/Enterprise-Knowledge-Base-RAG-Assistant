import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { DocumentsModule } from './documents/documents.module';
import { HealthController } from './health.controller';
import { IngestionModule } from './ingestion/ingestion.module';
import { RetrievalModule } from './retrieval/retrieval.module';

@Module({
  imports: [
    AuthModule,
    DocumentsModule,
    IngestionModule,
    RetrievalModule,
    ChatModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
