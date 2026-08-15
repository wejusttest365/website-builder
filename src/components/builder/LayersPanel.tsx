"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useBuilder, pageOf } from "@/lib/builder/store";
import { getLayerTreeFromBody, getLayerTreeForSection, findLayerNodeById, expandAncestors, type LayerNode } from "./layerTree";
import { ChevronRight, Search, X, Eye, EyeOff, Type, Heading, Image, MousePointer, Square, Layout, FileText } from "lucide-react";

interface LayersPanelProps {
  onClose?: () => void;
}

function getIconForTag(tagName: string) {
  switch (tagName) {
    case "H1":
    case "H2":
    case "H3":
    case "H4":
    case "H5":
    case "H6":
      return Heading;
    case "P":
    case "SPAN":
    case "STRONG":
    case "EM":
    case "B":
    case "I":
    case "SMALL":
    case "BLOCKQUOTE":
    case "CITE":
    case "LABEL":
      return Type;
    case "BUTTON":
    case "A":
      return MousePointer;
    case "IMG":
      return Image;
    case "DIV":
    case "SECTION":
    case "HEADER":
    case "FOOTER":
    case "NAV":
    case "MAIN":
    case "ARTICLE":
    case "ASIDE":
      return Layout;
    case "UL":
    case "OL":
    case "LI":
    case "TABLE":
    case "TR":
    case "TD":
    case "TH":
    case "FORM":
    case "INPUT":
    case "TEXTAREA":
      return Square;
    default:
      return FileText;
  }
}

function matchesSelection(node: LayerNode, selectedSectionId: string | null, selectedElement: any): boolean {
  if (!selectedSectionId) return false;
  if (node.id === `section-${selectedSectionId}` && !selectedElement) return true;
  if (!selectedElement) return false;

  if (selectedElement.widgetId) {
    if (node.id.startsWith(`widget-${selectedElement.widgetId}`)) {
      if (selectedElement.elementKey && node.id === `element-${selectedElement.widgetId}-${selectedElement.elementKey}`) return true;
      if (selectedElement.childId && node.id === `child-${selectedElement.widgetId}-${selectedElement.childId}`) return true;
      if (!selectedElement.elementKey && !selectedElement.childId && node.id === `widget-${selectedElement.widgetId}`) return true;
    }
  }

  if ((selectedElement.kind === 'container' || selectedElement.kind === 'dom') && selectedElement.index != null) {
    const expectedId = `dom-${selectedSectionId}-${selectedElement.index}`;
    if (node.id === expectedId) return true;
  }

  if (node.id === `section-${selectedSectionId}`) return true;

  return false;
}

