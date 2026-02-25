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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import CommonRegisterForm from "./CommonRegisterForm";
import useRegister from "@/hooks/auth/useRegister";
import useLookups from "@/hooks/useLookups";

export default function RegisterStudent({ onBack }) {
    const { t } = useTranslation("auth");
    const { registerStudent, registerFirebaseStudent } = useRegister();

    // Schema
    const studentSchema = z.object({
        level_id: z.string().min(1, { message: t("validation.required") }),
        government_id: z.string().min(1, { message: t("validation.required") }),
        zone_id: z.string().min(1, { message: t("validation.required") }),
        parent_phone_number: z.string().min(1, { message: t("validation.required") }),
        studentCode: z.string().optional(),
        faction: z.string().default("Alpha"),
    });

    const handleSubmit = async (values, firebaseToken) => {
        const { confirmPassword, ...data } = values;

        const payload = {
            ...data,
            level_id: parseInt(data.level_id),
            government_id: parseInt(data.government_id),
            zone_id: parseInt(data.zone_id),
            // faction is already in data or default
        };

        if (firebaseToken) {
            await registerFirebaseStudent({ ...payload, idToken: firebaseToken });
        } else {
            await registerStudent(payload);
        }

        navigate(`/auth/verify-email?email=${encodeURIComponent(data.email || "")}`);
    };

    return (
        <CommonRegisterForm
            role="student"
            onBack={onBack}
            extraSchema={studentSchema}
            defaultValues={{
                level_id: "",
                government_id: "",
                zone_id: "",
                parent_phone_number: "",
                studentCode: "",
                faction: "Alpha",
            }}
            onSubmit={handleSubmit}
        >
            <StudentFields />
        </CommonRegisterForm>
    );
}

function StudentFields() {
    const { t, i18n } = useTranslation("auth");
    const { control, watch, setValue } = useFormContext();
    const { governments, zones, getZonesByGovernment, levels, loading: lookupsLoading } = useLookups();
    const isRTL = i18n.dir() === "rtl";
    const selectedGov = watch("government_id");

    const handleGovChange = (value) => {
        setValue("government_id", value);
        setValue("zone_id", ""); // Reset zone when gov changes
        getZonesByGovernment(value);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name="government_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("signup.fields.government")}</FormLabel>
                            <Select dir={isRTL ? "rtl" : "ltr"} onValueChange={handleGovChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("signup.fields.selectGovernment")} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {governments.map((gov) => (
                                        <SelectItem key={gov.id} value={String(gov.id)}>
                                            {gov.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="zone_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("signup.fields.zone")}</FormLabel>
                            <Select
                                dir={isRTL ? "rtl" : "ltr"}
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={!selectedGov || zones.length === 0}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("signup.fields.selectZone")} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {zones.map((zone) => (
                                        <SelectItem key={zone.id} value={String(zone.id)}>
                                            {zone.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={control}
                name="level_id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t("signup.fields.level")}</FormLabel>
                        <Select dir={isRTL ? "rtl" : "ltr"} onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t("signup.fields.selectLevel")} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {levels.map((lvl) => (
                                    <SelectItem key={lvl.id} value={String(lvl.id)}>
                                        {lvl.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="parent_phone_number"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t("signup.fields.parentPhone")}</FormLabel>
                        <FormControl>
                            <Input placeholder={t("signup.fields.parentPhonePlaceholder")} {...field} data-testid="auth-register-student-parent-phone-input" />
                        </FormControl>
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
                            <Input placeholder={t("signup.fields.studentCodePlaceholder")} {...field} data-testid="auth-register-student-code-input" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
