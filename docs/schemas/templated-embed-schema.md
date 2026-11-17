# ♻ Templated Embed Schema

The templated embed schema is a special [embed schema](embed-schema.md) that allows you to define a template for embed
fields, mostly used when creating embeds that list an array of something.

> [!WARNING]
> While the following schema extends the embed schema, it does not contain the `fields` field.

| **Name**           | **Type**                                                       | **Used when/for...**                                          |
|--------------------|----------------------------------------------------------------|---------------------------------------------------------------|
| **fieldsTemplate** | [Embed field schema](../schemas/embed-schema.md#-field-schema) | Template used to create fields that list the queried objects. | 
