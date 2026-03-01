import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import RoleSelection from "@/components/auth/RoleSelection";
import RegisterStudent from "@/components/auth/RegisterStudent";
import RegisterTeacher from "@/components/auth/RegisterTeacher";
import RegisterParent from "@/components/auth/RegisterParent";
import RegisterLecturer from "@/components/auth/RegisterLecturer";
import AuthAnimatedBackground from "@/components/auth/AuthAnimatedBackground";

export default function SignupPage() {
    const { i18n } = useTranslation("auth");
    const [role, setRole] = useState(null);
    const isRTL = i18n.dir() === "rtl";

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const renderStep = () => {
        if (!role) {
            return <RoleSelection onRoleSelect={setRole} />;
        }

        switch (role) {
            case "student":
                return <RegisterStudent onBack={() => setRole(null)} />;
            case "teacher":
                return <RegisterTeacher onBack={() => setRole(null)} />;
            case "parent":
                return <RegisterParent onBack={() => setRole(null)} />;
            case "lecturer":
                return <RegisterLecturer onBack={() => setRole(null)} />;
            default:
                return null;
        }
    };

    return (
        <div className="container relative grid min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden lg:max-w-none lg:grid-cols-2 lg:px-0">
            <AuthAnimatedBackground variant="register" />

            {/* Right Side - Image Loop / Artwork */}
            <motion.div
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className={cn(
                "relative hidden h-full flex-col bg-muted p-10 lg:flex",
                isRTL ? "lg:order-first" : "lg:order-last"
                )}
            >
                <div className="absolute inset-0" />
                <motion.img
                    src="/register.png"
                    alt="Art"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                    animate={{ scale: [1, 1.03, 1], y: [0, -8, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>

            {/* Left Side - Form */}
            <div className="relative z-10 flex h-full flex-col items-center justify-center p-4 py-8 lg:p-8">
                <div className="flex w-full flex-col justify-center space-y-6 max-w-md mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                    >
                        {renderStep()}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
