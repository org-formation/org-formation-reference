import { ConsoleUtil } from "aws-organization-formation/dist/src/util/console-util";
import { ensureBuildAccountExists } from "./ensure-build-acct";
import { ensureRunningInManagementAccount } from "./ensure-running-mgmt-acct";
import { performBootstrap } from "./perform-bootstrap";
ConsoleUtil.verbose = false;

const bootstrap = async () => {
  ConsoleUtil.LogInfo(
    "Hi there! this process will set up org-formation within your organization. i'm excited. "
  );

  const templatePackageUrl = process.env["TEMPLATE_PACKAGE_URL"];
  const buildAcctRootEmail = process.env["BUILD_ACCT_ROOTEMAIL"];
  const buildAcctName = process.env["BUILD_ACCT_NAME"]
    ? process.env["BUILD_ACCT_NAME"]
    : "Organization Build Account";

  const crossAccountRoleName = process.env["X_ACCT_ROLE_NAME"]
    ? process.env["X_ACCT_ROLE_NAME"]
    : "OrganizationAccountAccessRole";

  ConsoleUtil.LogInfo(
    `The following parameters have been passed: BUILD_ACCT_ROOTEMAIL = ${buildAcctRootEmail}.`
  );

  if (!buildAcctRootEmail) {
    ConsoleUtil.LogError("parameter BUILD_ACCT_ROOTEMAIL is missing. ");
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

  const buildAccountId = await ensureBuildAccountExists(
    buildAcctRootEmail,
    buildAcctName,
    crossAccountRoleName
  );

  if (!buildAccountId) {
    ConsoleUtil.LogError("unable to get or create build account id. ");
    process.exitCode = 1;
    return;
  }
  ConsoleUtil.LogInfo(
    `- AWS account id of the build account: ${buildAccountId}`
  );

  ConsoleUtil.LogInfo("Step 3: initializing org-formation ...");
  const initSucceeded = await performBootstrap(
    buildAccountId,
    crossAccountRoleName,
    templatePackageUrl
  );
  if (!initSucceeded) {
    process.exitCode = 1;
    return;
  }
};

bootstrap();
