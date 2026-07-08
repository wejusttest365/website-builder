import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useBuilder } from "@/lib/builder/store";
import { buildExportBundle } from "@/lib/builder/preview";
import { Terminal } from "lucide-react";

type Tab = "html" | "css" | "js" | "console";

export function CodePanel() {
  const [tab, setTab] = useState<Tab>("html");
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const setGlobalCss = useBuilder((s) => s.setGlobalCss);
  const setGlobalJs = useBuilder((s) => s.setGlobalJs);
  const setPageHtml = useBuilder((s) => s.setPageHtml);
  const dark = useBuilder((s) => s.dark);

  const bundle = project
    ? buildExportBundle({
        sections: project.sections,
        globalCss: project.globalCss,
        globalJs: project.globalJs,
      })
    : { body: "", css: "", js: "" };

  const [consoleLines, setConsoleLines] = useState<{ level: string; text: string; t: number }[]>([]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    function onCon(e: Event) {
      const d = (e as CustomEvent).detail as { level: string; args: string[] };
      setConsoleLines((prev) =>
        [...prev, { level: d.level, text: (d.args || []).join(" "), t: Date.now() }].slice(-200),
      );
    }
    window.addEventListener("wto-console", onCon as EventListener);
    return () => window.removeEventListener("wto-console", onCon as EventListener);
  }, []);

  const htmlDraft = useRef(bundle.body);
  useEffect(() => {
    htmlDraft.current = bundle.body;
  }, [bundle.body]);

  return (
    <div className="h-full flex flex-col bg-card border-t border-border">
      <div className="flex items-center border-b border-border bg-muted/30">
        {(["html", "css", "js", "console"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-medium uppercase tracking-wider border-r border-border ${tab === t ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t === "console" && <Terminal className="w-3 h-3 inline mr-1" />}
            {t}
          </button>
        ))}
        <div className="ml-auto pr-3 text-[10px] text-muted-foreground">Live preview updates as you type</div>
      </div>
      <div className="flex-1 min-h-0">
        {tab === "html" && (
          <Editor
            theme={dark ? "vs-dark" : "vs-light"}
            defaultLanguage="html"
            path={`page-${project?.id ?? "x"}.html`}
            value={bundle.body}
            onChange={(v) => setPageHtml(v ?? "")}
            options={editorOpts}
          />
        )}
        {tab === "css" && (
          <Editor
            theme={dark ? "vs-dark" : "vs-light"}
            defaultLanguage="css"
            path={`global-${project?.id ?? "x"}.css`}
            value={project?.globalCss ?? ""}
            onChange={(v) => setGlobalCss(v ?? "")}
            options={editorOpts}
          />
        )}
        {tab === "js" && (
          <Editor
            theme={dark ? "vs-dark" : "vs-light"}
            defaultLanguage="javascript"
            path={`global-${project?.id ?? "x"}.js`}
            value={project?.globalJs ?? ""}
            onChange={(v) => setGlobalJs(v ?? "")}
            options={editorOpts}
          />
        )}
        {tab === "console" && (
          <div className="h-full overflow-auto p-3 font-mono text-xs bg-background">
            {consoleLines.length === 0 && (
              <div className="text-muted-foreground">No console output yet.</div>
            )}
            {consoleLines.map((l, i) => (
              <div
                key={i}
                className={`py-0.5 ${l.level === "error" ? "text-red-500" : l.level === "warn" ? "text-yellow-500" : "text-foreground"}`}
              >
                <span className="opacity-50 mr-2">[{l.level}]</span>
                {l.text}
              </div>
            ))}
            {consoleLines.length > 0 && (
              <button
                className="mt-2 text-xs text-muted-foreground hover:text-foreground underline"
                onClick={() => setConsoleLines([])}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const editorOpts = {
  minimap: { enabled: false },
  fontSize: 12,
  wordWrap: "on" as const,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
};
