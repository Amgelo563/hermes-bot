import { readdirSync } from 'node:fs';

const getDirectories = (source: string) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

export function getLanguages(parent: string) {
  return getDirectories(parent);
}
