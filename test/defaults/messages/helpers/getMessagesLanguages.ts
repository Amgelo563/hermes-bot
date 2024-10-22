import { getLanguages } from '../../helpers/getLanguages';

let cache: string[] | undefined;

export function getMessagesLanguages() {
  if (!cache) {
    cache = getLanguages('messages');
  }
  return cache;
}
