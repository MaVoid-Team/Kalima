import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import usePassword from "@/hooks/auth/usePassword";

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

      React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const formSchema = React.useMemo(() => {
        return z.object({
            email: z.string().min(1, { message: t("validation.required") }).email({ message: t("validation.email_invalid") }),
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
        <div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0 min-h-[calc(100vh-4rem)] py-8">
            <div className="lg:p-8 w-full">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Card className="border-0 shadow-none sm:border sm:shadow-sm">
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
                                            <FormItem>
                                                <FormLabel>{t("login.emailLabel")}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="name@example.com" type="email" {...field} className="bg-background" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading && (
                                            <LoadingSpinner className="mr-2 h-4 w-4" />
                                        )}
                                        {t("forgotPassword.submit", "Send Reset Link")}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2">
                            <div className="text-sm text-muted-foreground text-center">
                                <Link
                                    to="/login"
                                    className="flex items-center justify-center gap-2 underline underline-offset-4 hover:text-primary font-medium"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    {t("forgotPassword.backToLogin", "Back to login")}
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
