# 🎨 Embed Message Schema

The embed message schema is used to create embed messages.

> [!NOTE]
> Every field is optional, but an embed needs at least a `title`, `author`, `description`, `thumbnail`, `image` or
> `footer`.

| **Name**        | **Type**                | **Description**               |
|-----------------|-------------------------|-------------------------------|
| **title**       | string?                 | Embed's title.                |
| **description** | string?                 | Embed's description.          |
| **url**         | string?                 | Embed's title URL.            |
| **timestamp**   | ISO8601 string?         | Embed's bottom timestamp.     |
| **color**       | HEX string?             | Embed's color.                |
| **footer**      | [footer schema](#-footer-schema)? | Embed's footer.               |
| **image**       | URL string?             | Embed's image.                |
| **thumbnail**   | URL string?             | Embed's thumbnail image.      |
| **author**      | [author schema](#-author-schema)? | Embed's author.               |
| **fields**      | array of [field schemas](#-field-schema)? | Embed's fields array. Max 25. |

## 📄 Footer Schema

| **Name** | **Type**    | **Description**          |
|----------|-------------|--------------------------|
| **text** | string      | The footer's text.       |
| **icon** | URL string? | The footer's icon image. |

## 👤 Author Schema

| **Name** | **Type**    | **Description**          |
|----------|-------------|--------------------------|
| **name** | string      | The author's name.       |
| **url**  | URL string? | The author's url.        |
| **icon** | URL string? | The author's icon image. |

## 💬 Field Schema

| **Name**   | **Type** | **Description**              |
|------------|----------|------------------------------|
| **name**   | string   | The field's name.            |
| **value**  | string   | The field's value.           |
| **inline** | boolean? | Whether the field is inline. |

