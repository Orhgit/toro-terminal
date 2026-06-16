"use client";

/**
 * ConfirmDialog — reusable confirmation modal.
 *
 * Accessible: role=alertdialog, focus trap, Escape closes, focus restored
 * to the previously active element on unmount (RIN-387).
 */

import { useId } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useDialogA11y } from "../../lib/use-dialog-a11y";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "אישור",
  cancelLabel = "ביטול",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useDialogA11y(onCancel);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scaleIn outline-none"
      >
        <button
          onClick={onCancel}
          aria-label={cancelLabel}
          className="absolute top-3 left-3 p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <X className="h-4 w-4 text-slate-400" />
        </button>

        <div className="flex items-start gap-3 mb-4">
          <div className={`p-2 rounded-xl flex-shrink-0 ${variant === "danger" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 id={titleId} className="text-sm font-black text-slate-800">{title}</h3>
            <p id={descId} className="text-xs text-slate-500 mt-1">{message}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-white
              ${variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-amber-500 hover:bg-amber-600"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
