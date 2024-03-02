import { z } from 'zod';
import { DiscordEmbedFieldSchema } from '../../../discord/embed/DiscordEmbedFieldSchema';
import type { RequirementResultData } from '../../../requirement/result/RequirementResultData';
import type { BasicHermesMessageParser } from '../../message/BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../../message/context/HermesPlaceholderContext';

import { AbstractHermesRequirement } from '../AbstractHermesRequirement';
import { RequirementConfigSchema } from '../config/RequirementConfigSchema';

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

type SearchRequirementConfig = z.infer<typeof SearchRequirementConfigSchema>;

type ParsedRegex = Omit<
  z.infer<typeof RegexSearchRequirementSchema>,
  'regex'
> & { regex: RegExp };

export class SearchRequirement<
  Input extends object = object,
> extends AbstractHermesRequirement<SearchRequirementConfig, Input> {
  protected regexes: ParsedRegex[] = [];

  constructor(
    parser: BasicHermesMessageParser<z.ZodTypeAny>,
    getSearchedOverride?: (input: Input) => object,
  ) {
    super(parser);
    if (getSearchedOverride) this.getSearchedObject = getSearchedOverride;
  }

  public getId(): string {
    return 'search';
  }

  protected parseConfig(
    config: SearchRequirementConfig,
  ): SearchRequirementConfig {
    this.regexes = [];

    const parsed = SearchRequirementConfigSchema.parse(config);

    for (const regexConfig of parsed.regex ?? []) {
      this.regexes.push({
        ...regexConfig,
        regex: new RegExp(regexConfig.regex, regexConfig.flags),
      });
    }

    return parsed;
  }

  protected performCheck(
    _context: HermesPlaceholderContext,
    inputObject: Input,
    config: SearchRequirementConfig,
  ): RequirementResultData[] {
    const object = this.getSearchedObject(inputObject);

    const words = config.words ?? [];

    const responses: RequirementResultData[] = [];

    for (const regexConfig of this.regexes) {
      const prop = this.get(object, regexConfig.on);
      if (prop === null) continue;

      const { regex } = regexConfig;
      const matches = regex.exec(prop);

      if (
        (matches === null && regexConfig.mode === 'require')
        || (matches !== null && regexConfig.mode === 'forbid')
      ) {
        responses.push({
          allowed: this.reject(regexConfig),
          message: regexConfig.message,
        });
      }
    }

    for (const wordsConfig of words) {
      const prop = this.get(object, wordsConfig.on);
      if (!prop) continue; // This also excludes '', but there's no need to check for it

      const searchedWords = wordsConfig.words;
      let matches: boolean;

      switch (wordsConfig.mode) {
        case 'any':
          matches = searchedWords.some((word) => prop.includes(word));
          break;
        case 'all':
          matches = searchedWords.every((word) => prop.includes(word));
          break;
        case 'none':
          matches = !searchedWords.some((word) => prop.includes(word));
          break;
      }

      if (!matches) {
        responses.push({
          allowed: this.reject(wordsConfig),
          message: wordsConfig.message,
        });
      }
    }

    return responses;
  }

  protected get(obj: object, key: string): string | null {
    const result = (obj as Record<string, unknown>)[key];

    return typeof result === 'string' ? result : null;
  }

  protected getSearchedObject(input: Input): object {
    return input;
  }
}
