export type CachePersistence = 'local' | 'session'

export interface CacheOptions {
  namespace: string
  ttl: number
  persist?: CachePersistence
  maxEntries?: number
}

export interface CacheEntry<T> {
  value: T
  timestamp: number
}

const isBrowser = typeof window !== 'undefined'

export class CacheStore<T> {
  private readonly memory = new Map<string, CacheEntry<T>>()
  private readonly prefix: string
  private readonly ttl: number
  private readonly maxEntries?: number
  private storage: Storage | null = null

  constructor(options: CacheOptions) {
    this.prefix = `aura-cache::${options.namespace}::`
    this.ttl = options.ttl
    this.maxEntries = options.maxEntries

    if (isBrowser && options.persist) {
      this.storage = options.persist === 'session' ? window.sessionStorage : window.localStorage
      window.addEventListener('storage', this.handleStorageEvent)
    }
  }

  private handleStorageEvent = (event: StorageEvent) => {
    if (!event.key || !event.key.startsWith(this.prefix)) {
      return
    }

    const cacheKey = event.key.replace(this.prefix, '')
    if (!cacheKey) {
      return
    }

    if (!event.newValue) {
      this.memory.delete(cacheKey)
      return
    }

    try {
      const entry = JSON.parse(event.newValue) as CacheEntry<T>
      this.memory.set(cacheKey, entry)
    } catch (error) {
      console.warn('[CacheStore] Failed to sync storage entry', error)
    }
  }

  private buildStorageKey(id: string) {
    return `${this.prefix}${id}`
  }

  private readFromStorage(id: string): CacheEntry<T> | null {
    if (!this.storage) {
      return null
    }

    try {
      const raw = this.storage.getItem(this.buildStorageKey(id))
      if (!raw) {
        return null
      }
      return JSON.parse(raw) as CacheEntry<T>
    } catch (error) {
      console.warn('[CacheStore] Failed to read cache entry', error)
      return null
    }
  }

  private writeToStorage(id: string, entry: CacheEntry<T>) {
    if (!this.storage) {
      return
    }

    try {
      this.storage.setItem(this.buildStorageKey(id), JSON.stringify(entry))
    } catch (error) {
      console.warn('[CacheStore] Failed to persist cache entry', error)
    }
  }

  private removeFromStorage(id: string) {
    if (!this.storage) {
      return
    }

    try {
      this.storage.removeItem(this.buildStorageKey(id))
    } catch (error) {
      console.warn('[CacheStore] Failed to remove cache entry', error)
    }
  }

  private isExpired(timestamp: number) {
    return Date.now() - timestamp > this.ttl
  }

  private evictOldestEntry() {
    if (!this.maxEntries || this.memory.size <= this.maxEntries) {
      return
    }

    let oldestKey: string | null = null
    let oldestTimestamp = Infinity

    for (const [key, entry] of this.memory.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.memory.delete(oldestKey)
      this.removeFromStorage(oldestKey)
    }
  }

  private hydrateEntry(id: string): CacheEntry<T> | null {
    const entry = this.memory.get(id) ?? this.readFromStorage(id)
    if (!entry) {
      return null
    }

    if (this.isExpired(entry.timestamp)) {
      this.delete(id)
      return null
    }

    this.memory.set(id, entry)
    return entry
  }

  public getEntry(id: string): CacheEntry<T> | null {
    return this.hydrateEntry(id)
  }

  public get(id: string): T | null {
    const entry = this.hydrateEntry(id)
    return entry ? entry.value : null
  }

  public set(id: string, value: T) {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
    }

    this.memory.set(id, entry)
    this.writeToStorage(id, entry)
    this.evictOldestEntry()
  }

  public delete(id?: string) {
    if (id) {
      this.memory.delete(id)
      this.removeFromStorage(id)
      return
    }

    this.memory.clear()
    if (!this.storage) {
      return
    }

    const keysToRemove: string[] = []
    for (let index = 0; index < this.storage.length; index += 1) {
      const key = this.storage.key(index)
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => this.storage?.removeItem(key))
  }

  public getAge(id: string): number | null {
    const entry = this.hydrateEntry(id)
    if (!entry) {
      return null
    }
    return Date.now() - entry.timestamp
  }
}

