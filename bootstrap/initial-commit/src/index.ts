const IInitializationParameterKeys = [
  // "FORMATION_REPO_NAME",
  // "BUILD_ACCT_ID",
  // "BOOTSTRAP_BUCKET_NAME",
  // "BUILD_ACCT_NAME",
  // "USE_BUILD_ACCT",
  // "FORMATION_RES_PREFIX",
  // "BOOTSTRAP_CLEANUP",
  "BUILD_ACCT_ROOTEMAIL",
];

import { ConsoleUtil } from "aws-organization-formation/dist/src/util/console-util";
import { ensureBuildAccountExists } from "./ensure-build-acct";
import { ensureRunningInManagementAccount } from "./ensure-running-mgmt-acct";
import { performBootstrap } from "./perform-bootstrap";
ConsoleUtil.verbose = false;

const bootstrap = async () => {
  ConsoleUtil.LogInfo(
    "Hi there! this process will set up org-formation within your organization. i'm excited. "
  );

  const buildAcctRootEmail = process.env["BUILD_ACCT_ROOTEMAIL"];
  ConsoleUtil.LogInfo(
    `The following parameters have been passed: BUILD_ACCT_ROOTEMAIL = ${buildAcctRootEmail}.`
  );

  if (!buildAcctRootEmail) {
    ConsoleUtil.LogError("parameter BUILD_ACCT_ROOTEMAIL is missing. ");
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
    return;
  }
  ConsoleUtil.LogInfo(
    "Step 2: We will now check whether the build account already exists and if not we will create it..."
  );

  const buildAccountId = await ensureBuildAccountExists(
    buildAcctRootEmail,
    "Orgformation Build"
  );

  if (!buildAccountId) {
    ConsoleUtil.LogError("unable to get or create build account id. ");
    return;
  }
  ConsoleUtil.LogInfo(
    `- AWS account id of the build account: ${buildAccountId}`
  );

  ConsoleUtil.LogInfo("Step 3: initializing org-formation ...");
  const initSucceeded = await performBootstrap(buildAccountId);
  if (!initSucceeded) return;
};

bootstrap();
