import { z } from 'zod';
import type { OfferRepository } from '../../hermes/database/OfferRepository';
import type { RequestRepository } from '../../hermes/database/RequestRepository';
import type { BasicHermesMessageParser } from '../../hermes/message/BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../../hermes/message/context/HermesPlaceholderContext';
import { AbstractHermesRequirement } from '../../hermes/requirement/AbstractHermesRequirement';
import type { RequirementConfig } from '../../hermes/requirement/config/RequirementConfigSchema';
import { EmbedRequirementConfigSchema } from '../../hermes/requirement/config/RequirementConfigSchema';
import type { RequirementResultData } from '../../requirement/result/RequirementResultData';
import { RequirementResultEnum } from '../../requirement/result/RequirementResultEnum';

const MaxOffersRequirementSchema = EmbedRequirementConfigSchema.extend({
  max: z.number().min(1),
  overrides: z
    .object({
      role: z.string(),
      max: z.number().min(1),
    })
    .array()
    .optional(),
  type: z.enum(['offer', 'request']),
});

type MaxOffersRequirementConfig = z.infer<typeof MaxOffersRequirementSchema>;

export abstract class AbstractMaxServicesRequirement<
  Input,
> extends AbstractHermesRequirement<MaxOffersRequirementConfig, Input> {
  protected readonly offerRepository: OfferRepository;

  protected readonly requestRepository: RequestRepository;

  constructor(
    messages: BasicHermesMessageParser<z.ZodTypeAny>,
    offerRepository: OfferRepository,
    requestRepository: RequestRepository,
  ) {
    super(messages);
    this.offerRepository = offerRepository;
    this.requestRepository = requestRepository;
  }

  public async performCheck(
    context: HermesPlaceholderContext,
    object: Input,
    config: MaxOffersRequirementConfig,
  ): Promise<RequirementResultData> {
    const userId = this.getUserId(object);
    const roles = this.getRoles(object);

    const max =
      config.overrides
        ?.filter((override) => roles.includes(override.role))
        .reduce((max, override) => Math.max(max, override.max), config.max)
      ?? config.max;

    let services;

    if (config.type === 'offer') {
      services = await this.offerRepository.fetchFrom(userId, max);
    } else {
      services = await this.requestRepository.fetchFrom(userId, max);
    }

    if (!services || services.length < max) {
      return {
        allowed: RequirementResultEnum.Allow,
      };
    }

    const contexts: HermesPlaceholderContext[] = services.map((service) => {
      return {
        ...context,
        services: {
          [config.type]: service,
        },
      };
    });

    return {
      allowed: this.reject(config),
      message: this.parser.parseTemplatedEmbed(
        config.message,
        context,
        contexts,
      ),
    };
  }

  public getId(): string {
    return 'maxServices';
  }

  protected parseConfig(config: RequirementConfig): MaxOffersRequirementConfig {
    return MaxOffersRequirementSchema.parse(config);
  }

  protected abstract getUserId(input: Input): string;

  protected abstract getRoles(input: Input): string[];
}
