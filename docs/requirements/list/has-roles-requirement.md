# 👷 `has-roles` Requirement

The `has-roles` requirement allows you to check if the member has (or not) any specified roles.

| Option      | Type                                                              | Description                                                                         |
|-------------|-------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| mode        | "only", "any", "all" or "none"                                    | Whether to check if the member has only/any/all/none of these roles.                |
| roles       | Array of role IDs                                                 | The roles to check.                                                                 |
| message     | [Embed field schema](../../schemas/embed-schema.md#-field-schema) | The message to display if the requirement rejects.                                  |
| staffBypass | boolean?                                                          | Whether if staff bypasses this requirement. Defaults to true.                       |
| deny        | boolean?                                                          | Whether to deny if the requirement rejects (only warns if false). Defaults to true. |
