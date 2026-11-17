# 🏷 Tag

The tag feature allows users to categorize their services. Offers can include multiple tags, while requests can only
include one. Tags can also be used to filter services when searching them.

Only staff members (see `staffRoles` in the [💬 Discord Configuration](../configs/discord-config.md)) can create, edit
or delete tags, and they can do it while the bot is running.

> [!TIP]
> When the bot starts and there are no tags in the database, it creates the `defaultTags` from the
> [🏷 Tag Configuration](tag-config.md). After that, tags are managed exclusively through commands.

> [!NOTE]
> The last remaining tag can't be deleted, so there's always at least one tag available.

## 💻 Available commands

All command names, descriptions and options are editable through
the [🏷 Tag Messages](tag-messages.md) file.

In the default configuration they are named:

- `/tags` - The main tag command.
  - `/tags list` - Lists all the available tags.
  - `/tags info` - Shows information about a given tag.
  - `/tags create` - Creates a new tag. Staff only.
  - `/tags edit` - Edits a tag. Staff only.
  - `/tags delete` - Deletes a tag. Staff only.

## 🧩 Configuration

See information about tag configuration in the [🏷 Tag Configuration](tag-config.md) section.

## 📝 Messages

See information about tag messages in the [🏷 Tag Messages](tag-messages.md) section.
