import { assertEquals } from "https://deno.land/std@0.128.0/testing/asserts.ts";
import { Cache, DependenciesType } from "../mod.ts";


const testSet = [
    { key: "undefined", value: undefined },
    { key: "null", value: null },
    { key: "number", value: 123 },
    { key: "string", value: "Lorem ipsum" },
    { key: "array", value: [10, 20, 30] },
    { key: "object", value: { foo: "bar" } },
];


Deno.test("Cache: load returns type", () => {
    const cache = new Cache<number>();

    const _v1: number | undefined = cache.load("test");
    const _v2: number = cache.load("test", () => 123);
    const _v3: number = cache.load("test", () => 123, { expire: 1 });
    const _v4: number | undefined = cache.load("test", { expire: 1 });
});


Deno.test("Cache: save & load", () => {
    const cache = new Cache<unknown>();

    testSet.forEach(({ key, value }) => {
        cache.save(key, value);

        assertEquals(cache.has(key), true);
        assertEquals(cache.load(key), value);
        assertEquals(cache.has(key), true);
    });
});


Deno.test("Cache: load & generator", () => {
    const cache = new Cache<unknown>();

    testSet.forEach(({ key, value }) => {
        assertEquals(cache.has(`${key}_1`), false);
        assertEquals(cache.load(`${key}_1`, () => value), value);
        assertEquals(cache.has(`${key}_1`), true);

        assertEquals(cache.has(`${key}_2`), false);
        assertEquals(cache.load(`${key}_2`), undefined);
        assertEquals(cache.has(`${key}_2`), false);
    });
});


Deno.test({
    name: "Cache: save & dependencies (expire)",
    fn: () => new Promise((exit) => {
        const expiration = 50;
        const dependencies: DependenciesType = { expire: expiration };

        const cache = new Cache<unknown>();

        const promises: Promise<void>[] = testSet.map(({ key, value }) => new Promise((exit) => {
            cache.save(key, value, dependencies);

            assertEquals(cache.has(key), true);
            assertEquals(cache.load(key), value);
            assertEquals(cache.has(key), true);

            setTimeout(() => {
                assertEquals(cache.has(key), false);
                assertEquals(cache.load(key), undefined);
                assertEquals(cache.has(key), false);
                exit();
            }, expiration + 10);
        }));


        Promise.all(promises).then(() => exit());
    })
});


Deno.test({
    name: "Cache: save & dependencies (expire & sliding)",
    fn: () => new Promise((exit) => {
        const expiration = 50;
        const dependencies: DependenciesType = {
            expire: expiration,
            sliding: true
        };

        const cache = new Cache<unknown>();

        const promises: Promise<void>[] = testSet.map(({ key, value }) => new Promise((exit) => {
            cache.save(key, value, dependencies);

            assertEquals(cache.has(key), true);
            assertEquals(cache.load(key), value);
            assertEquals(cache.has(key), true);

            setTimeout(() => {
                assertEquals(cache.has(key), true);
                assertEquals(cache.load(key), value);
                assertEquals(cache.has(key), true);
            }, 2 * 10);

            setTimeout(() => {
                assertEquals(cache.has(key), true);
                assertEquals(cache.load(key), value);
                assertEquals(cache.has(key), true);
            }, expiration + 10);

            setTimeout(() => {
                assertEquals(cache.has(key), false);
                assertEquals(cache.load(key), undefined);
                assertEquals(cache.has(key), false);
                exit();
            }, 3 * expiration + 10);
        }));


        Promise.all(promises).then(() => exit());
    })
});


Deno.test({
    name: "Cache: save & dependencies (files)",
    fn: () => new Promise((exit) => {
        const cache = new Cache<unknown>();

        const promises: Promise<void>[] = testSet.map(({ key, value }) => new Promise((exit) => {
            const file1 = Deno.makeTempFileSync();
            const file2 = Deno.makeTempFileSync();

            const dependencies: DependenciesType = {
                files: [file1, file2]
            };

            cache.save(key, value, dependencies);

            assertEquals(cache.has(key), true);
            assertEquals(cache.load(key), value);
            assertEquals(cache.has(key), true);

            Deno.removeSync(file1);

            assertEquals(cache.has(key), false);
            assertEquals(cache.load(key), undefined);
            assertEquals(cache.has(key), false);

            Deno.removeSync(file2);

            assertEquals(cache.has(key), false);
            assertEquals(cache.load(key), undefined);
            assertEquals(cache.has(key), false);

            exit();
        }));


        Promise.all(promises).then(() => {
            exit();
        });
    })
});

Deno.test("Cache: save & dependencies (callbacks)", () => {
    const cache = new Cache<unknown>();

    testSet.forEach(({ key, value }) => {
        cache.save(key, value, {
            callbacks: () => true
        });

        assertEquals(cache.has(key), true);
        assertEquals(cache.load(key), value);
        assertEquals(cache.has(key), true);
    });

    testSet.forEach(({ key, value }) => {
        cache.save(key, value, {
            callbacks: () => false
        });

        assertEquals(cache.has(key), false);
        assertEquals(cache.load(key), undefined);
        assertEquals(cache.has(key), false);
    });
});
