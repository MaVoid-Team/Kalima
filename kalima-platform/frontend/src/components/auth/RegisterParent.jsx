import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import * as z from "zod";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CommonRegisterForm from "./CommonRegisterForm";
import useRegister from "../../hooks/auth/useRegister";

export default function RegisterParent({ onBack }) {
    const { t } = useTranslation("auth");
    const { registerParent, registerFirebaseParent, loading: registerLoading } = useRegister();

    // Schema
    const parentSchema = z.object({
        secondary_phone: z.string().optional(),
    });

    const handleSubmit = async (values, firebaseToken) => {
        const { confirmPassword, ...data } = values;

        // Ensure empty string is treated as null or handle as optional
        if (!data.secondary_phone) {
            delete data.secondary_phone;
        }

        if (firebaseToken) {
            await registerFirebaseParent({ ...data, idToken: firebaseToken });
        } else {
            await registerParent(data);
        }
    };

    return (
        <CommonRegisterForm
            role="parent"
            onBack={onBack}
            extraSchema={parentSchema}
            defaultValues={{ secondary_phone: "" }}
            onSubmit={handleSubmit}
        >
            <ParentFields />
        </CommonRegisterForm>
    );
}

function ParentFields() {
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
