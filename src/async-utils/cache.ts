import { statSync } from "node:fs";
import { resolve } from "node:path";


export type CacheKeyPart = boolean | number | string | undefined;

export interface CacheOptions {
  // keys of other entries the value is derived from. The value becomes stale when one of them changes or disappears.
  dependencies?: readonly string[];
  // files the value is derived from, optionally with the modification time they had when they were read. The value becomes stale when one of them changes.
  files?: readonly string[] | Readonly<Record<string, number>>;
  // how much of the capacity the entry uses, defaults to 1. Large values like the Tailwind CSS context use more.
  weight?: number;
}

interface Snapshot {
  dependencies: readonly { key: string; version: number; }[];
  files: readonly { modified: number; path: string; }[];
  weight: number;
}

interface Entry extends Snapshot {
  // whether other entries depend on this entry, only then can removing it make other entries stale
  isDependency: boolean;
  key: string;
  // neighbors in the list from the least to the most recently used entry
  newer: Entry | undefined;
  older: Entry | undefined;
  validatedAt: number;
  value: unknown;
  version: number;
}

// modification time recorded for files that do not exist, so that their creation is detected.
export const MISSING_FILE = -1;

const CAPACITY = 20_000;
const MAX_DEPENDENCY_DEPTH = 8;

// most entries depend on nothing or only on the tailwind context, sharing the empty list saves an allocation per entry
const NONE: readonly never[] = Object.freeze([]);

// joins key parts with a separator that can not appear in class names or paths.
export function cacheKey(...parts: CacheKeyPart[]): string {
  // join converts undefined to an empty string
  return parts.join("\0");
}

// a least recently used cache whose entries can depend on files and on other entries.
// - The least recently used entries are evicted when the summed weight of all entries exceeds the capacity.
// - An entry is valid while the files it depends on keep their modification time and the entries it depends on keep their version.
// - Files are only checked once between two calls to `refresh()`.
// - Writing a value that is identical (`Object.is`) to the cached one keeps the version, so entries derived from it stay valid.
export class Cache {

  private readonly entries = new Map<string, Entry>();
  private readonly modifiedTimes = new Map<string, number>();

  // a linked list instead of reinserting map entries, so that using and evicting an entry does not depend on the size of the cache
  private newest: Entry | undefined;
  private oldest: Entry | undefined;

  // the version of the next written value
  private clock = 0;

  // advances with every change that can turn a valid entry stale, a validation stays valid until then
  private generation = 0;

  // the summed weight of all entries
  private weight = 0;

  constructor(private readonly capacity: number = CAPACITY) {}

  get<Value>(key: string): Value | undefined {
    return this.lookup(key)?.value as Value | undefined;
  }

  has(key: string): boolean {
    return this.lookup(key) !== undefined;
  }

  version(key: string): number | undefined {
    return this.lookup(key)?.version;
  }

  getOrCreate<Value>(key: string, create: () => Value, options?: CacheOptions): Value {
    const entry = this.lookup(key);

    if(entry){
      return entry.value as Value;
    }

    // taken before the value is created, so that changes during its creation make it stale
    const snapshot = this.snapshot(options);
    const value = create();

    this.store(key, value, snapshot);

    return value;
  }

  set(key: string, value: unknown, options?: CacheOptions): void {
    this.store(key, value, this.snapshot(options));
  }

  delete(key: string): boolean {
    const entry = this.entries.get(key);

    if(entry){
      this.remove(entry);
    }

    return !!entry;
  }

  // checks the files of all entries again on their next access.
  refresh(): void {
    this.modifiedTimes.clear();
    this.generation++;
  }

  clear(): void {
    this.entries.clear();
    this.newest = undefined;
    this.oldest = undefined;
    this.weight = 0;
    this.refresh();
  }

  // the modification time of a file, read at most once between two calls to `refresh()`.
  modified(path: string): number {
    let modified = this.modifiedTimes.get(path);

    if(modified === undefined){
      modified = readModifiedTime(path);
      this.modifiedTimes.set(path, modified);
    }

    return modified;
  }

  get size(): number {
    return this.entries.size;
  }

