import { z } from 'zod';
import { DiscordEmbedFieldSchema } from '../../../discord/embed/DiscordEmbedFieldSchema';
import type { BasicHermesMessageParser } from '../../message/BasicHermesMessageParser';
import { AbstractHermesRequirementFactory } from '../AbstractHermesRequirementFactory';
import type { RequirementConfig } from '../config/RequirementConfigSchema';
import { RequirementConfigSchema } from '../config/RequirementConfigSchema';
import type { HermesRequirement } from '../HermesRequirement';
import { SearchRequirement } from '../requirements/SearchRequirement';

const BaseSearchRequirementSchema = z.object({
  on: z.string(),
  deny: z.boolean().default(true),
  message: DiscordEmbedFieldSchema,
});

const RegexSearchRequirementSchema = BaseSearchRequirementSchema.extend({
  mode: z.enum(['require', 'forbid']),
  regex: z.string(),
  flags: z.string().optional(),
});

const WordsSearchRequirementSchema = BaseSearchRequirementSchema.extend({
  mode: z.enum(['any', 'all', 'none']),
  words: z.string().array(),
});

const SearchRequirementConfigSchema = RequirementConfigSchema.extend({
  regex: RegexSearchRequirementSchema.array().optional(),
  words: WordsSearchRequirementSchema.array().optional(),
});

export type SearchRequirementConfig = z.infer<
  typeof SearchRequirementConfigSchema
>;

export type ParsedRegex = Omit<
  z.infer<typeof RegexSearchRequirementSchema>,
  'regex'
> & { regex: RegExp };

export class SearchRequirementFactory<
  Input extends object = object,
> extends AbstractHermesRequirementFactory<Input> {
  protected readonly getSearchedObject?: (input: Input) => object;

  constructor(
    parser: BasicHermesMessageParser<z.ZodTypeAny>,
    getSearchedObject?: (input: Input) => object,
  ) {
    super(parser);
    this.getSearchedObject = getSearchedObject;
  }

  public create(config: RequirementConfig): HermesRequirement<Input> {
    const regexes: ParsedRegex[] = [];
    const parsed = SearchRequirementConfigSchema.parse(config);

    for (const regexConfig of parsed.regex ?? []) {
      regexes.push({
        ...regexConfig,
        regex: new RegExp(regexConfig.regex, regexConfig.flags),
      });
    }

    return new SearchRequirement<Input>(
      this.parser,
      parsed,
      regexes,
      this.getSearchedObject,
    );
  }

  public getId(): string {
    return 'search';
  }
}
