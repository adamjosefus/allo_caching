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


export class Cache<T> {

    readonly #storage: Map<string, {
        value: T,
        dependencies?: DependenciesType,
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

        const { value, dependencies } = stored;
        if (dependencies === undefined) return value;

        if (!this.#isDependenciesValid(dependencies)) return undefined;
        return value;
    }


    #isDependenciesValid(dependencies: DependenciesType): boolean {
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
}
