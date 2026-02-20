import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from "../../lib/firebase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

    const baseShape = {
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().min(1, { message: t("validation.required") }),
        gender: z.enum(["male", "female"], { required_error: t("validation.required") }),
        password: z.string().optional(),
        confirmPassword: z.string().optional(),
    };

    const formSchema = z.object({
        ...baseShape,
        ...(extraSchema ? extraSchema.shape : {}),
    }).superRefine((data, ctx) => {
        if (!firebaseToken) {
            if (!data.name) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("validation.required"), path: ["name"] });
            if (!data.email) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("validation.required"), path: ["email"] });
            if (!data.password || data.password.length < 6) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("validation.password_min"), path: ["password"] });
            if (data.password !== data.confirmPassword) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("validation.password_mismatch"), path: ["confirmPassword"] });
        }
    });

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
            toast.success("Successfully authenticated with Firebase. Please complete the remaining fields.");
        } catch (error) {
            console.error("Firebase Login failed:", error);
            toast.error(error?.message || "Failed to authenticate with Firebase");
        }
    };

    const handleSubmit = async (values) => {
        setIsLoading(true);
        if (onSubmit) {
            await onSubmit(values, firebaseToken);
        }
        setIsLoading(false);
    };

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2 mb-2">
                    <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 pl-0 text-muted-foreground hover:text-foreground">
                        {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
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
                            <div className="flex flex-col gap-2 mb-6">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => handleFirebaseLogin(googleProvider)}
                                    disabled={isLoading}
                                >
                                    <svg xmlns="http://www.w3.org/20Utility.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /><path d="M1 1h22v22H1z" fill="none" /></svg>
                                    Sign up with Google
                                </Button>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => handleFirebaseLogin(facebookProvider)}
                                    disabled={isLoading}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                    Sign up with Facebook
                                </Button>
                            </div>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Or continue with email
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
                                            <Input id="name" {...field} />
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
                                            <Input id="email" type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}

                    {firebaseToken && (
                        <div className="bg-primary/10 p-4 rounded-md mb-4 text-sm text-primary">
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
                                    <Input id="phone" type="tel" {...field} />
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("signup.submit")}
                    </Button>
                </form>
            </Form>

            <div className="text-sm text-muted-foreground text-center">
                {t("signup.hasAccount")}{" "}
                <Link
                    to="/login"
                    className="underline underline-offset-4 hover:text-primary font-medium"
                >
                    {t("signup.loginLink")}
                </Link>
            </div>
        </div>
    );
}
