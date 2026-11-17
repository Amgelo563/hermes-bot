# 🔍 `search` Requirement

The `search` requirement allows you to search if the service contains (or doesn't contain) some words or regexes.

Unlike other requirements, each search has its own `message` and `deny` options, so you can show a different message
for each one.

| **Option** | **Type**                                                    | **Description**                                              |
|------------|-------------------------------------------------------------|--------------------------------------------------------------|
| **regex**  | Array of [regex search objects](#regex-search-object)?      | Configures what regexes to search in the specified property. |
| **words**  | Array of [word search objects](#word-search-object)?        | Configures what words to search in the specified property.   |

### Regex Search object

| **Option** | **Type** | **Description** |
|------------|----------|-----------------|
| **on**     | string | Where to search. This can be: <br>* `title`<br>* `description`<br>* `price` on offers, `budget` on requests<br>* `thumbnail` and `image`, only on offers |
| **mode**   | "require" or "forbid" | Whether to require or forbid the regex to match. |
| **regex**  | string | The regex itself. Remember to escape backslashes, eg. `"\\d"` for `\d`. |
| **flags**  | string? | The [regex's flags](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#advanced_searching_with_flags), eg. `"i"` for case insensitive. |
| **message** | [Embed field schema](../../schemas/embed-schema.md#-field-schema) | The message to display if this search rejects. |
| **deny** | boolean? | Whether to deny if this search rejects (only warns if false). Defaults to true. |

### Word Search object

| **Option** | **Type** | **Description** |
|------------|----------|-----------------|
| **on**     | string | Where to search. This can be: <br>* `title`<br>* `description`<br>* `price` on offers, `budget` on requests<br>* `thumbnail` and `image`, only on offers |
| **mode**   | "any", "all" or "none" | Whether to require any word to be present, all words to be present, or none of them. |
| **words**  | Array of string | The words to search for. The search is case sensitive. |
| **message** | [Embed field schema](../../schemas/embed-schema.md#-field-schema) | The message to display if this search rejects. |
| **deny** | boolean? | Whether to deny if this search rejects (only warns if false). Defaults to true. |

## 👀 Examples

Requiring a number in the price to publish an offer:

```js
requirements: {
  publish: [
    {
      id: "search",
      regex: [
        {
          on: "price",
          mode: "require",
          regex: "\\d",
          message: {
            name: "💰 Price",
            value: "You must specify a price for your offer."
          },
        },
      ],
    }
  ]
}
```

Requiring a currency in the budget to publish a request:

```js
requirements: {
  publish: [
    {
      id: "search",
      words: [
        {
          on: "budget",
          mode: "any",
          words: ["$", "€", "dollar", "usd", "euro"],
          message: {
            name: "💵 Currency",
            value: "You must specify a currency. Available currencies: `$`, `€`, `dolar`, `usd`, `euro`."
          },
        }
      ]
    }
  ]
}
```
