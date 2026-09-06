import {
    AlertCircle,
    BadgeCheck,
    Save,
  } from "lucide-react";
  
  import type {
    StructuredRequirement,
  } from "../../types/marketplace";
  
  interface Props {
    requirement: StructuredRequirement;
  
    onFieldChange: (
      fieldId: string,
      value: string
    ) => void;
  
    onSave?: () => void;
  }
  
  export default function RequirementSummary({
    requirement,
    onFieldChange,
    onSave,
  }: Props) {
    const missingRequiredCount =
      requirement.fields.filter(
        (field) =>
          field.required &&
          !field.value.trim()
      ).length;
  
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* HEADER */}
  
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black text-slate-950">
                {requirement.title}
              </h2>
  
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                <BadgeCheck
                  size={13}
                />
  
                AI Generated
              </span>
            </div>
  
            <p className="mt-2 text-sm text-slate-500">
              {
                requirement.category
              }
  
              {requirement.subCategory
                ? ` • ${requirement.subCategory}`
                : ""}
            </p>
          </div>
        </div>
  
        {/* MISSING WARNING */}
  
        {missingRequiredCount >
          0 && (
          <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-amber-600"
            />
  
            <p className="text-sm leading-6 text-amber-800">
              {
                missingRequiredCount
              }{" "}
              required field
              {missingRequiredCount >
              1
                ? "s are"
                : " is"}{" "}
              missing.
            </p>
          </div>
        )}
  
        {/* DYNAMIC FIELDS */}
  
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {requirement.fields.map(
            (field) => {
              const isMissing =
                field.required &&
                !field.value.trim();
  
              return (
                <div
                  key={field.id}
                >
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    {field.label}
  
                    {field.required && (
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    )}
                  </label>
  
                  <input
                    type="text"
                    value={
                      field.value
                    }
                    onChange={(
                      event
                    ) =>
                      onFieldChange(
                        field.id,
                        event
                          .target
                          .value
                      )
                    }
                    className={`w-full rounded-xl border bg-slate-50 px-4 py-3 outline-none transition ${
                      isMissing
                        ? "border-amber-300 focus:border-amber-500"
                        : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
  
                  {isMissing && (
                    <p className="mt-1 text-xs font-medium text-amber-600">
                      This field is
                      required.
                    </p>
                  )}
                </div>
              );
            }
          )}
        </div>
  
        {/* SAVE */}
  
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={
              missingRequiredCount >
              0
            }
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Save size={18} />
  
            Save Requirement
          </button>
        )}
      </div>
    );
  }