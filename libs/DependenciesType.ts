/**
 * @copyright Copyright (c) 2022 Adam Josefus
 */


export type DependenciesType = {
    /**
     * Set priority of the cashed value.
     */
    priority?: number;
    /**
     * Expired time in milliseconds.
     */
    expire?: number,
    /**
     * If true, extends the validity period with each reading.
     */
    sliding?: boolean,
    /**
     * If files are changed, the cache is invalidated.
     */
    files?: string | string[],
    /**
     * If callback return false, the cache is invalidated.
     */
    callbacks?: (() => boolean) | (() => boolean)[],
};
