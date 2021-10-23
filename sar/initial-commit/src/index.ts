import { ConsoleUtil } from "aws-organization-formation/dist/src/util/console-util";
import { ensureAccountExists, ensureOuExists } from "./ensure";
import { ensureRunningInManagementAccount } from "./ensure-running-mgmt-acct";
import { performBootstrap } from "./perform-bootstrap";
ConsoleUtil.verbose = false;
process.env.X_ACCT_ROLE_NAME = "OrganizationAccountAccessRole";
process.env.LOGARCHIVE_ACCT_ROOTEMAIL =
  "ccount+log-archive@olafconijn.awsapps.com";
process.env.BUILD_ACCT_ROOTEMAIL = "ccount+a@olafconijn.awsapps.com";
process.env.TEMPLATE_PACKAGE_URL =
  "https://org-formation-reference.s3.amazonaws.com/org-formation-reference.zip";
process.env.SECURITY_ACCT_ROOTEMAIL = "ccount+security@olafconijn.awsapps.com";

const bootstrap = async () => {
  ConsoleUtil.LogInfo(
    "Hi there! this process will set up org-formation within your organization. i'm excited. "
  );

  const templatePackageUrl = process.env["TEMPLATE_PACKAGE_URL"];
  const buildAcctRootEmail = process.env["BUILD_ACCT_ROOTEMAIL"];
  const buildAcctName = process.env["BUILD_ACCT_NAME"]
    ? process.env["BUILD_ACCT_NAME"]
    : "Organization Build Account";

  const securityAcctRootEmail = process.env["SECURITY_ACCT_ROOTEMAIL"];
  const securityAcctName = process.env["SECURITY_ACCT_NAME"]
    ? process.env["SECURITY_ACCT_NAME"]
    : "Security Account";

  const logArchiveAcctRootEmail = process.env["LOGARCHIVE_ACCT_ROOTEMAIL"];
  const logArchiveAcctName = process.env["LOGARCHIVE_ACCT_NAME"]
    ? process.env["LOGARCHIVE_ACCT_NAME"]
    : "Log Archive Account";

  const crossAccountRoleName = process.env["X_ACCT_ROLE_NAME"]
    ? process.env["X_ACCT_ROLE_NAME"]
    : "OrganizationAccountAccessRole";

  const logicalNameToIdMap: Record<string, string> = {};
  const logicalNameToRootEmailMap: Record<string, string> = {};

  ConsoleUtil.LogInfo(
    `The following parameters have been passed: BUILD_ACCT_ROOTEMAIL = ${buildAcctRootEmail}, LOGARCHIVE_ACCT_ROOTEMAIL = ${logArchiveAcctRootEmail}, SECURITY_ACCT_ROOTEMAIL = ${securityAcctRootEmail}.`
  );

  if (!buildAcctRootEmail) {
    ConsoleUtil.LogError("parameter BUILD_ACCT_ROOTEMAIL is missing. ");
    process.exitCode = 1;
    return;
  }

  if (!securityAcctRootEmail) {
    ConsoleUtil.LogError("parameter SECURITY_ACCT_ROOTEMAIL is missing. ");
    process.exitCode = 1;
    return;
  }

  if (!logArchiveAcctRootEmail) {
    ConsoleUtil.LogError("parameter LOGARCHIVE_ACCT_ROOTEMAIL is missing. ");
    process.exitCode = 1;
    return;
  }

  ConsoleUtil.LogInfo(
    "Step 1: check whether you are running the organization management account..."
  );
  const runningInManagement = await ensureRunningInManagementAccount();
  if (!runningInManagement) {
    ConsoleUtil.LogError(
      "not running in the organization management account. "
    );
    process.exitCode = 1;
    return;
  }
  ConsoleUtil.LogInfo(
    "Step 2: We will now check whether the build account already exists and if not we will create it..."
  );

  const buildAccountId = await ensureAccountExists(
    buildAcctRootEmail,
    buildAcctName,
    crossAccountRoleName,
    "OrgBuildAccount"
  );

  if (!buildAccountId) {
    ConsoleUtil.LogError("unable to get or create build account details. ");
    process.exitCode = 1;
    return;
  }
  logicalNameToIdMap["OrgBuildAccount"] = buildAccountId;
  logicalNameToRootEmailMap["OrgBuildAccount"] = buildAcctRootEmail;

  ConsoleUtil.LogInfo(
    `- AWS account id of the build account: ${buildAccountId}`
  );

  const securityAccountId = await ensureAccountExists(
    securityAcctRootEmail,
    securityAcctName,
    crossAccountRoleName,
    "SecurityAccount"
  );

  if (!securityAccountId) {
    ConsoleUtil.LogError("unable to get or create security account details. ");
    process.exitCode = 1;
    return;
  }
  logicalNameToIdMap["SecurityAccount"] = securityAccountId;
  logicalNameToRootEmailMap["SecurityAccount"] = securityAcctRootEmail;

  ConsoleUtil.LogInfo(
    `- AWS account id of the security account: ${securityAccountId}`
  );

  const logArchiveAccountId = await ensureAccountExists(
    logArchiveAcctRootEmail,
    logArchiveAcctName,
    crossAccountRoleName,
    "LogArchiveAccount"
  );

  if (!logArchiveAccountId) {
    ConsoleUtil.LogError(
      "unable to get or create log archive account details. "
    );
    process.exitCode = 1;
    return;
  }
  logicalNameToIdMap["LogArchiveAccount"] = logArchiveAccountId;
  logicalNameToRootEmailMap["LogArchiveAccount"] = logArchiveAcctRootEmail;

  ConsoleUtil.LogInfo(
    `- AWS account id of the log archive account: ${logArchiveAccountId}`
  );

  logicalNameToIdMap["SuspendedOu"] = await ensureOuExists(
    "suspended",
    "SuspendedOu"
  );
  ConsoleUtil.LogInfo(`- AWS OU suspended exists`);
  logicalNameToIdMap["SharedOu"] = await ensureOuExists("shared", "SharedOu");
  ConsoleUtil.LogInfo(`- AWS OU shared exists`);
  logicalNameToIdMap["SdlcOu"] = await ensureOuExists("sdlc", "SdlcOu");
  ConsoleUtil.LogInfo(`- AWS OU sdlc exists`);
  logicalNameToIdMap["ProdOu"] = await ensureOuExists("prod", "ProdOu");
  ConsoleUtil.LogInfo(`- AWS OU prod exists`);

  ConsoleUtil.LogInfo("Step 3: initializing org-formation ...");

  const packageParameters: Record<string, string> = {
    EmailForBudgetAlarms:
      process.env["EMAIL_FOR_BUDGET_ALARMS"] ?? "someone@your-org.com",
    PrimaryAwsRegion: process.env["PRIMARY_REGION"] ?? "us-east-1",
    ResourcePrefix: process.env["RESOURCE_PREFIX"] ?? "orgformation",
    StateBucketName: "organization-formation-" + buildAccountId,
    ManagementAcctId: process.env["MGMT_ACCT_ID"] as string,
  };

  const initSucceeded = await performBootstrap(
    buildAccountId,
    crossAccountRoleName,
    templatePackageUrl,
    logicalNameToIdMap,
    logicalNameToRootEmailMap,
    packageParameters
  );

  if (!initSucceeded) {
    process.exitCode = 1;
    return;
  }

  ConsoleUtil.LogInfo("done!");
  ConsoleUtil.LogInfo(
    "org-formation and this reference architecture seems have have successfully installed."
  );
  ConsoleUtil.LogInfo(
    `best to head over to account ${buildAccountId} (using role ${crossAccountRoleName}) to check out the CodeCommit repository.`
  );
};

bootstrap().catch((x) => {
  console.error(x);
  process.exitCode = 1;
});
