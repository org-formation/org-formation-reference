### Purpose of these templates
The templates in this folder are the basis for the functioning of org-formation. It is the folder that needs to be deployed manually when setting up (bootstrapping) a new organization.

Some notable resources in this folder:
| Resource | Description
| - | -
| buckets | The buckets where the org-formation state file is stored as well as where the zip file of the initial commit of the orgBuild repository is placed
| eventbus | an AWS Eventbus policy that allows other accounts within the organization to subscribe to events published by org-formation. An exmaple of such event is the `AccountCreated` event, which is used in the folder  `050-account-creation`
| build | The build pipeline including a PR pipeline that executes org-formation from within the OrgBuild account
| roles | Each account needs to have a priveleged role that the build can assume to execute deployments