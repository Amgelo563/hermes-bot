# 🔢 `max-services` Requirement

The `max-services` requirement allows you check if the user has reached a given amount of offers or requests.

| Option    | Type                                                              | Description                                                                                          |
|-----------|-------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| type      | "offer" or "request"                                              | The type of services to check.                                                                       |
| max       | number, minimum 1                                                 | The maximum amount of services allowed.                                                              |
| message   | [Templated embed schema](../../schemas/templated-embed-schema.md) | The message to display if the requirement rejects. The template will be used for the found services. |
| deny      | boolean?                                                          | Whether to deny if the requirement rejects (only warns if false). Defaults to true.                  |
| overrides | Array of [override objects](#override-object)?                    | Roles that can have more services than the default.                                                  |

> [!TIP]
> If a member matches multiple override roles, the maximum of all of them will be picked.

### Override object

| **Option** | **Type** | **Description**                                       |
|------------|----------|-------------------------------------------------------|
| **role**   | string   | The ID of the role.                                   |
| **max**    | number   | The maximum amount of services allowed for this role. |
