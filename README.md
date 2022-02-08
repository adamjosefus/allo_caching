# Caching

## `Cache`

```ts
const cache = new Cache<string>();

const cacheKey = 'abc123';

/**
 * Load from cache.
 * If not found, value will be generated and stored in cache.
 */
cache.load(cacheKey, () => {
    const result = 'Lorem ipsum';

    // Some expensive operation
    // ...

    return result
}); // -> string


/**
 * Load from cache.
 */
cache.load(cacheKey); // -> string | undefined


/**
 * Save to cache.
 */
cache.save(cacheKey, 'Lorem ipsum');


/**
 * Check if cache exists.
 */
cache.has(cacheKey); // -> boolean

```