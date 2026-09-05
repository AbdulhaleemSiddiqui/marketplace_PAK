import {
    CheckCircle2,
    PhoneCall,
    ShieldCheck,
    Sparkles,
    X,
  } from "lucide-react";
  
  import type { SavedBuyerRequirement } from "../../types/marketplace";
  
  interface Props {
    open: boolean;
  
    requirement:
      | SavedBuyerRequirement
      | null;
  
    onClose: () => void;
  
    onConfirm: () => void;
  }
  
  export default function AiVerificationModal({
    open,
    requirement,
    onClose,
    onConfirm,
  }: Props) {
    if (
      !open ||
      !requirement
    ) {
      return null;
    }
  
    const importantFields =
      requirement.fields
        .filter(
          (field) =>
            field.value.trim()
        )
        .slice(0, 6);
  
    return (
      <div
        className="
          fixed
          inset-0
          z-[100]
          flex
          items-center
          justify-center
          bg-slate-950/60
          p-4
          backdrop-blur-sm
        "
      >
        <div
          className="
            w-full
            max-w-lg
            overflow-hidden
            rounded-3xl
            bg-white
            shadow-2xl
          "
        >
          {/* HEADER */}
  
          <div
            className="
              flex
              items-start
              justify-between
              border-b
              border-slate-100
              p-7
            "
          >
            <div>
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-blue-50
                  text-blue-600
                "
              >
                <PhoneCall
                  size={22}
                />
              </div>
  
              <p
                className="
                  mt-5
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-blue-600
                "
              >
                Mock AI Call
              </p>
  
              <h2 className="mt-1 text-2xl font-black">
                Requirement
                Verification
              </h2>
            </div>
  
            <button
              type="button"
              onClick={onClose}
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                text-slate-400
                hover:bg-slate-100
              "
            >
              <X size={20} />
            </button>
          </div>
  
          {/* CONTENT */}
  
          <div className="p-7">
            <div
              className="
                rounded-2xl
                border
                border-blue-100
                bg-blue-50/60
                p-5
              "
            >
              <div className="flex gap-3">
                <Sparkles
                  size={20}
                  className="mt-0.5 shrink-0 text-blue-600"
                />
  
                <div>
                  <p className="font-bold text-slate-900">
                    KhojMarket AI
                  </p>
  
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Assalam-o-Alaikum.
                    Aap ne ye buyer
                    requirement submit
                    ki hai. Kya ye
                    requirement correct
                    aur currently active
                    hai?
                  </p>
                </div>
              </div>
            </div>
  
            {/* REQUIREMENT */}
  
            <div className="mt-5 rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={17}
                  className="text-emerald-600"
                />
  
                <span className="text-xs font-semibold text-emerald-600">
                  Phone Verified
                </span>
              </div>
  
              <h3 className="mt-4 text-xl font-black">
                {
                  requirement.title
                }
              </h3>
  
              <p className="mt-1 text-sm text-slate-500">
                {
                  requirement.category
                }
  
                {requirement.subCategory
                  ? ` • ${requirement.subCategory}`
                  : ""}
              </p>
  
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {importantFields.map(
                  (field) => (
                    <div
                      key={
                        field.id
                      }
                      className="rounded-xl bg-slate-50 p-3"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        {
                          field.label
                        }
                      </p>
  
                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {
                          field.value
                        }
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
  
            <p className="mt-5 text-center text-sm text-slate-500">
              Confirm karne ke
              baad requirement public
              Buyer Requirements
              section mein live ho
              jayegi.
            </p>
  
            {/* ACTIONS */}
  
            <button
              type="button"
              onClick={onConfirm}
              className="
                mt-6
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-emerald-600
                px-5
                py-3.5
                font-semibold
                text-white
                transition
                hover:bg-emerald-700
              "
            >
              <CheckCircle2
                size={18}
              />
  
              Yes, Confirm Requirement
            </button>
  
            <button
              type="button"
              onClick={onClose}
              className="
                mt-3
                w-full
                rounded-xl
                border
                border-slate-200
                px-5
                py-3
                text-sm
                font-semibold
                text-slate-600
                hover:bg-slate-50
              "
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    );
  }