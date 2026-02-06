import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import { cn } from "@/lib/utils";

export default function CommonRegisterForm({ role, onBack, children, extraSchema, defaultValues }) {
    const { t, i18n } = useTranslation("auth");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isRTL = i18n.dir() === "rtl";

    const baseShape = {
        name: z.string().min(1, { message: t("validation.required") }),
        email: z.string().min(1, { message: t("validation.required") }).email({ message: t("validation.email_invalid") }),
        phone: z.string().min(1, { message: t("validation.required") }),
        password: z.string().min(6, { message: t("validation.password_min") }),
        confirmPassword: z.string().min(1, { message: t("validation.required") }),
    };

    const formSchema = z.object({
        ...baseShape,
        ...(extraSchema ? extraSchema.shape : {}),
    }).refine((data) => data.password === data.confirmPassword, {
        message: t("validation.password_mismatch"),
        path: ["confirmPassword"],
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            ...defaultValues,
        },
    });

    const onSubmit = async (values) => {
        setIsLoading(true);
        console.log(values);
        // Simulate API call
        setTimeout(() => setIsLoading(false), 2000);
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
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

                    <div className="grid grid-cols-2 gap-4">
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
                    </div>

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
