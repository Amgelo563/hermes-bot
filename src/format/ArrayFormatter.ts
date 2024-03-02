export class ArrayFormatter {
  public static format(value: unknown[], args: string[]): string | null {
    if (!value.length) {
      return '`[]`';
    }

    const format = args[0]?.toLowerCase();
    if (!format) return null;

    switch (format) {
      case 'mapby': {
        const by = args[1];
        const newFormat = args.slice(2);
        if (!by || !newFormat.length) return null;

        const mapped: unknown[] = value.reduce(
          (result: unknown[], element: unknown) => {
            if (typeof element !== 'object' || element === null) {
              return result;
            }
            if (!(by in element)) {
              return result;
            }

            result.push((element as Record<string, unknown>)[by]);

            return result;
          },
          [],
        );

        return ArrayFormatter.format(mapped, newFormat);
      }

      case 'join':
        return value.join(',');

      case 'ascodelist':
        return value.map((element) => `\`${String(element)}\``).join(', ');

      case 'list':
      case 'aslist':
        return value.map((element) => `* ${String(element)}`).join('\n');

      case 'codejoin':
        return '`' + value.join('`, `') + '`';

      case 'idjoin': {
        const ids: string[] = [];

        for (const element of value) {
          if (typeof element !== 'object' || element === null) {
            continue;
          }
          if ('id' in element && typeof element.id === 'string') {
            ids.push(element.id);
          }
        }

        return ArrayFormatter.format(ids, ['codejoin']);
      }

      case 'asrolelist': {
        const ids: string[] = value.map((element) => `<@&${String(element)}>`);

        return ArrayFormatter.format(ids, ['aslist']);
      }

      default:
        return null;
    }
  }
}
