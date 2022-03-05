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


###  Invalidation
#### Expiration
```ts
const cache = new Cache<number>();

cache.save('key', 42, {
    expire: 1000 // Expire after 1 second.
});


// Works with load generator too.
cache.load('key', () => 42, { expire: 1000 });
```

```ts
const cache = new Cache<number>();

cache.save('key', 42, {
    expire: 1000,
    sliding: true // Update expiration after each load
});
```

#### Files
```ts
const cache = new Cache<string>();

cache.save('key', "My text data", {
    files: [
        'file_1.txt',
        'file_2.txt'
    ] // Expired when some file is modified or deleted.
});
```

#### Callbacks
```ts
const cache = new Cache<string>();

function isValid(): boolean {
    //...
    return true;
}

cache.save('key', "My text data", {
    callbacks: [
        isValid,
        () => false,
    ] // Expired when some callback returns false.
});
```


## Documentation 📖

Description of all classes and methods with **examples** will found in the [documentation](https://doc.deno.land/https://deno.land/x/allo_caching/mod.ts).

---

Check out other [ours packages 📦](https://deno.land/x?query=allo_)!