import { FileText, ImagePlus, Paperclip, X } from "lucide-react";
import { useRef } from "react";

interface AttachmentMenuProps {
  onFilesSelected: (files: File[]) => void;
  onClose: () => void;
}

export default function AttachmentMenu({
  onFilesSelected,
  onClose,
}: AttachmentMenuProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const files = Array.from(fileList);

    if (files.length === 0) return;

    onFilesSelected(files);
    onClose();
  };

  return (
    <div className="absolute bottom-16 left-0 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm font-bold text-slate-800">
          Add attachment
        </span>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={16} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => imageInputRef.current?.click()}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-slate-50"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <ImagePlus size={18} />
        </div>

        <div>
          <div className="text-sm font-semibold">Photos</div>
          <div className="text-xs text-slate-400">
            JPG, PNG, WEBP
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-slate-50"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Paperclip size={18} />
        </div>

        <div>
          <div className="text-sm font-semibold">Files</div>
          <div className="text-xs text-slate-400">
            PDF, DOCX and more
          </div>
        </div>
      </button>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => handleFiles(event.target.files)}
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  );
}