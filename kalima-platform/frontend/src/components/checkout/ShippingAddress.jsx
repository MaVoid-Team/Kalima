import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ShippingAddress() {
    const { t } = useTranslation('checkout');

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('shipping.title')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label className="text-xs uppercase text-muted-foreground tracking-wide">
                        {t('shipping.country_label')}
                    </Label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="ca">Canada</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="au">Australia</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label className="text-xs uppercase text-primary tracking-wide">{t('shipping.first_name')}</Label>
                        <Input type="text" />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-xs uppercase text-primary tracking-wide">{t('shipping.last_name')}</Label>
                        <Input type="text" />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label className="text-xs uppercase text-primary tracking-wide">{t('shipping.address_label')}</Label>
                    <Input type="text" />
                </div>

                <div className="grid gap-2">
                    <Input
                        type="text"
                        placeholder={t('shipping.apartment_placeholder')}
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                        <Label className="text-xs uppercase text-muted-foreground tracking-wide">{t('shipping.city')}</Label>
                        <Input type="text" />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-xs uppercase text-muted-foreground tracking-wide">{t('shipping.state')}</Label>
                        <Input type="text" />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-xs uppercase text-muted-foreground tracking-wide">{t('shipping.zip_code')}</Label>
                        <Input type="text" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
