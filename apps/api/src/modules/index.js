import { AuthModule } from './auth/auth.module'
import { ChatModule } from './chat/chat.module'
import { DocumentsModule } from './documents/documents.module'
import { HealthModule } from './health/health.module'
import { IngestionModule } from './ingestion/ingestion.module'
import { RetrievalModule } from './retrieval/retrieval.module'

export default [
    HealthModule,
    AuthModule,
    DocumentsModule,
    IngestionModule,
    RetrievalModule,
    ChatModule,
]
