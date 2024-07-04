import type { RequestCreateData } from '../data/RequestCreateData';

export type RequestModalInputData = Omit<RequestCreateData, 'tag' | 'tagId'>;
