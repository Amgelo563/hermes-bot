# ✏ Update Placeholders

The update placeholders are available in log messages about something that changed, like an offer, request or tag being
updated or deleted. They start with `%update_...%`.

| **Option**   | **Description**                                                                                                                                                                                                  | **Result example**      |
|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------|
| **updater**  | [Member placeholder type](./types/member-placeholder-type.md) that displays the member that made the change.                                                                                                      | Depends on the options. |
| **affected** | [Member placeholder type](./types/member-placeholder-type.md) that displays the member affected by the change, like the author of the updated offer.                                                              | Depends on the options. |
| **old**      | A value from the object before the change, followed by its key. For example, `%update_old_title%` shows the old title. If the value is a list, you can use the [array placeholder type](./types/array-placeholder-type.md) options after the key. | Depends on the key.     |
| **new**      | Same as **old**, but with the object after the change. Empty on deletion logs.                                                                                                                                   | Depends on the key.     |

> [!TIP]
> The keys available for **old** and **new** are the ones of the changed object, like `title`, `description` or `price`
> for an offer. Nested keys are separated with `.`, for example `%update_old_member.username%`.

## 👀 Examples

* `%update_updater_mention%` - Mentions who made the change.
* `%update_affected_username%` - Displays the username of the affected member.
* `%update_old_title%` - Displays the old title of an offer or request.
