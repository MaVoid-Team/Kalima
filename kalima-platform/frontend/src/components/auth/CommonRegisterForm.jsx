import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { signInWithPopup } from 'firebase/auth';
import { auth } from "@/lib/firebase";
import SocialLoginButtons from "./SocialLoginButtons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput, egyptPhoneSchema } from "@/components/ui/phone-input";
import {
    Form,
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
import { cn } from "@/lib/utils";

export default function CommonRegisterForm({ role, onBack, children, extraSchema, defaultValues, onSubmit }) {
    const { t, i18n } = useTranslation("auth");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [firebaseToken, setFirebaseToken] = useState(null);
    const isRTL = i18n.dir() === "rtl";

    const formSchema = React.useMemo(() => {
        const baseShape = {
            name: z.string().min(2, { message: t("validation.required", "Name is required") }).optional().or(z.literal("")),
            email: z.string().email({ message: t("validation.emailInvalid", "Invalid email") }).optional().or(z.literal("")),
            phone: egyptPhoneSchema,
            gender: z.enum(["male", "female"], { required_error: t("validation.required", "Gender is required") }),
            password: z.string().optional().or(z.literal("")),
            confirmPassword: z.string().optional().or(z.literal("")),
        };

        return z.object({
            ...baseShape,
            ...(extraSchema ? extraSchema.shape : {}),
        }).superRefine((data, ctx) => {
            if (!firebaseToken) {
                if (!data.name) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("validation.required"), path: ["name"] });
                if (!data.email) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("validation.required"), path: ["email"] });
                if (!data.password || data.password.length < 6) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("validation.passwordMin"), path: ["password"] });
                if (data.password !== data.confirmPassword) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("validation.passwordMismatch"), path: ["confirmPassword"] });
            }
        });
    }, [t, extraSchema, firebaseToken]);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            gender: undefined,
            password: "",
            confirmPassword: "",
            ...defaultValues,
        },
    });

    const handleFirebaseLogin = async (provider) => {
        try {
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            setFirebaseToken(idToken);
            toast.success(t("signup.firebaseAuthenticated", "Successfully authenticated with Firebase. Please complete the remaining fields."));
        } catch (error) {
            console.error("Firebase Login failed:", error);
            toast.error(error?.message || "Failed to authenticate with Firebase");
        }
    };

    const handleSubmit = async (values) => {
        setIsLoading(true);
        try {
            if (onSubmit) {
                await onSubmit(values, firebaseToken);
            }
        } catch (error) {
            console.error("Form submission error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2 mb-2">
                    <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 pl-0 text-muted-foreground hover:text-foreground" data-testid="auth-register-back-button">
                        <ArrowLeft className="h-4 w-4" />
                        {t("signup.roleLabel")}
                    </Button>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">{t("signup.title")}</h1>
                <p className="text-sm text-muted-foreground">{t("signup.roles." + role)}</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
                    {!firebaseToken && (
                        <>
                            <SocialLoginButtons
                                onProviderSelect={handleFirebaseLogin}
                                isLoading={isLoading}
                                textGoogle={t("signup.google")}
                            />

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        {t("signup.continueWith")}
                                    </span>
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="name">{t("signup.fields.name")}</FormLabel>
                                        <FormControl>
                                            <Input id="name" {...field} data-testid="auth-register-name-input" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="email">{t("signup.fields.email")}</FormLabel>
                                        <FormControl>
                                            <Input id="email" type="email" {...field} data-testid="auth-register-email-input" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}

                    {firebaseToken && (
                        <div className="bg-success p-4 rounded-md mb-4 text-sm text-success-foreground">
                            ✓ {t("signup.firebaseAuthenticated", "Social account connected. Please complete the remaining fields.")}
                        </div>
                    )}

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="phone">{t("signup.fields.phone")}</FormLabel>
                                <FormControl>
                                    <PhoneInput id="phone" dir="ltr" {...field} data-testid="auth-register-phone-input" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("signup.fields.gender")}</FormLabel>
                                <Select dir={isRTL ? "rtl" : "ltr"} onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("signup.fields.genderPlaceholder")} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="male">{t("signup.gender.male")}</SelectItem>
                                        <SelectItem value="female">{t("signup.gender.female")}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {!firebaseToken && (
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="password">{t("signup.fields.password")}</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    className={cn(isRTL ? "pl-10" : "pr-10", "bg-background")}
                                                    {...field}
                                                    data-testid="auth-register-password-input"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className={cn(
                                                        "absolute top-0 h-full px-3 py-2 hover:bg-transparent",
                                                        isRTL ? "left-0" : "right-0"
                                                    )}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    data-testid="auth-register-password-toggle"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="confirmPassword">{t("signup.fields.confirmPassword")}</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    id="confirmPassword"
                                                    type={showPassword ? "text" : "password"}
                                                    className={cn(isRTL ? "pl-10" : "pr-10", "bg-background")}
                                                    {...field}
                                                    data-testid="auth-register-confirm-password-input"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className={cn(
                                                        "absolute top-0 h-full px-3 py-2 hover:bg-transparent",
                                                        isRTL ? "left-0" : "right-0"
                                                    )}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    data-testid="auth-register-confirm-password-toggle"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {children}

                    <Button type="submit" className="w-full" disabled={isLoading} data-testid="auth-register-submit-button">
                        {isLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
                        {t("signup.submit")}
                    </Button>
                </form>
            </Form>

            <div className="text-sm text-muted-foreground text-center">
                {t("signup.hasAccount")}{" "}
                <Link
                    to="/login"
                    className="underline underline-offset-4 hover:text-primary font-medium"
                    data-testid="auth-register-login-link"
                >
                    {t("signup.loginLink")}
                </Link>
            </div>
        </div>
    );
}
