# 💰 Request Placeholders

The request placeholders extract information about a specific request. They start with `%request_...%`.

| **Option**           | **Description**                                                                                                                                                                          | **Result example**                       |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|
| **id**               | The request's ID, or `0` while creating the request.                                                                                                                                     | 1                                        |
| **title**            | The request's title.                                                                                                                                                                     | Looking for a sysadmin                   |
| **description**      | The request's description.                                                                                                                                                               | I need someone to administrate a server. |
| **shortDescription** | The request's description, sliced at a maximum of 100 characters. Deprecated in favor of the more customizable [`%slice_...` global placeholder](../placeholder/global-placeholders.md). | I need someone to administrate a s…      |
| **budget**           | The request's budget.                                                                                                                                                                    | 10$                                      |
| **userId**           | The request's user ID.                                                                                                                                                                   | 235428738748121088                       |
| **createdAt**        | [Date placeholder type](../placeholder/types/date-placeholder-type.md) that displays the request's first post date.                                                                      | Depends on the options.                  |
| **lastPostedAt**     | [Date placeholder type](../placeholder/types/date-placeholder-type.md) that displays the request's last post date.                                                                       | Depends on the options.                  |
| **tag**              | [`%tag_...`](../tag/tag-placeholders.md) placeholders for the request's tag. If the request has no tag, the `noTags` tag from the [🏷 Tag Messages](../tag/tag-messages.md) is used.   | Depends on the options.                  |
| **user**             | [Member placeholder type](../placeholder/types/member-placeholder-type.md) that displays the member that created the request.                                                            | Depends on the options.                  |
| **channelId**        | The request's post channel ID.                                                                                                                                                           | 770705035650269204                       |
| **messageId**        | The request's post message ID. Not accurate while creating the request.                                                                                                                  | 948179167143415868                       |
| **url**              | An URL to the request's post message. Not accurate while creating the request.                                                                                                           | https://discord.com/channels/...         |

## 👀 Examples

* `%request_title%` - Displays the request's title.
* `%request_tag_name%` - Displays the name of the request's tag.
* `%request_user_mention%` - Mentions the request's author.