function LayerNodeComponent({
  node,
  depth,
  selectedSectionId,
  selectedElement,
  expandedNodes,
  onToggle,
  onSelect,
  onToggleVisibility,
}: {
  node: LayerNode;
  depth: number;
  selectedSectionId: string | null;
  selectedElement: any;
  expandedNodes: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (node: LayerNode) => void;
  onToggleVisibility: (node: LayerNode) => void;
}) {
  const isSelected = matchesSelection(node, selectedSectionId, selectedElement);
  const isExpanded = expandedNodes.has(node.id);
  const Icon = getIconForTag(node.tagName);
  const hasChildren = node.children.length > 0;
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected && nodeRef.current) {
      nodeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isSelected]);

  return (
    <div ref={isSelected ? nodeRef : undefined}>
      <button
        type="button"
        onClick={() => onSelect(node)}
        className={`flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-left text-xs transition ${
          isSelected ? "bg-[#FACC15]/15 text-[#FACC15]" : "text-[#D0D0D0] hover:bg-[#242424] hover:text-[#F5F5F5]"
        }`}
        style={{ paddingLeft: depth * 16 + 24 }}
      >
        <span
          className="flex h-3.5 w-3.5 items-center justify-center text-[#969696]"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id);
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronRight className="h-3 w-3 rotate-90" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )
          ) : (
            <span className="inline-block h-3 w-3" />
          )}
        </span>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(node);
          }}
          className={`flex h-4 w-4 items-center justify-center rounded ${node.hidden ? "text-[#FACC15]" : "text-[#969696]"}`}
          title={node.hidden ? "Show element" : "Hide element"}
        >
          {node.hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        </span>
        <Icon className="h-3.5 w-3.5 text-[#969696]" />
        <span className="truncate">{node.label}</span>
      </button>
      {hasChildren && isExpanded ? (
        <div>
          {node.children.map((child) => (
            <LayerNodeComponent
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedSectionId={selectedSectionId}
              selectedElement={selectedElement}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
              onSelect={onSelect}
              onToggleVisibility={onToggleVisibility}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function LayersPanel({ onClose }: LayersPanelProps) {
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const selectedSectionId = useBuilder((s) => s.selectedSectionId);
  const selectedElement = useBuilder((s) => s.selectedElement);
  const selectSection = useBuilder((s) => s.selectSection);
  const selectElement = useBuilder((s) => s.selectElement);
  const pushHistory = useBuilder((s) => s.pushHistory);
  const [search, setSearch] = useState("");
  const [iframeVersion, setIframeVersion] = useState(0);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handler = () => setIframeVersion((v) => v + 1);
    window.addEventListener("wto-iframe-loaded", handler);
    const iframe = document.querySelector('iframe[title="preview"]') as HTMLIFrameElement | null;
    if (iframe?.contentDocument?.body) {
      setIframeVersion((v) => v + 1);
    }
    return () => window.removeEventListener("wto-iframe-loaded", handler);
  }, []);

  const layerTree = useMemo<LayerNode[]>(() => {
    const iframe = document.querySelector('iframe[title="preview"]') as HTMLIFrameElement | null;
    const doc = iframe?.contentDocument;
    if (!doc?.body) return [];

    const sections = doc.querySelectorAll("[data-wto-section]");
    const tree: LayerNode[] = [];

    sections.forEach((sectionEl) => {
      const sectionId = sectionEl.getAttribute("data-wto-section");
      if (!sectionId) return;

      const sectionNode: LayerNode = {
        id: `section-${sectionId}`,
        tagName: "SECTION",
        label: "Section",
        children: getLayerTreeForSection(sectionEl as HTMLElement),
        element: sectionEl as HTMLElement,
        hidden: sectionEl.getAttribute("data-wto-hidden-layers") === "1",
      };
      tree.push(sectionNode);
    });

    return tree;
  }, [iframeVersion, project?.id, project?.currentPageId]);

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const handleSelectNode = useCallback((node: LayerNode) => {
    const iframe = document.querySelector('iframe[title="preview"]') as HTMLIFrameElement | null;
    const doc = iframe?.contentDocument;
    if (!doc) return;

    const sectionId = node.id.startsWith("section-") ? node.id.replace("section-", "") : null;

    if (node.id.startsWith("section-") && sectionId) {
      pushHistory();
      selectSection(sectionId);
      selectElement(null);
      iframe.contentWindow?.postMessage({ __wto: true, type: 'set-selected-section', payload: { sectionId } }, '*');
      return;
    }

    const element = node.element;
    if (!element || !doc.body.contains(element)) return;

    pushHistory();
    const index = element.getAttribute("data-wto-idx");
    const widgetId = element.closest?.("[data-widget-id]")?.getAttribute("data-widget-id") || null;
    const elementKey = element.getAttribute("data-wto-widget-element-key") || null;
    const childId = element.getAttribute("data-container-child-id") || element.getAttribute("data-wto-child-id") || null;

    iframe.contentWindow?.postMessage({
      __wto: true,
      type: 'select-element',
      payload: {
        sectionId: sectionId || selectedSectionId,
        index: index != null ? Number(index) : null,
        widgetId,
        elementKey,
        childId,
        scrollTo: true,
      }
    }, '*');
  }, [selectSection, selectElement, pushHistory, selectedSectionId]);

  const handleToggleVisibility = useCallback((node: LayerNode) => {
    const iframe = document.querySelector('iframe[title="preview"]') as HTMLIFrameElement | null;
    const doc = iframe?.contentDocument;
    if (!doc) return;

    const element = node.element;
    if (!element || !doc.body.contains(element)) return;

    const isHidden = element.getAttribute("data-wto-hidden-layers") === "1";
    if (isHidden) {
      element.removeAttribute("data-wto-hidden-layers");
      element.style.display = "";
    } else {
      element.setAttribute("data-wto-hidden-layers", "1");
      element.style.display = "none";
    }

    setIframeVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    if (!selectedSectionId) return;
    const targetId = (() => {
      if (!selectedElement) return `section-${selectedSectionId}`;
      if (selectedElement.widgetId) {
        if (selectedElement.elementKey) return `element-${selectedElement.widgetId}-${selectedElement.elementKey}`;
        if (selectedElement.childId) return `child-${selectedElement.widgetId}-${selectedElement.childId}`;
        return `widget-${selectedElement.widgetId}`;
      }
      if ((selectedElement.kind === 'container' || selectedElement.kind === 'dom') && selectedElement.index != null) {
        return `dom-${selectedSectionId}-${selectedElement.index}`;
      }
      return `section-${selectedSectionId}`;
    })();
    setExpandedNodes((prev) => expandAncestors(layerTree, targetId, prev));
  }, [selectedSectionId, selectedElement, layerTree]);

  const filteredTree = useMemo(() => {
    if (!search.trim()) return layerTree;
    const q = search.toLowerCase();
    function filter(nodes: LayerNode[]): LayerNode[] {
      const out: LayerNode[] = [];
      for (const node of nodes) {
        const matchesSelf = node.label.toLowerCase().includes(q) || node.tagName.toLowerCase().includes(q);
        const filteredChildren = filter(node.children);
        if (matchesSelf || filteredChildren.length) {
          out.push({ ...node, children: filteredChildren });
        }
      }
      return out;
    }
    return filter(layerTree);
  }, [layerTree, search]);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-[#969696]">Layers</span>
        <div className="flex items-center gap-1">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[#969696] transition hover:bg-[#242424] hover:text-[#F5F5F5]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#969696]" />
        <input
          type="text"
          placeholder="Search layers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-full rounded-lg border border-[#363636] bg-[#171717] pl-8 pr-3 text-xs text-[#F5F5F5] outline-none transition focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20"
        />
      </div>
      <div className="space-y-0.5">
        {filteredTree.map((node) => (
          <LayerNodeComponent
            key={node.id}
            node={node}
            depth={0}
            selectedSectionId={selectedSectionId}
            selectedElement={selectedElement}
            expandedNodes={expandedNodes}
            onToggle={toggleNode}
            onSelect={handleSelectNode}
            onToggleVisibility={handleToggleVisibility}
          />
        ))}
        {filteredTree.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-[#969696]">No layers found</p>
        )}
      </div>
    </div>
  );
}
