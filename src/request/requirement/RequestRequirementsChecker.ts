import type { NyxBot, SessionStartInteraction } from '@nyx-discord/core';
import type { GuildMember } from 'discord.js';
import type { OfferRepository } from '../../hermes/database/OfferRepository';
import type { RequestRepository } from '../../hermes/database/RequestRepository';
import type { HermesPlaceholderContext } from '../../hermes/message/context/HermesPlaceholderContext';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import { BasicHermesRequirementChecker } from '../../hermes/requirement/check/BasicHermesRequirementChecker';
import { HermesRequirementResultHandler } from '../../hermes/requirement/handler/HermesRequirementResultHandler';
import { CooldownRepostRequirement } from '../../hermes/requirement/requirements/CooldownRepostRequirement';
import { HasRolesRequirement } from '../../hermes/requirement/requirements/HasRolesRequirement';
import { SearchRequirement } from '../../hermes/requirement/requirements/SearchRequirement';
import { RequirementCheckModeEnum } from '../../requirement/mode/RequirementCheckMode';
import type { ServiceActionInteraction } from '../../service/action/interaction/ServiceActionInteraction';
import type { RequestData } from '../../service/request/RequestData';
import { MaxServicesEditRequirement } from '../../service/requirements/MaxServicesEditRequirement';
import { HasTagRequestEditRequirement } from './edit/HasTagRequestEditRequirement';
import type { RequestSessionRequirement } from './edit/RequestSessionRequirement';
import { SearchOffersRequirement } from './edit/SearchOffersRequirement';
import type { RequestRepostRequirement } from './repost/RequestRepostRequirement';
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
    messageService: HermesMessageService,
    requestRepository: RequestRepository,
    offerRepository: OfferRepository,
  ) {
    const messages = messageService.getRequestMessages();

    const publishRequirements: RequestSessionRequirement[] = [
      new HasRolesRequirement(
        messages,
        (data) => data.interaction.member as GuildMember,
      ),
      new SearchOffersRequirement(messages, offerRepository),
      new HasTagRequestEditRequirement(messages),
      new SearchRequirement(messages, (data) => data.request),
      new MaxServicesEditRequirement(
        messages,
        offerRepository,
        requestRepository,
      ),
    ];

    const repostRequirements: RequestRepostRequirement[] = [
      new CooldownRepostRequirement(messages),
      new HasRolesRequirement(
        messages,
        (data) => data.interaction.member as GuildMember,
      ),
    ];

    const updateRequirements: RequestSessionRequirement[] = [
      new SearchRequirement(messages, (data) => data.request),
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
