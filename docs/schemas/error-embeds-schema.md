# ❌ Error Embeds Schema

The error embeds schema allows you to define a user readable error and a log error embed, that can contain more
information about the error.

| **Name** | **Type**     | **Used for...**                                            |
|----------|--------------|------------------------------------------------------------|
| **user** | Embed Schema | Displayed to the user, meant to not contain internal data. |
| **log**  | Embed Schema | Displayed in the log channel.                              |
