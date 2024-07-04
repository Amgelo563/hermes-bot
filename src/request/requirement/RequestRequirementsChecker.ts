import type { NyxBot, SessionStartInteraction } from '@nyx-discord/core';
import { BlacklistRequirement } from '../../blacklist/requirement/BlacklistRequirement';
import type { HermesConfigWrapper } from '../../config/file/HermesConfigWrapper';
import type { HermesDatabaseService } from '../../hermes/database/HermesDatabaseService';
import type { HermesPlaceholderContext } from '../../hermes/message/context/HermesPlaceholderContext';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import { BasicHermesRequirementChecker } from '../../hermes/requirement/check/BasicHermesRequirementChecker';
import { CooldownRepostRequirementFactory } from '../../hermes/requirement/factories/CooldownRepostRequirementFactory';
import { HasRolesRequirementFactory } from '../../hermes/requirement/factories/HasRolesRequirementFactory';
import { SearchRequirementFactory } from '../../hermes/requirement/factories/SearchRequirementFactory';
import { HermesRequirementResultHandler } from '../../hermes/requirement/handler/HermesRequirementResultHandler';
import { RequirementCheckModeEnum } from '../../requirement/mode/RequirementCheckMode';
import type { ServiceActionInteraction } from '../../service/action/interaction/ServiceActionInteraction';
import type { HermesMember } from '../../service/member/HermesMember';
import { MaxServicesEditRequirementFactory } from '../../service/requirements/MaxServicesEditRequirementFactory';
import type { RequestData } from '../data/RequestData';
import type { DiscordRequestAgent } from '../discord/DiscordRequestAgent';
import type { RequestSessionRequirement } from './edit/RequestSessionRequirement';
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
    databaseService: HermesDatabaseService,
    agent: DiscordRequestAgent,
  ) {
    const offerRepository = databaseService.getOfferRepository();
    const requestRepository = databaseService.getRequestRepository();
    const requestMessages = messageService.getRequestMessages();

    const publishRequirements: RequestSessionRequirementFactory[] = [
      new HasRolesRequirementFactory(
        requestMessages,
        (data) => data.member,
        config.isStaff.bind(config),
      ),
      new SearchOffersRequirementFactory(requestMessages, offerRepository),
      new HasTagRequestEditRequirementFactory(requestMessages),
      new SearchRequirementFactory(requestMessages, (data) => data.request),
      new MaxServicesEditRequirementFactory(
        requestMessages,
        offerRepository,
        requestRepository,
      ),
    ];

    const repostRequirements: RequestRepostRequirementFactory[] = [
      new CooldownRepostRequirementFactory(requestMessages),
      new HasRolesRequirementFactory(
        requestMessages,
        (data) => data.member,
        config.isStaff.bind(config),
      ),
    ];

    const updateRequirements: RequestSessionRequirementFactory[] = [
      new SearchRequirementFactory(requestMessages, (data) => data.request),
    ];

    const systemRequirements: RequestSessionRequirement[] = [
      new BlacklistRequirement(
        messageService.getBlacklistMessages(),
        databaseService.getBlacklistRepository(),
        agent,
      ),
    ];

    const handler = new HermesRequirementResultHandler(bot, messageService);
    const checker = new RequestRequirementsChecker(handler, messageService);

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
    request: RequestData,
    interaction: ServiceActionInteraction,
    member: HermesMember,
  ): Promise<boolean> {
    const result = await this.checkRepost(context, {
      repost: request,
      interaction,
      member,
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
