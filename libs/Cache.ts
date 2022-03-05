/**
 * @copyright Copyright (c) 2022 Adam Josefus
 */

import { type DependenciesType } from "./DependenciesType.ts";


export type GeneratorType<T> = () => T;

type LoadOnlyEntryType =
    | [key: string]
    | [key: string, dependencies: DependenciesType];

type LoadAndGenerateEntryType<T> =
    | [key: string, generator: GeneratorType<T>]
    | [key: string, generator: GeneratorType<T>, dependencies?: DependenciesType];

type LoadEntryType<T> =
    | LoadOnlyEntryType | LoadAndGenerateEntryType<T>;

type StateType = {
    timestamp: number;
    files: Map<string, number>;
};


export class Cache<T> {

    readonly #storage: Map<string, {
        value: T,
        dependencies?: DependenciesType,
        state: StateType,
    }> = new Map();


    /**
     * @param `key` Cache key.
     * @param `generator` Generator generates a value if it is not loaded.
     * @returns `<T>` or `<T> | undefined` – depending on whether the generator has been set.
     */
    load<E extends LoadEntryType<T>>(...args: E): E extends LoadAndGenerateEntryType<T> ? T : T | undefined {
        const { key, generator, dependencies } = (() => {
            const [key, a, b] = args;

            if (key !== undefined && a !== undefined && b !== undefined) {
                return {
                    key,
                    generator: a as GeneratorType<T>,
                    dependencies: b as DependenciesType,
                }

            } else if (typeof a === 'function') {
                return {
                    key,
                    generator: a as GeneratorType<T>,
                    dependencies: undefined,
                }

            } else if (typeof a === 'object') {
                return {
                    key,
                    generator: undefined,
                    dependencies: a as DependenciesType,
                }

            } else {
                return {
                    key,
                    generator: undefined,
                    dependencies: undefined,
                }
            }
        })();

        if (this.has(key)) {
            return this.#load(key)!;
        }

        if (generator) {
            const value = generator();
            this.save(key, value, dependencies);

            return value;
        }

        // deno-lint-ignore no-explicit-any
        return undefined as any;
    }


    #load(key: string): T | undefined {
        const stored = this.#storage.get(key);
        if (stored === undefined) return undefined;

        const { value, dependencies, state } = stored;

        if (!dependencies) return value;

        if (!this.#invalidate(state, dependencies)) {
            this.remove(key);
            return undefined;
        }

        this.#updateState(state, dependencies);

        return value;
    }


    #invalidate(state: StateType, dependencies: DependenciesType) {
        const now = Date.now();

        if (dependencies.expire) {
            const expired = now > state.timestamp + dependencies.expire;

            if (expired) return true;
        }

        if (dependencies.callbacks) {
            const callbacks = [dependencies.callbacks].flat();
            const invalid = callbacks.some(callback => !callback());

            if (invalid) return true;
        }

        if (dependencies.files) {
            const current = Cache.#computeFileState([dependencies.files].flat());

            const invalid = [...state.files.entries()].some(([file, modifed]) => {
                if (!current.has(file)) return true;
                return current.get(file)! > modifed;
            });

            if (invalid) return true;
        }

        return false;
    }


    /**
     * Save value to cache by key.
     * @param key 
     * @param value 
     */
    save(key: string, value: T, dependencies?: DependenciesType): void {
        this.#storage.set(key, {
            value,
            dependencies,
            state: this.#createState(dependencies),
        });
    }


    /**
     * Check if value exists in cache.
     * @param key 
     * @param value 
     */
    has(key: string): boolean {
        return this.#load(key) !== undefined;
    }


    /**
     * Remove value from cache.
     * @param key 
     */
    remove(key: string): void {
        this.#storage.delete(key);
    }


    /**
     * @deprecated Use `remove` instead.
     * 
     * Delete value from cache.
     * @param key 
     */
    delete(key: string): void {
        this.remove(key);
    }


    #createState(dependencies?: DependenciesType): StateType {
        const files = [dependencies?.files ?? []].flat();

        return {
            timestamp: Date.now(),
            files: Cache.#computeFileState(files),
        };
    }


    #updateState(state: StateType, dependencies: DependenciesType): void {
        if (dependencies.sliding) state.timestamp = Date.now();
    }


    static #computeFileState(files: string[]): Map<string, number> {
        const result = new Map<string, number>();

        files.forEach(file => {
            const modified = Deno.statSync(file).mtime?.getTime() ?? null;
            if (modified === null) return;

            result.set(file, modified);
        });

        return result;
    }
}
