### Purpose of these templates
The templates in this folder update the [AWS Limits](https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html) on resources, actions and items centrally through Service Quotas. Some limits can be increased programmatically and that is done by this stack based on tags on the account object in `organization.yml`.

All of the resources here are based on community resource types that are made available through `005-types`

Some notable resources in this folder:
| Quota/Limit | Description
| - | -
| S3 buckets | Set the maximum number of S3 buckets the account may contain. This service quota is global (across all regions), the default maximum is 100.
| CloudFormation stacks | Set the maximum number of CloudFormation stacks allowed. This service quota is regional (needs to be set separately for every region). The default per region is 200.
| DynamoDB tables | Set the maximum number of DynamoDB tables allowed. This service quota is regional (needs to be set separately for every region). The default per region is 256.

Note that for regional limits, the account tags used in the service-quotas.yml template file apply to the `primaryRegion` set up in the  `_parameters.yml` file.

As an example, consider the following account:

```  yaml
TempDevAccount:
    Type: OC::ORG::Account
    Properties:
      Alias: ba-temp-dev
      AccountName: Temporary Development Account
      AccountId: '215869187117'
      RootEmail: aws-temp-dev@bee.awesome
      Tags:
        service-quotas-s3-buckets: 200
        service-quotas-cfn-stacks: 300
        service-quotas-ddb-tables: 300
```
