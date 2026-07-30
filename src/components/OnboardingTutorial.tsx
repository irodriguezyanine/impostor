"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Smartphone, EyeOff, Vote, X, ChevronRight } from "lucide-react";

type OnboardingTutorialProps = {
  open: boolean;
  onClose: () => void;
};

const STEPS = [
  {
    icon: Smartphone,
    title: "Pasa el teléfono",
    body: "Cada jugador ve su carta en secreto. Cuando termine, ocúltala y pásale el móvil al siguiente.",
  },
  {
    icon: EyeOff,
    title: "No digas la palabra",
    body: "Los civiles conocen la palabra secreta. Da pistas sin decirla. El impostor debe fingir.",
  },
  {
    icon: Vote,
    title: "Discutan y voten",
    body: "Después de las pistas, debatan. Voten en secreto a quién creen que es el impostor.",
  },
] as const;

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function OnboardingTutorial({ open, onClose }: OnboardingTutorialProps) {
  const [step, setStep] = useState(0);
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus(), 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step >= STEPS.length - 1;

  const modal = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-sm rounded-2xl bg-surface border border-white/10 p-6 shadow-modal"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-3 right-3 p-2 rounded-lg text-slate-400 hover:text-slate-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X size={20} aria-hidden="true" />
            </button>

            <div className="text-center space-y-4 pt-2">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                <Icon size={28} className="text-primary" aria-hidden="true" />
              </div>
              <h2
                id={titleId}
                className="text-xl font-bold text-slate-100"
              >
                {current.title}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                {current.body}
              </p>
              <div className="flex justify-center gap-1.5 pt-1">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-6 rounded-full ${
                      i === step ? "bg-primary" : "bg-white/15"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex-1 py-3 rounded-xl bg-surface-light border border-white/10 text-slate-100 font-semibold min-h-[48px]"
                >
                  Atrás
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (isLast) onClose();
                  else setStep((s) => s + 1);
                }}
                className="flex-1 py-3 rounded-xl bg-primary text-gray-900 font-bold flex items-center justify-center gap-1 min-h-[48px]"
              >
                {isLast ? "Entendido" : "Siguiente"}
                {!isLast && <ChevronRight size={18} aria-hidden="true" />}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}
