import type { NyxBot } from '@nyx-discord/core';
import { IllegalStateError } from '@nyx-discord/core';
import type { ApplicationCommand } from 'discord.js';

import type { HermesPlaceholderReplacer } from '../../hermes/message/placeholder/HermesPlaceholderReplacer';
import type { MessagePlaceholder } from '../../message/placeholder/MessagePlaceholder';

// A more type safe return type of String#split()
type SplitReturnType = [string, ...(string | undefined)[]];

export class BotCommandPlaceholderReplacer
  implements HermesPlaceholderReplacer
{
  protected readonly commands: ApplicationCommand[];

  constructor(commands: ApplicationCommand[]) {
    this.commands = commands;
  }

  public static async fromBot(
    bot: NyxBot,
  ): Promise<BotCommandPlaceholderReplacer> {
    const commandMap = await bot.getClient().application?.commands.fetch();
    if (!commandMap) throw new IllegalStateError();

    const commands = Array.from(commandMap.values());
    return new BotCommandPlaceholderReplacer(commands);
  }

  public replace(placeholder: MessagePlaceholder): string | null {
    const commandsArg = placeholder.values[0];
    if (!commandsArg) return null;

    const commandNameArgs = commandsArg.split(':') as SplitReturnType;
    const [topLevelName] = commandNameArgs;

    const commandMapping = this.commands.find(
      (command) => command.name === topLevelName,
    );
    if (!commandMapping) return null;

    return `</${commandNameArgs.join(' ')}:${commandMapping.id}>`;
  }

  public getNamespace(): string {
    return 'command';
  }
}
