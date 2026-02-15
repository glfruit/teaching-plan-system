import { describe } from 'bun:test';

type EnvLike = Record<string, string | undefined>;

export const isDatabaseTestEnabled = (env: EnvLike = process.env): boolean => {
  const databaseUrl = env.DATABASE_URL;
  return typeof databaseUrl === 'string' && databaseUrl.trim().length > 0;
};

export const describeWithDatabase: typeof describe = isDatabaseTestEnabled()
  ? describe
  : describe.skip;
