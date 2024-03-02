import { TagAction } from '../../../tag/action/TagAction';
import { TagActionSubCommand } from './TagActionSubCommand';

export class TagsDeleteSubCommand extends TagActionSubCommand {
  protected readonly action = TagAction.enum.Delete;
}
