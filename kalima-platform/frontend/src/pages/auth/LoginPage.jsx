import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const formSchema = z.object({
        email: z.string().min(1, { message: t("validation.required") }).email({ message: t("validation.email_invalid") }),
        password: z.string().min(1, { message: t("validation.required") }),
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values) => {
        setIsLoading(true);
        console.log(values);
        // Simulate API call
        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0 min-h-[calc(100vh-4rem)]">
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Card>
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
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        {t("login.submit")}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2">
                            <div className="text-sm text-muted-foreground text-center">
                                {t("login.noAccount")}{" "}
                                <Link
                                    to="/signup"
                                    className="underline underline-offset-4 hover:text-primary font-medium"
                                >
                                    {t("login.signupLink")}
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
