import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { motion, AnimatePresence } from "framer-motion";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function CommonRegisterForm({ role, onBack, children, extraSchema, defaultValues, onSubmit, redirectTo }) {
    const { t, i18n } = useTranslation("auth");
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [firebaseToken, setFirebaseToken] = useState(null);
    const [formError, setFormError] = useState(null);
    const isRTL = i18n.dir() === "rtl";

    const containerVariants = {
        hidden: { opacity: 0, y: 18 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.55,
                ease: "easeOut",
                staggerChildren: 0.08,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } },
    };

    const formSchema = React.useMemo(() => {
        const baseShape = {
            name: z.string().min(2, { message: t("validation.required", "Name is required") }).optional().or(z.literal("")),
            email: z.string().email({ message: t("validation.emailInvalid", "Invalid email") }).optional().or(z.literal("")),
            phone: egyptPhoneSchema(t).refine(val => val && val !== "+20", { message: t("validation.required", "Phone is required") }),
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
                if (!data.password || data.password.length < 8) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("validation.passwordMin"), path: ["password"] });
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
            setFormError(null);
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            setFirebaseToken(idToken);

            // Populate form with user data from social provider
            if (result.user.displayName) form.setValue("name", result.user.displayName);
            if (result.user.email) form.setValue("email", result.user.email);

            toast.success(t("signup.firebaseAuthenticated", "Social account connected. Please complete the remaining fields."));
        } catch (error) {
            console.error("Firebase Login failed:", error);
            toast.error(error?.message || "Failed to authenticate with Firebase");
        }
    };

    const handleSubmit = async (values) => {
        setIsLoading(true);
        setFormError(null);
        try {
            if (onSubmit) {
                await onSubmit(values, firebaseToken);
            }
            if (!firebaseToken) {
                // For normal (non-social) registration, redirect to login
                navigate("/login", { replace: true });
            }
        } catch (error) {
            console.error("Form submission error:", error);
            const errData = error?.response?.data;
            const errors = errData?.errors || errData?.details;
            const fallbackMessage = errData?.message || error?.message || t("errors.default", "An unexpected error occurred. Please try again.");
            const unmappedMessages = [];
            let mappedFieldErrors = 0;

            const applyServerError = (field, message) => {
                if (field && form.getValues(field) !== undefined) {
                    form.setError(field, { type: "server", message });
                    mappedFieldErrors += 1;
                    return true;
                }
                unmappedMessages.push(message);
                return false;
            };

            if (errors) {
                if (Array.isArray(errors)) {
                    errors.forEach(err => {
                        if (typeof err === "string") {
                            unmappedMessages.push(err);
                            return;
                        }
                        const path = err?.path || err?.field || err?.param;
                        applyServerError(path, err?.message || err?.msg || fallbackMessage);
                    });
                } else if (typeof errors === 'object') {
                    Object.entries(errors).forEach(([field, msg]) => {
                        applyServerError(field, Array.isArray(msg) ? msg[0] : msg);
                    });
                }
            }

            const topLevelMessage = unmappedMessages.filter(Boolean).join("\n");
            setFormError(topLevelMessage || (mappedFieldErrors > 0 ? null : fallbackMessage));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            className="w-full space-y-6 pb-16 md:pb-0"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            <motion.div className="flex flex-col space-y-2" variants={itemVariants}>
                <div className="flex items-center gap-2 mb-2">
                    <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 pl-0 text-muted-foreground hover:text-foreground" data-testid="auth-register-back-button">
                        <ArrowLeft className="h-4 w-4" />
                        {t("signup.roleLabel")}
                    </Button>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">{t("signup.title")}</h1>
                <p className="text-sm text-muted-foreground">{t(`signup.roles.${role}`)}</p>
            </motion.div>

            <Form {...form}>
                <motion.form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate variants={containerVariants}>
                    <AnimatePresence mode="wait">
                        {formError && (
                            <motion.div
                                key="register-error"
                                variants={itemVariants}
                                initial="hidden"
                                animate="show"
                                exit={{ opacity: 0, y: -8 }}
                            >
                                <Alert variant="destructive" data-testid="auth-register-error-alert">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>{t("errors.registrationFailed", "Registration failed")}</AlertTitle>
                                    <AlertDescription className="whitespace-pre-line">
                                        {formError}
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!firebaseToken && (
                        <>
                            <motion.div variants={itemVariants}>
                                <SocialLoginButtons
                                    onProviderSelect={handleFirebaseLogin}
                                    isLoading={isLoading}
                                    textGoogle={t("signup.google")}
                                />
                            </motion.div>

                            <motion.div className="relative my-4" variants={itemVariants}>
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background rounded-sm px-1 text-muted-foreground">
                                        {t("signup.continueWith")}
                                    </span>
                                </div>
                            </motion.div>

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <motion.div variants={itemVariants}>
                                        <FormItem>
                                            <FormLabel htmlFor="name">{t("signup.fields.name")}</FormLabel>
                                            <FormControl>
                                                <Input id="name" {...field} className="h-16 md:h-12 text-xl md:text-base rounded-2xl md:rounded-xl bg-background/40" data-testid="auth-register-name-input" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    </motion.div>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <motion.div variants={itemVariants}>
                                        <FormItem>
                                            <FormLabel htmlFor="email">{t("signup.fields.email")}</FormLabel>
                                            <FormControl>
                                                <Input id="email" type="email" {...field} className="h-16 md:h-12 text-xl md:text-base rounded-2xl md:rounded-xl bg-background/40" data-testid="auth-register-email-input" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    </motion.div>
                                )}
                            />
                        </>
                    )}

                    <AnimatePresence mode="wait">
                        {firebaseToken && (
                            <motion.div
                                key="firebase-success"
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: "auto" }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                                className="bg-success/20 border border-success/30 p-4 rounded-lg mb-4 text-sm text-success flex items-center gap-3 overflow-hidden"
                            >
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-success text-success-foreground flex items-center justify-center text-[10px] font-bold italic">
                                    ✓
                                </span>
                                <span className="font-medium">
                                    {t("signup.firebaseAuthenticated", "Social account connected. Please complete the remaining fields.")}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <motion.div variants={itemVariants}>
                                <FormItem dir="ltr">
                                    <FormLabel dir={i18n.dir()} htmlFor="phone">{t("signup.fields.phone")}</FormLabel>
                                    <FormControl>
                                        <PhoneInput id="phone" dir="ltr" {...field} data-testid="auth-register-phone-input" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </motion.div>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <motion.div variants={itemVariants}>
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
                            </motion.div>
                        )}
                    />

                    {!firebaseToken && (
                        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={itemVariants}>
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
                                                    className={cn(isRTL ? "pl-14" : "pr-14", "bg-background/40 h-16 md:h-12 text-xl md:text-base rounded-2xl md:rounded-xl transition-all")}
                                                    {...field}
                                                    placeholder="●●●●●●●●●●"
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
                                                    className={cn(isRTL ? "pl-14" : "pr-14", "bg-background/40 h-16 md:h-12 text-xl md:text-base rounded-2xl md:rounded-xl transition-all")}
                                                    {...field}
                                                    placeholder="●●●●●●●●●●"
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
                        </motion.div>
                    )}

                    <motion.div variants={itemVariants}>{children}</motion.div>

                    <motion.div variants={itemVariants}>
                        <Button type="submit" className="w-full h-16 md:h-14 text-xl md:text-lg font-black md:font-bold transition-all duration-300 active:scale-[0.95] md:hover:scale-[1.02] rounded-3xl md:rounded-2xl" disabled={isLoading} data-testid="auth-register-submit-button">
                            {isLoading && <LoadingSpinner className="mr-2 h-7 w-7 md:h-5 md:w-5" />}
                            {t("signup.submit")}
                        </Button>
                    </motion.div>
                </motion.form>
            </Form>

            <motion.div className="text-sm text-muted-foreground text-center" variants={itemVariants}>
                {t("signup.hasAccount")}{" "}
                <Link
                    to="/login"
                    state={redirectTo ? { from: { pathname: redirectTo } } : undefined}
                    className="underline underline-offset-4 hover:text-primary font-medium"
                    data-testid="auth-register-login-link"
                >
                    {t("signup.loginLink")}
                </Link>
            </motion.div>
        </motion.div>
    );
}
