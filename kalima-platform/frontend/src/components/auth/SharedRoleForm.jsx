import React from "react";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import * as z from "zod";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput, egyptPhoneSchema } from "@/components/ui/phone-input";
import CommonRegisterForm from "./CommonRegisterForm";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/auth/useAuth";

export default function SharedRoleForm({ role, onBack, registerFn, registerFirebaseFn }) {
    // Memoize the schema to prevent recreation on every render
    const sharedSchema = React.useMemo(() => z.object({
        secondary_phone: z.union([egyptPhoneSchema, z.literal(""), z.undefined()]),
    }), []);
    const navigate = useNavigate();
    const { loginSuccess } = useAuth();

    const handleSubmit = async (values, firebaseToken) => {
        const { confirmPassword, ...data } = values;

        if (!data.secondary_phone) {
            delete data.secondary_phone;
        }

        if (firebaseToken) {
            // OAuth flow: backend auto-verifies → returns user+tokens → auto-login
            const res = await registerFirebaseFn({ ...data, idToken: firebaseToken });
            const user = res?.data?.user || res?.user;
            const tokens = res?.data?.tokens || res?.tokens;
            const portalAccess = res?.data?.portalAccess || res?.portalAccess;
            if (user && tokens) {
                loginSuccess(user, tokens, portalAccess);
                navigate("/");
            }
        } else {
            // Email/password flow: backend sends verification email → stay on page
            await registerFn(data);
            // No navigation — user must verify email first. Toast is shown by useApiMutation.
        }
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
    const { t, i18n } = useTranslation("auth");
    const { control } = useFormContext();

    return (
        <FormField
            control={control}
            name="secondary_phone"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{t("signup.fields.secondaryPhone")}</FormLabel>
                    <FormControl>
                        <PhoneInput dir="ltr" placeholder={t("signup.fields.secondaryPhonePlaceholder")} {...field} data-testid="auth-register-secondary-phone-input" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
