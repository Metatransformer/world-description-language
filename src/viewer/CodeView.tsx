/** @jsxImportSource react */
"use client";
import { useMemo } from "react";
import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";

hljs.registerLanguage("xml", xml);
hljs.registerLanguage("typescript", typescript);

export function CodeView({ code, startLine = 1 }: { code: string; startLine?: number }) {
  const highlighted = useMemo(() => hljs.highlight(code, { language: "typescript" }).value, [code]);
  return <div className="syntax-code" tabIndex={0} aria-label="Syntax-highlighted TypeScript source">
    <pre className="line-numbers" aria-hidden="true">{code.split("\n").map((_, index) => startLine + index).join("\n")}</pre>
    <pre><code className="hljs language-typescript" dangerouslySetInnerHTML={{ __html: highlighted }} /></pre>
  </div>;
}
