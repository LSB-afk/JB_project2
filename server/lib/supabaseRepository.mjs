import { BACKEND_SCHEMA_VERSION, createSeedDatabase } from "./seed.mjs";

function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function encodeFilterValue(value) {
  return encodeURIComponent(String(value));
}

function maskUrl(value) {
  const url = trimTrailingSlash(value);
  return url || null;
}

export class SupabaseRepository {
  constructor(options = {}) {
    this.url = trimTrailingSlash(options.url);
    this.key = options.key || "";
    this.table = options.table || "jb_backend_state";
    this.stateId = options.stateId || "localguard";
    this.queue = Promise.resolve();
  }

  describe() {
    return {
      driver: "supabase",
      url: maskUrl(this.url),
      table: this.table,
      stateId: this.stateId,
    };
  }

  assertConfigured() {
    if (!this.url) {
      throw new Error("SUPABASE_URL is required when JB_DB_DRIVER=supabase");
    }
    if (!this.key) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY is required when JB_DB_DRIVER=supabase");
    }
  }

  endpoint(search = "") {
    const suffix = search ? `?${search}` : "";
    return `${this.url}/rest/v1/${encodeURIComponent(this.table)}${suffix}`;
  }

  headers(extra = {}) {
    return {
      apikey: this.key,
      authorization: `Bearer ${this.key}`,
      accept: "application/json",
      "content-type": "application/json",
      ...extra,
    };
  }

  async request(method, search, body = undefined, extraHeaders = {}) {
    this.assertConfigured();
    const response = await fetch(this.endpoint(search), {
      method,
      headers: this.headers(extraHeaders),
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    let parsed;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = { raw: text };
    }
    if (!response.ok) {
      const detail = parsed?.message || parsed?.error || text || response.statusText;
      const error = new Error(`supabase ${method} ${this.table} failed: ${detail}`);
      error.statusCode = response.status >= 400 && response.status < 500 ? 400 : 500;
      error.supabaseStatus = response.status;
      throw error;
    }
    return parsed;
  }

  async fetchPayload() {
    const rows = await this.request(
      "GET",
      `id=eq.${encodeFilterValue(this.stateId)}&select=payload`,
    );
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows[0]?.payload || null;
  }

  async ensure() {
    const payload = await this.fetchPayload();
    if (!payload) {
      await this.write(createSeedDatabase());
    }
  }

  async read() {
    await this.ensure();
    const db = await this.fetchPayload();
    if (!db) {
      throw new Error("supabase state row was not created");
    }
    if (!db.meta || db.meta.schemaVersion !== BACKEND_SCHEMA_VERSION) {
      throw new Error(`unsupported backend schema version: ${db.meta && db.meta.schemaVersion}`);
    }
    return db;
  }

  async write(db) {
    db.meta = db.meta || {};
    db.meta.schemaVersion = BACKEND_SCHEMA_VERSION;
    db.meta.updatedAt = new Date().toISOString();
    await this.request(
      "POST",
      "on_conflict=id",
      { id: this.stateId, payload: db },
      { prefer: "resolution=merge-duplicates,return=minimal" },
    );
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
}
