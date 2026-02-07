import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function ContactInformation() {
    const { t } = useTranslation('checkout');

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>{t('contact.title')}</CardTitle>
                <a href="#" className="text-primary text-sm hover:underline font-normal">
                    {t('contact.login')}
                </a>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email" className="text-xs uppercase text-muted-foreground tracking-wide">
                        {t('contact.email_label')}
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder={t('contact.email_placeholder')}
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox id="news_offers" />
                    <Label htmlFor="news_offers" className="text-sm font-normal text-muted-foreground cursor-pointer">
                        {t('contact.news_offers')}
                    </Label>
                </div>
            </CardContent>
        </Card>
    );
}
