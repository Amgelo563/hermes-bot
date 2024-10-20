import type {
  EmbedAuthorOptions,
  EmbedField,
  EmbedFooterOptions,
} from 'discord.js';
import {
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  escapeMarkdown,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
} from 'discord.js';
import { z } from 'zod';

import type { EscapeMarkdownConfig } from '../../config/configs/escape/EscapeMarkdownConfigSchema';
import type { DiscordButtonSchema } from '../../discord/button/DiscordButtonSchema';
import type { DiscordLinkButtonSchema } from '../../discord/button/DiscordLinkButtonSchema';
import type { DiscordEmbedFieldSchema } from '../../discord/embed/DiscordEmbedFieldSchema';
import { DiscordEmbedLimits } from '../../discord/embed/DiscordEmbedLimits';
import type { DiscordEmbedSchema } from '../../discord/embed/DiscordEmbedSchema';
import type { DiscordTemplatedEmbedSchema } from '../../discord/embed/DiscordTemplatedEmbedSchema';
import type { OptionalInlineField } from '../../discord/embed/OptionalInlineField';
import { SimplifiedModalBuilder } from '../../discord/modal/builder/SimplifiedModalBuilder';
import type { DiscordModalFieldSchema } from '../../discord/modal/schema/DiscordModalFieldSchema';
import { DiscordModalLimits } from '../../discord/modal/schema/DiscordModalLimits';
import type { DiscordModalSchema } from '../../discord/modal/schema/DiscordModalSchema';
import { DiscordSelectMenuLimits } from '../../discord/select/DiscordSelectMenuLimits';
import type { SelectMenuOptionSchemaType } from '../../discord/select/DiscordSelectMenuOptionSchema';
import type {
  DiscordSelectMenuSchema,
  SelectMenuSchemaType,
} from '../../discord/select/DiscordSelectMenuSchema';
import type { EphemeralPlaceholderContext } from '../../message/placeholder/context/EphemeralPlaceholderContext';
import type { MessagePlaceholderManager } from '../../message/placeholder/MessagePlaceholderManager';
import type { Optional } from '../../types/Optional';
import type { WithRequired } from '../../types/WithRequired';
import type { HermesPlaceholderContext } from './context/HermesPlaceholderContext';
import type { ErrorEmbedsData } from './error/ErrorEmbedsData';
import type { ErrorEmbedsSchema } from './error/ErrorEmbedsSchema';

export class BasicHermesMessageParser<Schema extends z.ZodTypeAny> {
  public static HexSchema = z.string().min(7).max(7).startsWith('#');

  protected readonly placeholders: MessagePlaceholderManager<HermesPlaceholderContext>;

  protected readonly messages: z.infer<Schema>;

  protected readonly escapeConfig: EscapeMarkdownConfig;

  constructor(
    placeholders: MessagePlaceholderManager<HermesPlaceholderContext>,
    messages: z.infer<Schema>,
    escapeConfig: EscapeMarkdownConfig,
  ) {
    this.placeholders = placeholders;
    this.messages = messages;
    this.escapeConfig = escapeConfig;
  }

  public static IsHex: (input: string) => input is `#${string}` = (
    input: string,
  ): input is `#${string}` => {
    return BasicHermesMessageParser.HexSchema.safeParse(input).success;
  };

