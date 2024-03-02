import type { NyxBot, ReadonlyCommandRepository } from '@nyx-discord/core';
import type { MessagePlaceholder } from '../../../message/placeholder/MessagePlaceholder';
import type { HermesPlaceholderReplacer } from './abstract/HermesPlaceholderReplacer';

// A more type safe return type of String#split()
type SplitReturnType = [string, ...(string | undefined)[]];

export class CommandPlaceholderReplacer implements HermesPlaceholderReplacer {
  protected readonly commands: ReadonlyCommandRepository;

  constructor(commands: ReadonlyCommandRepository) {
    this.commands = commands;
  }

  public static fromBot(bot: NyxBot): CommandPlaceholderReplacer {
    return new CommandPlaceholderReplacer(bot.commands.getRepository());
  }

  public replace(placeholder: MessagePlaceholder): string | null {
    const commandsArg = placeholder.values[0];
    if (!commandsArg) return null;

    const commandNameArgs = commandsArg.split(':') as SplitReturnType;
    const [topLevelName] = commandNameArgs;

    const commands = this.commands.getCommands();

    const topLevelCommand = commands.find(
      (c) => c.getData().name === topLevelName,
    );
    if (!topLevelCommand) return this.defaultFormat(commandNameArgs);

    const mappings = this.commands.getMappings();
    const ids = mappings.get(topLevelCommand.getId());

    // TODO: I don't have the mental power or time to implement support for standalone commands with multiple contexts
    if (!ids || ids.length > 1) return this.defaultFormat(commandNameArgs);

    const commandMapping = ids[0];

    return `</${commandNameArgs.join(' ')}:${commandMapping.id}>`;
  }

  public getNamespace(): string {
    return 'command';
  }

  protected defaultFormat(commandArgs: SplitReturnType): string {
    return `\`/${commandArgs.join(' ')}\``;
  }
}
