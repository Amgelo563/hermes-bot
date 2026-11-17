# 💡 `search-offers` Requirement

The `search-offers` requirement allows you to search if there's an offer that could match what a user is about to
request. To do so, it searches for offers that include the tag that the user included in their request.

| Option  | Type                                                              | Description                                                                                   |
|---------|-------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| message | [Templated embed schema](../../schemas/templated-embed-schema.md) | The message to display if the requirement rejects. The template will be used for the found offers. |
| max     | number?                                                           | The maximum amount of offers searched. Defaults to 5.                                         |
| deny    | boolean?                                                          | Whether to deny if the requirement rejects (only warns if false). Defaults to true.           |
