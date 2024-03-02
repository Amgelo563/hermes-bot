import { AssertionError, ObjectNotFoundError } from '@nyx-discord/core';
import { EmbedBuilder } from 'discord.js';
import { ZodError } from 'zod';
import type { OptionalInlineField } from '../../discord/embed/OptionalInlineField';
import type { RequirementConfig } from '../../hermes/requirement/config/RequirementConfigSchema';
import { ZodErrorFormatter } from '../../zod/ZodErrorFormatter';
import type { RequirementCheckMode } from '../mode/RequirementCheckMode';
import { RequirementCheckModeEnum } from '../mode/RequirementCheckMode';
import type { Requirement } from '../Requirement';
import type { RequirementResultAggregate } from '../result/aggregate/RequirementResultAggregate';
import type {
  DeniedRequirementResultData,
  WarnedRequirementResultData,
} from '../result/RequirementResultData';
import { RequirementResultEnum } from '../result/RequirementResultEnum';
import type { RequirementChecker } from './RequirementChecker';
import type { RequirementCheckMappings } from './RequirementCheckMappings';

type RequirementStorage<
  Context,
  RequirementMap extends RequirementCheckMappings,
> = Map<
  RequirementCheckMode,
  Requirement<Context, RequirementMap[RequirementCheckMode]>[]
> & {
  get<Stage extends RequirementCheckMode>(
    stage: Stage,
  ): Requirement<Context, RequirementMap[Stage]>[];
};

export class BasicRequirementChecker<
  Context,
  RequirementMap extends RequirementCheckMappings,
> implements RequirementChecker<Context, RequirementMap>
{
  protected readonly requirementRegistry: RequirementStorage<
    Context,
    RequirementMap
  > = new Map();

  protected readonly loadedRequirements: Map<
    RequirementCheckMode,
    Requirement<Context, any>[]
  > = new Map();

  public initialize(
    stage: RequirementCheckMode,
    configs: RequirementConfig[],
  ): this {
    const registryRequirements = this.requirementRegistry.get(stage);

    if (!registryRequirements) {
      return this;
    }

    const loadedRequirements = [];

    for (const config of configs) {
      const requirement = registryRequirements.find(
        (r) => r.getId() === config.id,
      );

      if (!requirement) {
        throw new ObjectNotFoundError(
          `Requirement ${
            config.id
          } not found. Available requirements: ${registryRequirements
            .map((r) => r.getId())
            .join(', ')}`,
        );
      }

      try {
        requirement.initialize(config);
      } catch (e) {
        if (e instanceof ZodError) {
          const formatted = JSON.stringify(
            ZodErrorFormatter.format(e),
            null,
            2,
          );

          throw new AssertionError(
            `Validation error for requirement "${config.id}" on "${this.constructor.name}"\n ${formatted}`,
          );
        }
      }
      requirement.initialize(config);
      loadedRequirements.push(requirement);
    }

    this.loadedRequirements.set(stage, loadedRequirements);
    return this;
  }

  public setAvailableRequirements<Stage extends RequirementCheckMode>(
    stage: Stage,
    requirements: Requirement<Context, RequirementMap[Stage]>[],
  ): this {
    this.requirementRegistry.set(stage, requirements);
    return this;
  }

  public checkPublish(
    context: Context,
    check: RequirementMap[typeof RequirementCheckModeEnum.Publish],
  ): Promise<RequirementResultAggregate> {
    return this.check(RequirementCheckModeEnum.Publish, context, check);
  }

  public checkUpdate(
    context: Context,
    check: RequirementMap[typeof RequirementCheckModeEnum.Update],
  ): Promise<RequirementResultAggregate> {
    return this.check(RequirementCheckModeEnum.Update, context, check);
  }

  public checkRepost(
    context: Context,
    check: RequirementMap[typeof RequirementCheckModeEnum.Repost],
  ): Promise<RequirementResultAggregate> {
    return this.check(RequirementCheckModeEnum.Repost, context, check);
  }

  public async check<Stage extends RequirementCheckMode>(
    stage: Stage,
    context: Context,
    object: RequirementMap[Stage],
  ): Promise<RequirementResultAggregate> {
    const requirements = this.loadedRequirements.get(stage);

    if (!requirements || requirements.length === 0) {
      return {
        result: RequirementResultEnum.Allow,
        deniedBy: {
          empty: true,
          embeds: [],
          fields: [],
        },
        warnedBy: {
          empty: true,
          embeds: [],
          fields: [],
        },
      };
    }

    const deniedResults: DeniedRequirementResultData[] = [];
    const warnedResults: WarnedRequirementResultData[] = [];

    for (const requirement of requirements) {
      const response = await requirement.check(context, object);
      const results = Array.isArray(response) ? response : [response];

      for (const result of results) {
        if (result.allowed === RequirementResultEnum.Deny) {
          deniedResults.push(result);
        }

        if (result.allowed === RequirementResultEnum.Warn) {
          warnedResults.push(result);
        }
      }
    }

    const warnEmbeds: EmbedBuilder[] = [];
    const warnFields: OptionalInlineField[] = [];
    for (const result of warnedResults) {
      if (result.message instanceof EmbedBuilder) {
        warnEmbeds.push(result.message);
      } else {
        warnFields.push(result.message);
      }
    }

    const denyEmbeds: EmbedBuilder[] = [];
    const denyFields: OptionalInlineField[] = [];
    for (const result of deniedResults) {
      if (result.message instanceof EmbedBuilder) {
        denyEmbeds.push(result.message);
      } else {
        denyFields.push(result.message);
      }
    }

    if (deniedResults.length) {
      return {
        result: RequirementResultEnum.Deny,
        deniedBy: {
          empty: false,
          embeds: denyEmbeds,
          fields: denyFields,
        },
        warnedBy: {
          empty: warnEmbeds.length === 0 && warnFields.length === 0,
          embeds: warnEmbeds,
          fields: warnFields,
        },
      };
    }

    if (warnedResults.length) {
      return {
        result: RequirementResultEnum.Warn,
        deniedBy: {
          empty: true,
          embeds: [],
          fields: [],
        },
        warnedBy: {
          empty: false,
          embeds: warnEmbeds,
          fields: warnFields,
        },
      };
    }

    return {
      result: RequirementResultEnum.Allow,
      warnedBy: {
        empty: true,
        embeds: [],
        fields: [],
      },
      deniedBy: {
        empty: true,
        embeds: [],
        fields: [],
      },
    };
  }
}
