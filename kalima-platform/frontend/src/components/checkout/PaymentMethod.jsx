import { CreditCard, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function PaymentMethod() {
    const { t } = useTranslation('checkout');

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('payment.title')}</CardTitle>
                <CardDescription>{t('payment.secure_notice')}</CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup defaultValue="card" className="grid gap-4">
                    {/* Credit Card Option */}
                    <div className="border-2 border-primary rounded-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 bg-primary/5">
                            <div className="flex items-center space-x-3">
                                <RadioGroupItem value="card" id="card" className="accent-primary" />
                                <Label htmlFor="card" className="font-medium cursor-pointer">{t('payment.credit_card')}</Label>
                            </div>
                            <div className="flex gap-2 items-center">
                                <CreditCard className="w-6 h-6 text-muted-foreground" />
                            </div>
                        </div>

                        <div className="p-4 bg-muted/30 border-t border-border grid gap-4">
                            <div className="grid gap-2">
                                <Label className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                                    {t('payment.card_number')}
                                </Label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder={t('payment.card_placeholder')}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                                        {t('payment.expiration')}
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder={t('payment.expiration_placeholder')}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                                        {t('payment.security_code')}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder={t('payment.cvc_placeholder')}
                                        />
                                        <HelpCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                                    {t('payment.name_on_card')}
                                </Label>
                                <Input type="text" />
                            </div>
                        </div>
                    </div>

                    {/* PayPal Option */}
                    <div className="border border-border rounded-md">
                        <div className="flex justify-between items-center p-4 bg-muted/30">
                            <div className="flex items-center space-x-3">
                                <RadioGroupItem value="paypal" id="paypal" />
                                <Label htmlFor="paypal" className="font-medium cursor-pointer">{t('payment.paypal')}</Label>
                            </div>
                            <a href="#" className="text-primary text-sm hover:underline">{t('payment.paypal')}</a>
                        </div>
                    </div>

                    {/* Apple Pay Option */}
                    <div className="border border-border rounded-md">
                        <div className="flex justify-between items-center p-4 bg-muted/30">
                            <div className="flex items-center space-x-3">
                                <RadioGroupItem value="apple" id="apple" />
                                <Label htmlFor="apple" className="font-medium cursor-pointer">{t('payment.apple_pay')}</Label>
                            </div>
                            <span className="text-sm text-foreground">⌘ Pay</span>
                        </div>
                    </div>
                </RadioGroup>
            </CardContent>
        </Card>
    );
}