  public parseEmbed(
    config: z.infer<typeof DiscordEmbedSchema>,
    context: HermesPlaceholderContext,
    ephemeralContext?: EphemeralPlaceholderContext,
    descriptionLimit?: number,
  ): EmbedBuilder {
    const builder = new EmbedBuilder();

    if (config.title) {
      const parsed = this.parsePlaceholders(
        config.title,
        context,
        DiscordEmbedLimits.Title,
        ephemeralContext,
      );
      builder.setTitle(parsed);
    }

    if (config.description) {
      const parsed = this.parsePlaceholders(
        config.description,
        context,
        descriptionLimit ?? DiscordEmbedLimits.Description,
        ephemeralContext,
      );
      builder.setDescription(parsed);
    }

    if (config.url) {
      const parsed = this.parseUrl(config.url, context, ephemeralContext);

      if (parsed) {
        builder.setURL(parsed);
      }
    }

    if (config.color) {
      const colorString = this.parsePlaceholders(
        config.color,
        context,
        undefined,
        ephemeralContext,
      );
      const color = BasicHermesMessageParser.IsHex(colorString)
        ? colorString
        : '#000000';

      builder.setColor(color);
    }

    if (config.thumbnail) {
      const parsed = this.parseUrl(config.thumbnail, context, ephemeralContext);

      if (parsed) {
        builder.setThumbnail(parsed);
      }
    }

    if (config.image) {
      const parsed = this.parseUrl(config.image, context, ephemeralContext);

      if (parsed) {
        builder.setImage(parsed);
      }
    }

    if (config.author) {
      const name = this.parsePlaceholders(
        config.author.name,
        context,
        DiscordEmbedLimits.Author,
        ephemeralContext,
      );
      const authorOptions: EmbedAuthorOptions = { name };

      if (config.author.url) {
        const parsed = this.parseUrl(
          config.author.url,
          context,
          ephemeralContext,
        );

        if (parsed) {
          authorOptions.url = parsed;
        }
      }

      if (config.author.icon) {
        const parsed = this.parseUrl(
          config.author.icon,
          context,
          ephemeralContext,
        );

        if (parsed) {
          authorOptions.iconURL = parsed;
        }
      }

      builder.setAuthor(authorOptions);
    }

    if (config.footer) {
      const text = this.parsePlaceholders(
        config.footer.text,
        context,
        DiscordEmbedLimits.Footer,
        ephemeralContext,
      );
      const footerOptions: EmbedFooterOptions = { text };

      if (config.footer.icon) {
        const parsed = this.parseUrl(
          config.footer.icon,
          context,
          ephemeralContext,
        );

        if (parsed) {
          footerOptions.iconURL = parsed;
        }
      }

      builder.setFooter(footerOptions);
    }

    if (!config.fields) {
      return builder;
    }

    for (const field of config.fields) {
      const data = this.parseEmbedField(
        field,
        context,
        undefined,
        ephemeralContext,
      );

      builder.addFields(data);
    }

    return builder;
  }

  public parseTemplatedEmbed(
    config: z.infer<typeof DiscordTemplatedEmbedSchema>,
    context: HermesPlaceholderContext,
    dataContexts: HermesPlaceholderContext[],
    inlineOverride?: boolean,
  ): EmbedBuilder {
    const builder = this.parseEmbed(config, context);
    const template = config.fieldsTemplate;

    for (const dataContext of dataContexts) {
      const data = this.parseEmbedField(template, dataContext, inlineOverride);

      builder.addFields(data);
    }

    return builder;
  }

  public parseButton(
    config: z.infer<typeof DiscordButtonSchema>,
    context: HermesPlaceholderContext,
  ): ButtonBuilder {
    const builder = new ButtonBuilder()
      .setStyle(config.style)
      .setLabel(this.parsePlaceholders(config.label, context));

    if (config.emoji) {
      builder.setEmoji(this.parsePlaceholders(config.emoji, context));
    }

    return builder;
  }

  public parseLinkButton(
    config: z.infer<typeof DiscordLinkButtonSchema>,
    context: HermesPlaceholderContext,
    url: string,
  ): ButtonBuilder {
    const builder = new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel(this.parsePlaceholders(config.label, context))
      .setURL(url);

    if (config.emoji) {
      builder.setEmoji(this.parsePlaceholders(config.emoji, context));
    }

    return builder;
  }

  public parseSelect(
    config: z.infer<typeof DiscordSelectMenuSchema>,
    context: HermesPlaceholderContext,
  ): StringSelectMenuBuilder {
    return new StringSelectMenuBuilder().setPlaceholder(
      this.parsePlaceholders(
        config.placeholder,
        context,
        DiscordSelectMenuLimits.Placeholder,
      ),
    );
  }

  public parseSelectWithOptions<Option extends string>(
    config: SelectMenuSchemaType<Option>,
    context: HermesPlaceholderContext,
    values: Record<Option, string>,
  ): StringSelectMenuBuilder {
    const builder = this.parseSelect(config, context);

    for (const [key, option] of Object.entries(config.options)) {
      const value = values[key as Option];
      const optionBuilder = this.parseSelectOption(option, context, value);
      builder.addOptions(optionBuilder);
    }

    return builder;
  }

