# ✨ Introduction

Welcome to the Hermes bot documentation! Here you can learn how to fully configure Hermes for your needs.

## 📖 Table of contents

* **[🌐 Deployment](deployment.md)** - How to setup and run Hermes.
* **[💹 Offer](offer/offer.md)** - Feature to create and manage offers.
* **[💰 Request](request/request.md)** - Feature to create and manage requests.
* **[🏷 Tag](tag/tag.md)** - Feature to categorize offers and requests.
* **[⛔ Blacklist](blacklist/blacklist.md)** - Feature to blacklist users permanently or temporarily.
* **[✅ Requirements](requirements/requirements.md)** - Conditions that offers and requests must or should meet.
* **💻 Other Configurations** - Config files not related to a specific feature.
    * [🌎 General Configuration](configs/general-config.md) - General bot configuration.
    * [🌎 General Messages](configs/general-messages.md) - Messages shared across every feature.
    * [💬 Discord Configuration](configs/discord-config.md) - Discord specific configuration.
* **🔣 Placeholders** - Display context-specific information in messages.
    * [🌐 Global Placeholders](placeholder/global-placeholders.md) - Placeholders available in every message.
    * [✏ Update Placeholders](placeholder/update-placeholders.md) - Placeholders for update and deletion logs.

## ⚙ Configuration

Hermes includes two types of configuration for each feature:

- Its **behavior** configuration, stored in the `config` folder.
- Its **message** configuration, stored in the `messages` folder.

The example files are stored in the `example-config` and `lang` folders, respectively. See the
[🌐 Deployment](deployment.md#-configuration) section on how to use them. These are maintained to keep up
with latest changes, and you shouldn't need to change it manually.

To see more information about each of these files, see the documentation of each feature.

### Length limits

Pretty much every single message in Hermes is configurable, embeds, buttons, select menus, etc. You can also use
placeholders to display context-specific information in your messages.

Unfortunately, the combination of both can create invalid messages, since Discord limits the amount of characters
for every string, and we don't know what the length of a string will be before applying its placeholders.

To account for this, Hermes knows about each of these limits, and will slice strings and append a `…` if they're too
long after being parsed. While this should avoid pretty much every "Invalid Form Body" error, it could theorically
fail (specially if Discord changes the limits), so please open an issue if this happens.

### Types

Through the documentation you'll see mentions about "types". This means what "kind" the value of something should be.

> [!TIP]
> If a type is followed by `?`, it means that the type is optional and you can choose to not include it.

The most common types are:

* `string` is any string, like `"hello world"`. Some strings may need a special format, like a "HEX string", but they're
  still a string.
* `number` is any number, like `42`.
* `boolean` is either `true` or `false`.
* `Schema` is a object that is reused through various places. The exact contents of this object varies per schema, but
  each of them is entirely documented.
