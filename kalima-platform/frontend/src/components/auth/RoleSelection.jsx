import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { GraduationCap, School, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RoleSelection({ onRoleSelect }) {
    const { t } = useTranslation("auth");

    const ROLES = [
        {
            id: "student",
            label: t("signup.roles.student"),
            icon: GraduationCap,
            description: "Access courses and track progress"
        },
        {
            id: "teacher",
            label: t("signup.roles.teacher"),
            icon: School,
            description: "Create courses and manage students"
        },
        {
            id: "parent",
            label: t("signup.roles.parent"),
            icon: User,
            description: "Monitor your child's progress"
        }
    ];

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">{t("signup.title")}</h1>
                <p className="text-sm text-muted-foreground">{t("signup.roleLabel")}</p>
            </div>
            <div className="grid gap-4">
                {ROLES.map((r) => {
                    const Icon = r.icon;
                    return (
                        <Button
                            key={r.id}
                            variant="outline"
                            className="h-24 justify-start px-6 hover:border-primary hover:bg-primary/5 transition-all group"
                            onClick={() => onRoleSelect(r.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>
                                <div className="text-start">
                                    <div className="font-bold text-lg">{r.label}</div>
                                    <div className="text-xs text-muted-foreground font-normal">{r.description}</div>
                                </div>
                            </div>
                        </Button>
                    )
                })}
            </div>
            <div className="text-sm text-muted-foreground w-full text-center">
                {t("signup.hasAccount")}{" "}
                <Link to="/login" className="underline underline-offset-4 hover:text-primary font-medium">
                    {t("signup.loginLink")}
                </Link>
            </div>
        </div>
    );
}
