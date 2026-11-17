# 🌎 General Configuration

The `general.conf` configuration has options for configuring general settings.

| **Name**           | **Type**                                                                   | **Description**                                                                   |
|--------------------|----------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| **saveLogs**       | boolean                                                                    | Whether or not to save logs in the `logs` folder.                                 |
| **escapeMarkdown** | [Escape Markdown Configuration](#escape-markdown-configuration) or `false` |
| **debug**          | boolean                                                                    | Whether or not to enable debug mode, which outputs more messages on console.      |

## Escape Markdown Configuration

The `escapeMarkdown` option allows you to configure what markdown to escape in messages inputted by users, like service
descriptions.

| **Name**              | **Type** | **Description**                                |
|-----------------------|----------|------------------------------------------------|
| **bold**              | boolean  | Whether or not to escape bold text.            |
| **bulletedList**      | boolean  | Whether or not to escape bulleted lists.       |
| **codeBlock**         | boolean  | Whether or not to escape code blocks.          |
| **codeBlockContent**  | boolean  | Whether or not to escape code block content.   |
| **escape**            | boolean  | Whether or not to escape escape symbols (`\`). |
| **heading**           | boolean  | Whether or not to escape headings.             |
| **inlineCode**        | boolean  | Whether or not to escape inline code.          |
| **inlineCodeContent** | boolean  | Whether or not to escape inline code content.  |
| **italic**            | boolean  | Whether or not to escape italic text.          |
| **maskedLink**        | boolean  | Whether or not to escape masked links.         |
| **numberedList**      | boolean  | Whether or not to escape numbered lists.       |
| **strikethrough**     | boolean  | Whether or not to escape strikethrough text.   |
| **spoiler**           | boolean  | Whether or not to escape spoilers.             |
| **underline**         | boolean  | Whether or not to escape underlined text.      |
