import { Mic, MicOff } from "lucide-react";

interface VoiceButtonProps {
  listening: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export default function VoiceButton({
  listening,
  disabled = false,
  onClick,
}: VoiceButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={listening ? "Stop recording" : "Voice input"}
      className={[
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
        "transition-all",
        disabled
          ? "cursor-not-allowed bg-slate-100 text-slate-300"
          : listening
            ? "bg-red-50 text-red-600 ring-1 ring-red-200"
            : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-950 hover:text-white",
      ].join(" ")}
    >
      {listening ? <MicOff size={19} /> : <Mic size={19} />}
    </button>
  );
}