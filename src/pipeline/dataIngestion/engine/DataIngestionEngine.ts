import { SourceAdapter } from './SourceAdapter';

export class DataIngestionEngine {
    async ingest<T>(adapter: SourceAdapter<T>, handler: { handle(item: T): Promise<void> }) {
        const items = await adapter.load();
        for (const item of items) {
            await handler.handle(item);
        }
    }
}
