import { InitPipelineCommand } from "aws-organization-formation/dist/src/commands/init-organization-pipeline";
import { ConsoleUtil } from "aws-organization-formation/dist/src/util/console-util";

export const performBootstrap = async (
  buildAccountId: string,
  crossAccountRoleName: string
): Promise<boolean> => {
  try {
    return performAndRetryIfNeeded(async () => {
      const command = new InitPipelineCommand(undefined as any);
      await command.performCommand({
        buildAccountId,
        crossAccountRoleName: "OrganizationAccountAccessRole",
        roleStackName: "organization-formation-role",
        stackName: "organization-formation-build",
        resourcePrefix: "organization-formation",
        repositoryName: "organization-formation",
        stateObject: "state.json",
        stateBucketName: "organization-formation-${AWS::AccountId}",
        buildProcessRoleName: crossAccountRoleName,
        delegateToBuildAccount: true,
        region: undefined as unknown as string,
      });
      return true;
    });
  } catch (err) {
    ConsoleUtil.LogError("error running init", err as Error);
    return false;
  }
};

export const performAndRetryIfNeeded = async <T extends unknown>(
  fn: () => Promise<T>
): Promise<T> => {
  let shouldRetry = false;
  let retryCount = 0;
  do {
    shouldRetry = false;
    try {
      return await fn();
    } catch (err) {
      if (retryCount < 3) {
        retryCount = retryCount + 1;
        shouldRetry = true;
        const wait = Math.pow(retryCount, 2) + Math.random();
        ConsoleUtil.LogDebug(
          `retrying ${err}. wait ${wait} and retry-count ${retryCount}`
        );
        await sleep(wait * 2000);
        continue;
      }
      throw err;
    }
  } while (shouldRetry);
  throw Error();
};

export const sleep = (time: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, time));
};
