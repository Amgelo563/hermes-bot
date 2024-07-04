import type { TagData } from './TagData';

export type TagCreateData = Omit<TagData, 'id' | 'createdAt'>;
