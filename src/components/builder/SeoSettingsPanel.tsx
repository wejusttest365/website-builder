import { useMemo } from "react";
import { useBuilder, pageOf, type Page, type Project } from "@/lib/builder/store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type SeoSettingsPanelProps = {
  page?: Page;
  project?: Project;
  pageOnly?: boolean;
  projectOnly?: boolean;
};

export function SeoSettingsPanel({ page: pageProp, project: projectProp, pageOnly = false, projectOnly = false }: SeoSettingsPanelProps) {
  const currentProject = useBuilder((s) => s.currentProject());
  const setCustomHead = useBuilder((s) => s.setCustomHead);
  const setPageSeo = useBuilder((s) => s.setPageSeo);
  const setProjectSeo = useBuilder((s) => s.setProjectSeo);
  const project = projectProp ?? currentProject;
  const pageFromState = useMemo(() => pageOf(project), [project]);
  const page = pageProp ?? pageFromState;

  if (projectOnly && !project) {
    return <div className="p-4 text-sm text-muted-foreground">No project selected.</div>;
  }

  if (!projectOnly && !page) {
    return <div className="p-4 text-sm text-muted-foreground">No page selected.</div>;
  }

  const pageSeo = page?.seo ?? {};
  const projectSeo = project?.seo ?? {};
  const pageTitle = pageSeo.title ?? page?.name ?? "Page";

  return (
    <div className="space-y-6 p-3">
      {!projectOnly ? (
        <>
          <div className="space-y-2 rounded-2xl border border-border/70 bg-background/90 p-3 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Page SEO</div>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="seo-page-title">Page title</Label>
                <Input
                  id="seo-page-title"
                  value={pageTitle}
                  placeholder="Optional: page title"
                  onChange={(e) => setPageSeo(page!.id, { title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="seo-page-description">Meta description</Label>
                <Textarea
                  id="seo-page-description"
                  value={pageSeo.description ?? page?.description ?? ""}
                  placeholder="Write a short description for search engines"
                  onChange={(e) => setPageSeo(page!.id, { description: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="seo-page-keywords">Meta keywords</Label>
                <Input
                  id="seo-page-keywords"
                  value={pageSeo.keywords ?? page?.keywords ?? ""}
                  placeholder="Optional: comma-separated keywords"
                  onChange={(e) => setPageSeo(page!.id, { keywords: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="seo-canonical">Canonical URL</Label>
                  <Input
                    id="seo-canonical"
                    value={pageSeo.canonicalUrl ?? ""}
                    placeholder="https://example.com/page"
                    onChange={(e) => setPageSeo(page!.id, { canonicalUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="seo-robots">Robots</Label>
                  <Input
                    id="seo-robots"
                    value={pageSeo.robots ?? ""}
                    placeholder="index, follow"
                    onChange={(e) => setPageSeo(page!.id, { robots: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border border-border/70 bg-background/90 p-3 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Social preview</div>
            <div className="grid gap-4">
              <div className="space-y-1">
                <Label htmlFor="seo-og-title">Open Graph title</Label>
                <Input
                  id="seo-og-title"
                  value={pageSeo.openGraphTitle ?? ""}
                  placeholder="Optional social title"
                  onChange={(e) => setPageSeo(page!.id, { openGraphTitle: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="seo-og-description">Open Graph description</Label>
                <Textarea
                  id="seo-og-description"
                  value={pageSeo.openGraphDescription ?? ""}
                  placeholder="Optional social description"
                  onChange={(e) => setPageSeo(page!.id, { openGraphDescription: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="seo-og-image">Open Graph image</Label>
                <Input
                  id="seo-og-image"
                  value={pageSeo.openGraphImage ?? ""}
                  placeholder="https://example.com/image.png"
                  onChange={(e) => setPageSeo(page!.id, { openGraphImage: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="seo-twitter-card">Twitter card</Label>
                  <Input
                    id="seo-twitter-card"
                    value={pageSeo.twitterCard ?? ""}
                    placeholder="summary_large_image"
                    onChange={(e) => setPageSeo(page!.id, { twitterCard: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="seo-twitter-title">Twitter title</Label>
                  <Input
                    id="seo-twitter-title"
                    value={pageSeo.twitterTitle ?? ""}
                    placeholder="Optional Twitter title"
                    onChange={(e) => setPageSeo(page!.id, { twitterTitle: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="seo-twitter-description">Twitter description</Label>
                <Textarea
                  id="seo-twitter-description"
                  value={pageSeo.twitterDescription ?? ""}
                  placeholder="Optional Twitter description"
                  onChange={(e) => setPageSeo(page!.id, { twitterDescription: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="seo-twitter-image">Twitter image</Label>
                <Input
                  id="seo-twitter-image"
                  value={pageSeo.twitterImage ?? ""}
                  placeholder="https://example.com/twitter-image.png"
                  onChange={(e) => setPageSeo(page!.id, { twitterImage: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="seo-structured-data">Structured data (JSON-LD)</Label>
                <Textarea
                  id="seo-structured-data"
                  value={pageSeo.structuredData ?? ""}
                  placeholder='{"@context":"https://schema.org","@type":"WebSite"}'
                  onChange={(e) => setPageSeo(page!.id, { structuredData: e.target.value })}
                />
              </div>
            </div>
          </div>
        </>
      ) : null}

      {!pageOnly ? (
        <div className="space-y-2 rounded-2xl border border-border/70 bg-background/90 p-3 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Project SEO</div>
          <div className="grid gap-4">
            <div className="space-y-1">
              <Label htmlFor="seo-ga-id">Google Analytics ID</Label>
              <Input
                id="seo-ga-id"
                value={projectSeo.googleAnalyticsId ?? ""}
                placeholder="G-XXXXXXXXXX"
                onChange={(e) => setProjectSeo({ googleAnalyticsId: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="seo-gtm-id">Google Tag Manager ID</Label>
              <Input
                id="seo-gtm-id"
                value={projectSeo.googleTagManagerId ?? ""}
                placeholder="GTM-XXXXXXX"
                onChange={(e) => setProjectSeo({ googleTagManagerId: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="seo-google-verification">Google verification</Label>
              <Input
                id="seo-google-verification"
                value={projectSeo.googleSearchConsoleVerification ?? projectSeo.googleSiteVerification ?? ""}
                placeholder="Google site verification token"
                onChange={(e) => setProjectSeo({ googleSearchConsoleVerification: e.target.value, googleSiteVerification: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="seo-bing-verification">Bing verification</Label>
              <Input
                id="seo-bing-verification"
                value={projectSeo.bingVerification ?? ""}
                placeholder="Bing verification token"
                onChange={(e) => setProjectSeo({ bingVerification: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="seo-facebook-pixel">Facebook pixel ID</Label>
              <Input
                id="seo-facebook-pixel"
                value={projectSeo.facebookPixelId ?? projectSeo.metaPixelId ?? ""}
                placeholder="XXXXXXXXXXXXXXX"
                onChange={(e) => setProjectSeo({ facebookPixelId: e.target.value, metaPixelId: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="seo-custom-head">Custom head / analytics snippet</Label>
              <Textarea
                id="seo-custom-head"
                value={project?.customHead ?? ""}
                placeholder="Paste your Google verification/meta and gtag script here"
                rows={6}
                onChange={(e) => setCustomHead(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This snippet is injected into the page head during preview/export.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="seo-theme-color">Theme color</Label>
                <Input
                  id="seo-theme-color"
                  value={projectSeo.themeColor ?? ""}
                  placeholder="#ffffff"
                  onChange={(e) => setProjectSeo({ themeColor: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="seo-language">Language</Label>
                <Input
                  id="seo-language"
                  value={projectSeo.language ?? ""}
                  placeholder="en"
                  onChange={(e) => setProjectSeo({ language: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
