import type { DB } from "./db/client";

export type AppBindings = {
  DATABASE_URL: string;
};

export type AppVariables = {
  db: DB;
};

export type AppEnv = {
  Bindings: AppBindings;
  Variables: AppVariables;
};
