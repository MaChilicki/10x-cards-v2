/* eslint-disable no-console */
const isTestEnvironment = process.env.NODE_ENV === "test";

export const logger = {
  info: (message: string) => !isTestEnvironment && console.log(`[INFO] ${message}`),
  error: (message: string, error?: unknown) => !isTestEnvironment && console.error(`[ERROR] ${message}`, error),
  debug: (message: string) => !isTestEnvironment && console.log(`[DEBUG] ${message}`),
  warn: (message: string) => !isTestEnvironment && console.warn(`[WARN] ${message}`),
};
