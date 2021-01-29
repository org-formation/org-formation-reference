### Purpose of these templates
This folder contains an SNS Topic that will trigger based on an event published on the event bus by org-formation (see `000-org-build` for the definition of this event bus).

Any account within the AWS Organization will be able to subscribe to that topic and run any logic needed.
