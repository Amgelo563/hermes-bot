import type { z } from 'zod';
import type { RequirementResultData } from '../../../requirement/result/RequirementResultData';
import type { BasicHermesMessageParser } from '../../message/BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../../message/context/HermesPlaceholderContext';

import { AbstractHermesRequirement } from '../AbstractHermesRequirement';
import type {
  ParsedRegex,
  SearchRequirementConfig,
} from '../factories/SearchRequirementFactory';

export class SearchRequirement<
  Input extends object = object,
> extends AbstractHermesRequirement<SearchRequirementConfig, Input> {
  protected readonly regexes: ParsedRegex[];

  constructor(
    parser: BasicHermesMessageParser<z.ZodTypeAny>,
    config: SearchRequirementConfig,
    regexes: ParsedRegex[],
    getSearchedOverride?: (input: Input) => object,
  ) {
    super(parser, config);
    this.regexes = regexes;
    if (getSearchedOverride) this.getSearchedObject = getSearchedOverride;
  }

  public getId(): string {
    return 'search';
  }

  public check(
    _context: HermesPlaceholderContext,
    inputObject: Input,
  ): RequirementResultData[] {
    const object = this.getSearchedObject(inputObject);

    const words = this.config.words ?? [];

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
