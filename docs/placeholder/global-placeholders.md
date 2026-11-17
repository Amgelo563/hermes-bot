# 🌐 Global Placeholders

Global placeholders are available in every message that supports placeholders, that is, all messages except
command and modal schemas.

- [`%member_...`](./types/member-placeholder-type.md) - The member that triggered the message, like the command invoker
  or button clicker. If this is a message triggered by the bot itself, like a sticky message, it'll be the bot's member.
- [`%date_...`](./types/date-placeholder-type.md) - The current date and time.
- `%slice_<max>_<placeholder>%` - Parses the placeholder and slices it if it reaches the provided maximum length.
  Eg. `%slice_10_offer_description%` will parse and slice the offer's description so it has up to 10 characters.
- `%command_<name>%` - A clickable mention of a bot command. Separate subcommands with `:`, eg. `%command_offers:search%`.
  Only works once the commands have been deployed.
