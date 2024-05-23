import type { NyxBot, SessionStartInteraction } from '@nyx-discord/core';
import type { GuildMember } from 'discord.js';

import type { OfferSessionData } from '../../bot/offer/sessions/OfferSessionData';
import type { HermesConfigWrapper } from '../../config/HermesConfigWrapper';
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
import type { OfferData } from '../../service/offer/OfferData';
import { MaxServicesEditRequirement } from '../../service/requirements/MaxServicesEditRequirement';
import { HasTagOfferEditRequirement } from './edit/HasTagOfferEditRequirement';
import type { OfferSessionRequirement } from './edit/OfferSessionRequirement';
import type { OfferRequirementsMap } from './OfferRequirementsMap';
import type { OfferRepostRequirement } from './repost/OfferRepostRequirement';

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
    offerRepository: OfferRepository,
    requestRepository: RequestRepository,
  ): OfferRequirementsChecker {
    const messages = messageService.getOfferMessages();

    const publishRequirements: OfferSessionRequirement[] = [
      new HasRolesRequirement(
        messages,
        (data) => data.interaction.member as GuildMember,
        config.isStaff.bind(config),
      ),
      new HasTagOfferEditRequirement(messages),
      new SearchRequirement<OfferSessionData>(messages, (data) => data.offer),
      new MaxServicesEditRequirement(
        messages,
        offerRepository,
        requestRepository,
      ),
    ];

    const repostRequirements: OfferRepostRequirement[] = [
      new CooldownRepostRequirement(messages),
      new HasRolesRequirement(
        messages,
        (data) => data.interaction.member as GuildMember,
        config.isStaff.bind(config),
      ),
    ];

    const updateRequirements: OfferSessionRequirement[] = [
      new SearchRequirement(messages, (data) => data.offer),
    ];

    const handler = new HermesRequirementResultHandler(bot, messageService);
    const checker = new OfferRequirementsChecker(handler, messageService);

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
    offer: OfferData,
    interaction: ServiceActionInteraction,
  ): Promise<boolean> {
    const result = await this.checkRepost(context, {
      repost: offer,
      interaction,
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
