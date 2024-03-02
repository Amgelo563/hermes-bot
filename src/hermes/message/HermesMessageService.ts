import type {
  Identifier,
  Logger,
} from '@nyx-discord/core';
import type { z } from 'zod';

import type { EscapeMarkdownConfig } from '../../config/escape/EscapeMarkdownConfigSchema';
import type { HermesConfig } from '../../config/HermesConfigSchema';
import { MessageService } from '../../message/MessageService';
import { MessagePlaceholderManager } from '../../message/placeholder/MessagePlaceholderManager';
import { MessageRepository } from '../../message/repository/MessageRepository';
import type { MessageSource } from '../../message/source/MessageSource';
import { OfferMessagesParser } from '../../offer/message/OfferMessagesParser';
import { OfferMessagesReader } from '../../offer/message/OfferMessagesReader';
import type { OfferMessagesSchema } from '../../offer/message/OfferMessagesSchema';
import { RequestMessagesParser } from '../../request/message/RequestMessagesParser';
import { RequestMessagesReader } from '../../request/message/RequestMessagesReader';
import type { RequestMessagesSchema } from '../../request/message/RequestMessagesSchema';
import { TagMessagesParser } from '../../tag/message/TagMessagesParser';
import { TagsMessagesReader } from '../../tag/message/TagsMessagesReader';
import type { TagsMessagesSchema } from '../../tag/message/TagsMessagesSchema';
import { BasicHermesMessageParser } from './BasicHermesMessageParser';
import type { HermesPlaceholderContext } from './context/HermesPlaceholderContext';
import { GeneralMessagesParser } from './general/GeneralMessagesParser';
import { GeneralMessagesReader } from './general/GeneralMessagesReader';
import type { GeneralMessagesSchema } from './general/GeneralMessagesSchema';
import type { HermesPlaceholderReplacer } from './placeholder/abstract/HermesPlaceholderReplacer';
import { ConfigPlaceholderReplacer } from './placeholder/ConfigPlaceholderReplacer';
import { ErrorPlaceholderReplacer } from './placeholder/ErrorPlaceholderReplacer';
import { MissingRequirementPlaceholderReplacer } from './placeholder/MissingRequirementPlaceholderReplacer';
import { OfferPlaceholderReplacer } from './placeholder/OfferPlaceholderReplacer';
import { RequestPlaceholderReplacer } from './placeholder/RequestPlaceholderReplacer';
import { TagPlaceholderReplacer } from './placeholder/TagPlaceholderReplacer';
import { UpdatePlaceholderReplacer } from './placeholder/UpdatePlaceholderReplacer';
import { UserPlaceholderReplacer } from './placeholder/UserPlaceholderReplacer';

/** Service responsible for message reading and parsing. */
export class HermesMessageService extends MessageService<HermesPlaceholderContext> {
  protected readonly logger: Logger;

  protected readonly escapeConfig: EscapeMarkdownConfig;

  protected readonly config: HermesConfig;

  protected generalParser: GeneralMessagesParser | null = null;

  protected offerParser: OfferMessagesParser | null = null;

  protected requestParser: RequestMessagesParser | null = null;

  protected tagsParser: TagMessagesParser | null = null;

  constructor(
    placeholder: MessagePlaceholderManager<HermesPlaceholderContext>,
    repository: MessageRepository,
    logger: Logger,
    config: HermesConfig,
  ) {
    super(placeholder, repository);
    this.logger = logger;
    this.config = config;
    this.escapeConfig = config.general.escapeMarkdown;
  }

  public static create(
    config: HermesConfig,
    logger: Logger,
  ): HermesMessageService {
    const lang = config.general.language;

    const sources: [Identifier, MessageSource<object>][] = [
      [GeneralMessagesReader.ID, new GeneralMessagesReader(lang)],
      [OfferMessagesReader.ID, new OfferMessagesReader(lang)],
      [RequestMessagesReader.ID, new RequestMessagesReader(lang)],
      [TagsMessagesReader.ID, new TagsMessagesReader(lang)],
    ];

    const repository = new MessageRepository(new Map(sources));

    const placeholder =
      MessagePlaceholderManager.create<HermesPlaceholderContext>();

    return new HermesMessageService(placeholder, repository, logger, config);
  }

  public async start() {
    for (const source of this.repository.getSources().values()) {
      await this.repository.fetchFromSource(source.getId());
    }

    const placeholder = this.placeholderManager;

    const replacers: HermesPlaceholderReplacer[] = [
      new UserPlaceholderReplacer(),
      new ErrorPlaceholderReplacer(),
      new UpdatePlaceholderReplacer(),
      new TagPlaceholderReplacer(),
      new OfferPlaceholderReplacer(placeholder),
      new RequestPlaceholderReplacer(placeholder),
      new MissingRequirementPlaceholderReplacer(),
      new ConfigPlaceholderReplacer(this.config),
    ];

    placeholder.addReplacers(replacers);

    await this.placeholderManager.start();
  }

  public getGenericParser(): BasicHermesMessageParser<z.ZodTypeAny> {
    return new BasicHermesMessageParser(
      this.placeholderManager,
      {},
      this.escapeConfig,
    );
  }

  public getGeneralMessages(): GeneralMessagesParser {
    if (this.generalParser) {
      return this.generalParser;
    }

    const config = this.repository.getFromSource(GeneralMessagesReader.ID);

    this.generalParser = new GeneralMessagesParser(
      this.placeholderManager,
      config as z.infer<typeof GeneralMessagesSchema>,
      this.escapeConfig,
    );

    return this.generalParser;
  }

  public getOfferMessages(): OfferMessagesParser {
    if (this.offerParser) {
      return this.offerParser;
    }

    const config = this.repository.getFromSource(OfferMessagesReader.ID);

    this.offerParser = new OfferMessagesParser(
      this.placeholderManager,
      config as z.infer<typeof OfferMessagesSchema>,
      this.escapeConfig,
    );

    return this.offerParser;
  }

  public getRequestMessages(): RequestMessagesParser {
    if (this.requestParser) {
      return this.requestParser;
    }

    const config = this.repository.getFromSource(RequestMessagesReader.ID);

    this.requestParser = new RequestMessagesParser(
      this.placeholderManager,
      config as z.infer<typeof RequestMessagesSchema>,
      this.escapeConfig,
    );

    return this.requestParser;
  }

  public getTagsMessages(): TagMessagesParser {
    if (this.tagsParser) {
      return this.tagsParser;
    }

    const config = this.repository.getFromSource(TagsMessagesReader.ID);

    this.tagsParser = new TagMessagesParser(
      this.placeholderManager,
      config as z.infer<typeof TagsMessagesSchema>,
      this.escapeConfig,
    );

    return this.tagsParser;
  }
}
