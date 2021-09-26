import { ConsoleUtil } from "aws-organization-formation/dist/src/util/console-util";
import * as AWS from "aws-sdk";

export const ensureRunningInManagementAccount = async (): Promise<boolean> => {
  const orgs = new AWS.Organizations({ region: "us-east-1" });
  const sts = new AWS.STS();

  const me = await sts.getCallerIdentity().promise();
  const organization = await orgs.describeOrganization().promise();

  if (!me.Account) {
    ConsoleUtil.LogError("unable to get the current account id from STS");
    return false;
  }

  if (
    !organization.Organization ||
    !organization.Organization.MasterAccountId
  ) {
    ConsoleUtil.LogError(
      "unable to get the management account id from Organizations"
    );
    return false;
  }

  return me.Account === organization.Organization.MasterAccountId;
};
