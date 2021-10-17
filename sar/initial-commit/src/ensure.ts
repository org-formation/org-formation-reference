import { AwsOrganization } from "aws-organization-formation/dist/src/aws-provider/aws-organization";
import { AwsOrganizationReader } from "aws-organization-formation/dist/src/aws-provider/aws-organization-reader";
import { AwsOrganizationWriter } from "aws-organization-formation/dist/src/aws-provider/aws-organization-writer";
import { OrganizationalUnitResource } from "aws-organization-formation/dist/src/parser/model";
import { ConsoleUtil } from "aws-organization-formation/dist/src/util/console-util";
import * as AWS from "aws-sdk";

const orgs = new AWS.Organizations({ region: "us-east-1" });
let _org: undefined | AwsOrganization;

export const ensureInitialized = async (): Promise<AwsOrganization> => {
  if (_org) return _org;
  const reader = new AwsOrganizationReader(orgs);
  const org = new AwsOrganization(reader);
  await org.initialize();
  ConsoleUtil.LogDebug("initialization done");
  _org = org;
  return _org;
};

export const ensureAccountExists = async (
  rootEmail: string,
  accountName: string,
  crossAccountRoleName: string,
  logicalId: string
): Promise<string> => {
  const org = await ensureInitialized();
  const writer = new AwsOrganizationWriter(orgs, org);

  const accountId = await writer.createAccount({
    rootEmail,
    accountName,
    organizationAccessRoleName: crossAccountRoleName,
    logicalId,
  } as any);

  return accountId;
};

export const ensureOuExists = async (
  ouName: string,
  logicalId: string
): Promise<string> => {
  const org = await ensureInitialized();
  const writer = new AwsOrganizationWriter(orgs, org);

  const ouId = await writer.createOrganizationalUnit({
    organizationalUnitName: ouName,
    logicalId,
  } as OrganizationalUnitResource);

  return ouId;
};
