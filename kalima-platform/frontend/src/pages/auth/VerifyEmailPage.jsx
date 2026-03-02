import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import useEmailVerification from "@/hooks/auth/useEmailVerification";
import useAuth from "@/hooks/auth/useAuth";
import LoadingSpinner from "@/components/ui/loading-spinner";
import AuthAnimatedBackground from "@/components/auth/AuthAnimatedBackground";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

/**
 * VerifyEmailPage
 *
 * Handles the email verification link clicked from the user's inbox.
 * The token is single-use — after first use (success) the backend will reject
 * it on any subsequent call with "Invalid or expired verification token".
 * This means even a successful first verification can appear as an error if
 * the link is opened again. We handle this gracefully.
 */
export default function VerifyEmailPage() {
    const { t } = useTranslation("auth");
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const { verifyEmail, loading } = useEmailVerification();
    const { loginSuccess } = useAuth();

    // idle | verifying | success | already_verified | error
    const [status, setStatus] = useState("idle");

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

                // Backend may auto-authenticate after verification — log the user in if so
                const user = response?.data?.user || response?.user;
                const tokens = response?.data?.tokens || response?.tokens;
                const portalAccess = response?.data?.portalAccess || response?.portalAccess;

                if (user && tokens) {
                    loginSuccess(user, tokens, portalAccess);
                }

                if (isMounted) setStatus("success");
            } catch (err) {
                if (!isMounted) return;

                // The backend returns "Invalid or expired verification token" for
                // single-use tokens that have already been consumed (i.e. the email
                // WAS verified on first click). Surface a friendlier message so the
                // user is not confused.
                const serverMessage = err?.response?.data?.message || "";
                const isAlreadyUsed =
                    serverMessage.toLowerCase().includes("invalid or expired") ||
                    serverMessage.toLowerCase().includes("already verified") ||
                    serverMessage.toLowerCase().includes("already been used");

                setStatus(isAlreadyUsed ? "already_verified" : "error");
            }
        };

        verify();

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return (
        <div
            className="container relative grid min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden py-8 lg:max-w-none lg:grid-cols-1 lg:px-0"
            data-testid="verify-email-page"
        >
            <AuthAnimatedBackground variant="login" />

            <div className="relative w-full lg:p-8">
                <motion.div
                    className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]"
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
                        <Card className="relative border-0 bg-background/80 shadow-none backdrop-blur-2xl rounded-[calc(1rem-1.5px)] sm:border-0 text-center">
                            <CardHeader>
                                <CardTitle className="text-2xl">
                                    {t("verifyEmail.title", "Email Verification")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center py-6">

                                {/* ── Verifying ── */}
                                {(status === "verifying" || status === "idle") && (
                                    <motion.div variants={itemVariants} className="flex flex-col items-center w-full">
                                        <LoadingSpinner className="h-12 w-12 text-primary mb-4" />
                                        <p className="text-muted-foreground">
                                            {t("verifyEmail.verifying", "Verifying your email address…")}
                                        </p>
                                    </motion.div>
                                )}

                                {/* ── Success ── */}
                                {status === "success" && (
                                    <motion.div variants={itemVariants} className="flex flex-col items-center w-full">
                                        <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                                        <p className="font-semibold text-lg mb-2">
                                            {t("verifyEmail.successTitle", "Email Verified!")}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            {t(
                                                "verifyEmail.success",
                                                "Your email has been successfully verified. You can now log in to your account."
                                            )}
                                        </p>
                                        <Button
                                            asChild
                                            className="w-full mt-6"
                                            data-testid="verify-email-success-login-link"
                                        >
                                            <Link to="/login">
                                                {t("verifyEmail.backToLogin", "Go to Login")}
                                            </Link>
                                        </Button>
                                    </motion.div>
                                )}

                                {/* ── Already verified (token consumed on first use) ── */}
                                {status === "already_verified" && (
                                    <motion.div variants={itemVariants} className="flex flex-col items-center w-full">
                                        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                                        <p className="font-semibold text-lg mb-2">
                                            {t("verifyEmail.alreadyVerifiedTitle", "Link Already Used")}
                                        </p>
                                        <p className="text-muted-foreground text-sm mb-1">
                                            {t(
                                                "verifyEmail.alreadyVerified",
                                                "This verification link has already been used. Your email is likely already verified."
                                            )}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            {t(
                                                "verifyEmail.tryLogin",
                                                "Please try logging in — if your account is verified, you will be able to sign in normally."
                                            )}
                                        </p>
                                        <Button
                                            asChild
                                            className="w-full mt-6"
                                            data-testid="verify-email-already-verified-login-link"
                                        >
                                            <Link to="/login">
                                                {t("verifyEmail.backToLogin", "Go to Login")}
                                            </Link>
                                        </Button>
                                    </motion.div>
                                )}

                                {/* ── Error (truly invalid or network error) ── */}
                                {status === "error" && (
                                    <motion.div variants={itemVariants} className="flex flex-col items-center w-full">
                                        <XCircle className="h-12 w-12 text-destructive mb-4" />
                                        <p className="font-semibold text-lg mb-2">
                                            {t("verifyEmail.errorTitle", "Verification Failed")}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            {t(
                                                "verifyEmail.error",
                                                "The verification link is invalid or has expired. Please request a new one."
                                            )}
                                        </p>
                                        <div className="flex flex-col gap-3 w-full mt-6">
                                            <Button
                                                asChild
                                                className="w-full"
                                                data-testid="verify-email-error-login-link"
                                            >
                                                <Link to="/login">
                                                    {t("verifyEmail.backToLogin", "Go to Login")}
                                                </Link>
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
