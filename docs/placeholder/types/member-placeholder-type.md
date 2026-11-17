# 👤 Member Placeholder Type

The member placeholder type allows you to display information about a specific member.

| **Option**               | **Description**                                                                                                                                                                           | **Result example**             |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------|
| **username** or **name** | The member's username, not unique across Discord.                                                                                                                                         | Amgelo563                      |
| **discriminator**        | The member's discriminator from the [legacy tag format](https://support.discord.com/hc/en-us/articles/12620128861463-New-Usernames-Display-Names). If they don't have one, defaults to 0. | 1234                           |
| **globalName**           | The member's global name, unique.                                                                                                                                                         | amgelo563                      |
| **id**                   | The member's ID.                                                                                                                                                                          | 235428738748121088             |
| **tag**                  | The member's tag, which is either their username or their legacy tag if they still use it.                                                                                                | amgelo563#1234                 |
| **avatarURL**            | The member's displayed avatar, either their guild avatar or their user's avatar.                                                                                                          | https://cdn.discordapp.com/... |
| **mention**              | A string that mentions the user (doesn't ping).                                                                                                                                           | <@235428738748121088>          |

## 👀 Examples

* `%offer_user_username%` - Displays the username of the offer's author.
* `%request_user_id%` - Displays the user ID of the request's author.
* `%blacklist_blacklisted_mention%` - Displays a mention of the blacklisted user.
