# ✅ Requirements

Requirements let you configure specific conditions that must (forbidding otherwise) or should be (warning otherwise)
fulfilled for a user to be able to use a specific action.

Every requirement is an object with an `id`, which selects the requirement (like `"has-roles"`), and an optional `deny`
option, which defines whether the requirement will forbid (`true`, the default) or only warn (`false`). The rest of the
options depend on the requirement, check its page in the configuration section of each service type.

Currently requirements are supported in service creation, updating and reposting, and each of them have their own set of
requirements. You can see which ones on the configuration section of each service type.

## 💬 [Reject messages](requirement-embeds-schema.md)

When a requirement rejects, the bot uses the `deny` or `warn` embed specified in the respective message config.

Most requirements' reject message is an [embed field](../schemas/embed-schema.md#-field-schema) (which will then be used
in the embed), but others contain much more information and require
a full [templated embed](../schemas/templated-embed-schema.md). In case it uses an embed, it'll shown after the `deny`
or `warn` embed, so the user knows it's a warning or a denial.
