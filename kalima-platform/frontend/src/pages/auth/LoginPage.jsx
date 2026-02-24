import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import useLogin from "@/hooks/auth/useLogin";
import { signInWithPopup } from 'firebase/auth';
import { auth } from "@/lib/firebase";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

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

export default function LoginPage() {
    const { t } = useTranslation("auth");
    const navigate = useNavigate();
    const { login, loginWithFirebase, loading } = useLogin();
    const [showPassword, setShowPassword] = useState(false);

    const formSchema = React.useMemo(() => {
        return z.object({
            email: z.string().min(1, { message: t("validation.required") }).email({ message: t("validation.email_invalid") }),
            password: z.string().min(1, { message: t("validation.required") }),
        });
    }, [t]);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values) => {
        try {
            await login(values);
            // Navigate to dashboard or home after successful login
            navigate("/");
        } catch (error) {
            console.error("Login failed:", error);
            // Error is handled by interceptor/hook (toast)
        }
    };

    const handleFirebaseLogin = async (provider) => {
        try {
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            await loginWithFirebase(idToken);
            navigate("/");
        } catch (error) {
            console.error("Firebase Login failed:", error);
            toast.error(error?.message || "Failed to login with Firebase");
        }
    };

    return (
        <div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0 min-h-[calc(100vh-4rem)] py-8">
            <div className="lg:p-8 w-full">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Card className="border-0 shadow-none sm:border sm:shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-2xl">{t("login.title")}</CardTitle>
                            <CardDescription>{t("login.description")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("login.emailLabel")}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="name@example.com" type="email" {...field} className="bg-background" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("login.passwordLabel")}</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            className="bg-background pr-10"
                                                            {...field}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                                                <div className="flex justify-end mt-1">
                                                    <Link
                                                        to="/forgot-password"
                                                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                                    >
                                                        {t("login.forgotPassword", "Forgot Password?")}
                                                    </Link>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading && (
                                            <LoadingSpinner className="mr-2 h-4 w-4" />
                                        )}
                                        {t("login.submit")}
                                    </Button>

                                    <div className="relative my-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-background px-2 text-muted-foreground">
                                                {t("login.continueWith", "Or continue with")}
                                            </span>
                                        </div>
                                    </div>

                                    <SocialLoginButtons
                                        onProviderSelect={handleFirebaseLogin}
                                        isLoading={loading}
                                        textGoogle={t("login.google", "Google")}
                                        textFacebook={t("login.facebook", "Facebook")}
                                    />
                                </form>
                            </Form>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2">
                            <div className="text-sm text-muted-foreground text-center">
                                {t("login.noAccount", "Don't have an account?")}{" "}
                                <Link
                                    to="/signup"
                                    className="underline underline-offset-4 hover:text-primary font-medium"
                                >
                                    {t("login.signupLink", "Sign up")}
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
