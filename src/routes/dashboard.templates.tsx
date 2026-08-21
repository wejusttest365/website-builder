import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, Sparkles } from "lucide-react";
import { TEMPLATE_LIBRARY, type TemplateDefinition } from "@/lib/builder/templates";
import { useBuilder } from "@/lib/builder/store";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { nanoid } from "nanoid";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/templates")({
  component: TemplatesPage,
});

const GALLERY_FILTERS = ["All", "Single page", "Multi page", "Free templates", "Premium templates"] as const;
type GalleryFilter = (typeof GALLERY_FILTERS)[number];

function TemplatesPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<GalleryFilter>("All");
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const newProject = useBuilder((s) => s.newProject);
  const applyTemplateToCurrent = useBuilder((s) => s.applyTemplate);

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

  const handleUseTemplate = async (tpl: TemplateDefinition) => {
    setLoading(tpl.id);
    try {
      const createdId = newProject(`${tpl.name}`);
      applyTemplateToCurrent(tpl as any);

      const current = useBuilder.getState().currentProject();
      if (!current) throw new Error('Failed to initialize project from template');

      toast.success(`${tpl.name} template loaded! Opening editor...`);

      navigate({ to: "/editor/$projectId", params: { projectId: current.id } });
    } catch (err) {
      console.error("Template loading error:", err);
      toast.error("Failed to load template. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#171717] p-6 text-[#F5F5F5]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        

        {/* Search and Filters */}
        <div className="rounded-sm bg-[#1F1F1F] p-6 shadow-sm ring-1 ring-[#363636]">
          <div className="space-y-4 mb-4">
               <div className="mb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-[#F5F5F5]">Templates</h1>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#363636] bg-[#2B2B2B] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#FACC15]">
                  <Sparkles className="h-3.5 w-3.5 text-[#FACC15]" /> {TEMPLATE_LIBRARY.length} templates
                </span>
              </div>
              <p className="mt-2 text-[#969696]">
                Browse and use professionally designed templates to get started quickly
              </p>
            </div>
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#969696]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search templates by name, category, or description..."
                className="w-full pl-12 pr-4 h-12 rounded-xl border border-[#363636] bg-[#1F1F1F] text-[#F5F5F5] outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {GALLERY_FILTERS.map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    filter === filterOption
                      ? "bg-[#FACC15] text-[#111111]"
                      : "bg-[#2B2B2B] text-[#D0D0D0] hover:bg-[#363636]"
                  }`}
                >
                  {filterOption}
                </button>
              ))}
            </div>
          </div>
        

        {/* Templates Grid */}
        <div>
          {filteredTemplates.length === 0 ? (
            <div className="rounded-sm border-2 border-dashed border-[#363636] bg-[#1F1F1F] p-12 text-center">
              <p className="text-[#969696]">No templates found matching your search. Try a different term or filter.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((tpl) => (
                <div key={tpl.id} className="group overflow-hidden rounded-sm border border-[#363636] bg-[#1F1F1F] shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative h-56 overflow-hidden bg-[#242424]">
                    <img
                      src={tpl.thumbnail}
                      alt={tpl.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

                    {tpl.isPremium && (
                      <div className="absolute right-3 top-3 rounded-full bg-[#FACC15] px-3 py-1 text-xs font-semibold text-[#111111]">
                        Premium
                      </div>
                    )}

                    {tpl.category && (
                      <div className="absolute left-3 top-3 rounded-full bg-[#1F1F1F]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#D0D0D0]">
                        {tpl.category}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-[#F5F5F5]">{tpl.name}</h3>
                    <p className="mt-2 text-sm text-[#969696] line-clamp-2">{tpl.description}</p>

                    {tpl.pageType && (
                      <p className="mt-3 text-xs text-[#969696]">
                        {tpl.pageType === "single-page" ? "Single Page" : "Multi Page"}
                      </p>
                    )}

                    <div className="mt-4">
                      <Button
                        onClick={() => handleUseTemplate(tpl)}
                        disabled={loading === tpl.id}
                        className="w-full bg-[#FACC15] text-[#111111] hover:bg-[#FDE047]"
                      >
                        {loading === tpl.id ? "Loading..." : "Use Template"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}