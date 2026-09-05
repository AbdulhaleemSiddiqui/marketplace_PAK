import {
    BadgeCheck,
    Building2,
    MapPin,
    ShieldCheck,
    Store,
    X,
  } from "lucide-react";
  
  import {
    useEffect,
    useState,
  } from "react";
  
  interface Props {
    open: boolean;
  
    onClose: () => void;
  
    onVerify: (
      businessName: string,
      city: string,
      category: string
    ) => void;
  }
  
  export default function SellerVerificationModal({
    open,
    onClose,
    onVerify,
  }: Props) {
    const [
      businessName,
      setBusinessName,
    ] = useState("");
  
    const [
      city,
      setCity,
    ] = useState("");
  
    const [
      category,
      setCategory,
    ] = useState("");
  
    useEffect(() => {
      if (!open) {
        return;
      }
  
      setBusinessName("");
      setCity("");
      setCategory("");
    }, [open]);
  
    if (!open) {
      return null;
    }
  
    const handleVerify = () => {
      if (
        !businessName.trim() ||
        !city.trim() ||
        !category.trim()
      ) {
        alert(
          "Business name, city aur category required hain."
        );
  
        return;
      }
  
      onVerify(
        businessName.trim(),
        city.trim(),
        category.trim()
      );
    };
  
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
          {/* HEADER */}
  
          <div className="flex items-start justify-between border-b border-slate-100 p-7">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ShieldCheck
                  size={22}
                />
              </div>
  
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                Seller Trust
              </p>
  
              <h2 className="mt-1 text-2xl font-black">
                Verify Seller
              </h2>
  
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Verified sellers hi
                buyer requirements par
                paid inquiry send kar
                sakenge.
              </p>
            </div>
  
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>
  
          <div className="p-7">
            {/* BUSINESS */}
  
            <label className="text-sm font-bold text-slate-700">
              Business / Store Name
            </label>
  
            <div className="relative mt-2">
              <Building2
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
  
              <input
                value={
                  businessName
                }
                onChange={(
                  event
                ) =>
                  setBusinessName(
                    event.target
                      .value
                  )
                }
                placeholder="e.g. Tech Zone"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none focus:border-blue-500"
              />
            </div>
  
            {/* CITY */}
  
            <label className="mt-5 block text-sm font-bold text-slate-700">
              Business City
            </label>
  
            <div className="relative mt-2">
              <MapPin
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
  
              <input
                value={city}
                onChange={(
                  event
                ) =>
                  setCity(
                    event.target
                      .value
                  )
                }
                placeholder="Karachi"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none focus:border-blue-500"
              />
            </div>
  
            {/* CATEGORY */}
  
            <label className="mt-5 block text-sm font-bold text-slate-700">
              Selling Category
            </label>
  
            <div className="relative mt-2">
              <Store
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
  
              <select
                value={category}
                onChange={(
                  event
                ) =>
                  setCategory(
                    event.target
                      .value
                  )
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none focus:border-blue-500"
              >
                <option value="">
                  Select category
                </option>
  
                <option value="Electronics">
                  Electronics
                </option>
  
                <option value="Vehicles">
                  Vehicles
                </option>
  
                <option value="Fashion">
                  Fashion
                </option>
  
                <option value="Construction">
                  Construction
                </option>
  
                <option value="Services">
                  Services
                </option>
  
                <option value="General Trading">
                  General Trading
                </option>
              </select>
            </div>
  
            <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              <strong>
                Demo mode:
              </strong>{" "}
              abhi verification
              instantly approve hogi.
              Production mein request
              Admin Verification Queue
              mein jayegi.
            </div>
  
            <button
              type="button"
              onClick={
                handleVerify
              }
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white hover:bg-blue-600"
            >
              <BadgeCheck
                size={18}
              />
  
              Verify Seller
            </button>
          </div>
        </div>
      </div>
    );
  }