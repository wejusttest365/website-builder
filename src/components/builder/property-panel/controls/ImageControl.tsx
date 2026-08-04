import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { Image as ImageIcon, Upload, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useBuilder } from "@/lib/builder/store";
import {
  getAssetValue,
  getImageFilenameFromPath,
  IMAGE_FILE_ACCEPT,
  readFileAsDataUrl,
  resolveAssetValue,
  validateImageFile,
  type BuilderAssetEntry,
} from "@/lib/builder/image-storage";

export interface ImageControlProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  /** Show alt text + decorative controls */
  showAlt?: boolean;
  alt?: string;
  onAltChange?: (value: string) => void;
  decorative?: boolean;
  onDecorativeChange?: (value: boolean) => void;
  allowRemove?: boolean;
  showUrlOption?: boolean;
  /** Changes button copy for background image contexts */
  variant?: "image" | "background";
  disabled?: boolean;
  hint?: string;
}

async function resolvePreviewSrc(
  value: string,
  assets?: Record<string, BuilderAssetEntry>,
): Promise<string> {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^(data:|https?:|blob:)/i.test(raw)) return raw;

  const filename = getImageFilenameFromPath(raw);
  const asset = (filename && assets?.[filename]) || assets?.[raw];
  if (asset) {
    const sync = getAssetValue(asset);
    if (sync && /^(data:|https?:|blob:)/i.test(sync)) return sync;
    const resolved = await resolveAssetValue(asset);
    if (resolved && /^(data:|https?:|blob:)/i.test(resolved)) return resolved;
    if (resolved) return resolved;
  }

  return raw;
}

export function ImageControl({
  label = "Image",
  value = "",
  onChange,
  showAlt,
  alt = "",
  onAltChange,
  decorative,
  onDecorativeChange,
  allowRemove = true,
  showUrlOption = true,
  variant = "image",
  disabled = false,
  hint,
}: ImageControlProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const addAsset = useBuilder((s) => s.addAsset);
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const [previewSrc, setPreviewSrc] = useState("");
  const [showUrlField, setShowUrlField] = useState(false);
  const [urlDraft, setUrlDraft] = useState(value || "");
  const [uploading, setUploading] = useState(false);

  const hasImage = Boolean(String(value || "").trim());
  const altEnabled = showAlt ?? Boolean(onAltChange);
  const isDecorative = Boolean(decorative);
  const isBackground = variant === "background";

  useEffect(() => {
    let cancelled = false;
    void resolvePreviewSrc(value || "", project?.assets as Record<string, BuilderAssetEntry> | undefined).then(
      (next) => {
        if (!cancelled) setPreviewSrc(next);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [value, project?.assets]);

  useEffect(() => {
    setUrlDraft(value || "");
    if (value && /^(https?:|data:)/i.test(value) && !value.startsWith("images/")) {
      setShowUrlField(true);
    }
  }, [value]);

  const openFilePicker = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const assetPath = addAsset(dataUrl, file.name);
      if (!assetPath) {
        toast.error("Could not save the image. Please try again.");
        return;
      }
      onChange?.(assetPath);
      setShowUrlField(false);
      toast.success(hasImage ? "Image replaced" : "Image uploaded");
    } catch (err) {
      console.error("image upload failed", err);
      toast.error("Could not upload that image. Please try another file.");
    } finally {
      setUploading(false);
    }
  };

  const handleApplyUrl = () => {
    const next = String(urlDraft || "").trim();
    onChange?.(next);
  };

  const handleRemove = () => {
    onChange?.("");
    setUrlDraft("");
    setShowUrlField(false);
    if (onAltChange && isDecorative) {
      // keep decorative state; alt stays empty
    }
  };

  const handleDecorativeChange = (next: boolean) => {
    onDecorativeChange?.(next);
    if (next) {
      onAltChange?.("");
    }
  };

  const uploadLabel = uploading
    ? "Uploading…"
    : hasImage
      ? isBackground
        ? "Replace Background"
        : "Replace"
      : isBackground
        ? "Upload Background Image"
        : "Upload Image";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="text-[11px] font-medium leading-none text-slate-500">
          {label}
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <div className="flex h-28 w-full items-center justify-center bg-slate-100">
          {previewSrc ? (
            <img
              src={previewSrc}
              alt={isDecorative ? "" : alt || "Selected image preview"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5 px-3 text-center text-slate-400">
              <ImageIcon className="h-7 w-7" aria-hidden="true" />
              <span className="text-[11px]">No image selected</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={openFilePicker}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {hasImage ? <RefreshCw className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
          {uploadLabel}
        </button>

        {allowRemove && hasImage ? (
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={handleRemove}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept={IMAGE_FILE_ACCEPT}
        className="sr-only"
        disabled={disabled || uploading}
        onChange={handleFileChange}
      />

      {showUrlOption ? (
        <div className="space-y-1.5">
          {!showUrlField ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => setShowUrlField(true)}
              className="text-[11px] font-medium text-violet-600 hover:text-violet-700 disabled:opacity-50"
            >
              Use Image URL instead
            </button>
          ) : (
            <div className="space-y-1.5 rounded-md border border-slate-200 bg-white p-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-slate-500">Image URL</span>
                <button
                  type="button"
                  className="text-[10px] text-slate-400 hover:text-slate-600"
                  onClick={() => setShowUrlField(false)}
                >
                  Hide
                </button>
              </div>
              <input
                value={urlDraft}
                disabled={disabled}
                placeholder="https://example.com/image.jpg"
                onChange={(event) => setUrlDraft(event.target.value)}
                onBlur={handleApplyUrl}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleApplyUrl();
                  }
                }}
                className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[13px] text-slate-700 outline-none transition focus:border-slate-300 focus:ring-1 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-[10px] text-slate-400">Optional: paste a remote image URL</p>
            </div>
          )}
        </div>
      ) : null}

      {altEnabled ? (
        <div className="space-y-1.5">
          <label className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-2.5 py-2">
            <span className="text-[12px] font-medium text-slate-700">Decorative image</span>
            <input
              type="checkbox"
              checked={isDecorative}
              disabled={disabled}
              onChange={(event) => handleDecorativeChange(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-300"
            />
          </label>
          {!isDecorative ? (
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-500">Alt text</span>
              <input
                value={alt}
                disabled={disabled}
                placeholder="Describe this image for accessibility"
                onChange={(event) => onAltChange?.(event.target.value)}
                className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[13px] text-slate-700 outline-none transition focus:border-slate-300 focus:ring-1 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          ) : (
            <p className="text-[10px] text-slate-400">Decorative images use an empty alt attribute.</p>
          )}
        </div>
      ) : null}

      {hint ? <p className="text-[10px] text-slate-400">{hint}</p> : null}
    </div>
  );
}

/** Alias for the shared image picker */
export const ImagePicker = ImageControl;
export type ImagePickerProps = ImageControlProps;
