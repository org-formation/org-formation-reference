import { InitPipelineCommand } from "aws-organization-formation/dist/src/commands/init-organization-pipeline";
import { ConsoleUtil } from "aws-organization-formation/dist/src/util/console-util";

export const performBootstrap = async (
  buildAccountId: string
): Promise<boolean> => {
  try {
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
      buildProcessRoleName: "OrganizationFormationBuildAccessRole",
      delegateToBuildAccount: true,
      region: undefined as unknown as string,
    });
    return true;
  } catch (err) {
    ConsoleUtil.LogError("error running init", err);
    return false;
  }
};
