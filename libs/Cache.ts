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
        if (!this.#storage.has(key)) return undefined;

        this.#update(key, true);

        const { value } = this.#storage.get(key)!;
        return value;
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
            state: Cache.#createState(dependencies),
        });
    }


    /**
     * Check if value exists in cache.
     * @param key 
     * @param value 
     */
    has(key: string): boolean {
        this.#update(key, false);

        return this.#storage.has(key);
    }


    /**
     * Remove value from cache.
     * @param key 
     */
    remove(key: string): void {
        this.#storage.delete(key);
    }


    #isValid(state: StateType, dependencies: DependenciesType) {
        if (dependencies.expire) {
            const expired = Date.now() > state.timestamp + dependencies.expire;
            if (expired) return false;
        }

        if (dependencies.callbacks) {
            const callbacks = [dependencies.callbacks].flat();
            const invalid = callbacks.some(callback => !callback());

            if (invalid) return false;
        }

        if (dependencies.files) {
            const current = Cache.#computeFileModificationMap([dependencies.files].flat());

            const invalid = [...state.files.entries()].some(([file, modifed]) => {
                return !current.has(file) || current.get(file) !== modifed;
            });

            if (invalid) return false;
        }

        return true;
    }


    #update(key: string, refreshState: boolean): void {
        if (!this.#storage.has(key)) return;

        const { dependencies, state } = this.#storage.get(key)!;

        if (!dependencies) return;

        if (!this.#isValid(state, dependencies)) {
            this.remove(key);
            return
        }

        if (refreshState) {
            if (dependencies.sliding) state.timestamp = Date.now();
        }
    }


    static #createState(dependencies?: DependenciesType): StateType {
        const files = [dependencies?.files ?? []].flat();

        return {
            timestamp: Date.now(),
            files: Cache.#computeFileModificationMap(files),
        };
    }


    static #computeFileModificationMap(files: string[]): Map<string, number> {
        const result = new Map<string, number>();

        files.forEach(file => {
            try {
                const modified = Deno.statSync(file).mtime?.getTime() ?? null;
                if (modified === null) return;

                result.set(file, modified);
            } catch (_err) {
                return;
            }
        });

        return result;
    }
}
