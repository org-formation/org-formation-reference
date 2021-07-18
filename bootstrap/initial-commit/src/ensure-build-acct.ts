import { AwsOrganization } from "aws-organization-formation/dist/src/aws-provider/aws-organization";
import { AwsOrganizationReader } from "aws-organization-formation/dist/src/aws-provider/aws-organization-reader";
import { AwsOrganizationWriter } from "aws-organization-formation/dist/src/aws-provider/aws-organization-writer";
import { ConsoleUtil } from "aws-organization-formation/dist/src/util/console-util";
import * as AWS from "aws-sdk";

export const ensureBuildAccountExists = async (
  rootEmail: string,
  accountName: string
): Promise<string> => {
  const orgs = new AWS.Organizations({ region: "us-east-1" });
  const reader = new AwsOrganizationReader(orgs);
  const org = new AwsOrganization(reader);
  await org.initialize();
  ConsoleUtil.LogDebug("initialization done");
  const writer = new AwsOrganizationWriter(orgs, org);

  const accountId = await writer.createAccount({
    rootEmail,
    accountName,
    logicalId: "OrgFormatationBuildAccount",
  } as any);

  return accountId;
};
