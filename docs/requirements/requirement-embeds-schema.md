# ✅ Requirement Embeds Schema

The requirement embeds schema is used to show warnings and errors in case a user doesn't fulfill a requirement.

> [!TIP]
> Most requirements will show their failure messages as an embed field which will then be used in this schema, but
> others will show them as an entire new embed.
>
> In this second case, that embed will always go after the requirement deny/warn embed itself.

In both the `deny` and `warn` embeds you can use:

- [Global placeholders.](../placeholder/global-placeholders.md)
- [Missing Requirement Placeholders.](./missing-requirement-placeholders.md)
- Other placeholders specific to the feature being checked.

| **Name** | **Type**                                                       | **Description**                                                                                         |
|----------|----------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| **deny** | [Templated embed schema](../schemas/templated-embed-schema.md) | Shown if there are requirements that forbid the action. The template will be used for the requirements. |
| **warn** | [Templated embed schema](../schemas/templated-embed-schema.md) | Shown if there are requirements that report a warning, but don't forbid the action.                     |
