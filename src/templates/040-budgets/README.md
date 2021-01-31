### Purpose of these templates
The single template in this folder deploys a budget and a budget alarm to each account based on tags in the account specification. The alert when the threshold is met will be sent to the e-mail address specified on the account.

As an example, consider the following account:

``` yaml
  TempDevAccount:
    Type: OC::ORG::Account
    Properties:
      Alias: ba-temp-dev
      AccountName: Temporary Development Account
      AccountId: '215869187117'
      RootEmail: aws-temp-dev@bee.awesome
      Tags:
        budget-alarm-threshold: 200
        budget-alarm-threshold-email-recipient: aws-budget-owner@bee.awesome
```

This account has a budget threshold set for $200 monthly. An email with a budget alarm will be sent when:
- forecasted spent (end of month) exceeds 200 usd (100% of threshold)
- actual spent (month to date) exceeds 160 usd (80% of threshold)
- actual spent (month to date) exceeds 200 usd (100% of threshold)

The alerts will be sent to `aws-budget-owner@bee.awesome`.