  private lookup(key: string): Entry | undefined {
    const entry = this.entries.get(key);

    if(!entry){
      return;
    }

    if(!this.isValid(entry, 0)){
      this.remove(entry);
      return;
    }

    if(entry !== this.newest){
      this.unlink(entry);
      this.link(entry);
    }

    return entry;
  }

  private isValid(entry: Entry, depth: number): boolean {
    if(entry.validatedAt === this.generation){
      return true;
    }

    for(const file of entry.files){
      if(this.modified(file.path) !== file.modified){
        return false;
      }
    }

    for(const dependency of entry.dependencies){
      const target = this.entries.get(dependency.key);

      const isCurrent = target?.version === dependency.version && depth < MAX_DEPENDENCY_DEPTH && this.isValid(target, depth + 1);

      if(!isCurrent){
        return false;
      }
    }

    entry.validatedAt = this.generation;

    return true;
  }

  private snapshot({ dependencies = NONE, files = NONE, weight = 1 }: CacheOptions = {}): Snapshot | undefined {
    const fileSnapshot = Array.isArray(files)
      ? files.map(file => {
        const path = resolve(file);
        return { modified: this.modified(path), path };
      })
      : Object.entries(files).map(([path, modified]) => ({ modified, path: resolve(path) }));

    // allocated with the exact length, pushing to an empty array reserves space for more elements
    const dependencySnapshot = new Array<Snapshot["dependencies"][number]>(dependencies.length);

    for(let index = 0; index < dependencies.length; index++){
      const key = dependencies[index];
      const version = this.version(key);

      // the value would be stale right away
      if(version === undefined){
        return;
      }

      dependencySnapshot[index] = { key, version };
      this.entries.get(key)!.isDependency = true;
    }

    return {
      dependencies: dependencySnapshot.length > 0 ? dependencySnapshot : NONE,
      files: fileSnapshot.length > 0 ? fileSnapshot : NONE,
      weight
    };
  }

  private store(key: string, value: unknown, snapshot: Snapshot | undefined): void {
    if(!snapshot){
      return;
    }

    const previous = this.entries.get(key);

    // an unchanged value keeps its version, so entries that were derived from it stay valid
    const version = previous && Object.is(previous.value, value)
      ? previous.version
      : ++this.clock;

    if(previous){
      // entries derived from the previous value stay valid if the version is kept
      this.remove(previous, previous.version !== version);
    }

    const entry: Entry = {
      ...snapshot,
      isDependency: previous?.isDependency ?? false,
      key,
      newer: undefined,
      older: undefined,
      validatedAt: -1,
      value,
      version
    };

    this.entries.set(key, entry);
    this.link(entry);
    this.weight += snapshot.weight;

    // the entry that was just written is never evicted, even if it exceeds the capacity on its own
    while(this.weight > this.capacity && this.oldest && this.oldest !== entry){
      this.remove(this.oldest);
    }
  }

  // entries that depend on a removed entry become stale, remembered validations have to be repeated
  private remove(entry: Entry, invalidatesDependents: boolean = entry.isDependency): void {
    this.entries.delete(entry.key);
    this.unlink(entry);
    this.weight -= entry.weight;

    if(invalidatesDependents){
      this.generation++;
    }
  }

  // appends the entry as the most recently used one
  private link(entry: Entry): void {
    entry.older = this.newest;
    entry.newer = undefined;

    if(this.newest){
      this.newest.newer = entry;
    } else {
      this.oldest = entry;
    }

    this.newest = entry;
  }

  private unlink(entry: Entry): void {
    if(entry.older){
      entry.older.newer = entry.newer;
    } else {
      this.oldest = entry.newer;
    }

    if(entry.newer){
      entry.newer.older = entry.older;
    } else {
      this.newest = entry.older;
    }

    entry.newer = undefined;
    entry.older = undefined;
  }

}

function readModifiedTime(path: string): number {
  try {
    return statSync(path, { throwIfNoEntry: false })?.mtimeMs ?? MISSING_FILE;
  } catch {
    return MISSING_FILE;
  }
}

// the cache of the current thread. The ESLint thread and the Tailwind CSS worker each have their own instance.
export const cache = new Cache();
