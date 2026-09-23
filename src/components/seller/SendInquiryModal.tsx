import {
    Coins,
    MessageCircle,
    ShieldCheck,
    X,
  } from "lucide-react";
  
  import {
    useState,
  } from "react";
  
  import type {
    SavedBuyerRequirement,
  } from "../../types/marketplace";
  
  interface Props {
    open: boolean;
  
    requirement:
      | SavedBuyerRequirement
      | null;
  
    currentBalance: number;
  
    inquiryCost: number;
    submitting?: boolean;
  
    onClose: () => void;
  
    onConfirm: (
      message: string,
      offeredPrice: string
    ) => void;
  }
  
  export default function SendInquiryModal({
    open,
    requirement,
    currentBalance,
    inquiryCost,
    submitting = false,
    onClose,
    onConfirm,
  }: Props) {
    const [
      message,
      setMessage,
    ] = useState("");
  
    const [
      offeredPrice,
      setOfferedPrice,
    ] = useState("");
  
    if (
      !open ||
      !requirement
    ) {
      return null;
    }
  
    const enoughCredits =
      currentBalance >=
      inquiryCost;
  
    const handleSubmit = () => {
      if (submitting) return;
      if (!message.trim()) {
        alert(
          "Please enter your message."
        );
  
        return;
      }
  
      onConfirm(
        message,
        offeredPrice
      );
    };
  
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
  
          <div className="flex items-start justify-between border-b border-slate-100 p-7">
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
                <MessageCircle
                  size={22}
                />
              </div>
  
              <h2 className="mt-5 text-2xl font-black">
                Send Inquiry
              </h2>
  
              <p className="mt-2 text-sm text-slate-500">
                Buyer ko apni offer
                bhejein.
              </p>
            </div>
  
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>
  
          {/* CONTENT */}
  
          <div className="p-7">
            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={16}
                  className="text-emerald-600"
                />
  
                <span className="text-xs font-semibold text-emerald-600">
                  Verified Requirement
                </span>
              </div>
  
              <h3 className="mt-3 font-black">
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
            </div>
  
            {/* WALLET */}
  
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Your Balance
                </p>
  
                <p className="mt-1 flex items-center gap-2 text-xl font-black">
                  <Coins
                    size={18}
                    className="text-amber-500"
                  />
  
                  {
                    currentBalance
                  }
                </p>
              </div>
  
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Inquiry Cost
                </p>
  
                <p className="mt-1 text-xl font-black">
                  {inquiryCost} Credits
                </p>
              </div>
            </div>
  
            {!enoughCredits && (
              <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
                Not enough credits.
                Admin se credits add
                karne honge.
              </div>
            )}
  
            {/* OFFER */}
  
            <div className="mt-6">
              <label className="mb-2 block text-sm font-bold">
                Offered Price
                <span className="ml-1 font-normal text-slate-400">
                  optional
                </span>
              </label>
  
              <input
                value={
                  offeredPrice
                }
                onChange={(event) =>
                  setOfferedPrice(
                    event.target.value
                  )
                }
                placeholder="e.g. PKR 140,000"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
  
            {/* MESSAGE */}
  
            <div className="mt-5">
              <label className="mb-2 block text-sm font-bold">
                Message
              </label>
  
              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value
                  )
                }
                rows={5}
                placeholder="Assalam-o-Alaikum, mere paas aapki requirement ke according laptop available hai..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
  
            <div className="mt-5 rounded-xl bg-blue-50 p-4 text-xs leading-5 text-blue-700">
              Inquiry send hone par{" "}
              <strong>
                {inquiryCost} credits
              </strong>{" "}
              deduct honge. Same
              requirement par duplicate
              inquiry allow nahi hogi.
            </div>
  
            <button
              type="button"
              disabled={
                !enoughCredits || submitting
              }
              onClick={
                handleSubmit
              }
              className="
                mt-6
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-slate-950
                px-5
                py-3.5
                font-semibold
                text-white
                transition
                hover:bg-blue-600
                disabled:cursor-not-allowed
                disabled:bg-slate-300
              "
            >
              <Coins size={18} />
  
              Send Inquiry •{" "}
              {inquiryCost} Credits
            </button>
          </div>
        </div>
      </div>
    );
  }
