# 💹 Offer Configuration

You can edit how the offer feature behaves in the `offer.conf` config file.

| Name          | Type                                                              | Description                                                              |
|---------------|-------------------------------------------------------------------|--------------------------------------------------------------------------|
| channel       | string                                                            | The ID of the channel to send offers.                                    |
| log           | [🧾 Log Configuration](#-log-configuration) or `false`            | Specifies where and how to log offers.                                   |
| stickyMessage | [💬 Sticky Message Configuration](#-sticky-message-configuration) | Specifies whether to send a sticky message to the offer channel and how. |
| requirements  | [✅ Requirements Configuration](#-requirements-configuration)      | The requirements to check while users manage their offers.               |

## 🧾 Log Configuration

Specifies where and how to log blacklists. Can be turned off with `false`.

| **Name**    | **Type** | **Description**                          |
|-------------|----------|------------------------------------------|
| **channel** | string   | The channel to send logs.                |
| **update**  | boolean  | Whether to log when an offer is updated. |
| **delete**  | boolean  | Whether to log when an offer is deleted. |

## 💬 Sticky Message Configuration

Specifies whether to send a sticky message to the offer channel and how.
A sticky message is a special message that the bot keeps as the first message in the channel.

You can configure this message in the [💹 Offer Messages](./offer-messages.md) configuration.

| **Name**        | **Type** | **Description**                                                      |
|-----------------|----------|----------------------------------------------------------------------|
| **send**        | boolean  | Whether to send the sticky message.                                  |
| **deleteOther** | boolean  | Whether to delete messages sent by other users that are not the bot. |

## ✅ Requirements Configuration

Here you can configure what requirements the bot will check while users manage their offers.

| Name    | Type                                                      | Checked when...                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|---------|-----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| repost  | Array of [requirements](../requirements/requirements.md). | Reposting an existing offer. Available requirements:<br>• [`cooldown`](../requirements/list/cooldown-requirement.md)<br>• [`has-roles`](../requirements/list/has-roles-requirement.md)<br>• [`has-level`](../requirements/list/has-level-requirement.md)                                                                                                                                                                                                        |
| publish | Array of [requirements](../requirements/requirements.md). | Publishing a new offer. Available requirements:<br>• [`has-roles`](../requirements/list/has-roles-requirement.md)<br>• [`has-tag`](../requirements/list/has-tag-requirement.md)<br>• [`has-level`](../requirements/list/has-level-requirement.md)<br>• [`search`](../requirements/list/search-requirement.md)<br>• [`max-services`](../requirements/list/max-services-requirement.md) |
| update  | Array of [requirements](../requirements/requirements.md). | Updating an existing offer. Available requirements:<br>• [`search`](../requirements/list/search-requirement.md)<br>• [`has-level`](../requirements/list/has-level-requirement.md)                                                                                                                                                                                                                                                                               |                                                                   
