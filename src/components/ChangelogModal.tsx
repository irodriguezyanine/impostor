"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollText, X } from "lucide-react";
import { CHANGELOG } from "@/lib/product-stubs";

type ChangelogModalProps = {
  open?: boolean;
  onClose?: () => void;
};

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ChangelogModal({
  open: controlledOpen,
  onClose,
}: ChangelogModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const close = () => {
    if (isControlled) onClose?.();
    else setInternalOpen(false);
  };

  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus(), 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (isControlled) onClose?.();
        else setInternalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(t);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isControlled, onClose]);

  const modal =
    mounted &&
    createPortal(
      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4">
            <motion.button
              type="button"
              aria-label="Cerrar"
              className="absolute inset-0 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="relative w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl bg-surface border border-white/10 shadow-modal"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <h2
                  id={titleId}
                  className="text-lg font-bold text-slate-100 flex items-center gap-2"
                >
                  <ScrollText size={18} className="text-primary" aria-hidden />
                  Novedades
                </h2>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-200 min-h-[44px] min-w-[44px]"
                  aria-label="Cerrar"
                >
                  <X size={20} aria-hidden />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {CHANGELOG.map((entry) => (
                  <section key={entry.version}>
                    <div className="flex items-baseline gap-2 mb-2">
                      <h3 className="font-bold text-primary">
                        v{entry.version}
                      </h3>
                      <span className="text-xs text-slate-500">
                        {entry.date}
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {entry.items.map((item) => (
                        <li
                          key={item}
                          className="text-sm text-slate-300 pl-3 border-l-2 border-white/10"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>,
      document.body
    );

  return (
    <>
      {!isControlled ? (
        <button
          type="button"
          onClick={() => setInternalOpen(true)}
          className="text-xs text-slate-500 hover:text-primary inline-flex items-center gap-1"
        >
          <ScrollText size={14} aria-hidden />
          Novedades v{CHANGELOG[0]?.version}
        </button>
      ) : null}
      {modal}
    </>
  );
}
