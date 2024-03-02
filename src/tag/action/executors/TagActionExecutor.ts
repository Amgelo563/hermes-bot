import type { ServiceActionExecutor } from '../../../service/action/executor/ServiceActionExecutor';
import type { TagData } from '../../../service/tag/TagData';

export interface TagActionExecutor extends ServiceActionExecutor<TagData> {}
