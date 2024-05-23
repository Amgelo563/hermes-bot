# hermes-bot

A Discord.js bot for services publishing, made with [nyx](https://github.com/nyx-discord/nyx).

## Features

### Service Offers and Requests (Services)

* Publishing services with a user friendly interface, giving a preview of the service and warnings or denied
  requirements. Also allows editing and deleting offers, as well as republishing them.
* Configurable requirements that the user or published service must meet (denying the creation otherwise) or should
  meet (warning the user otherwise).

## Messages

* Completely configurable messages for every bot component (no hardcoded messages).
* Supports multiple languages, allowing to select one in the config.
* Powerful placeholder system to display information in messages.
* Uses the powerful HOCON syntax, allowing for easy reusability.

## Setting up

### Manual installation

1. Copy one of the templates in `./example-config` and paste it as `./config`, then edit it accordingly.
2. Optionally, change the datasource provider in `prisma/schema.prisma` to `mysql`, `postgresql` or `sqlite` (default).
3. Create a `.env` file with the following content:

```bash
# For MySQL: mysql://user:password@host:port/database
# For PostgreSQL: postgresql://user:password@host:port/database
# For SQLite: file:./<path>.db, relative to ./prisma. For example: file:../database.db
DATABASE_URL=The connection URL to your database.
```

4. Run `pnpm install` to install the dependencies, `pnpm build` to build the bot and `pnpm start` to start it.

### Docker

Alternatively, use the provided Dockerfile:

```bash
# Build the image (only once or after updating)
docker build -t hermes-bot .

# Start the bot, mounting the config directory
docker run --name hermes-bot --mount type=bind,source="$(pwd)"/config,target=/usr/src/app/config -d hermes-bot

# Use `docker restart hermes-bot` to restart the bot after doing changes in config.
```

Keep in mind that you still need to follow the first step in the manual installation.
