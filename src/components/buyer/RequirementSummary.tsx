import type { StructuredRequirement } from "../../types/marketplace";

interface RequirementSummaryProps {
  requirement: StructuredRequirement;
  onChange: (field: keyof StructuredRequirement, value: string) => void;
}

export default function RequirementSummary({
  requirement,
  onChange,
}: RequirementSummaryProps) {
  const fields: {
    key: keyof StructuredRequirement;
    label: string;
  }[] = [
    { key: "category", label: "Category" },
    { key: "product", label: "Product" },
    { key: "brand", label: "Brand" },
    { key: "model", label: "Model" },
    { key: "processor", label: "Processor" },
    { key: "ram", label: "RAM" },
    { key: "storage", label: "Storage" },
    { key: "condition", label: "Condition" },
    { key: "budget", label: "Budget" },
    { key: "location", label: "Location" },
    { key: "warranty", label: "Warranty" },
  ];

  const completed = fields.filter(
    (field) => requirement[field.key]?.trim() !== ""
  ).length;

  const percentage = Math.round((completed / fields.length) * 100);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          AI Generated
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-950">
          Your Requirement
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          AI ki generated details ko aap manually edit bhi kar sakte hain.
        </p>
      </div>

      <div className="space-y-4">
        {fields.map((field) => {
          const isMissing = !requirement[field.key]?.trim();

          return (
            <div key={field.key}>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                {field.label}
              </label>

              <input
                value={requirement[field.key]}
                onChange={(event) =>
                  onChange(field.key, event.target.value)
                }
                placeholder={
                  isMissing ? `${field.label} missing` : field.label
                }
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition
                  ${
                    isMissing
                      ? "border-amber-200 bg-amber-50 text-slate-900 placeholder:text-amber-500"
                      : "border-slate-200 bg-slate-50 text-slate-900"
                  }
                  focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100
                `}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-7">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-600">
            Requirement completeness
          </span>

          <span className="font-bold text-blue-600">
            {percentage}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <button className="mt-7 w-full rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-600">
        Find Sellers
      </button>
    </div>
  );
}