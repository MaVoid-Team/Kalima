"use client";
import { useState, forwardRef, useEffect } from "react";
import parsePhoneNumber, { isValidPhoneNumber } from "libphonenumber-js";
import { CircleFlag } from "react-circle-flags";
import { lookup } from "country-data-list";
import { z } from "zod";
import { cn } from "@/lib/utils";

import { GlobeIcon } from "lucide-react";

export const egyptPhoneSchema = z.string().refine((value) => {
    try {
        const parsed = parsePhoneNumber(value, "EG");
        return parsed && parsed.isValid() && parsed.country === "EG";
    } catch {
        return false;
    }
}, "Invalid Egyptian phone number");

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
        const [countryData, setCountryData] = useState();
        const [displayFlag, setDisplayFlag] = useState("eg");
        const [hasInitialized, setHasInitialized] = useState(false);

        useEffect(() => {
            const newCountryData = lookup.countries({
                alpha2: "eg",
            })[0];
            setCountryData(newCountryData);
            setDisplayFlag("eg");

            if (
                !hasInitialized &&
                newCountryData?.countryCallingCodes?.[0] &&
                !value
            ) {
                const syntheticEvent = {
                    target: {
                        value: newCountryData.countryCallingCodes[0], // '+20'
                    },
                };
                onChange?.(syntheticEvent);
                setHasInitialized(true);
            }
        }, [onChange, value, hasInitialized]);

        const handlePhoneChange = (e) => {
            let newValue = e.target.value;

            // Restrict and format directly to Egypt prefix (+20)
            if (!newValue || newValue === "+" || newValue === "+2") {
                // allow typing the prefix
            } else if (newValue.startsWith("01")) {
                newValue = "+20" + newValue.slice(1);
            } else if (newValue.startsWith("20")) {
                newValue = "+" + newValue;
            } else if (!newValue.startsWith("+")) {
                newValue = "+" + newValue;
            }

            try {
                const parsed = parsePhoneNumber(newValue, "EG");

                if (parsed && parsed.country) {
                    if (parsed.country === "EG") {
                        const syntheticEvent = {
                            ...e,
                            target: { ...e.target, value: parsed.number },
                        };
                        onChange?.(syntheticEvent);
                    } else {
                        // Prevent non-Egyptian country codes
                        const syntheticEvent = {
                            ...e,
                            target: { ...e.target, value: "+20" },
                        };
                        onChange?.(syntheticEvent);
                    }
                } else {
                    const syntheticEvent = {
                        ...e,
                        target: { ...e.target, value: newValue },
                    };
                    onChange?.(syntheticEvent);
                }
            } catch (error) {
                const syntheticEvent = {
                    ...e,
                    target: { ...e.target, value: newValue },
                };
                onChange?.(syntheticEvent);
            }
        };

        const inputClasses = cn(
            "flex items-center gap-2 relative bg-transparent transition-colors text-base rounded-md border border-input pl-3 h-9 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed md:text-sm has-[input:focus]:outline-none has-[input:focus]:ring-1 has-[input:focus]:ring-ring [interpolate-size:allow-keywords]",
            inline && "rounded-l-none w-full",
            className
        );

        return (
            <div className={inputClasses}>
                {!inline && (
                    <div className="w-4 h-4 rounded-full shrink-0">
                        {displayFlag ? (
                            <CircleFlag countryCode={displayFlag} height={16} />
                        ) : (
                            <GlobeIcon size={16} />
                        )}
                    </div>
                )}
                <input
                    ref={ref}
                    value={value}
                    onChange={handlePhoneChange}
                    placeholder={placeholder || "Enter number"}
                    type="tel"
                    autoComplete="tel"
                    name="phone"
                    className={cn(
                        "flex w-full border-none bg-transparent text-base transition-colors placeholder:text-muted-foreground outline-none h-9 py-1 p-0 leading-none md:text-sm [interpolate-size:allow-keywords]",
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);

PhoneInput.displayName = "PhoneInput";