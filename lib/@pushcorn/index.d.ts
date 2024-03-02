declare module '@pushcorn/hocon-parser' {
  interface ParserOptions {
    text?: string;
    url?: string;
    strict?: boolean;
  }

  function parse(opts: ParserOptions): Promise<unknown>;

  export = parse;
}
