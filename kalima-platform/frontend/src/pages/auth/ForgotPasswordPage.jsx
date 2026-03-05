import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import usePassword from "@/hooks/auth/usePassword";
import AuthAnimatedBackground from "@/components/auth/AuthAnimatedBackground";
import { motion } from "framer-motion";

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

export default function ForgotPasswordPage() {
    const { t } = useTranslation("auth");
    const { forgotPassword, loading } = usePassword();

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
        });
    }, [t]);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (values) => {
        try {
            await forgotPassword(values.email);
            // toast for success is handled by the hook
        } catch (error) {
            console.error("Forgot password failed:", error);
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
                                <CardTitle className="text-2xl">{t("forgotPassword.title", "Forgot Password")}</CardTitle>
                                <CardDescription>{t("forgotPassword.description", "Enter your email address and we will send you a link to reset your password.")}</CardDescription>
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
                                                            <Input placeholder="name@example.com" type="email" {...field} className="bg-background" data-testid="forgot-password-email-input" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                </motion.div>
                                            )}
                                        />
                                        <motion.div variants={itemVariants}>
                                            <Button type="submit" className="w-full" disabled={loading} data-testid="forgot-password-submit-button">
                                                {loading && (
                                                    <LoadingSpinner className="mr-2 h-4 w-4" />
                                                )}
                                                {t("forgotPassword.submit", "Send Reset Link")}
                                            </Button>
                                        </motion.div>
                                    </form>
                                </Form>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-2">
                                <div className="text-sm text-muted-foreground text-center">
                                    <Link
                                        to="/login"
                                        className="flex items-center justify-center gap-2 underline underline-offset-4 hover:text-primary font-medium"
                                        data-testid="forgot-password-back-link"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        {t("forgotPassword.backToLogin", "Back to login")}
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
