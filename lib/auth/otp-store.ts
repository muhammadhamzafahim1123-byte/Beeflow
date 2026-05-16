import crypto from "node:crypto";
import pg from "pg";

const { Pool } = pg;

export type OtpRecord = {
  id: string;
  email: string;
  name: string;
  hashedCode: string;
  expiresAt: Date;
  attempts: number;
  usedAt: Date | null;
  createdAt: Date;
};

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  hasWorkspace: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type CreateOtpInput = {
  email: string;
  name: string;
  hashedCode: string;
  expiresAt: Date;
};

type CreateSessionInput = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

type Store = {
  createOtp(input: CreateOtpInput): Promise<void>;
  findLatestActiveOtp(email: string): Promise<OtpRecord | null>;
  incrementAttempts(id: string): Promise<void>;
  markOtpUsed(id: string): Promise<void>;
  upsertUser(input: { email: string; name: string }): Promise<UserRecord>;
  createSession(input: CreateSessionInput): Promise<void>;
  checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult>;
  checkCooldown(key: string, cooldownSeconds: number): Promise<RateLimitResult>;
};

export function hasPersistentOtpStore(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

declare global {
  // eslint-disable-next-line no-var
  var beeflowMemoryStore: MemoryStore | undefined;
  // eslint-disable-next-line no-var
  var beeflowPgPool: pg.Pool | undefined;
  // eslint-disable-next-line no-var
  var beeflowPgReady: Promise<void> | undefined;
}

class MemoryStore implements Store {
  otps = new Map<string, OtpRecord>();
  users = new Map<string, UserRecord>();
  sessions = new Map<string, CreateSessionInput>();
  rateLimits = new Map<string, { count: number; resetAt: number }>();
  cooldowns = new Map<string, number>();

  async createOtp(input: CreateOtpInput): Promise<void> {
    const id = crypto.randomUUID();
    const now = new Date();
    this.otps.set(id, { id, ...input, attempts: 0, usedAt: null, createdAt: now });
  }

  async findLatestActiveOtp(email: string): Promise<OtpRecord | null> {
    const now = Date.now();
    return [...this.otps.values()]
      .filter((otp) => otp.email === email && !otp.usedAt && otp.expiresAt.getTime() > now)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] || null;
  }

  async incrementAttempts(id: string): Promise<void> {
    const otp = this.otps.get(id);
    if (otp) otp.attempts += 1;
  }

  async markOtpUsed(id: string): Promise<void> {
    const otp = this.otps.get(id);
    if (otp) otp.usedAt = new Date();
  }

  async upsertUser(input: { email: string; name: string }): Promise<UserRecord> {
    const existing = this.users.get(input.email);
    const now = new Date();
    if (existing) {
      existing.name = input.name;
      existing.updatedAt = now;
      return existing;
    }

    const user = { id: crypto.randomUUID(), email: input.email, name: input.name, hasWorkspace: false, createdAt: now, updatedAt: now };
    this.users.set(input.email, user);
    return user;
  }

  async createSession(input: CreateSessionInput): Promise<void> {
    this.sessions.set(input.tokenHash, input);
  }

  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    const now = Date.now();
    const current = this.rateLimits.get(key);
    if (!current || current.resetAt < now) {
      this.rateLimits.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
      return { allowed: true };
    }

    if (current.count >= limit) {
      return { allowed: false, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
    }

    current.count += 1;
    return { allowed: true };
  }

  async checkCooldown(key: string, cooldownSeconds: number): Promise<RateLimitResult> {
    const now = Date.now();
    const until = this.cooldowns.get(key) || 0;
    if (until > now) {
      return { allowed: false, retryAfterSeconds: Math.ceil((until - now) / 1000) };
    }

    this.cooldowns.set(key, now + cooldownSeconds * 1000);
    return { allowed: true };
  }
}

class PostgresStore implements Store {
  private pool: pg.Pool;

  constructor() {
    if (!globalThis.beeflowPgPool) {
      globalThis.beeflowPgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    }
    this.pool = globalThis.beeflowPgPool;
  }

  private async ready(): Promise<void> {
    if (!globalThis.beeflowPgReady) {
      globalThis.beeflowPgReady = this.pool.query(`
        create table if not exists auth_otps (
          id uuid primary key,
          email text not null,
          name text not null,
          hashed_code text not null,
          expires_at timestamptz not null,
          attempts integer not null default 0,
          used_at timestamptz,
          created_at timestamptz not null
        );
        create index if not exists auth_otps_email_created_idx on auth_otps(email, created_at desc);
        create table if not exists auth_users (
          id uuid primary key,
          email text unique not null,
          name text not null,
          has_workspace boolean not null default false,
          created_at timestamptz not null,
          updated_at timestamptz not null
        );
        create table if not exists auth_sessions (
          token_hash text primary key,
          user_id uuid not null,
          expires_at timestamptz not null,
          created_at timestamptz not null
        );
        create table if not exists auth_rate_limits (
          key text primary key,
          count integer not null,
          reset_at timestamptz not null
        );
        create table if not exists auth_cooldowns (
          key text primary key,
          until_at timestamptz not null
        );
      `).then(() => undefined);
    }
    await globalThis.beeflowPgReady;
  }

