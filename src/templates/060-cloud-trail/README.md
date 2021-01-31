### Purpose of these templates
The templates in this folder enable [CloudTrail](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html) in each account. CloudTrail is an essential service that implements an audit log of all actions taken within the account.

The (audit) trail logs are stored in a central S3 bucket in the LogArchive account, which is in the Shared OU and therefore considered a production account. Analytics can take place based on the logs in that S3 buckets, for example, based on [S3 notifications](https://docs.aws.amazon.com/AmazonS3/latest/dev/NotificationHowTo.html).

A common use-case is to do analysis on security related events, anomaly detection or forensics. Such functionality would be implemented in another subfolder depending on this one.
