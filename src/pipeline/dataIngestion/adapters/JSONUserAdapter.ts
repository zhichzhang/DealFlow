import { SourceAdapter } from '../engine/SourceAdapter';
import { User } from '../../../entities/models';

export class JSONUserAdapter implements SourceAdapter<User> {
    constructor(private path: string) {}

    async load(): Promise<User[]> {
        const rawData = await import(this.path);

        return rawData.default.map((item: any) => ({
            name: item.name.trim(),
            email: item.email.toLowerCase(),
            preferred_retailers: item.preferred_retailers
        }));
    }
}
