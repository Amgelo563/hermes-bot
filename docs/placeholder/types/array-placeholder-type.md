# 🔢 Array Placeholder Type

The array placeholder type is used to display an array of values.

> [!TIP]
> If the array has no values, this will always return `[]`.

> [!TIP]
> This is currently probably the least customizable part of the bot, since list formats are hardcoded. I'm not quite
> sure how it can be improved to be more user friendly. Recommendations and PRs are welcome!

| **Option**             | **Description**                                                                                                                                   | **Result example**  | 
|------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| **join**               | Joins the values by `,`.                                                                                                                          | 1, 2, 3             |
| **codeJoin**           | Wraps the values in \` and joins them by `,`.                                                                                                     | \`1\`, \`2\`, \`3\` |
| **mapBy**              | Maps the values using the specified key. For instance, `%offer_tags_mapBy_description_join%` joins the descriptions of the offer's tags.          | 1, 2, 3             |
| **idJoin**             | Only works if the underlying value is an object with an ID: It joins said IDs as a **codeJoin** format. Shorthand for **mapBy** and **codeJoin**. | \`1\`, \`2\`, \`3\` |             
| **list** or **asList** | Displays the values as a Markdown list.                                                                                                           | * 1<br>* 2<br>* 3   |
