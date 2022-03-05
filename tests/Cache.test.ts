import { assertEquals } from "https://deno.land/std@0.128.0/testing/asserts.ts";
import { Cache } from "../mod.ts";


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