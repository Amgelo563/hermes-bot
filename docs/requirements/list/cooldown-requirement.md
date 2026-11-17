# ⏰ `cooldown` Requirement

The `cooldown` requirement allows you to set a cooldown for reposting services.

| Option    | Type                                                              | Description                                                                                                         |
|-----------|-------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| cooldown  | string                                                            | The cooldown amount, in [duration format](https://www.npmjs.com/package/parse-duration#parsestr-formatms), eg "1d". |
| message   | [Embed field schema](../../schemas/embed-schema.md#-field-schema) | The message to display if the requirement rejects.                                                                  |
| overrides | Array of [override objects](#override-objects)?                   | Roles that can have a lower cooldown than the default.                                                              |
| deny      | boolean?                                                          | Whether to deny if the requirement rejects (only warns if false). Defaults to true.                                 |

> [!TIP]
> If a member matches multiple override roles, the minimum cooldown of all of them will be picked.

### Override objects

Used to create per role overrides, which can have a lower cooldown than the one specified.

| **Option**   | **Type** | **Description**             |
|--------------|----------|-----------------------------|
| **role**     | string   | The ID of the role.         |
| **cooldown** | string   | The cooldown for this role. |
