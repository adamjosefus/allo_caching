import { assertEquals } from "https://deno.land/std@0.128.0/testing/asserts.ts";
import { Cache, DependenciesType } from "../mod.ts";


Deno.test("Cache: save & load", () => {
    const set = [
        { key: "undefined", value: undefined },
        { key: "null", value: null },
        { key: "number", value: 123 },
        { key: "string", value: "Lorem ipsum" },
        { key: "array", value: [10, 20, 30] },
        { key: "object", value: { foo: "bar" } },
    ];

    const cache = new Cache<unknown>();

    set.forEach(({ key, value }) => {
        cache.save(key, value);
        assertEquals(cache.load(key), value);
    });
});


Deno.test("Cache: load & generator", () => {
    const set = [
        { key: "undefined", value: undefined },
        { key: "null", value: null },
        { key: "number", value: 123 },
        { key: "string", value: "Lorem ipsum" },
        { key: "array", value: [10, 20, 30] },
        { key: "object", value: { foo: "bar" } },
    ];

    const cache = new Cache<unknown>();

    set.forEach(({ key, value }) => {
        assertEquals(cache.load(`${key}_1`, () => value), value);
        assertEquals(cache.load(`${key}_2`), undefined);
    });
});


async function sleep(time: number) {
    return await new Promise((resolve) => setTimeout(resolve, time));
}

Deno.test("Cache: save & dependencies (expire)", async () => {
    const expire = 100;
    const dependencies: DependenciesType = { expire };

    const key = "key";
    const cache = new Cache<unknown>();
    const value = "abc123";

    cache.save(key, value, dependencies);

    await sleep(expire * .51);
    assertEquals(cache.load(key), value);

    await sleep(expire * .51);
    assertEquals(cache.load(key), undefined);
});


Deno.test("Cache: save & dependencies (files)", () => {
    const file = Deno.makeTempFileSync({ prefix: 'my_temp_' });    
    const dependencies: DependenciesType = {
        files: file
    };

    const key = "key";
    const cache = new Cache<unknown>();
    const value = "abc123";

    cache.save(key, value, dependencies);

    assertEquals(cache.load(key), value);''

    Deno.removeSync(file);
    assertEquals(cache.load(key), undefined);
});
