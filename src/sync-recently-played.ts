import * as functions from "firebase-functions";
import axios, { AxiosError } from "axios";
import { z } from "zod";

const Config = z.object({
  origin: z.string(),
  // TODO:
  // auth_secret: z.string(),
});

type User = {
  id: string;
};

let functionsConfig = functions.config().api;
if (Object.keys(functionsConfig || {}).length === 0) {
  functionsConfig = undefined;
}

export const run = async (): Promise<void> => {
  const parsedConfig = Config.safeParse(functionsConfig || process.env);
  if (!parsedConfig.success) {
    throw parsedConfig.error;
  }

  const { data: config } = parsedConfig;
  const { origin } = config;

  // Get user ids json array
  const { data: users } = await axios.get<User[]>(`${origin}/api/users/`);

  // Hit each sync recently-played user endpoint individually; Try/catch each call so a failure
  // in one user doesnt block the rest
  for (const user of users) {
    try {
      const { data: syncResult } = await axios(
        `${origin}/api/sync/recently-played/${user.id}`
      );

      log("Sync succeeded", syncResult);
    } catch (err: any) {
      handleError(err);
    }
  }
};

/**
 * ====================
 *    Helper Methods
 * ====================
 */
const handleError = (err: any): void => {
  // TODO: this should hit a webhook ideally
  if (err instanceof AxiosError) {
    console.error(err.message, err.code);
  } else {
    console.error(err);
  }
};

const log = (message: string, extra?: Record<any, unknown>): void => {
  console.log(JSON.stringify({ message, ...extra, time: new Date() }, null, 4));
};

/**
 * ====================
 *         Exec
 * ====================
 */
export default functions.pubsub
  .schedule("*/15 * * * *")
  .onRun(async (): Promise<void> => {
    try {
      log("Starting");
      await run();
      log("Finished");
    } catch (err: any) {
      handleError(err);
    }
  });

if (!functionsConfig) {
  console.log("running as script");
  run()
    .then(() => log("Success"))
    .catch(handleError);
}
