import {
  BadgeCheck,
  MapPin,
  Mic,
  Paperclip,
  Send,
  Sparkles,
} from "lucide-react";
import BasicModal from "./BasicModal";

interface FindInfoModalsProps {
  showHowItWorks: boolean;
  showHelp: boolean;
  onCloseHowItWorks: () => void;
  onCloseHelp: () => void;
}

export default function FindInfoModals({
  showHowItWorks,
  showHelp,
  onCloseHowItWorks,
  onCloseHelp,
}: FindInfoModalsProps) {
  return (
    <>
      {showHowItWorks && (
        <BasicModal
          title="How It Works"
          onClose={() =>
            onCloseHowItWorks()
          }
        >
          <div className="space-y-5">
            <div className="rounded-2xl bg-blue-50 p-5">
              <h3 className="font-black text-slate-900">
                KhojMarket ka complete process
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Product ya service Roman Urdu, Urdu ya English mein describe karein. Voice aur multiple images bhi use kar sakte hain.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["1", "Requirement Add Karein", "Text, voice aur maximum 20 images ke sath requirement add karein."],
                ["2", "Details Review Karein", "Generated fields, location, budget aur category ko review/edit karein."],
                ["3", "Verification Complete Karein", "Phone aur requirement verification complete hone ke baad post public hoti hai."],
                ["4", "Seller Inquiries", "Verified sellers active requirement par inquiry ya quotation bhejte hain."],
              ].map(([number, stepTitle, description]) => (
                <div
                  key={number}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                    {number}
                  </div>

                  <h4 className="mt-4 font-black">
                    {stepTitle}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {description}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex gap-3">
                <BadgeCheck className="mt-0.5 shrink-0 text-emerald-600" />

                <div>
                  <h4 className="font-black">
                    Verified Requirement
                  </h4>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Badge requirement ki verification show karta hai. Ye automatically user ko Verified User declare nahi karta.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </BasicModal>
      )}

      {showHelp && (
        <BasicModal
          title="Help"
          onClose={() =>
            onCloseHelp()
          }
        >
          <div className="space-y-5">
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="font-black">
                Help & Icons Guide
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Har important action ka icon aur purpose neeche diya gaya hai.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex gap-3 rounded-2xl border border-slate-200 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Mic size={19} />
                </div>
                <div>
                  <h4 className="text-sm font-black">Voice Input</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Roman Urdu ya Urdu mein requirement bolne ke liye.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-slate-200 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Paperclip size={19} />
                </div>
                <div>
                  <h4 className="text-sm font-black">Images</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Maximum 20 product/service images attach karne ke liye.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-slate-200 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Sparkles size={19} />
                </div>
                <div>
                  <h4 className="text-sm font-black">Generate Fields</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Customer ke text ke hisab se relevant fields generate karta hai.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-slate-200 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <MapPin size={19} />
                </div>
                <div>
                  <h4 className="text-sm font-black">Map Location</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Filter mein map/current location se location select karne ke liye.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-slate-200 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <BadgeCheck size={19} />
                </div>
                <div>
                  <h4 className="text-sm font-black">Verified Requirement</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Requirement verification complete hone ka badge.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-slate-200 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Send size={19} />
                </div>
                <div>
                  <h4 className="text-sm font-black">Send Inquiry</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Verified seller active requirement par inquiry bhejta hai.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h4 className="font-black">
                Submit issue?
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Red * wale fields complete karein, Country aur City select karein, aur kam az kam 1 image upload karein.
              </p>
            </div>
          </div>
        </BasicModal>
      )}

    </>
  );
}
