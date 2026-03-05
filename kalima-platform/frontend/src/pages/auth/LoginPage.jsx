import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import useLogin from "@/hooks/auth/useLogin";
import { signInWithPopup } from 'firebase/auth';
import { auth } from "@/lib/firebase";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import AuthAnimatedBackground from "@/components/auth/AuthAnimatedBackground";

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
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";
    const { login, loginWithFirebase, loading } = useLogin();
    const [showPassword, setShowPassword] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0, y: 28 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.9,
                ease: "easeOut",
                staggerChildren: 0.12,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
    };

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const formSchema = React.useMemo(() => {
        return z.object({
            email: z.string().min(1, { message: t("validation.required") }).email({ message: t("validation.emailInvalid") }),
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
            // Navigate forward to the page the user was on before auth
            navigate(from, { replace: true });
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
            navigate(from, { replace: true });
        } catch (error) {
            console.error("Firebase Login failed:", error);
            toast.error(error?.message || "Failed to login with Firebase");
        }
    };

    return (
        <div className="container relative grid min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden py-8 lg:max-w-none lg:grid-cols-1 lg:px-0">
            <AuthAnimatedBackground variant="login" />

            <div className="relative w-full lg:p-8">
                <motion.div
                    className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div
                        variants={itemVariants}
                        className="relative group rounded-2xl p-[1.5px] bg-linear-to-b from-primary/60 via-primary/10 to-transparent shadow-2xl shadow-primary/20 transition-all duration-500 hover:shadow-primary/30"
                    >
                        {/* Ambient Glow effect around the frame */}
                        <div className="pointer-events-none absolute -inset-1.5 -z-10 rounded-2xl bg-primary/20 blur-xl opacity-50 group-hover:opacity-90 transition-opacity duration-500" />
                        <Card className="relative border-0 bg-background/80 shadow-none backdrop-blur-2xl rounded-[calc(1rem-1.5px)] sm:border-0">
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
                                                <motion.div variants={itemVariants}>
                                                    <FormItem>
                                                        <FormLabel>{t("login.emailLabel")}</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="name@example.com" type="email" {...field} className="bg-background" data-testid="login-email-input" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                </motion.div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <motion.div variants={itemVariants}>
                                                    <FormItem>
                                                        <FormLabel>{t("login.passwordLabel")}</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    type={showPassword ? "text" : "password"}
                                                                    className="bg-background pr-10"
                                                                    {...field}
                                                                    data-testid="login-password-input"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    data-testid="login-show-password-button"
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
                                                                data-testid="login-forgot-password-link"
                                                            >
                                                                {t("login.forgotPassword", "Forgot Password?")}
                                                            </Link>
                                                        </div>
                                                    </FormItem>
                                                </motion.div>
                                            )}
                                        />
                                        <motion.div variants={itemVariants}>
                                            <Button type="submit" className="w-full" disabled={loading} data-testid="login-submit-button">
                                                {loading && (
                                                    <LoadingSpinner className="mr-2 h-4 w-4" />
                                                )}
                                                {t("login.submit")}
                                            </Button>
                                        </motion.div>

                                        <motion.div variants={itemVariants} className="relative my-4">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t" />
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-background rounded-sm px-2 text-muted-foreground">
                                                    {t("login.continueWith", "Or continue with")}
                                                </span>
                                            </div>
                                        </motion.div>

                                        <motion.div variants={itemVariants}>
                                            <SocialLoginButtons
                                                onProviderSelect={handleFirebaseLogin}
                                                isLoading={loading}
                                                textGoogle={t("login.google", "Google")}
                                            />
                                        </motion.div>
                                    </form>
                                </Form>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-2">
                                <div className="text-sm text-muted-foreground text-center">
                                    {t("login.noAccount", "Don't have an account?")}{" "}
                                    <Link
                                        to="/signup"
                                        state={{ from: location.state?.from }}
                                        className="underline underline-offset-4 hover:text-primary font-medium"
                                        data-testid="login-signup-link"
                                    >
                                        {t("login.signupLink", "Sign up")}
                                    </Link>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
