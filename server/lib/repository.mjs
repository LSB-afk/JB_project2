import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { createSeedDatabase, BACKEND_SCHEMA_VERSION } from "./seed.mjs";

export class JsonRepository {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.queue = Promise.resolve();
  }

  async ensure() {
    await mkdir(path.dirname(this.dbPath), { recursive: true });
    try {
      const raw = await readFile(this.dbPath, "utf8");
      if (!raw.trim()) {
        await this.write(createSeedDatabase());
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      await this.write(createSeedDatabase());
    }
  }

  async read() {
    await this.ensure();
    const raw = await readFile(this.dbPath, "utf8");
    const db = JSON.parse(raw);
    if (!db.meta || db.meta.schemaVersion !== BACKEND_SCHEMA_VERSION) {
      throw new Error(`unsupported backend schema version: ${db.meta && db.meta.schemaVersion}`);
    }
    return db;
  }

  async write(db) {
    db.meta = db.meta || {};
    db.meta.schemaVersion = BACKEND_SCHEMA_VERSION;
    db.meta.updatedAt = new Date().toISOString();
    await mkdir(path.dirname(this.dbPath), { recursive: true });
    const tmpPath = `${this.dbPath}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tmpPath, `${JSON.stringify(db, null, 2)}\n`, "utf8");
    await rename(tmpPath, this.dbPath);
  }

  async mutate(mutator) {
    const run = async () => {
      const db = await this.read();
      const result = await mutator(db);
      await this.write(db);
      return result;
    };
    this.queue = this.queue.then(run, run);
    return this.queue;
  }

  async reset() {
    const db = createSeedDatabase();
    await this.write(db);
    return db;
  }

  describe() {
    return {
      driver: "json",
      dbPath: this.dbPath,
    };
  }
}

export function nextId(db, counterKey, prefix) {
  db.counters = db.counters || {};
  db.counters[counterKey] = Number(db.counters[counterKey] || 0) + 1;
  return `${prefix}-${String(db.counters[counterKey]).padStart(4, "0")}`;
}

export function publicCase(row) {
  if (!row) return null;
  return { ...row };
}

export function publicRole(row) {
  if (!row) return null;
  return { ...row };
}

export function caseCounts(cases) {
  return {
    total: cases.length,
    critical: cases.filter((item) => item.riskLevel === "critical").length,
    high: cases.filter((item) => item.riskLevel === "high").length,
    pending: cases.filter((item) => /pending|required|review/.test(item.status || "")).length,
    ready: cases.filter((item) => item.status === "ready" || item.status === "completed").length,
  };
}
