import type {
  Identifier,
  Logger,
} from '@nyx-discord/core';
import type { z } from 'zod';
import { BlacklistPlaceholderReplacer } from '../../blacklist/message/placeholder/BlacklistPlaceholderReplacer';
import { BlacklistMessagesParser } from '../../blacklist/message/read/BlacklistMessagesParser';
import { BlacklistMessagesReader } from '../../blacklist/message/read/BlacklistMessagesReader';
import type { BlacklistMessagesSchema } from '../../blacklist/message/read/BlacklistMessagesSchema';

import type { EscapeMarkdownConfig } from '../../config/configs/escape/EscapeMarkdownConfigSchema';
import type { HermesConfig } from '../../config/file/HermesConfigSchema';
import { ConfigPlaceholderReplacer } from '../../config/message/ConfigPlaceholderReplacer';
import { ErrorPlaceholderReplacer } from '../../error/message/ErrorPlaceholderReplacer';
import { MessageService } from '../../message/MessageService';
import { MessagePlaceholderManager } from '../../message/placeholder/MessagePlaceholderManager';
import { MessageRepository } from '../../message/repository/MessageRepository';
import type { MessageSource } from '../../message/source/MessageSource';
import { OfferPlaceholderReplacer } from '../../offer/message/placeholder/OfferPlaceholderReplacer';
import { OfferMessagesParser } from '../../offer/message/read/OfferMessagesParser';
import { OfferMessagesReader } from '../../offer/message/read/OfferMessagesReader';
import type { OfferMessagesSchema } from '../../offer/message/read/OfferMessagesSchema';
import { RequestPlaceholderReplacer } from '../../request/message/placeholder/RequestPlaceholderReplacer';
import { RequestMessagesParser } from '../../request/message/read/RequestMessagesParser';
import { RequestMessagesReader } from '../../request/message/read/RequestMessagesReader';
import type { RequestMessagesSchema } from '../../request/message/read/RequestMessagesSchema';
import { HermesMemberPlaceholderReplacer } from '../../service/member/message/HermesMemberPlaceholderReplacer';
import { TagPlaceholderReplacer } from '../../tag/message/placeholder/TagPlaceholderReplacer';
import { TagMessagesParser } from '../../tag/message/TagMessagesParser';
import { TagsMessagesReader } from '../../tag/message/TagsMessagesReader';
import type { TagsMessagesSchema } from '../../tag/message/TagsMessagesSchema';
import { MissingRequirementPlaceholderReplacer } from '../requirement/message/MissingRequirementPlaceholderReplacer';
import { BasicHermesMessageParser } from './BasicHermesMessageParser';
import type { HermesPlaceholderContext } from './context/HermesPlaceholderContext';
import { GeneralMessagesParser } from './messages/general/GeneralMessagesParser';
import { GeneralMessagesReader } from './messages/general/GeneralMessagesReader';
import type { GeneralMessagesSchema } from './messages/general/GeneralMessagesSchema';
import type { HermesPlaceholderReplacer } from './placeholder/HermesPlaceholderReplacer';
import { UpdatePlaceholderReplacer } from './placeholder/UpdatePlaceholderReplacer';

/** Service responsible for message reading and parsing. */
export class HermesMessageService extends MessageService<HermesPlaceholderContext> {
  protected readonly logger: Logger;

  protected readonly escapeConfig: EscapeMarkdownConfig;

  protected readonly config: HermesConfig;

  protected generalParser: GeneralMessagesParser | null = null;

  protected offerParser: OfferMessagesParser | null = null;

  protected requestParser: RequestMessagesParser | null = null;

  protected tagsParser: TagMessagesParser | null = null;

  protected blacklistParser: BlacklistMessagesParser | null = null;

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
      [BlacklistMessagesReader.ID, new BlacklistMessagesReader(lang)],
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
    const noTagsTag = this.getTagsMessages().getNoTagsTag();

    const replacers: HermesPlaceholderReplacer[] = [
      new HermesMemberPlaceholderReplacer(),
      new ErrorPlaceholderReplacer(),
      new UpdatePlaceholderReplacer(),
      new TagPlaceholderReplacer(),
      new OfferPlaceholderReplacer(placeholder, noTagsTag),
      new RequestPlaceholderReplacer(placeholder, noTagsTag),
      new MissingRequirementPlaceholderReplacer(),
      new ConfigPlaceholderReplacer(this.config),
      new BlacklistPlaceholderReplacer(
        this.getBlacklistMessages().getPermanentDuration(),
      ),
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

  public getBlacklistMessages(): BlacklistMessagesParser {
    if (this.blacklistParser) {
      return this.blacklistParser;
    }

    const config = this.repository.getFromSource(BlacklistMessagesReader.ID);

    this.blacklistParser = new BlacklistMessagesParser(
      this.placeholderManager,
      config as z.infer<typeof BlacklistMessagesSchema>,
      this.escapeConfig,
    );

    return this.blacklistParser;
  }
}
