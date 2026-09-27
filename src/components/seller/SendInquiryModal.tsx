import {
    Coins,
    MessageCircle,
    ShieldCheck,
    WalletCards,
    X,
  } from "lucide-react";
  
  import {
    useEffect,
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
  
    useEffect(() => {
      if (!open) {
        setMessage("");
        setOfferedPrice("");
      }
    }, [open]);

    if (
      !open ||
      !requirement
    ) {
      return null;
    }
  
    const enoughCredits =
      currentBalance >=
      inquiryCost;

    const numericOfferedPrice =
      offeredPrice.replace(/[^0-9]/g, "");

    const formattedOfferedPrice =
      numericOfferedPrice
        ? Number(numericOfferedPrice).toLocaleString("en-PK")
        : "";
  
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
          p-3
          sm:p-4
          backdrop-blur-sm
        "
      >
        <div
          className="
            w-full
            max-w-xl
            max-h-[calc(100vh-1.5rem)]
            overflow-y-auto
            rounded-3xl
            bg-white
            shadow-2xl
          "
        >
          {/* HEADER */}
  
          <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
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
  
              <h2 className="mt-3 text-xl font-black sm:text-2xl">
                Send Your Offer
              </h2>
  
              <p className="mt-1 text-sm text-slate-500">
                Share your price and a short message with the buyer.
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
  
          <div className="px-5 py-4 sm:px-6 sm:py-5">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={16}
                  className="text-emerald-600"
                />
  
                <span className="text-xs font-semibold text-emerald-600">
                  Verified Requirement
                </span>
              </div>
  
              <h3 className="mt-2 font-black">
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
  
            <div className="mt-4 grid grid-cols-2 gap-3">
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
                Not enough credits. Please contact support to add credits.
              </div>
            )}
  
            {/* OFFER */}
  
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-sm font-bold">
                  Offered Price
                  <span className="ml-1 font-normal text-slate-400">
                    optional
                  </span>
                </label>
                <span className="text-xs font-semibold text-slate-400">
                  PKR
                </span>
              </div>

              <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <div className="flex items-center gap-2 border-r border-slate-200 bg-white px-4 text-sm font-black text-slate-700">
                  <WalletCards size={16} className="text-blue-600" />
                  PKR
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formattedOfferedPrice}
                  onChange={(event) =>
                    setOfferedPrice(
                      event.target.value.replace(/[^0-9]/g, "")
                    )
                  }
                  placeholder="140,000"
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base font-bold text-slate-950 outline-none"
                />
              </div>

              {numericOfferedPrice && (
                <p className="mt-1.5 text-xs font-semibold text-slate-400">
                  Your offer: PKR {formattedOfferedPrice}
                </p>
              )}
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
                rows={4}
                placeholder="Assalam-o-Alaikum, mere paas aapki requirement ke according laptop available hai..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
  
            <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-700">
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
                mt-4
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
