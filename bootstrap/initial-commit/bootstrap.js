const {
  AwsOrganization,
} = require("aws-organization-formation/dist/src/aws-provider/aws-organization");
const {
  AwsOrganizationReader,
} = require("aws-organization-formation/dist/src/aws-provider/aws-organization-reader");
const {
  AwsOrganizationWriter,
} = require("aws-organization-formation/dist/src/aws-provider/aws-organization-writer");
const AWS = require("aws-sdk");
const ensureBuildAccountExists = async (rootEmail) => {
  const orgs = new AWS.Organizations({ region: "us-east-1" });
  const reader = new AwsOrganizationReader(orgs);
  const org = new AwsOrganization(reader);
  await org.initialize();
  const writer = new AwsOrganizationWriter(orgs, org);

  const accountId = await writer.createAccount({
    rootEmail,
    accountName: "Organization Formation Build",
    logicalId: "OrgFormatationBuildAccount",
  });

  return accountId;
};

const buildAccountRootEmail = process.argv[2];
ensureBuildAccountExists(buildAccountRootEmail)
  .then((x) => console.log(x))
  .catch((x) => (process.exitCode = 1));
