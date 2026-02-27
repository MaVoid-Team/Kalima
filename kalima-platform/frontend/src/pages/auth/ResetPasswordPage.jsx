import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import usePassword from "@/hooks/auth/usePassword";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

export default function ResetPasswordPage() {
    const { t } = useTranslation("auth");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const { resetPassword, loading } = usePassword();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error("Invalid or missing password reset token.");
            navigate("/login");
        }
    }, [token, navigate]);

    const formSchema = React.useMemo(() => {
        return z.object({
            password: z.string().min(6, { message: t("validation.password_min") }),
            confirmPassword: z.string().min(6, { message: t("validation.password_min") }),
        }).refine((data) => data.password === data.confirmPassword, {
            message: t("validation.password_mismatch"),
            path: ["confirmPassword"],
        });
    }, [t]);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values) => {
        if (!token) return;
        try {
            await resetPassword(token, values.password);
            // Navigate to login after successful reset
            navigate("/login");
        } catch (error) {
            console.error("Reset password failed:", error);
        }
    };

    if (!token) return null;

    return (
        <div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0 min-h-[calc(100vh-4rem)] py-8">
            <div className="lg:p-8 w-full">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Card className="border-0 shadow-none sm:border sm:shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-2xl">{t("resetPassword.title", "Reset Password")}</CardTitle>
                            <CardDescription>{t("resetPassword.description", "Enter your new password below.")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("resetPassword.newPasswordLabel", "New Password")}</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            className="bg-background pr-10"
                                                            {...field}
                                                            data-testid="reset-password-input"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            data-testid="reset-password-show-button"
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
                                                <FormLabel>{t("resetPassword.confirmPasswordLabel", "Confirm New Password")}</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            className="bg-background pr-10"
                                                            {...field}
                                                            data-testid="reset-password-confirm-input"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            data-testid="reset-password-show-confirm-button"
                                                        >
                                                            {showConfirmPassword ? (
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
                                    <Button type="submit" className="w-full" disabled={loading} data-testid="reset-password-submit-button">
                                        {loading && (
                                            <LoadingSpinner className="mr-2 h-4 w-4" />
                                        )}
                                        {t("resetPassword.submit", "Reset Password")}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2">
                            <div className="text-sm text-muted-foreground text-center">
                                <Link
                                    to="/login"
                                    className="flex items-center justify-center gap-2 underline underline-offset-4 hover:text-primary font-medium"
                                    data-testid="reset-password-back-link"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    {t("resetPassword.backToLogin", "Back to login")}
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
