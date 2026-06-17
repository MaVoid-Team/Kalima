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
import logo from "../../assets/Logo.webp";

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
            const errData = error?.response?.data;
            const errors = errData?.errors || errData?.details;
            if (errors) {
                if (Array.isArray(errors)) {
                    errors.forEach(err => {
                        const path = err.path || err.field || err.param;
                        if (path) form.setError(path, { type: "server", message: err.message || err.msg });
                    });
                } else if (typeof errors === 'object') {
                    Object.entries(errors).forEach(([field, msg]) => {
                        form.setError(field, { type: "server", message: Array.isArray(msg) ? msg[0] : msg });
                    });
                }
            } else if (error?.response?.status === 401) {
                const invalidCredsMsg = t("errors.invalid_credentials", "Invalid email or password");
                form.setError("email", { type: "server", message: invalidCredsMsg });
                form.setError("password", { type: "server", message: invalidCredsMsg });
            }
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
            // We don't toast here anymore because the global axios interceptor in src/api/axios.js 
            // already handles error toasting with translated messages.
        }
    };

    return (
        <div className="relative w-full grid min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] flex-col items-center justify-center overflow-hidden py-8 lg:max-w-none lg:grid-cols-1 lg:px-0 px-4">
            <AuthAnimatedBackground variant="login" />

            <div className="relative w-full lg:p-8">
                <motion.div
                    className="mx-auto flex w-full flex-col justify-center space-y-8 md:space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {/* Native App Style Header (Android Inspired) */}
                    <motion.div variants={itemVariants} className="flex flex-col items-center space-y-4 mb-4 md:mb-6">
                        <Link to="/" className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <div className="absolute  bg-primary/10 blur-3xl rounded-full opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-700" />
                                <img
                                    src={logo}
                                    alt="Kalima Logo"
                                    className="h-20 md:h-16 w-auto relative z-10"
                                />
                            </div>
                            <span className="text-3xl md:text-2xl font-bold tracking-tight text-foreground">
                                {t("navbar.brand", "Kalima")}
                            </span>
                        </Link>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="relative w-full pb-16 md:pb-0 md:max-w-[400px] md:mx-auto md:group md:rounded-[2.5rem] md:p-[1px] md:bg-linear-to-b md:from-primary/30 md:via-primary/5 md:to-transparent transition-all duration-700"
                    >
                        {/* Immersive Glow effect (Desktop only) */}
                        <div className="pointer-events-none absolute -inset-2 -z-10 rounded-full bg-primary/10 blur-3xl opacity-0 md:opacity-60 md:group-hover:opacity-100 transition-opacity duration-700" />

                        <Card className="relative border-0 bg-transparent md:bg-background/40 md:dark:bg-background/20 shadow-none md:backdrop-blur-3xl md:rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="text-center pb-6 md:pb-2 pt-4 md:pt-10">
                                <CardTitle className="text-4xl md:text-3xl lg:text-4xl font-black md:font-extrabold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                                    {t("login.title")}
                                </CardTitle>
                                <CardDescription className="text-lg md:text-base lg:text-lg text-muted-foreground/60 font-medium">
                                    {t("login.description")}
                                </CardDescription>
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
                                                            <Input
                                                                placeholder="name@example.com"
                                                                type="email"
                                                                {...field}
                                                                className="bg-background/40 border-foreground/10 focus:bg-background/60 h-14 text-lg rounded-2xl transition-all"
                                                                data-testid="login-email-input"
                                                            />
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
                                                                    className="bg-background/40 md:bg-background/40 border-foreground/10 focus:bg-background/60 pr-14 h-16 md:h-14 text-xl md:text-lg rounded-2xl transition-all"
                                                                    {...field}
                                                                    data-testid="login-password-input"
                                                                    placeholder="●●●●●●●●●●"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="absolute right-2 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    data-testid="login-show-password-button"
                                                                >
                                                                    {showPassword ? (
                                                                        <EyeOff className="h-5 w-5 text-muted-foreground/50" />
                                                                    ) : (
                                                                        <Eye className="h-5 w-5 text-muted-foreground/50" />
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
                                        <motion.div variants={itemVariants} className="pt-8 md:pt-4">
                                            <Button type="submit" className="w-full h-16 md:h-14 text-xl md:text-lg font-black md:font-bold transition-all duration-300 active:scale-[0.95] md:hover:scale-[1.02] rounded-3xl md:rounded-2xl" disabled={loading} data-testid="login-submit-button">
                                                {loading && (
                                                    <LoadingSpinner className="mr-2 h-7 w-7 md:h-5 md:w-5" />
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
