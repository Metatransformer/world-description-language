import { Fragment, jsx as reactJsx } from "react/jsx-runtime";
export { Fragment };
export function jsxDEV(
  type: unknown,
  props: Record<string, unknown>,
  key: string | undefined,
  _isStaticChildren: boolean,
  source?: { fileName: string; lineNumber: number; columnNumber: number },
  _self?: unknown,
) {
  const next = source
    ? {
        ...props,
        __wdlSource: {
          file: source.fileName,
          line: source.lineNumber,
          column: source.columnNumber,
        },
      }
    : props;
  return reactJsx(type as never, next, key);
}
