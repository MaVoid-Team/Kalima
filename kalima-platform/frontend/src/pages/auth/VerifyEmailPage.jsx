import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle, Mail } from "lucide-react";
import useEmailVerification from "../../hooks/auth/useEmailVerification";
import LoadingSpinner from "@/components/ui/loading-spinner";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function VerifyEmailPage() {
    const { t } = useTranslation("auth");
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const { verifyEmail, resendVerification, loading } = useEmailVerification();

    const [status, setStatus] = useState("idle"); // idle, verifying, success, error

    useEffect(() => {
        if (!token) {
            setStatus("error");
            return;
        }

        let isMounted = true;

        const verify = async () => {
            setStatus("verifying");
            try {
                const response = await verifyEmail(token);

                // Extract user and tokens if the backend automatically authenticates the user upon verification
                const user = response?.data?.user || response?.user;
                const tokens = response?.data?.tokens || response?.tokens;
                const portalAccess = response?.data?.portalAccess || response?.portalAccess;

                if (user && tokens) {
                    loginSuccess(user, tokens, portalAccess);
                }

                if (isMounted) setStatus("success");
            } catch (err) {
                if (isMounted) setStatus("error");
            }
        };

        verify();

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const handleResend = async () => {
        if (emailToVerify) {
            try {
                await resendVerification(emailToVerify);
            } catch (error) {
                console.error("Resend error:", error);
            }
        }
    };

    return (
        <div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0 min-h-[calc(100vh-4rem)] py-8">
            <div className="lg:p-8 w-full">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                    <Card className="border-0 shadow-none sm:border sm:shadow-sm text-center">
                        <CardHeader>
                            <CardTitle className="text-2xl">{t("verify_email.title", "Email Verification")}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center py-6">
                            {status === "verifying" || status === "idle" ? (
                                <>
                                    <LoadingSpinner className="h-12 w-12 text-primary mb-4" />
                                    <p className="text-muted-foreground">
                                        {t("verify_email.verifying", "Verifying your email address...")}
                                    </p>
                                </>
                            ) : status === "pending" ? (
                                <>
                                    <Mail className="h-12 w-12 text-primary mb-4" />
                                    <p className="text-muted-foreground mb-4">
                                        {t("verify_email.pending", "Registration successful! Please check your inbox for the verification link.")}
                                    </p>
                                    <Button onClick={handleResend} variant="outline" className="w-full" disabled={loading}>
                                        {loading && <LoadingSpinner className="mr-2 h-4 w-4" />}
                                        {t("verify_email.resend", "Resend Verification Email")}
                                    </Button>
                                    <Button asChild variant="ghost" className="w-full mt-2">
                                        <Link to="/login">
                                            {t("verify_email.backToLogin", "Go to Login")}
                                        </Link>
                                    </Button>
                                </>
                            ) : status === "success" ? (
                                <>
                                    <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                                    <p className="text-muted-foreground">
                                        {t("verify_email.success", "Your email has been successfully verified! You can now access all features of your account.")}
                                    </p>
                                    <Button asChild className="w-full mt-6">
                                        <Link to="/login">
                                            {t("verify_email.backToLogin", "Go to Login")}
                                        </Link>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-12 w-12 text-destructive mb-4" />
                                    <p className="text-muted-foreground">
                                        {t("verify_email.error", "The verification link is invalid or has expired.")}
                                    </p>
                                    <div className="flex flex-col gap-3 w-full mt-6">
                                        <Button asChild variant="outline" className="w-full">
                                            <Link to="/login">
                                                {t("verify_email.backToLogin", "Go to Login")}
                                            </Link>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
