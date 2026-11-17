# 🏆 `has-level` Requirement

The `has-level` requirement allows you to check if a member has reached a certain level role.

> [!WARNING]
> Hermes does not include a leveling system. This is meant to be used with other leveling bots.

| Option      | Type                                                              | Description                                                                                            |
|-------------|-------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| level       | number                                                            | The minimum level needed for this requirement.                                                         |
| regex       | Regex string                                                      | The regex to find the level in a given role name. It must have a named capturing group called "level". |
| message     | [Embed field schema](../../schemas/embed-schema.md#-field-schema) | The message to display if the requirement rejects.                                                     |
| rolesBypass | Array of role IDs?                                                | Roles that bypass this level check.                                                                    |
| staffBypass | boolean?                                                          | Whether staff bypasses this check. Defaults to true.                                                   |
| deny        | boolean?                                                          | Whether to deny if the requirement rejects (only warns if false). Defaults to true.                    |

> [!TIP]
> If a member doesn't have any role that matches the regex, it'll be assumed they're at level 0.

## 👀 Example

Suposse your leveling roles are:

* `Level 1`
* `Level 10`
* `Level 100`
* ... and so on

You can use this to check if a member has reached level 10:

```js
requirements: {
  publish: [
    {
      id: "has-level",
      level: 10,
      message: {
        name: "🏆 Level",
        value: "You must reach level 10 to publish."
      },
      regex: "Level (?<level>\\d+)",
    }
  ]
}
```

In essence, just put `(?<level>\\d+)` wherever the level should be.
