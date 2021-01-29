### Purpose of these templates
The templates in this folder enable [AWS SSO](https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html) in the Management account. SSO is used to enable human access to accounts within the organization, both to the console as well as through the cli. 

This is one of the few folders that does not come with '**batteries included**' as it requires you to manually create Groups and Users. By default it comes with four profiles:
1. Auditor: tied to the default policy `arn:aws:iam::aws:policy/SecurityAudit`
2. Developer: tied to the default policy `arn:aws:iam::aws:policy/PowerUserAccess`
3. Supporter: tied to the default policies `arn:aws:iam::aws:policy/PowerUserAccess` and `arn:aws:iam::aws:policy/job-function/ViewOnlyAccess`
4. Administrator: tied to the default policy `arn:aws:iam::aws:policy/AdministratorAccess`

You will notice that there are more than 4 tasks, that is because for production access we want to limit the session time to 1 hour, while for non-production it can be 12 hours. This can only be done by deploying different permission sets.

Some notable resources in this folder:

| Resource | Description |
| - | - |
| Managed policies | An example stack to design your own IAM policies to assign to Groups |
| SSO | Deploys a set of permissions (roles basically) and connects that to groups that you create earlier |

It is recommended to re-use AWS provided policies where possible because of the maintenance benefit. The AWS environment constantly changes and AWS ensures that the managed policies they provide give access to new AWS Services and new actions within existing services.

