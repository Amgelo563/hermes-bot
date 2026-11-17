# 🔢 Select Menu Schema

The select menu schema is used to create select menus.

| **Name**        | **Type**                                                                        | **Description**                                                                                                                  |
|-----------------|---------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| **placeholder** | string                                                                          | The text shown in the select menu while nothing is selected.                                                                     |
| **options**     | object with values of [Select Menu Option Schema](#-select-menu-option-schema)? | The select menu's options. The exact contents of this object varies, check the documentation of what select menu you're editing. |

## 👤 Select Menu Option Schema

The select menu option schema is used to populate a select menu with its options.

| **Name**        | **Type** | **Description**                                                                                               |
|-----------------|----------|---------------------------------------------------------------------------------------------------------------|
| **label**       | string   | The option's label.                                                                                           |
| **description** | string?  | A smaller text shown below the label.                                                                         |
| **emoji**       | string?  | The option's emoji. Either a single unicode emoji, like `"🏷️"`, or a custom emoji, like `"<:name:123456789012345678>"`. |

> [!TIP]
> Some select menus have a single option that's used as a **template**, like the `tag` option of the tag select menus.
> In those cases, the bot creates one option per item (eg. one per tag) from that template, so you can use the item's
> placeholders inside it, like `%tag_name%`.

## 👀 Example

```hocon
tagSelect {
  placeholder = "Select a tag"
  options {
    tag {
      label = "%tag_name%"
      description = "%tag_description%"
    }
  }
}
```
