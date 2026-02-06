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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import CommonRegisterForm from "./CommonRegisterForm";

export default function RegisterStudent({ onBack }) {
    const { t } = useTranslation("auth");

    const studentSchema = z.object({
        grade: z.string().min(1, { message: t("validation.grade_required") }),
        studentCode: z.string().optional(),
    });

    return (
        <CommonRegisterForm
            role="student"
            onBack={onBack}
            extraSchema={studentSchema}
            defaultValues={{ grade: "", studentCode: "" }}
        >
            <StudentFields />
        </CommonRegisterForm>
    );
}

function StudentFields() {
    const { t } = useTranslation("auth");
    const { control } = useFormContext();

    return (
        <>
            <FormField
                control={control}
                name="grade"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t("signup.fields.grade")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t("signup.fields.grade")} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="10">Grade 10</SelectItem>
                                <SelectItem value="11">Grade 11</SelectItem>
                                <SelectItem value="12">Grade 12</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="studentCode"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t("signup.fields.studentCode")}</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}
