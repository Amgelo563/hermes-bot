# ⛔ Blacklist Messages

You can edit blacklist messages in the `blacklist.conf` lang file.

| **Name**               | **Type**                                       | **Used when/for...**                                                | **Placeholders**                                                                                                                                 |
|------------------------|------------------------------------------------|---------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| **notAllowed**         | [Embed schema](../schemas/embed-schema.md)     | A non-staff tries to blacklist, unblacklist, or create a blacklist. | • [Global placeholders.](../placeholder/global-placeholders.md)                                                                                  |
| **command**            | [Command schema](../schemas/command-schema.md) | Creating the main blacklist command.                                | None.                                                                                                                                            |
| **permanent**          | string                                         | A blacklist's expiration date is queried, but it's permanent.       | None.                                                                                                                                            |
| **notBlacklisted**     | [Embed schema](../schemas/embed-schema.md)     | Trying to delete a blacklist of a not blacklisted user.             | • [Global placeholders.](../placeholder/global-placeholders.md)                                                                                  |
| **alreadyBlacklisted** | [Embed schema](../schemas/embed-schema.md)     | Trying to blacklist a blacklisted user.                             | • [Global placeholders.](../placeholder/global-placeholders.md)<br>• [`%blacklist_...`](./blacklist-placeholders.md), for the present blacklist. |
| **info**               | [Info messages](#info-messages)                | Messages about displaying blacklist information.                    | Varies per message.                                                                                                                              |
| **create**             | [Create messages](#create-messages)            | Messages about creating blacklists.                                 | Varies per message.                                                                                                                              |
| **list**               | [List messages](#list-messages)                | Messages about displaying blacklists.                               | Varies per message.                                                                                                                              |
| **delete**             | [Delete messages](#delete-messages)            | Messages about deleting blacklists.                                 | Varies per message.                                                                                                                              |
| **expire**             | [Expire messages](#expire-messages)            | Messages about blacklists that expired.                             | Varies per message.                                                                                                                              |

## Info messages

The `info` object contains messages about displaying blacklist information.

| **Name**    | **Type**                                                           | **Used when/for...**                                          | **Placeholders**                                                                                                                         |
|-------------|--------------------------------------------------------------------|---------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| **command** | [Command schema](../schemas/command-schema.md) with `user` option. | Creating the blacklist info command.                          | None.                                                                                                                                    | None.                                                                       |
| **embed**   | [Embed schema](../schemas/embed-schema.md)                         | Displaying a blacklist's info, mostly through the subcommand. | • [Global placeholders.](../placeholder/global-placeholders.md)<br>• [`%blacklist_...`](./blacklist-placeholders.md), for the blacklist. |

## Create messages

The `create` object contains messages about creating blacklists.

| **Name**    | **Type**                                                                    | **Used when/for...**                                           | **Placeholders**                                                                                                                                 |
|-------------|-----------------------------------------------------------------------------|----------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| **command** | [Command schema](../schemas/command-schema.md) with `user` option.          | Creating the blacklist create command.                         | None.                                                                                                                                            | None.                                                                               |
| **modal**   | [Modal schema](../schemas/modal-schema.md) with `time` and `reason` fields. | Creating the blacklist create modal.                           | None.                                                                                                                                            |
| **confirm** | [Embed schema](../schemas/embed-schema.md)                                  | Asking for confirmation when creating a blacklist.             | • [Global placeholders.](../placeholder/global-placeholders.md)<br>• [`%blacklist_...`](./blacklist-placeholders.md), for the created blacklist. |                                       |
| **success** | [Embed schema](../schemas/embed-schema.md)                                  | Displaying blacklist creation success.                         | • [Global placeholders.](../placeholder/global-placeholders.md)<br>• [`%blacklist_...`](./blacklist-placeholders.md), for the created blacklist. |                                       |
| **log**     | [Embed schema](../schemas/embed-schema.md)                                  | Logging the blacklist creation in the log channel, if enabled. | • [Global placeholders.](../placeholder/global-placeholders.md)<br>• [`%blacklist_...`](./blacklist-placeholders.md), for the created blacklist. |                                       |
| **error**   | [Error embeds schema](../schemas/error-embeds-schema.md)                    | Displaying a blacklist creation error.                         | • [Global placeholders.](../placeholder/global-placeholders.md)<br>• `%error_...`, for the error.                                                |

## List messages

The `list` object contains messages about displaying blacklisted users in the guild.

| **Name**    | **Type**                                                       | **Used when/for...**                                                       | **Placeholders**                                                                                                                       |
|-------------|----------------------------------------------------------------|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| **command** | [Command schema](../schemas/command-schema.md)                 | Creating the blacklist list subcommand.                                    | None.                                                                                                                                  |
| **embed**   | [Templated embed schema](../schemas/templated-embed-schema.md) | Displaying a blacklist list. The template will be used for the blacklists. | • [Global placeholders.](../placeholder/global-placeholders.md)<br>• [`%blacklist_...`](./blacklist-placeholders.md), in the template. |
| **empty**   | string                                                         | Used as embed description when there's no blacklisted users.               | • [Global placeholders.](../placeholder/global-placeholders.md)                                                                        |

## Delete messages

The `delete` object contains messages about deleting blacklists.

| **Name**    | **Type**                                                           | **Used when/for...**                                           | **Placeholders**                                                                                                                                                           |
|-------------|--------------------------------------------------------------------|----------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **command** | [Command schema](../schemas/command-schema.md) with `user` option. | Creating the blacklist delete subcommand.                      | None.                                                                                                                                                                      |
| **success** | [Embed schema](../schemas/embed-schema.md)                         | Displaying blacklist deletion success.                         | • [Global placeholders.](../placeholder/global-placeholders.md)<br>• [`%blacklist_...`](./blacklist-placeholders.md), for the deleted blacklist.                           |
| **log**     | [Embed schema](../schemas/embed-schema.md)                         | Logging the blacklist deletion in the log channel, if enabled. | • [Global placeholders.](../placeholder/global-placeholders.md)<br>• [`%blacklist_...`](./blacklist-placeholders.md), for the deleted blacklist.                           |
| **error**   | [Error embeds schema](../schemas/error-embeds-schema.md)           | Displaying a blacklist deletion error.                         | • [Global placeholders.](../placeholder/global-placeholders.md)<br>• `%error_...`, for the error.<br>• [`%blacklist_...`](./blacklist-placeholders.md), for the blacklist. |

## Expire messages

The `expire` object contains messages about blacklists that expired automatically.

| **Name**  | **Type**                                                 | **Used when/for...**                                 | **Placeholders**                                                                                                                                                           |
|-----------|----------------------------------------------------------|------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **log**   | [Embed schema](../schemas/embed-schema.md)               | Logging the blacklist expiration in the log channel. | • [Global placeholders.](../placeholder/global-placeholders.md)<br>• [`%blacklist_...`](./blacklist-placeholders.md), for the expired blacklist.                           |
| **error** | [Error embeds schema](../schemas/error-embeds-schema.md) | Displaying a blacklist expiration error.             | • [Global placeholders.](../placeholder/global-placeholders.md)<br>• `%error_...`, for the error.<br>• [`%blacklist_...`](./blacklist-placeholders.md), for the blacklist. |

