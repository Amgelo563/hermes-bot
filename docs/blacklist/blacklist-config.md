# ⛔ Blacklist Configuration

You can edit how the blacklist feature behaves in the `blacklist.conf` config file.

| **Name** | **Type**                                           | **Description**                            |
|----------|----------------------------------------------------|--------------------------------------------|
| **log**  | [Log Configuration](#-log-configuration) or `false` | Specifies where and how to log blacklists. |

## 🧾 Log Configuration

Specifies where and how to log blacklists. Can be turned off with `false`.

| **Name**    | **Type** | **Description**                             |
|-------------|----------|---------------------------------------------|
| **channel** | string   | The channel to send logs.                   |
| **create**  | boolean  | Whether to log when a blacklist is created. |
| **delete**  | boolean  | Whether to log when a blacklist is deleted. |
