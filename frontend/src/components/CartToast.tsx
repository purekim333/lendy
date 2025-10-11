import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  message: string;
  actionLabel?: string;
  duration?: number;          // ms
  onAction?: () => void;
  onClose: () => void;
};

export default function CartToast({
  open,
  message,
  actionLabel = "장바구니로 이동",
  duration = 2500,
  onAction,
  onClose,
}: Props) {
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    // 자동 닫힘 타이머
    timer.current = window.setTimeout(() => onClose(), duration);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = null;
    };
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-4 z-[60]"
    >
      <div className="mx-auto w-full max-w-[480px] px-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-gray-900/90 px-4 py-3 text-white shadow-lg backdrop-blur-sm">
          <span className="text-sm">{message}</span>
          <div className="flex items-center gap-2">
            {onAction && (
              <button
                onClick={() => {
                  if (timer.current) window.clearTimeout(timer.current);
                  onAction();
                }}
                className="rounded-xl bg-emerald-300/90 px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-emerald-300"
              >
                {actionLabel}
              </button>
            )}
            <button
              aria-label="닫기"
              onClick={() => onClose()}
              className="grid h-7 w-7 place-items-center rounded-full text-white/80 hover:bg-white/10"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
