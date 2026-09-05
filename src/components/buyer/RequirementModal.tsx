import { X, Save, AlertCircle } from "lucide-react";
import type {
  StructuredRequirement,
  RequirementField,
} from "../../types/marketplace";

interface Props {
  open: boolean;
  requirement: StructuredRequirement | null;
  onClose: () => void;
  onChange: (requirement: StructuredRequirement) => void;
  onSave: () => void;
}

export default function RequirementModal({
  open,
  requirement,
  onClose,
  onChange,
  onSave,
}: Props) {
  if (!open || !requirement) return null;

  const updateField = (
    fieldId: string,
    value: string
  ) => {
    const updatedFields = requirement.fields.map((field) =>
      field.id === fieldId
        ? { ...field, value }
        : field
    );

    onChange({
      ...requirement,
      fields: updatedFields,
    });
  };

  const missingRequired = requirement.fields.filter(
    (field) => field.required && !field.value.trim()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              AI Generated
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Review Your Requirement
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Save karne se pehle details check ya edit kar lein.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>

        {/* CONTENT */}

        <div className="space-y-5 p-6">

          {/* CATEGORY */}

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
              Category
            </label>

            <input
              value={requirement.category}
              onChange={(e) =>
                onChange({
                  ...requirement,
                  category: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* TITLE */}

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
              Requirement
            </label>

            <input
              value={requirement.title}
              onChange={(e) =>
                onChange({
                  ...requirement,
                  title: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* DYNAMIC FIELDS */}

          <div className="grid gap-4 sm:grid-cols-2">

            {requirement.fields.map((field: RequirementField) => {

              const missing =
                field.required && !field.value.trim();

              return (
                <div key={field.id}>

                  <label className="mb-2 block text-xs font-bold uppercase text-slate-500">

                    {field.label}

                    {field.required && (
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    )}

                  </label>

                  <input
                    value={field.value}
                    onChange={(e) =>
                      updateField(
                        field.id,
                        e.target.value
                      )
                    }
                    placeholder={`Enter ${field.label}`}
                    className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                      missing
                        ? "border-amber-300 bg-amber-50"
                        : "border-slate-200 bg-slate-50"
                    } focus:border-blue-500 focus:bg-white`}
                  />

                </div>
              );
            })}

          </div>

          {missingRequired.length > 0 && (
            <div className="flex gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">

              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <strong>
                  Kuch important details missing hain.
                </strong>

                <p className="mt-1">
                  {missingRequired
                    .map((x) => x.label)
                    .join(", ")}
                </p>
              </div>

            </div>
          )}

        </div>

        {/* FOOTER */}

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-5">

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-blue-600"
          >
            <Save size={17} />
            Save Requirement
          </button>

        </div>

      </div>

    </div>
  );
}