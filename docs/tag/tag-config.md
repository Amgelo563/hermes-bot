# 🏷 Tag Configuration

You can edit how the tag feature behaves in the `tags.conf` config file.

| **Name**        | **Type**                                              | **Description**                                                                                     |
|-----------------|-------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| **defaultTags** | Array of [🏷 Tag schemas](#-tag-schema)               | The tags to create when the bot starts and there are no tags yet. Ignored once any tag exists.      |
| **log**         | [🧾 Log Configuration](#-log-configuration) or `false` | Specifies where and how to log tag changes.                                                         |

## 🏷 Tag Schema

| **Name**        | **Type** | **Description**                                             |
|-----------------|----------|-------------------------------------------------------------|
| **name**        | string   | The tag's name.                                             |
| **color**       | string   | The tag's color, as a HEX string (eg. `"#5865F2"`).         |
| **description** | string   | The tag's description.                                      |

## 🧾 Log Configuration

Specifies where and how to log tag changes. Can be turned off with `false`.

| **Name**    | **Type** | **Description**                         |
|-------------|----------|-----------------------------------------|
| **channel** | string   | The ID of the channel to send logs.     |
| **create**  | boolean  | Whether to log when a tag is created.   |
| **update**  | boolean  | Whether to log when a tag is updated.   |
| **delete**  | boolean  | Whether to log when a tag is deleted.   |
