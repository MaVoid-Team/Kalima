import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import RoleSelection from "@/components/auth/RoleSelection";
import RegisterStudent from "@/components/auth/RegisterStudent";
import RegisterTeacher from "@/components/auth/RegisterTeacher";
import RegisterParent from "@/components/auth/RegisterParent";

export default function SignupPage() {
    const { t, i18n } = useTranslation("auth");
    const [role, setRole] = useState(null);
    const isRTL = i18n.dir() === "rtl";

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
            default:
                return null;
        }
    };

    return (
        <div className="container relative min-h-[calc(100vh-4rem)] flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">

            {/* Right Side - Image Loop / Artwork */}
            <div className={cn(
                "relative hidden h-full flex-col bg-muted p-10 lg:flex",
                isRTL ? "lg:order-first" : "lg:order-last"
            )}>
                <div className="absolute inset-0" />
                <img
                    src="/register.png"
                    alt="Art"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
            </div>

            {/* Left Side - Form */}
            <div className="flex h-full flex-col items-center justify-center p-4 lg:p-8">
                <div className="flex w-full flex-col justify-center space-y-6">
                    {renderStep()}
                </div>
            </div>
        </div>
    );
}
