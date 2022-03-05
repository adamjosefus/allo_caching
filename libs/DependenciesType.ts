/**
 * @copyright Copyright (c) 2022 Adam Josefus
 */


export type DependenciesType = {
    // /**
    //  * Set priority of the cashed value.
    //  */
    // priority?: number;
    /**
     * Expired time in milliseconds.
     */
    expire?: number,
    /**
     * If callback return false, the cache is invalidated.
     */
    callbacks?: (() => boolean) | (() => boolean)[],
    /**
     * If files are changed, the cache is invalidated.
     */
    files?: string | string[],
    /**
     * If true, extends the validity period with each reading.
     */
    sliding?: boolean,
};
