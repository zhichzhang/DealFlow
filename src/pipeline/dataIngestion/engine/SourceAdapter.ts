export interface SourceAdapter<T> {
    load(): Promise<T[]>;
}