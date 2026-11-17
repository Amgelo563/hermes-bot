# 🏷 `has-tag` Requirement

The `has-tag` requirement rejects if the user hasn't tagged their service yet. Specifically:

* In offers, it rejects if the user hasn't specified at least one tag.
* In requests, it rejects if the user hasn't specified the tag.

| Option  | Type                                                              | Description                                                                         |
|---------|-------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| message | [Embed field schema](../../schemas/embed-schema.md#-field-schema) | The message to display if the requirement rejects.                                  |
| deny    | boolean?                                                          | Whether to deny if the requirement rejects (only warns if false). Defaults to true. |
