import React from "react";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import * as z from "zod";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CommonRegisterForm from "./CommonRegisterForm";
import { useNavigate } from "react-router-dom";

export default function SharedRoleForm({ role, onBack, registerFn, registerFirebaseFn }) {
    // Memoize the schema to prevent recreation on every render
    const sharedSchema = React.useMemo(() => z.object({
        secondary_phone: z.string().optional(),
    }), []);
    const navigate = useNavigate();

    const handleSubmit = async (values, firebaseToken) => {
        const { confirmPassword, ...data } = values;

        if (!data.secondary_phone) {
            delete data.secondary_phone;
        }

        if (firebaseToken) {
            await registerFirebaseFn({ ...data, idToken: firebaseToken });
        } else {
            await registerFn(data);
        }

        navigate(`/auth/verify-email?email=${encodeURIComponent(data.email || "")}`);
    };

    return (
        <CommonRegisterForm
            role={role}
            onBack={onBack}
            extraSchema={sharedSchema}
            defaultValues={{ secondary_phone: "" }}
            onSubmit={handleSubmit}
        >
            <SharedFields />
        </CommonRegisterForm>
    );
}

function SharedFields() {
    const { t } = useTranslation("auth");
    const { control } = useFormContext();

    return (
        <FormField
            control={control}
            name="secondary_phone"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{t("signup.fields.secondaryPhone")}</FormLabel>
                    <FormControl>
                        <Input placeholder={t("signup.fields.secondaryPhonePlaceholder")} type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
