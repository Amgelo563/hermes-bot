# 🌐 Deployment

Hermes supports deployment manually, or through a provided Dockerfile.

## 🧱 Installation

Both the manual and Docker installation require you to first setup your config and message files:

### 🧩 Configuration

1. Copy one of the templates in `./example-config`, paste it on `./config`, then edit them accordingly.
2. Copy one of the templates in `./lang`, paste it on `./messages`, and edit them accordingly.

### 👷 Manual

1. Optionally, change the datasource provider in `prisma/schema.prisma` to `mysql`, `postgresql` or `sqlite` (default).
2. Create a `.env` file with the following content:

```bash
# For MySQL: mysql://user:password@host:port/database
# For PostgreSQL: postgresql://user:password@host:port/database
# For SQLite: file:./<path>.db, relative to ./prisma. For example: file:../database.db
DATABASE_URL=The connection URL to your database.
```

3. Run `pnpm install` to install the dependencies, `pnpm build` to build the bot and `pnpm start` to start it.
4. If you want to update the bot, just perform a `git pull` and the third step.

### 🐳 Docker

Use the provided Dockerfile:

```bash
# Build the image (only once or after updating)
docker build -t hermes-bot .

# Start the bot, mounting the config and messages directories
docker run --name hermes-bot --mount type=bind,source="$(pwd)"/config,target=/usr/src/app/config --mount type=bind,source="$(pwd)"/messages,target=/usr/src/app/messages -d hermes-bot

# Use `docker restart hermes-bot` to restart the bot after doing changes in config or messages.
```

## 💻 Command Deployment

When starting, you can use the `--deploy` flag if you want it to deploy commands. For example:

```bash
pnpm start --deploy
```

Or when running with Docker:

```bash
docker run --name hermes-bot --mount type=bind,source="$(pwd)"/config,target=/usr/src/app/config --mount type=bind,source="$(pwd)"/messages,target=/usr/src/app/messages -d hermes-bot --deploy
```

**Always** use this option in the first start, or when you have changed commands names, descriptions or options.
