# 🌎 General Messages

You can edit messages shared across every feature in the `general.conf` messages file.

| **Name**            | **Type**                                                   | **Used when/for...**                                                                                                                    | **Placeholders**                                                                                                                                    |
|---------------------|------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| **confirm**         | [Confirm/cancel messages](#-confirm-and-cancel-messages)   | The confirm button shown while previewing a new or updated service.                                                                     | Varies per message.                                                                                                                                 |
| **cancel**          | [Confirm/cancel messages](#-confirm-and-cancel-messages)   | The cancel button shown while previewing a new or updated service, and the embed shown when a session is cancelled or has expired.      | Varies per message.                                                                                                                                 |
| **updateButton**    | [Button schema](../schemas/button-schema.md)               | The button to edit a service while previewing it, or to edit an existing service.                                                       | • [Global placeholders.](../placeholder/global-placeholders.md)                                                                                     |
| **deleteButton**    | [Button schema](../schemas/button-schema.md)               | The button to delete an existing service, shown along its information.                                                                  | • [Global placeholders.](../placeholder/global-placeholders.md)                                                                                     |
| **continue**        | [Continue messages](#-continue-messages)                   | The yes/no buttons shown when asking the user to confirm something.                                                                     | Varies per message.                                                                                                                                 |
| **unknownError**    | [Error embeds schema](../schemas/error-embeds-schema.md)   | Informing the user and logging about an unexpected error that isn't covered by a more specific error message.                           | • [Global placeholders.](../placeholder/global-placeholders.md)<br>• [`%error_...`](../placeholder/types/error-placeholder-type.md), for the error. |
| **notInGuildError** | [Embed schema](../schemas/embed-schema.md)                 | A command that needs a server member is used outside of a server, eg. in DMs.                                                           | • [Global placeholders.](../placeholder/global-placeholders.md)                                                                                     |
| **unknownMember**   | [Unknown member](#-unknown-member)                         | Data to display when a member can't be found, like the author of a service that left the server.                                        | None.                                                                                                                                               |
| **filters**         | [Filter messages](#-filter-messages)                       | The select menus used to filter offer and request search results.                                                                       | Varies per message.                                                                                                                                 |
| **booleans**        | Object with `yes` and `no` strings                         | Text representations of `true` and `false`. Currently unused.                                                                           | None.                                                                                                                                               |
| **pagination**      | Object with `previous` and `next` [buttons](../schemas/button-schema.md) | Pagination buttons. Currently unused.                                                                                     | None.                                                                                                                                               |

## ✅ Confirm and cancel messages

Both the `confirm` and `cancel` objects have the same structure.

| **Name**   | **Type**                                     | **Used when/for...**                                                                       | **Placeholders**                                                 |
|------------|----------------------------------------------|--------------------------------------------------------------------------------------------|------------------------------------------------------------------|
| **button** | [Button schema](../schemas/button-schema.md) | The button itself.                                                                         | • [Global placeholders.](../placeholder/global-placeholders.md) |
| **embed**  | [Embed schema](../schemas/embed-schema.md)   | Only used for `cancel`: the embed shown when a session is cancelled or has expired. `confirm.embed` is currently unused. | • [Global placeholders.](../placeholder/global-placeholders.md) |

## ❓ Continue messages

The `continue` object contains the yes/no buttons used to ask for confirmation. It has two variants, each with a `yes` and
a `no` [button](../schemas/button-schema.md), so you can style them differently:

| **Name**   | **Used when/for...**                                                                       | **Placeholders**                                                 |
|------------|--------------------------------------------------------------------------------------------|------------------------------------------------------------------|
| **safe**   | Confirming an action the user asked for, like deleting a service or a tag.                 | • [Global placeholders.](../placeholder/global-placeholders.md) |
| **unsafe** | Continuing despite [requirement](../requirements/requirements.md) warnings.                | • [Global placeholders.](../placeholder/global-placeholders.md) |

## 👻 Unknown member

The `unknownMember` object is used to fill [member placeholders](../placeholder/types/member-placeholder-type.md) when
the member can't be found.

| **Name**          | **Type**                       | **Description**                                                          |
|-------------------|--------------------------------|--------------------------------------------------------------------------|
| **username**      | string, up to 45 characters    | The username to display. The member's ID is appended after it.           |
| **discriminator** | string, up to 4 characters     | The discriminator to display.                                            |
| **avatar**        | string                         | An URL to the avatar to display.                                         |

## 🔍 Filter messages

The `filters` object contains the select menus used to filter search results.

| **Name** | **Type**                                                                                                                  | **Used when/for...**                                                                                                         | **Placeholders**                                                                                                                                                |
|----------|---------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **date** | [Select menu schema](../schemas/select-menu-schema.md) with `LastDay`, `LastWeek`, `LastMonth` and `LastYear` options     | Filtering services by how recently they were posted.                                                                         | • [Global placeholders.](../placeholder/global-placeholders.md)                                                                                                |
| **tag**  | [Select menu schema](../schemas/select-menu-schema.md) with `tag` option                                                  | Filtering services by tag. The `tag` option will be used as a template for every tag being inserted as an option.            | • [Global placeholders.](../placeholder/global-placeholders.md)<br>• Inside the `tag` option, [`%tag_...`](../tag/tag-placeholders.md), for the tag being filled. |
