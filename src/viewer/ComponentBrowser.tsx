/** @jsxImportSource react */
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentDefinition } from "../server/components";
import { CodeView } from "./CodeView";

export function ComponentBrowser({ initialName, revision, onClose, onInspect }: {
  initialName?: string;
  revision: number;
  onClose: () => void;
  onInspect: (id: string, spaceId: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [definitions, setDefinitions] = useState<ComponentDefinition[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/components", { signal: controller.signal }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not load component definitions");
      setDefinitions(data);
      setSelectedId((current) => data.some((item: ComponentDefinition) => item.id === current) ? current : data.find((item: ComponentDefinition) => item.name === initialName)?.id ?? data[0]?.id);
    }).catch((cause) => { if (!controller.signal.aborted) setError(cause.message); });
    return () => controller.abort();
  }, [initialName, revision]);
  const filtered = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/);
    return definitions.filter((item) => terms.every((term) => `${item.name} ${item.file} ${item.code}`.toLowerCase().includes(term)));
  }, [definitions, query]);
  const selected = definitions.find((item) => item.id === selectedId);
  return <dialog ref={dialog} className="component-browser" aria-label="Component library" onCancel={onClose}>
    <div className="component-browser-heading">
      <div><strong>Component library</strong><span>{definitions.length} definitions · source is the world</span></div>
      <button onClick={onClose} aria-label="Close component library">Close ×</button>
    </div>
    <div className="component-browser-body">
      <nav aria-label="All authored components">
        <input autoFocus aria-label="Search components" placeholder="Search names, files, code…" value={query} onChange={(event) => setQuery(event.target.value)} />
        <small>{filtered.length} of {definitions.length} components</small>
        <div className="component-results">
          {filtered.map((item) => <button key={item.id} aria-pressed={item.id === selectedId} onClick={() => setSelectedId(item.id)}>
            <strong>{item.name}</strong><span>{item.file}:{item.line}</span><small>{item.instances.length} placed roots</small>
          </button>)}
          {filtered.length === 0 && <p>{definitions.length ? "No matching components." : error ?? "Loading components…"}</p>}
        </div>
      </nav>
      <section className="component-detail" aria-label="Component definition">
        {selected && <>
          <div className="component-file"><h2>{selected.name}</h2><span>{selected.file}:{selected.line}–{selected.endLine}</span></div>
          <CodeView code={selected.code} startLine={selected.line} />
          <details className="component-instances">
            <summary>Placed instances ({selected.instances.length})</summary>
            {selected.instances.length ? selected.instances.map((instance) => <button key={instance.id} onClick={() => onInspect(instance.id, instance.spaceId)}>{instance.name}<small>{instance.spaceId}</small></button>) : <p>This definition has no placed objects in the current world.</p>}
          </details>
        </>}
        {error && <p role="alert">{error}</p>}
      </section>
    </div>
  </dialog>;
}
