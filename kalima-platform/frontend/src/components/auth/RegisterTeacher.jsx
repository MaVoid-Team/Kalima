import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import * as z from "zod";

import { Input } from "@/components/ui/input";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import CommonRegisterForm from "./CommonRegisterForm";

export default function RegisterTeacher({ onBack }) {
    const { t } = useTranslation("auth");

    const teacherSchema = z.object({
        subject: z.string().min(1, { message: t("validation.subject_required") }),
    });

    return (
        <CommonRegisterForm
            role="teacher"
            onBack={onBack}
            extraSchema={teacherSchema}
            defaultValues={{ subject: "" }}
        >
            <TeacherFields />
        </CommonRegisterForm>
    );
}

function TeacherFields() {
    const { t } = useTranslation("auth");
    const { control } = useFormContext();

    return (
        <FormField
            control={control}
            name="subject"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{t("signup.fields.subject")}</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. Mathematics" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
