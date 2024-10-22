import { readdirSync } from 'node:fs';
import { join as joinPath } from 'path';

const getDirectories = (source: string) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

export function getLanguages(parent: string) {
  const path = joinPath(parent, 'lang');
  return getDirectories(path);
}
