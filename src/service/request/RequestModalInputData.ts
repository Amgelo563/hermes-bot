import type { RequestCreateData } from './RequestCreateData';

export type RequestModalInputData = Omit<RequestCreateData, 'tag' | 'tagId'>;
