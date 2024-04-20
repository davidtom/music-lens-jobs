import * as functions from "firebase-functions";
import axios, { AxiosError } from "axios";
import { z } from "zod";

const Config = z.object({
  origin: z.string(),
  api_secret: z.string(),
});

type User = {
  id: string;
};

let functionsConfig = functions.config().api;
if (Object.keys(functionsConfig || {}).length === 0) {
  functionsConfig = undefined;
}

const parsedConfig = Config.safeParse(functionsConfig || process.env);
if (!parsedConfig.success) {
  throw parsedConfig.error;
}

const { data: config } = parsedConfig;
const { origin, api_secret } = config;

const client = axios.create({
  baseURL: origin,
  headers: {
    Authorization: `Bearer ${api_secret}`,
  },
});

export const run = async (): Promise<void> => {
  // Get user ids json array
  const { data: users } = await client.get<User[]>("/api/sync/users/");

  // Hit each sync recently-played user endpoint individually; Try/catch each call so a failure
  // in one user doesnt block the rest
  for (const user of users) {
    try {
      const { data: syncResult } = await client.post(
        `/api/sync/recently-played/${user.id}`
      );

      logger.log("Sync succeeded", syncResult);
    } catch (err: any) {
      handleError(err, { userId: user.id });
    }
  }
};

/**
 * ====================
 *    Helper Methods
 * ====================
 */
const handleError = (err: any, extra?: Record<string, any>): void => {
  // TODO: this should hit a webhook ideally
  if (err instanceof AxiosError) {
    logger.error(err.message, { status: err.code, ...extra });
  } else {
    logger.error(err.message, { ...extra });
  }
};

const logger = functions.logger;

/**
 * ====================
 *         Exec
 * ====================
 */
export default functions.pubsub
  .schedule("*/10 * * * *")
  .onRun(async (): Promise<void> => {
    try {
      logger.log("Starting");
      await run();
      logger.log("Finished");
    } catch (err: any) {
      handleError(err);
    }
  });

if (!functionsConfig) {
  console.log("running as script");
  run()
    .then(() => logger.log("Success"))
    .catch(handleError);
}
