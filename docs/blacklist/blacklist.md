# ⛔ Blacklist

The blacklist feature allows you to blacklist certain members from using the bot.

This is implemented through a requirement on both offer and request creation that rejects if the user is blacklisted.

## 💻 Available commands

All command names, descriptions and options are editable through
the [⛔ Blacklist Messages](blacklist-messages.md) file.

In the default configuration they are named:

* `/blacklist` - The main blacklist command.
    * `/blacklist info` - Shows information about a user's blacklist, if any.
    * `/blacklist delete` - Deletes a user's blacklist, if any.
    * `/blacklist create` - Creates a blacklist on a user.
    * `/blacklist list` - Lists all blacklisted users.

## 🧩 Configuration

See information about blacklist configuration in the [⛔ Blacklist Configuration](blacklist-config.md)
section.

## 📝 Messages

See information about blacklist messages in the [⛔ Blacklist Messages](blacklist-messages.md)
section.
