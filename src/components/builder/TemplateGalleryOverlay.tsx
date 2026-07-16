import { useEffect, useMemo, useState } from "react";
import { Search, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { TEMPLATE_LIBRARY, type TemplateDefinition } from "@/lib/builder/templates";
import { useBuilder } from "@/lib/builder/store";

const GALLERY_FILTERS = ["All", "Single page", "Multi page", "Free templates", "Premium templates"] as const;
type GalleryFilter = (typeof GALLERY_FILTERS)[number];

export function TemplateGalleryOverlay() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<GalleryFilter>("All");
  const applyTemplate = useBuilder((s) => s.applyTemplate);
  const setLeftPanelView = useBuilder((s) => s.setLeftPanelView);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const filteredTemplates = useMemo(() => {
    const search = query.trim().toLowerCase();
    return TEMPLATE_LIBRARY.filter((tpl) => {
      const matchesFilter =
        filter === "All" ||
        (filter === "Free templates" ? !tpl.isPremium :
          filter === "Premium templates" ? !!tpl.isPremium :
          (filter === "Single page" ? tpl.pageType === "single-page" :
           filter === "Multi page" ? tpl.pageType === "multi-page" : false));
      const matchesSearch =
        !search ||
        [tpl.name, tpl.description, tpl.category, tpl.pageType].join(" ").toLowerCase().includes(search);
      return matchesFilter && matchesSearch;
    });
  }, [filter, query]);

  const handleUseTemplate = (tpl: TemplateDefinition) => {
    applyTemplate(tpl);
    setLeftPanelView("pages");
    toast.success(`${tpl.name} loaded into the canvas`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-sm px-4 py-5 sm:px-6 lg:px-8">
      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-slate-800/80 bg-slate-950 shadow-2xl ring-1 ring-white/5">
        <div className="sticky top-0 z-10 border-b border-slate-800/80 bg-slate-950/95 px-6 py-6 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Template marketplace</p>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl">Browse ready-made website templates</h2>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" /> New
                </span>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-slate-400">Explore templates in a polished gallery view, then apply the design directly to your canvas.</p>
            </div>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              onClick={() => setLeftPanelView("pages")}
              aria-label="Close gallery"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search templates..."
                className="w-full rounded-2xl border border-slate-800/90 bg-slate-900/75 py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {GALLERY_FILTERS.map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition ${filter === filterOption ? "bg-white text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
                >
                  {filterOption}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((tpl) => (
                <article key={tpl.id} className="group overflow-hidden rounded-[1.75rem] border border-slate-800/90 bg-slate-900 shadow-2xl ring-1 ring-white/5 transition hover:-translate-y-0.5 hover:shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]">
                  <div className="relative h-60 overflow-hidden bg-slate-800">
                    <img src={tpl.thumbnail} alt={tpl.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/95 via-slate-950/20 to-transparent" />
                    <div className="absolute left-4 top-4 inline-flex rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-100">
                      {tpl.pageType === "single-page" ? "Single page" : tpl.pageType === "multi-page" ? "Multi page" : tpl.category}
                    </div>
                    <div className="absolute right-4 top-4 inline-flex rounded-full bg-slate-950/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-100">
                      {tpl.isPremium ? "Premium" : "Free"}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{tpl.name}</h3>
                        <p className="mt-2 text-sm text-slate-400">{tpl.description}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {tpl.category ? (
                          <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                            {tpl.category}
                          </span>
                        ) : null}
                        {tpl.price ? (
                          <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                            {tpl.price}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        className="inline-flex flex-1 min-w-[120px] items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                        onClick={() => handleUseTemplate(tpl)}
                      >
                        Use template
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-full rounded-[1.75rem] border border-dashed border-slate-700 bg-slate-900/90 p-10 text-center text-sm text-slate-400">
                No templates matched your search. Try a different term or category.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