  public parseSelectOption(
    config: SelectMenuOptionSchemaType,
    context: HermesPlaceholderContext,
    value: string,
  ): StringSelectMenuOptionBuilder {
    const option = new StringSelectMenuOptionBuilder()
      .setLabel(
        this.parsePlaceholders(
          config.label,
          context,
          DiscordSelectMenuLimits.Option.Label,
        ),
      )
      .setValue(value);

    if (config.emoji) {
      option.setEmoji(this.parsePlaceholders(config.emoji, context));
    }

    if (config.description) {
      option.setDescription(
        this.parsePlaceholders(
          config.description,
          context,
          DiscordSelectMenuLimits.Option.Description,
        ),
      );
    }

    return option;
  }

  public parseModal(
    config: z.infer<typeof DiscordModalSchema>,
  ): SimplifiedModalBuilder {
    return new SimplifiedModalBuilder().setTitle(
      this.slice(config.title, DiscordModalLimits.Title),
    );
  }

  public parseModalField(
    config: z.infer<typeof DiscordModalFieldSchema>,
  ): TextInputBuilder {
    const builder = new TextInputBuilder().setLabel(
      this.slice(config.label, DiscordModalLimits.Label),
    );

    if (config.placeholder) {
      builder.setPlaceholder(
        this.slice(config.placeholder, DiscordModalLimits.Placeholder),
      );
    }

    return builder;
  }

  public parseEmbedField(
    config: z.infer<typeof DiscordEmbedFieldSchema>,
    context: HermesPlaceholderContext,
    inlineOverride?: boolean,
    ephemeralContext?: EphemeralPlaceholderContext,
  ): Optional<EmbedField, 'inline'> {
    return {
      name: this.parsePlaceholders(
        config.name,
        context,
        DiscordEmbedLimits.FieldName,
        ephemeralContext,
      ),
      value: this.parsePlaceholders(
        config.value,
        context,
        DiscordEmbedLimits.FieldValue,
        ephemeralContext,
      ),
      inline: inlineOverride === undefined ? config.inline : inlineOverride,
    };
  }

  public getRaw(): z.infer<Schema> {
    return this.messages;
  }

  protected parsePlaceholders(
    input: string,
    context: HermesPlaceholderContext,
    max?: number,
    ephemeralContext?: EphemeralPlaceholderContext,
  ): string {
    const replaced = this.placeholders.replace(
      input,
      context,
      ephemeralContext,
    );
    if (max) {
      return this.slice(replaced, max);
    }

    return replaced;
  }

  protected parseUrl(
    input: string,
    context: HermesPlaceholderContext,
    ephemeralContext?: EphemeralPlaceholderContext,
  ): string | null {
    const parsed = this.parsePlaceholders(
      input,
      context,
      undefined,
      ephemeralContext,
    );

    try {
      const url = new URL(parsed);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return null;
      }

      return parsed;
    } catch (e) {
      return null;
    }
  }

  protected parseErrorEmbeds(
    embeds: z.infer<typeof ErrorEmbedsSchema>,
    context: WithRequired<HermesPlaceholderContext, 'error'>,
  ): ErrorEmbedsData {
    return {
      log: this.parseEmbed(embeds.log, context),
      user: this.parseEmbed(embeds.user, context),
    };
  }

  protected escape(text: string): string {
    const markdown = escapeMarkdown(text, this.escapeConfig);

    return this.placeholders.escapePlaceholders(markdown);
  }

  protected slice(string: string, maxLength: number): string {
    if (string.length > maxLength) {
      return `${string.slice(0, maxLength - 1)}…`;
    }

    return string;
  }

  protected getRequirementEmbed(
    embed: z.infer<typeof DiscordTemplatedEmbedSchema>,
    context: HermesPlaceholderContext,
    requirements: OptionalInlineField[],
  ): EmbedBuilder {
    const { fieldsTemplate: template } = embed;

    const builder = this.parseEmbed(embed, context);

    const dataContexts: HermesPlaceholderContext[] = requirements.map(
      (missing) => ({
        ...context,
        missingRequirement: {
          name: missing.name,
          description: missing.value,
          inline: missing.inline,
        },
      }),
    );

    for (const dataContext of dataContexts) {
      const data = this.parseEmbedField(
        template,
        dataContext,
        dataContext.missingRequirement?.inline,
      );

      builder.addFields(data);
    }

    return builder;
  }
}
