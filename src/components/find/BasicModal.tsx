import { X } from "lucide-react";
import type { ReactNode } from "react";

export default function BasicModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl">

        <div className="flex justify-between">
          <h2 className="text-xl font-black">
            {title}
          </h2>

          <button
            onClick={
              onClose
            }
          >
            <X />
          </button>
        </div>

        <div className="mt-5">
          {children}
        </div>
      </div>
    </div>
  );
}
