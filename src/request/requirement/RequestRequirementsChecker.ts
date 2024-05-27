import type { NyxBot, SessionStartInteraction } from '@nyx-discord/core';
import type { GuildMember } from 'discord.js';
import type { HermesConfigWrapper } from '../../config/HermesConfigWrapper';
import type { OfferRepository } from '../../hermes/database/OfferRepository';
import type { RequestRepository } from '../../hermes/database/RequestRepository';
import type { HermesPlaceholderContext } from '../../hermes/message/context/HermesPlaceholderContext';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import { BasicHermesRequirementChecker } from '../../hermes/requirement/check/BasicHermesRequirementChecker';
import { CooldownRepostRequirementFactory } from '../../hermes/requirement/factories/CooldownRepostRequirementFactory';
import { HasRolesRequirementFactory } from '../../hermes/requirement/factories/HasRolesRequirementFactory';
import { SearchRequirementFactory } from '../../hermes/requirement/factories/SearchRequirementFactory';
import { HermesRequirementResultHandler } from '../../hermes/requirement/handler/HermesRequirementResultHandler';
import { RequirementCheckModeEnum } from '../../requirement/mode/RequirementCheckMode';
import type { ServiceActionInteraction } from '../../service/action/interaction/ServiceActionInteraction';
import type { RequestData } from '../../service/request/RequestData';
import { MaxServicesEditRequirementFactory } from '../../service/requirements/MaxServicesEditRequirementFactory';
import type { RequestSessionRequirementFactory } from './edit/RequestSessionRequirementFactory';
import { SearchOffersRequirementFactory } from './edit/search/SearchOffersRequirementFactory';
import { HasTagRequestEditRequirementFactory } from './edit/tag/HasTagRequestEditRequirementFactory';
import type { RequestRepostRequirementFactory } from './repost/RequestRepostRequirementFactory';
import type { RequestRequirementsMap } from './RequestRequirementsMap';

// eslint-disable-next-line max-len
export class RequestRequirementsChecker extends BasicHermesRequirementChecker<RequestRequirementsMap> {
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
    requestRepository: RequestRepository,
    offerRepository: OfferRepository,
  ) {
    const messages = messageService.getRequestMessages();

    const publishRequirements: RequestSessionRequirementFactory[] = [
      new HasRolesRequirementFactory(
        messages,
        (data) => data.interaction.member as GuildMember,
        config.isStaff.bind(config),
      ),
      new SearchOffersRequirementFactory(messages, offerRepository),
      new HasTagRequestEditRequirementFactory(messages),
      new SearchRequirementFactory(messages, (data) => data.request),
      new MaxServicesEditRequirementFactory(
        messages,
        offerRepository,
        requestRepository,
      ),
    ];

    const repostRequirements: RequestRepostRequirementFactory[] = [
      new CooldownRepostRequirementFactory(messages),
      new HasRolesRequirementFactory(
        messages,
        (data) => data.interaction.member as GuildMember,
        config.isStaff.bind(config),
      ),
    ];

    const updateRequirements: RequestSessionRequirementFactory[] = [
      new SearchRequirementFactory(messages, (data) => data.request),
    ];

    const handler = new HermesRequirementResultHandler(bot, messageService);
    const checker = new RequestRequirementsChecker(handler, messageService);

    checker
      .setAvailableRequirements(
        RequirementCheckModeEnum.Publish,
        publishRequirements,
      )
      .setAvailableRequirements(
        RequirementCheckModeEnum.Repost,
        repostRequirements,
      )
      .setAvailableRequirements(
        RequirementCheckModeEnum.Update,
        updateRequirements,
      );

    return checker;
  }

  public async checkRepostAndHandle(
    context: HermesPlaceholderContext,
    request: RequestData,
    interaction: ServiceActionInteraction,
  ): Promise<boolean> {
    const result = await this.checkRepost(context, {
      repost: request,
      interaction,
    });
    const offerMessages = this.messageService.getRequestMessages();

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