  async createOtp(input: CreateOtpInput): Promise<void> {
    await this.ready();
    await this.pool.query(
      `insert into auth_otps (id, email, name, hashed_code, expires_at, attempts, used_at, created_at)
       values ($1, $2, $3, $4, $5, 0, null, now())`,
      [crypto.randomUUID(), input.email, input.name, input.hashedCode, input.expiresAt]
    );
  }

  async findLatestActiveOtp(email: string): Promise<OtpRecord | null> {
    await this.ready();
    const result = await this.pool.query(
      `select id, email, name, hashed_code, expires_at, attempts, used_at, created_at
       from auth_otps
       where email = $1 and used_at is null and expires_at > now()
       order by created_at desc
       limit 1`,
      [email]
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      hashedCode: row.hashed_code,
      expiresAt: row.expires_at,
      attempts: row.attempts,
      usedAt: row.used_at,
      createdAt: row.created_at
    };
  }

  async incrementAttempts(id: string): Promise<void> {
    await this.ready();
    await this.pool.query("update auth_otps set attempts = attempts + 1 where id = $1", [id]);
  }

  async markOtpUsed(id: string): Promise<void> {
    await this.ready();
    await this.pool.query("update auth_otps set used_at = now() where id = $1", [id]);
  }

  async upsertUser(input: { email: string; name: string }): Promise<UserRecord> {
    await this.ready();
    const result = await this.pool.query(
      `insert into auth_users (id, email, name, has_workspace, created_at, updated_at)
       values ($1, $2, $3, false, now(), now())
       on conflict (email)
       do update set name = excluded.name, updated_at = now()
       returning id, email, name, has_workspace, created_at, updated_at`,
      [crypto.randomUUID(), input.email, input.name]
    );
    const row = result.rows[0];
    return { id: row.id, email: row.email, name: row.name, hasWorkspace: row.has_workspace, createdAt: row.created_at, updatedAt: row.updated_at };
  }

  async createSession(input: CreateSessionInput): Promise<void> {
    await this.ready();
    await this.pool.query(
      `insert into auth_sessions (token_hash, user_id, expires_at, created_at) values ($1, $2, $3, now())`,
      [input.tokenHash, input.userId, input.expiresAt]
    );
  }

  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    await this.ready();
    const now = new Date();
    const resetAt = new Date(Date.now() + windowSeconds * 1000);
    const result = await this.pool.query("select count, reset_at from auth_rate_limits where key = $1", [key]);
    const row = result.rows[0];
    if (!row || row.reset_at < now) {
      await this.pool.query(
        `insert into auth_rate_limits (key, count, reset_at) values ($1, 1, $2)
         on conflict (key) do update set count = 1, reset_at = excluded.reset_at`,
        [key, resetAt]
      );
      return { allowed: true };
    }
    if (row.count >= limit) {
      return { allowed: false, retryAfterSeconds: Math.ceil((row.reset_at.getTime() - Date.now()) / 1000) };
    }
    await this.pool.query("update auth_rate_limits set count = count + 1 where key = $1", [key]);
    return { allowed: true };
  }

  async checkCooldown(key: string, cooldownSeconds: number): Promise<RateLimitResult> {
    await this.ready();
    const now = new Date();
    const result = await this.pool.query("select until_at from auth_cooldowns where key = $1", [key]);
    const until = result.rows[0]?.until_at as Date | undefined;
    if (until && until > now) {
      return { allowed: false, retryAfterSeconds: Math.ceil((until.getTime() - Date.now()) / 1000) };
    }
    await this.pool.query(
      `insert into auth_cooldowns (key, until_at) values ($1, $2)
       on conflict (key) do update set until_at = excluded.until_at`,
      [key, new Date(Date.now() + cooldownSeconds * 1000)]
    );
    return { allowed: true };
  }
}

function createStore(): Store {
  if (process.env.DATABASE_URL) return new PostgresStore();
  if (!globalThis.beeflowMemoryStore) globalThis.beeflowMemoryStore = new MemoryStore();
  return globalThis.beeflowMemoryStore;
}

export const otpStore = createStore();
