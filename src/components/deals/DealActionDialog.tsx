import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Star, X } from "lucide-react";

export type DealAction = "request" | "confirm" | "cancel" | "review" | "report" | "warning" | "dismiss" | "unblock";
export interface DealActionValues { rating: number; comment: string; reason: string; category: string }

const copy = {
  report: { title: "Report a problem", description: "Describe what happened with this deal. An admin will review your complaint; submitting a report does not automatically issue a warning.", button: "Submit report" },
  warning: { title: "Issue a warning", description: "Confirm this complaint only after reviewing the evidence. One warning will be recorded; three confirmed warnings automatically block the account.", button: "Confirm and issue warning" },
  dismiss: { title: "Dismiss complaint", description: "Record why this complaint should be dismissed. No warning will be issued.", button: "Dismiss complaint" },
  unblock: { title: "Unblock account", description: "Restore this user's access. Existing warnings are retained, so another confirmed warning may block the account again.", button: "Unblock account" },
  request: { title: "Request completion", description: "Confirm that the agreed product or service has been delivered. The seller must confirm before this deal is completed.", button: "Send completion request" },
  confirm: { title: "Confirm completion", description: "The buyer has requested completion. Confirm only if the agreed product or service has been delivered. Both parties can then leave a review.", button: "Confirm completed deal" },
  cancel: { title: "Cancel deal", description: "Tell the other party why this deal cannot continue. Your reason will be saved with the deal.", button: "Cancel deal" },
  review: { title: "Leave a review", description: "Rate your experience with the other party. Your review is saved against this completed deal.", button: "Submit review" },
};

export default function DealActionDialog({ action, title, counterpart, onClose, onSubmit }: {
  action: DealAction;
  title: string;
  counterpart: string;
  onClose: () => void;
  onSubmit: (values: DealActionValues) => Promise<void>;
}) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reason, setReason] = useState("");
  const [category, setCategory] = useState("");
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!submitting.current) close.current();
      }
      if (event.key !== "Tab") return;
      const elements = Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]') ?? []);
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); panel.current?.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", handleKey);
      previousFocus?.focus();
    };
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting.current) return;
    if (action === "review" && (rating < 1 || rating > 5)) { setError("Please select a rating from 1 to 5 stars."); return; }
    if (action === "cancel" && !reason.trim()) { setError("Please enter a cancellation reason."); return; }
    if (action === "report" && (!category || !reason.trim())) { setError("Please select a category and describe the problem."); return; }
    if ((action === "warning" || action === "dismiss") && !reason.trim()) { setError("Please enter an admin review note."); return; }
    submitting.current = true;
    setBusy(true);
    setError("");
    try { await onSubmit({ rating, comment: comment.trim(), reason: reason.trim(), category }); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Unable to save. Please try again."); }
    finally { submitting.current = false; setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={event => { if (event.target === event.currentTarget && !submitting.current) onClose(); }}>
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} tabIndex={-1} className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl outline-none sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-widest text-blue-600">{["warning", "dismiss", "unblock"].includes(action) ? "Admin moderation" : "Marketplace deal"}</p><h2 id={`${id}-title`} className="mt-2 text-2xl font-black text-slate-950">{copy[action].title}</h2></div>
          <button type="button" aria-label="Close dialog" disabled={busy} onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"><X size={20} /></button>
        </div>
        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-800">{title}</p>
        <p id={`${id}-description`} className="mt-4 text-sm leading-6 text-slate-600">{copy[action].description}</p>
        <form onSubmit={submit} className="mt-6 space-y-5">
          {action === "review" && <>
            <fieldset disabled={busy}><legend className="text-sm font-bold text-slate-800">Your rating for {counterpart}</legend>
              <div className="mt-3 flex gap-2">{[1, 2, 3, 4, 5].map(value => <label key={value} className="cursor-pointer rounded-lg p-1 focus-within:ring-2 focus-within:ring-blue-600">
                <input className="sr-only" type="radio" name={`${id}-rating`} value={value} checked={rating === value} onChange={() => { setRating(value); setError(""); }} aria-label={`${value} ${value === 1 ? "star" : "stars"}`} />
                <Star size={32} aria-hidden="true" className={value <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
              </label>)}</div><p className="mt-2 text-xs text-slate-500" aria-live="polite">{rating ? `${rating} of 5 stars` : "Select a rating"}</p>
            </fieldset>
            <div><label htmlFor={`${id}-comment`} className="text-sm font-bold text-slate-800">Review <span className="font-normal text-slate-400">(optional)</span></label><textarea id={`${id}-comment`} disabled={busy} value={comment} onChange={event => setComment(event.target.value)} maxLength={1000} rows={4} placeholder="What went well? What could be better?" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500" /><p className="text-right text-xs text-slate-400">{comment.length}/1000</p></div>
          </>}
          {action === "cancel" && <div><label htmlFor={`${id}-reason`} className="text-sm font-bold text-slate-800">Cancellation reason <span className="text-red-500">*</span></label><textarea id={`${id}-reason`} required disabled={busy} value={reason} onChange={event => setReason(event.target.value)} maxLength={1000} rows={4} placeholder="Explain why you need to cancel this deal" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500" /><p className="text-right text-xs text-slate-400">{reason.length}/1000</p></div>}
          {action === "report" && <div>
            <label htmlFor={`${id}-category`} className="text-sm font-bold text-slate-800">Complaint category *</label>
            <select id={`${id}-category`} required disabled={busy} value={category} onChange={event => setCategory(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm">
              <option value="">Select a category</option>
              <option value="delivery_issue">Delivery or service issue</option><option value="payment_issue">Payment issue</option><option value="quality_issue">Product or service quality</option><option value="misconduct">Misconduct or misleading information</option><option value="other">Other</option>
            </select>
          </div>}
          {(["report", "warning", "dismiss"] as DealAction[]).includes(action) && <div>
            <label htmlFor={`${id}-details`} className="text-sm font-bold text-slate-800">{action === "report" ? "What happened?" : "Admin review note"} *</label>
            <textarea id={`${id}-details`} required disabled={busy} value={reason} onChange={event => setReason(event.target.value)} maxLength={action === "report" ? 1500 : 1000} rows={4} placeholder={action === "report" ? "Include relevant facts about this deal" : "Explain your decision"} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500" />
            <p className="text-right text-xs text-slate-400">{reason.length}/{action === "report" ? 1500 : 1000}</p>
          </div>}
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button type="button" disabled={busy} onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold disabled:opacity-50">Go back</button>
            <button type="submit" disabled={busy} className={`rounded-xl px-4 py-3 text-sm font-bold text-white disabled:opacity-50 ${(action === "cancel" || action === "warning") ? "bg-red-600" : "bg-blue-600"}`}>{busy ? "Saving…" : copy[action].button}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
