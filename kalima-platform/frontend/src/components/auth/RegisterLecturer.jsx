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

export default function RegisterLecturer({ onBack }) {
    const { t } = useTranslation("auth");
    const { registerLecturer, loading: registerLoading } = useRegister();

    // Schema
    const lecturerSchema = z.object({
        secondary_phone: z.string().optional(),
    });

    const handleSubmit = async (values) => {
        const { confirmPassword, ...data } = values;

        if (!data.secondary_phone) {
            delete data.secondary_phone;
        }

        await registerLecturer(data);
    };

    return (
        <CommonRegisterForm
            role="lecturer"
            onBack={onBack}
            extraSchema={lecturerSchema}
            defaultValues={{ secondary_phone: "" }}
            onSubmit={handleSubmit}
        >
            <LecturerFields />
        </CommonRegisterForm>
    );
}

function LecturerFields() {
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
