# 🤖 `hermes-bot`

*[Named after the greek god of merchants and commerce.](https://www.wikiwand.com/en/articles/Hermes)*

A fully configurable Discord.js bot that allows users to publish and request services in a
guild.

![Build Status](https://img.shields.io/github/actions/workflow/status/Amgelo563/hermes-bot/build.yml?style=for-the-badge&logo=github)
![Test Status](https://img.shields.io/github/actions/workflow/status/Amgelo563/hermes-bot/test.yml?style=for-the-badge&logo=vitest&label=Tests)
[![Latest Release](https://img.shields.io/github/v/release/Amgelo563/hermes-bot?style=for-the-badge&logo=nodedotjs&color=5FA04E)](https://github.com/Amgelo563/hermes-bot/releases/latest)

[![Built with Typescript](https://img.shields.io/badge/Built%20with-Typescript-3176C6?style=for-the-badge&logo=typescript&logoColor=3178C6)](https://www.typescriptlang.org/)
[![Powered by Nyx](https://img.shields.io/badge/Powered_by-Nyx-5662f6?style=for-the-badge&logo=discord)](https://github.com/nyx-discord/nyx)

This quick showcase shows an offer workflow, where the user can edit mistakes in their offer and the bot reports missing
requirements before letting them publish it. After publishing, the sticky message is re-sent so it's always the first in
the channel.

![Video Showcase](assets/showcase.mp4)

## ✨ Features

> [!TIP]
> The word "service" is used to refer to both service offers and service requests.

### Services

* User friendly workflow for publishing, letting the user preview and edit it before it's posted.
* Edit, delete and repost offers and requests.
* Keep a log of edits, deletions and reposts.

### Tags

* Allow users to "tag" their offers and requests.
* Create, delete or edit tags in runtime.
* Search services based on tags with a subcommand.
* Offers can include multiple tags, while requests can only include one.

### Requirements

* Configure requirements that the user or service **must** (denying otherwise) or **should** meet (warning otherwise,
  but still allowing).
* Entirely configurable requirements, from whether they're required or not, to the deny message shown to the user.

Currently available requirements:

* Search if the service contains/matches (or doesn't) a list of forbidden words or regexes.
* Require to have or not have specific roles.
* Require at least one tag.
* Forbid if the user has reached a given amount of services.
* Repost cooldown.
* Require to be at least a certain level (to integrate with leveling bots).

### Blacklists

You can blacklist specific users from using the bot.

* Make blacklist expire automatically after a certain time.
* Keep a log of blacklist creations, deletions and expirations.
* Allow users to see currently blacklisted users.

### Sticky Messages

* Configure messages that will be kept as the first message of the offer or request channel.
* Display important information that won't be overlooked by users.
* Debounce system to avoid bugs when messages are sent too fast.

### Messages

* Configure the messages for every feature, with nothing hardcoded.
* Ships with English and Spanish presets, ready to copy and edit.
* Powerful placeholder system to display information in messages.
* Messages in HOCON syntax, allowing easy reusability.

### Error handling

* Display both a user friendly error and a log error embed with more information about it.
* Messages are automatically stripped using Discord's officially documented limits if they would be too long for their
  respective fields (for example, due to a long placeholder).

## 🚀 Usage

[Head to the documentation to learn how to deploy and configure the bot.](docs/intro.md).
