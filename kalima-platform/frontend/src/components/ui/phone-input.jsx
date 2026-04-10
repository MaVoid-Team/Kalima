"use client";
import { useState, forwardRef, useEffect } from "react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";

export const egyptPhoneSchema = (t) => z.string().superRefine((value, ctx) => {
    // Allow empty during base validation.
    if (!value || value === "+20" || value === "") return;

    // Strict validation: +20 followed by exactly 10 digits
    const valid = /^\+20\d{10}$/.test(value);
    if (!valid) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t ? t("common:validation.invalidEgyptPhone", "Invalid Egyptian phone number. Must follow the prefix with 10 digits.") : "Invalid Egyptian phone number."
        });
    }
});

export const PhoneInput = forwardRef(
    (
        {
            className,
            onCountryChange,
            onChange,
            value,
            placeholder,
            defaultCountry = "EG",
            inline = false,
            ...props
        },
        ref
    ) => {
        const [hasInitialized, setHasInitialized] = useState(false);
        const egyptPrefix = "+20";
        const countryLabel = i18n.language === "ar" ? "مصر" : "Egypt";
        const countryShortLabel = i18n.language === "ar" ? "مصر" : "EG";
        const { t } = useTranslation("common");


        useEffect(() => {
            if (!hasInitialized) {
                // We keep this to inform the parent form that we are using the egypt prefix,
                // but we let it be empty if no digits are provided.
                setHasInitialized(true);
            }
        }, [hasInitialized]);

        const displayValue = (value || "").startsWith("+20") ? value.slice(3) : (value || "");

        const handlePhoneChange = (e) => {
            // Keep only digits and slice to 10
            let digits = e.target.value.replaceAll(/\D/g, "");

            // If they are pasting a number that starts with 0 or 20, clean it up
            if (digits.startsWith("20")) digits = digits.slice(2);
            if (digits.startsWith("0")) digits = digits.slice(1);

            digits = digits.slice(0, 10);

            const normalized = digits ? `${egyptPrefix}${digits}` : "";

            const syntheticEvent = {
                ...e,
                target: { ...e.target, value: normalized },
            };
            onChange?.(syntheticEvent);
        };

        const inputClasses = cn(
            "group relative flex h-11 w-full items-center gap-0 rounded-lg border border-input bg-background shadow-xs transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
            inline && "rounded-s-none",
            className
        );

        return (
            <div className={inputClasses}>
                <div
                    className="flex items-center gap-2 h-full px-3 bg-muted/30 border-e border-input/50 text-sm font-bold tracking-tight select-none no-drag"
                    dir="ltr"
                >
                    <span className="text-muted-foreground select-none">{countryShortLabel}</span>
                    <span className="text-primary font-extrabold select-none">{egyptPrefix}</span>
                </div>
                <input
                    ref={ref}
                    value={displayValue}
                    onChange={handlePhoneChange}
                    placeholder={placeholder || "1X XXXX XXXX"}
                    type="tel"
                    autoComplete="tel"
                    name="phone"
                    dir="ltr"
                    className="h-full w-full border-none bg-transparent px-3 text-sm font-semibold tracking-widest text-foreground placeholder:text-muted-foreground/50 outline-none"
                    {...props}
                />
            </div>
        );
    }
);

PhoneInput.displayName = "PhoneInput";