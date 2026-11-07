"use client";

import React, { useRef, useEffect } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({
  value = "",
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
  autoFocus = true,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Array of 6 characters
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const handlePastedText = (pasted: string) => {
    const cleanDigits = pasted.replace(/\D/g, "").slice(0, 6);
    if (!cleanDigits) return;

    onChange(cleanDigits);

    const nextIndex = Math.min(cleanDigits.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (cleanDigits.length === 6 && onComplete) {
      onComplete(cleanDigits);
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const cleanVal = rawVal.replace(/\D/g, "");

    // User cleared the box
    if (!cleanVal) {
      const newDigits = [...digits];
      newDigits[index] = "";
      onChange(newDigits.join(""));
      return;
    }

    // User pasted or browser autofilled multiple digits
    if (cleanVal.length > 1) {
      handlePastedText(cleanVal);
      return;
    }

    // Single digit typed
    const digit = cleanVal.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    const newValue = newDigits.join("");
    onChange(newValue);

    // Auto advance to next input box
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto complete when all 6 digits entered
    if (newValue.length === 6 && onComplete) {
      onComplete(newValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Move to previous box and delete its value
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    handlePastedText(pasted);
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-2.5 my-3 select-none">
      {digits.map((digit, idx) => (
        <React.Fragment key={idx}>
          {idx === 3 && (
            <div className="text-muted-foreground/30 font-bold text-lg px-0.5 select-none">
              –
            </div>
          )}
          <input
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            value={digit}
            onChange={(e) => handleChange(idx, e)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            disabled={disabled}
            className={`
              w-11 h-14 sm:w-12 sm:h-16
              text-center text-xl sm:text-2xl font-bold font-mono
              rounded-xl border
              bg-card/80 backdrop-blur-md text-foreground
              outline-none transition-all duration-200
              ${
                hasError
                  ? "border-destructive/80 text-destructive focus:ring-4 focus:ring-destructive/20 animate-shake"
                  : digit
                  ? "border-primary/80 bg-primary/5 text-primary shadow-[0_0_15px_rgba(var(--primary),0.15)] ring-1 ring-primary/40"
                  : "border-border/80 hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/20"
              }
              focus:scale-105
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-label={`Digit ${idx + 1} of 6`}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
