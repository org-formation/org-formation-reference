# IMPORTANT NOTE

This reference architecture and also the steps outlined in this review are still under development and wont work as-is.

Please do

- watch this project if you would like to get updates on the process.
- contribute best practices / ideas / documentation / code through issues or PRs <3

thanks!

# Introduction

This is a reference architecture to get started quickly with using `org-formation` as well as provide examples of best practices and demonstrates the capabilities. The reference architecture is built with the following core principles:

- _Batteries included:_ it should deploy with as little dependencies as possible
- _Always relevant:_ every organization will get value out of every part of the reference architecture. This means two things
  - it should not contain services that might not be used. Examples: **AWS ECS**, **AWS Step Functions**
  - it should not be too opinionated about choosing an AWS service as the implementation for a function that can also be sourced externally. Examples: **AWS SecurityHub**, **AWS CloudWatch** logs and metrics

To use this reference architecture, follow the [Getting Started](#getting-started). If you want to deploy additional stacks using org-formation on top of this reference architecture, then it is advised to do that using _delegated builds_. Within the org-formation GitHub there will be example stacks configured as delegated builds that are usable, but are not eligeble to be part of the reference architecture because they either depend on an external system (not batteries included) or not always relevent (uses an AWS service that does something that is not always relevant). Examples are:

- Break glass notifications based on events
- DNS and Domain management

# Getting Started

To create an AWS Organization based on this reference architecture, managed by org-formation follow these steps end to end.

1. [Create the AWS Management Account](#1-create-the-aws-management-account)
2. [Create the AWS Organization](#2-create-the-aws-organization)
3. [Configure AWS SSO](#3-configure-aws-sso)
4. [Clone and modify this repository](#4-clone-and-modify-this-repository)
5. [Initialize `org-formation`](#5-initialize-org-formation)
6. [Clone your new `org-formation` repository](#6-clone-your-new-org-formation-repository)

## Prerequisites

1. A valid credit card
2. A working phone number
3. Four unique email addresses within your domain (management-root, compliance-root and orgbuild-root)

> _Hint: if you are using Google as an email provider, you can use team+something@domain.com to create unique addresses that all arrive in the same email box_

## 1. Create the AWS Management Account

Create an AWS Account. This will be the management account of your AWS Organization

1. Navigate [here](https://portal.aws.amazon.com/billing/signup?nc2=h_ct&src=default&redirect_url=https%3A%2F%2Faws.amazon.com%2Fregistration-confirmation#/start) to sign up to an AWS account. Or sign-up on the page [here](https://aws.amazon.com/)
2. Gather the following data that you will need in step [Clone and modify this repository](#4.-clone-and-modify-this-repository)

| Parameter                 | Where to find it                        | Example      |
| ------------------------- | --------------------------------------- | ------------ |
| {{management-account-id}} | Top right -> your account -> My Account | 341696816352 |

## 2. Create the AWS Organization

1. [Create an AWS Organization](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_create.html)
2. [Enable all features](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_org_support-all-features.html)
3. [Enable all policy types](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_enable-disable.html)

## 4. Clone and modify this repository

1. Clone this repository locally
2. Search and replace the following values globally in all files

| Parameter                      | Description                                           | Source                                                                    | Example                                       |
| ------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------- |
| {{ManagementAcctId}}           | 12 digit identifier of the management account         | [Create the AWS Management Account](#1-create-the-aws-management-account) | 341696816352                                  |
| {{StateBucketName}}            | S3 bucket where the IaC state will be stored          | choose                                                                    | organization-formation-state-341696816352-prd |
| {{OrganizationName}}           | Alias of the management account                       | choose                                                                    | bee-awesome                                   |
| {{PrimaryAwsRegion}}           | The primary AWS region to deploy to                   | choose                                                                    | us-east-1                                     |
| {{management-acct-root-email}} | Email address used to register the management account | [Create the AWS Management Account](#1-create-the-aws-management-account) | platform.team@bee.awesome                     |
| {{security-acct-root-email}}   | Email address for the compliance account              | [Prerequisites](#prerequisites)                                           | platform.team+compliance@bee.awesome          |
| {{logarchive-acct-root-email}} | Email address for the compliance account              | [Prerequisites](#prerequisites)                                           | platform.team+compliance@bee.awesome          |
| {{orgbuild-acct-root-email}}   | Email address for the org build account               | [Prerequisites](#prerequisites)                                           | platform.team+org-build@bee.awesome           |

## 5. Initialize `org-formation`

In this step, you run OrgFormation locally using the credentials of the root user of the management account. This is the only time you will use the root user of any account for any purpose and the root user will be closed off as the last step in this guide.

> _Note: you might need to run the OrgFormation commands more than once._

<br>

1. Install OrgFormation on your local machine

```
npm install -g aws-organization-formation
```

<details>
<summary>I already have an existing AWS Organization</summary>

If you already have an existing organization, then the following command generates an organization.yml file for you based on the current structure of your organization.

```
npx org-formation init organization.yml --region _Primary Region_ --cross-account-role-name OrganizationFormationBuildAccessRole --print-stack --verbose
```

You can then merge that with the ./src/organization.yml file in the way you like and continue with this guide.

</details><br>

2. Apply the organization.yml file to AWS Organizations. This means creating accounts and OUs and ordering them. This will also create the OrgBuild account where the org-formation build pipeline will reside.

```
npx org-formation update ./src/organization.yml --verbose
```

3. Create the role that the `org-formation` uses inside of the Management Account

```
aws cloudformation create-stack --stack-name org-formation-role --template-body file://src/templates/000-org-build/role.yml --capabilities CAPABILITY_NAMED_IAM
```

4. Zip this local repository into `000-org-build` to be used as the initial commit for the OrgBuild CodeCommit repository. From the top level of this repository, execute:

```
zip ./src/templates/000-org-build/initial-commit src/**/*.* .gitignore .org-formationrc *.yml *.json README.md
```

5. Deploy the stacks in `000-org-build`. This creates the build roles, state bucket and file and the OrgFormation build pipeline in the OrgBuild account. It also uploads this entire local repository as an initial commit to the Git repository that the build pipeline will then execute.

```
npx org-formation perform-tasks ./src/templates/000-org-build/_tasks.yml --organization-file ./src/organization.yml --max-concurrent-stacks 50 --max-concurrent-tasks 1 --print-stack --verbose
```

When you have finished the setup, we will need to delete the S3 bucket containing the state in the management account. This was created in step 2 because at that time the OrgBuild account, was assumed to not exist yet.

## 6. Clone your new `org-formation` repository

Here you will configure command line access to the CodeCommit repository that will trigger the Build Pipeline in the OrgBuild Account. It requires you to configure the aws cli to use SSO and the clone the repository using HTTPS git-remote-codecommit (GRC)

1. Configure AWS CLI with AWS SSO by following [this guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html#sso-configure-profile-auto)

You will need to provide the following details:

| Parameter                 | Description                                                               | Example                              |
| ------------------------- | ------------------------------------------------------------------------- | ------------------------------------ |
| SSO start URL             | The landing page URL to be found in the AWS SSO of the management account | https://dgega332fa.awsapps.com/start |
| SSO region                | The default region                                                        | us-east-1                            |
| SSO account id            | Select the OrgBuild account from the drop-down                            | 222140350420                         |
| SSO role name             | Select a role with write permission the drop-down                         | Administrator                        |
| CLI default client Region | The default region                                                        | us-east-1                            |
| CLI default output format | Whatever format you prefer                                                | yaml                                 |
| CLI profile name          | Name of the profile, choose wisely                                        | ba-orgbuild-admin                    |

2. Configure support for CodeCommit [git-remote-codecommit](https://docs.aws.amazon.com/codecommit/latest/userguide/setting-up-git-remote-codecommit.html?icmpid=docs_acc_console_connect#setting-up-git-remote-codecommit-install)

3. Using your IDP (either AWS SSO itself or an external IDP), log into the OrgBuild account, navigate to AWS CodeCommit, find the repository URL and clone

It looks something like this

```
git clone codecommit::eu-central-1://<AWS_CLI_PROFILE_NAME>@organization-formation
```

4. You can now make changes, commit and push and that will be effectuated by the build pipeline in the OrgBuild Account
