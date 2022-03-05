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


Deno.test("Cache: save & load", () => {
    const cache = new Cache<unknown>();

    testSet.forEach(({ key, value }) => {
        cache.save(key, value);
        assertEquals(cache.load(key), value);
    });
});


Deno.test("Cache: load & generator", () => {
    const cache = new Cache<unknown>();

    testSet.forEach(({ key, value }) => {
        assertEquals(cache.load(`${key}_1`, () => value), value);
        assertEquals(cache.load(`${key}_2`), undefined);
    });
});


Deno.test({
    name: "Cache: save & dependencies (expire)",
    fn: () => new Promise((exit) => {
        const expiration = 100;
        const dependencies: DependenciesType = { expire: expiration };
        
        const cache = new Cache<unknown>();

        const promises: Promise<void>[] = testSet.map(({ key, value }) => new Promise((exit) => {
            cache.save(key, value, dependencies);

            assertEquals(cache.load(key), value);

            setTimeout(() => {
                assertEquals(cache.load(key), undefined);
                exit();
            }, expiration + 10);
        }));


        Promise.all(promises).then(() => exit());
    })
});
