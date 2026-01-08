import { SourceAdapter } from '../engine/SourceAdapter';
import { DealJSON } from '../../../entities/models';

export class JSONDealAdapter implements SourceAdapter<DealJSON> {
    constructor(private path: string) {}

    async load(): Promise<DealJSON[]> {
        const rawData = await import(this.path);

        return rawData.default.map((d: any) => ({
            retailer: d.retailer,
            product: d.product,
            size: d.size,
            category: d.category,
            price: d.price,
            startDate: new Date(d.start),
            endDate: new Date(d.end)
        }));
    }
}
