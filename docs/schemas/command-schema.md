# 💻 Command Schema

The command schema is used to define commands and their options.

| **Name**        | **Type**       | **Description**                                                                                                                                                                                                              |
|-----------------|----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **name**        | string         | The command's name.                                                                                                                                                                                                          |
| **description** | string         | The command's description.                                                                                                                                                                                                   |
| **options**     | options object | The command's options. The exact contents of this object varies through usages, since different commands have different options (some may not even have options).<br>Check the documentation of what command you're editing. |

## 🧾 Command Option Schema

Each command option inside the `options` object follows this schema.

| **Name**        | **Type** | **Description**           |
|-----------------|----------|---------------------------|
| **name**        | string   | The option's name.        |
| **description** | string   | The option's description. |
