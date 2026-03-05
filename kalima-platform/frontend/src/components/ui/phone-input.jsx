"use client";
import { useState, forwardRef, useEffect } from "react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";

export const egyptPhoneSchema = z.string().superRefine((value, ctx) => {
    const valid = /^\+20\d{10}$/.test(value || "");
    if (!valid) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: i18n.t(
                "cart:validation.invalidEgyptPhone",
                "Invalid Egyptian phone number. Must start with +20 followed by 10 digits.",
            ),
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
        const normalizeEgyptPhone = (rawValue) => {
            const cleaned = String(rawValue || "").replaceAll(/[^\d+]/g, "");

            if (!cleaned) return "";
            if (cleaned === "+" || cleaned === "+2" || cleaned === "+20") return cleaned;

            let digits = cleaned;
            if (digits.startsWith("+")) digits = digits.slice(1);
            if (digits.startsWith("20")) digits = digits.slice(2);
            if (digits.startsWith("0")) digits = digits.slice(1);

            digits = digits.replaceAll(/\D/g, "").slice(0, 10);
            return `${egyptPrefix}${digits}`;
        };

        useEffect(() => {
            if (!hasInitialized) {
                if (!value) {
                    const syntheticEvent = {
                        target: {
                            value: "+20",
                        },
                    };
                    onChange?.(syntheticEvent);
                }
                setHasInitialized(true);
            }
        }, [hasInitialized, onChange, value]);

        const handlePhoneChange = (e) => {
            const normalized = normalizeEgyptPhone(e.target.value);
            const syntheticEvent = {
                ...e,
                target: { ...e.target, value: normalized },
            };
            onChange?.(syntheticEvent);
        };

        const inputClasses = cn(
            "group relative flex h-11 w-full items-center gap-2 rounded-lg border border-input bg-background px-3 shadow-xs transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 disabled:opacity-50 disabled:cursor-not-allowed",
            inline && "rounded-s-none",
            className
        );

        return (
            <div className={inputClasses}>
                {!inline && (
                    <div
                        className="shrink-0 p-2 rounded-md bg-muted flex items-center justify-center text-sm leading-none border border-border/60"
                        title={countryLabel}
                    >
                        <span aria-hidden="true">{countryShortLabel}</span>
                        <span className="sr-only">{countryLabel}</span>
                    </div>
                )}
                <input
                    ref={ref}
                    value={value}
                    onChange={handlePhoneChange}
                    placeholder={placeholder || t("common:enterNumber", "Enter number")}
                    type="tel"
                    autoComplete="tel"
                    name="phone"
                    dir="ltr"
                    className="h-full w-full border-none bg-transparent p-0 text-sm font-medium tracking-wide text-foreground placeholder:text-muted-foreground outline-none"
                    {...props}
                />
            </div>
        );
    }
);

PhoneInput.displayName = "PhoneInput";