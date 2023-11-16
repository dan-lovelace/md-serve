import { NextFunction, Request, Response } from "express";

interface ICacheStore {
  data: TCacheData;
  get(key: string): TCacheItem | undefined;
  set(key: string, value: string): TCacheItem;
}

type TCacheData = Record<string, TCacheItem>;
type TCacheItem = { expires: number; value: string };

const CACHE_LENGTH_MS = 5 * 60 * 1000; // 5 minutes

class CacheStore implements ICacheStore {
  data: TCacheData = {};

  get(key: string) {
    const cachedItem = this.data[key];

    if (cachedItem && new Date().getTime() < cachedItem.expires) {
      return cachedItem;
    }

    return undefined;
  }

  set(key: string, value: string) {
    this.data[key] = {
      expires: new Date().getTime() + CACHE_LENGTH_MS,
      value,
    };

    return this.data[key];
  }
}

/**
 * The global cache store.
 */
export const cacheStore = new CacheStore();

/**
 * Express middleware for caching a route's response.
 * @returns An Express middleware function.
 */
export function cacheRoute() {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = getCacheKey(req);
    const cachedData = cacheStore.get(key);

    if (cachedData) {
      return res.send(cachedData.value);
    }

    next();
  };
}

/**
 * Gets a cache key from a request.
 * @param req The request object.
 * @returns A key to use when storing something in the cache store.
 */
export function getCacheKey(req: Request) {
  return `__express__${req.originalUrl || req.url}`;
}
