import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";

export default function NotFoundPage() {
    const { t } = useTranslation("landing");

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="bg-primary/10 p-6 rounded-full w-24 h-24 flex items-center justify-center mb-8 mx-auto ring-8 ring-primary/5">
                <FileQuestion className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-7xl font-bold tracking-tighter text-foreground mb-4">
                {t("notFound.title", "404")}
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-4">
                {t("notFound.subtitle", "Page Not Found")}
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-[500px]">
                {t("notFound.description", "Oops! The page you are looking for doesn't exist or has been moved.")}
            </p>
            <Button asChild size="lg" className="font-medium" data-testid="notfound-home-link">
                <Link to="/" className="gap-2">
                    <Home className="w-4 h-4" />
                    {t("notFound.backHome", "Back to Home")}
                </Link>
            </Button>
        </div>
    );
}
