import { NextFunction, Request, Response } from "express";

interface ICacheStore {
  data: TCacheData;
  get(key: string): TCacheItem | undefined;
  set(key: string, value: string): TCacheItem;
}

type TCacheData = Record<string, TCacheItem>;
type TCacheItem = { expires: number; value: string };

const defaultCacheLengthSeconds = 5 * 60 * 1000; // 5 minutes

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
      expires: new Date().getTime() + defaultCacheLengthSeconds,
      value,
    };

    return this.data[key];
  }
}

export const cacheStore = new CacheStore();

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

export function getCacheKey(req: Request) {
  return `__express__${req.originalUrl || req.url}`;
}
