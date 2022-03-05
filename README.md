# **Allo Caching** for Deno 🦕

Simple caching solution in Typescript.


## `Cache<ValueType>`

### Load or Generate

```ts
const cache = new Cache<string>();

// Load from cache.
// If not found, value will be generated and stored in cache.
cache.load('key_1', () => {
    // Some expensive operation
    return 'Lorem ipsum';
}); // Return type is string

cache.has('key_1'); // true
cache.load('key_1'); // 'Lorem ipsum'


// Load from cache without generating.
cache.load('key_2'); // Return type is string | undefined

// Save to cache.
cache.save('key_2', 'Lorem ipsum');

// Check if cache exists.
cache.has('key_2'); // true
cache.load('key_2'); // 'Lorem ipsum'

```



## Documentation 📖

Description of all classes and methods with **examples** will found in the [documentation](https://doc.deno.land/https://deno.land/x/allo_caching/mod.ts).

---

Check out other [ours packages 📦](https://deno.land/x?query=allo_)!