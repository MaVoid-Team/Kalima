import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { GraduationCap, School, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function RoleSelection({ onRoleSelect }) {
    const { t } = useTranslation("auth");

    const containerVariants = {
        hidden: { opacity: 0, y: 16 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
                staggerChildren: 0.09,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } },
    };

    const ROLES = [
        {
            id: "student",
            label: t("signup.roles.student"),
            icon: GraduationCap,
            description: t("signup.roleDescriptions.student")
        },
        {
            id: "teacher",
            label: t("signup.roles.teacher"),
            icon: School,
            description: t("signup.roleDescriptions.teacher")
        },
        {
            id: "parent",
            label: t("signup.roles.parent"),
            icon: User,
            description: t("signup.roleDescriptions.parent")
        },
        // {
        //     id: "lecturer",
        //     label: t("signup.roles.lecturer"),
        //     icon: Mic2,
        //     description: t("signup.roleDescriptions.lecturer")
        // }
    ];

    return (
        <motion.div
            className="w-full space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            <motion.div className="flex flex-col space-y-2 text-center" variants={itemVariants}>
                <h1 className="text-2xl font-semibold tracking-tight">{t("signup.title")}</h1>
                <p className="text-sm text-muted-foreground">{t("signup.roleLabel")}</p>
            </motion.div>
            <motion.div className="grid gap-4" variants={itemVariants}>
                {ROLES.map((r) => {
                    const Icon = r.icon;
                    return (
                        <motion.div
                            key={r.id}
                            className="w-full"
                            variants={itemVariants}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.99 }}
                            transition={{ type: "spring", stiffness: 380, damping: 20 }}
                        >
                            <Button
                                variant="outline"
                                className="h-24 w-full justify-start px-6 hover:border-primary hover:bg-primary/5 transition-all group"
                                onClick={() => onRoleSelect(r.id)}
                                data-testid={`auth-role-select-${r.id}`}
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
                        </motion.div>
                    )
                })}
            </motion.div>
            <motion.div className="text-sm text-muted-foreground w-full text-center" variants={itemVariants}>
                {t("signup.hasAccount")}{" "}
                <Link to="/login" className="underline underline-offset-4 hover:text-primary font-medium" data-testid="auth-role-login-link">
                    {t("signup.loginLink")}
                </Link>
            </motion.div>
        </motion.div>
    );
}
