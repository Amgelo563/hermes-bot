# 📄 Modal Schema

The modal schema is used when creating modals that will query the user for further information about something.

> [!WARNING]
> Discord interactions expire after 3 seconds, but bots can reply with a "defer", which gives more time to answer.
> Unfortunately, Discord does not allow to defer and then send a modal, so modals **must** be sent within those 3
> seconds, in other words as soon as possible.
>
> Hermes addresses this problem by caching modals everywhere it can, but this also means that modals (or modal fields)
> cannot contain placeholders, since that'd take extra processing time. Either way I haven't personally seen a use case
> for *needing* placeholders on a modal, but if you have one you can open an issue about it.

| **Name**   | **Type**                                                         | **Used when/for                                                                                                               |
|------------|------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| **title**  | string                                                           | The modal's title.                                                                                                            |
| **fields** | object with values of [Modal Field Schema](#-modal-field-schema) | The modal's fields. The exact contents of this object varies per modal, check the documentation of what modal you're editing. |

## 🧾 Modal Field Schema

The modal field schema is used to create a field inside a modal.

| **Name**        | **Type** | **Used when/for                                          |
|-----------------|----------|----------------------------------------------------------|
| **label**       | string   | The label of this field.                                 |
| **placeholder** | string?  | A placeholder string shown as a suggestion in the field. |
