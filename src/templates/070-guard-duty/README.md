### Purpose of these templates
The templates in this folder enable [GuardDuty](https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html) in each account. Amazon GuardDuty is a continuous security monitoring service that analyzes and processes the following Data sources: VPC Flow Logs, AWS CloudTrail management event logs, Cloudtrail S3 data event logs, and DNS logs.

GuardDuty supports a management-member model, which this stack uses. The Management account is configured to be the SecurityAccount, all other accounts are member accounts. Some notable resources in this folder:

| Resource | Description |
| - | - |
| Trusted IP | A bucket and file with an allow-list of IP addresses. These can be the home IPs of engineers working from home to reduce the number of false positives |
| SNS topic | An extension point to notify, filter or respond to GuardDuty findings |
