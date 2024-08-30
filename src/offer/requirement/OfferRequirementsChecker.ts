import type { NyxBot, SessionStartInteraction } from '@nyx-discord/core';

import { BlacklistRequirement } from '../../blacklist/requirement/BlacklistRequirement';
import type { HermesConfigWrapper } from '../../config/file/HermesConfigWrapper';
import type { HermesDatabaseService } from '../../hermes/database/HermesDatabaseService';
import type { HermesPlaceholderContext } from '../../hermes/message/context/HermesPlaceholderContext';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import { BasicHermesRequirementChecker } from '../../hermes/requirement/check/BasicHermesRequirementChecker';
import { CooldownRepostRequirementFactory } from '../../hermes/requirement/factories/CooldownRepostRequirementFactory';
import { HasLevelRequirementFactory } from '../../hermes/requirement/factories/HasLevelRequirementFactory';
import { HasRolesRequirementFactory } from '../../hermes/requirement/factories/HasRolesRequirementFactory';
import { SearchRequirementFactory } from '../../hermes/requirement/factories/SearchRequirementFactory';
import { HermesRequirementResultHandler } from '../../hermes/requirement/handler/HermesRequirementResultHandler';
import { RequirementCheckModeEnum } from '../../requirement/mode/RequirementCheckMode';
import type { ServiceActionInteraction } from '../../service/action/interaction/ServiceActionInteraction';
import type { HermesMember } from '../../service/member/HermesMember';
import { MaxServicesRequirementFactory } from '../../service/requirements/MaxServicesRequirementFactory';
import type { OfferData } from '../data/OfferData';
import type { DiscordOfferAgent } from '../discord/DiscordOfferAgent';
import type { OfferSessionRequirement } from './edit/OfferSessionRequirement';
import type { OfferSessionRequirementFactory } from './edit/OfferSessionRequirementFactory';
import { HasTagOfferEditRequirementFactory } from './edit/tag/HasTagOfferEditRequirementFactory';
import type { OfferRequirementsMap } from './OfferRequirementsMap';
import type { OfferRepostRequirementFactory } from './repost/OfferRepostRequirementFactory';

export class OfferRequirementsChecker extends BasicHermesRequirementChecker<OfferRequirementsMap> {
  protected readonly handler: HermesRequirementResultHandler;

  protected readonly messageService: HermesMessageService;

  constructor(
    handler: HermesRequirementResultHandler,
    messageService: HermesMessageService,
  ) {
    super();
    this.handler = handler;
    this.messageService = messageService;
  }

  public static create(
    bot: NyxBot,
    config: HermesConfigWrapper,
    messageService: HermesMessageService,
    databaseService: HermesDatabaseService,
    agent: DiscordOfferAgent,
  ): OfferRequirementsChecker {
    const offerMessages = messageService.getOfferMessages();

    const offerRepository = databaseService.getOfferRepository();
    const requestRepository = databaseService.getRequestRepository();

    const publishRequirements: OfferSessionRequirementFactory[] = [
      new HasRolesRequirementFactory(
        offerMessages,
        (data) => data.member,
        config.isStaff.bind(config),
      ),
      new HasTagOfferEditRequirementFactory(offerMessages),
      new SearchRequirementFactory(offerMessages, (data) => data.offer),
      new MaxServicesRequirementFactory(
        offerMessages,
        offerRepository,
        requestRepository,
      ),
      new HasLevelRequirementFactory(offerMessages, (data) => data.member),
    ];

    const repostRequirements: OfferRepostRequirementFactory[] = [
      new CooldownRepostRequirementFactory(offerMessages),
      new HasRolesRequirementFactory(
        offerMessages,
        (data) => data.member,
        config.isStaff.bind(config),
      ),
      new HasLevelRequirementFactory(offerMessages, (data) => data.member),
    ];

    const updateRequirements: OfferSessionRequirementFactory[] = [
      new SearchRequirementFactory(offerMessages, (data) => data.offer),
      new HasLevelRequirementFactory(offerMessages, (data) => data.member),
    ];

    const systemRequirements: OfferSessionRequirement[] = [
      new BlacklistRequirement(
        messageService.getBlacklistMessages(),
        databaseService.getBlacklistRepository(),
        agent,
      ),
    ];

    const handler = new HermesRequirementResultHandler(bot, messageService);
    const checker = new OfferRequirementsChecker(handler, messageService);

    checker
      .setUserAvailableRequirements(
        RequirementCheckModeEnum.Publish,
        publishRequirements,
      )
      .setUserAvailableRequirements(
        RequirementCheckModeEnum.Repost,
        repostRequirements,
      )
      .setUserAvailableRequirements(
        RequirementCheckModeEnum.Update,
        updateRequirements,
      )
      .setSystemRequirements(systemRequirements);

    return checker;
  }

  public async checkRepostAndHandle(
    context: HermesPlaceholderContext,
    offer: OfferData,
    interaction: ServiceActionInteraction,
    member: HermesMember,
  ): Promise<boolean> {
    const result = await this.checkRepost(context, {
      repost: offer,
      interaction,
      member,
    });
    const offerMessages = this.messageService.getOfferMessages();

    return this.handler.handle(
      result,
      interaction as SessionStartInteraction,
      context,
      {
        getWarnEmbed: offerMessages.getRepostWarnEmbed.bind(offerMessages),
        getDenyEmbed: offerMessages.getRepostDenyEmbed.bind(offerMessages),
      },
    );
  }
}
