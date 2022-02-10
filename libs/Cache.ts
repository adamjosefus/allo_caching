/**
 * @copyright Copyright (c) 2022 Adam Josefus
 */


export type GeneratorType<T> = () => T;
type LoadOnlyEntryType = [key: string];
type LoadAndGenerateEntryType<T> = [key: string, generator: GeneratorType<T>];
type LoadEntryType<T> = LoadOnlyEntryType | LoadAndGenerateEntryType<T>;


export class Cache<T> {

    readonly #storage: Map<string, T> = new Map();


    load<E extends LoadEntryType<T>>(...args: E): E extends LoadAndGenerateEntryType<T> ? T : T | undefined {
        const [key, generator] = args;

        if (this.#storage.has(key)) {
            return this.#storage.get(key)!;
        }

        if (generator) {
            const value = generator();
            this.save(key, value);

            return value;
        }

        // deno-lint-ignore no-explicit-any
        return undefined as any;
    }


    save(key: string, value: T): void {
        this.#storage.set(key, value);
    }


    has(key: string): boolean {
        return this.#storage.has(key);
    }


    delete(key: string): void {
        this.#storage.delete(key);
    }
}
