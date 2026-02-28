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
import { Checkbox } from "@/components/ui/checkbox";
import CommonRegisterForm from "./CommonRegisterForm";
import useRegister from "@/hooks/auth/useRegister";
import useLookups from "@/hooks/useLookups";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/auth/useAuth";

export default function RegisterTeacher({ onBack }) {
    const { t } = useTranslation("auth");
    const navigate = useNavigate();
    const { registerTeacher, registerFirebaseTeacher } = useRegister();
    const { loginSuccess } = useAuth();

    // Schema
    const teacherSchema = z.object({
        government_id: z.string().min(1, { message: t("validation.required") }),
        zone_id: z.string().min(1, { message: t("validation.required") }),
        subject_id: z.string().min(1, { message: t("validation.required") }),
        is_primary: z.boolean().default(false),
        is_preparatory: z.boolean().default(false),
        is_secondary: z.boolean().default(false),
    });

    const handleSubmit = async (values, firebaseToken) => {
        const { confirmPassword, ...data } = values;

        const payload = {
            ...data,
            government_id: parseInt(data.government_id),
            zone_id: parseInt(data.zone_id),
            subject_id: parseInt(data.subject_id),
        };

        if (firebaseToken) {
            // OAuth flow: backend auto-verifies → returns user+tokens → auto-login
            const res = await registerFirebaseTeacher({ ...payload, idToken: firebaseToken });
            const user = res?.data?.user || res?.user;
            const tokens = res?.data?.tokens || res?.tokens;
            const portalAccess = res?.data?.portalAccess || res?.portalAccess;
            if (user && tokens) {
                loginSuccess(user, tokens, portalAccess);
                navigate("/");
            }
        } else {
            // Email/password flow: backend sends verification email → stay on page
            await registerTeacher(payload);
            // No navigation — user must verify email first. Toast is shown by useApiMutation.
        }
    };

    return (
        <CommonRegisterForm
            role="teacher"
            onBack={onBack}
            extraSchema={teacherSchema}
            defaultValues={{
                government_id: "",
                zone_id: "",
                subject_id: "",
                is_primary: false,
                is_preparatory: false,
                is_secondary: false,
            }}
            onSubmit={handleSubmit}
        >
            <TeacherFields />
        </CommonRegisterForm>
    );
}

function TeacherFields() {
    const { t, i18n } = useTranslation("auth");
    const { control, watch, setValue } = useFormContext();
    const { governments, zones, getZonesByGovernment, subjects, loading: lookupsLoading } = useLookups();
    const isRTL = i18n.dir() === "rtl";

    const selectedGov = watch("government_id");

    const handleGovChange = (value) => {
        setValue("government_id", value);
        setValue("zone_id", ""); // Reset zone when gov changes
        getZonesByGovernment(value);
    };

    // If initial value exists (e.g. edit mode), we might need to populate zones. 
    // But for register, it's empty initially.

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
                name="subject_id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t("signup.fields.subject")}</FormLabel>
                        <Select dir={isRTL ? "rtl" : "ltr"} onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t("signup.fields.selectSubject")} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {subjects.map((sub) => (
                                    <SelectItem key={sub.id} value={String(sub.id)}>
                                        {sub.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="space-y-2">
                <FormLabel>{t("signup.fields.teachingLevels")}</FormLabel>
                <div className="flex flex-col space-y-2 rounded-md border p-4">
                    <FormField
                        control={control}
                        name="is_primary"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        className={`${isRTL ? "scale-x-[-1]" : ""}`}
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        data-testid="auth-register-teacher-primary-checkbox"
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        {t("signup.fields.primary")}
                                    </FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="is_preparatory"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        className={`${isRTL ? "scale-x-[-1]" : ""}`}
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        data-testid="auth-register-teacher-preparatory-checkbox"
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        {t("signup.fields.preparatory")}
                                    </FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="is_secondary"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        className={`${isRTL ? "scale-x-[-1]" : ""}`}
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        data-testid="auth-register-teacher-secondary-checkbox"
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        {t("signup.fields.secondary")}
                                    </FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
