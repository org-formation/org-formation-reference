### Purpose of these templates
The templates in this folder are [Service Control Policies](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html). They are the strongest form of policy prescribing what is and is not possible within the Organization. They can be applied to the entire organization or per Organizational Unit (OU). Depending on your risk management approach, adding or modifying SCPs is a recommended approach

Some notable SCPs in this folder:
| Resource | Description
| - | -
| Deny Root Access | An explicit DENY on all actions performed by the root user
| Deny Large EC2 | To ensure no surprises in your AWS bill - either by configuration mistake or malicious use - ec2 instances large (or bigger) are not allowed
| Allowed regions | Explicitly allow the deployment of resources in predetermined regions only
| Self protect | This SCP ensures the integrity of the build system and basic organization setup.