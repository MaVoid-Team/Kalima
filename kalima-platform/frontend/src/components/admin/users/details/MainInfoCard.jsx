import React from 'react';
import { Mail, Phone, User as UserIcon, Flag, Crown, Zap, ShieldCheck, Eye, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PhoneInput } from '@/components/ui/phone-input';
import InfoRow from './InfoRow';
import { useTranslation } from 'react-i18next';

export default function MainInfoCard({
    user,
    isEditing,
    formData,
    setFormData,
    t,
    displayEmail,
    displayPhone,
    displaySecondaryPhone
}) {
    const { i18n } = useTranslation();

    const getFlagConfig = (flag) => {
        const f = flag || 'NORMAL';
        if (f === 'ELITE') return { icon: Crown, color: 'text-amber-600' };
        if (f === 'PRO') return { icon: Zap, color: 'text-indigo-600' };
        if (f === 'OBSERVER') return { icon: Eye, color: 'text-slate-600' };
        if (f === 'Warned') return { icon: AlertTriangle, color: 'text-red-600' };
        return { icon: ShieldCheck, color: 'text-emerald-600' };
    };

    const flagConfig = getFlagConfig(user.flag);
    const FlagIcon = flagConfig.icon;
    return (
        <Card className="shadow-sm overflow-hidden" data-testid="user-detail-info-card">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-primary" />
                    {t('details.personalInfo')}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {isEditing ? (
                    <div className="space-y-4 py-2">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">{t('details.name', 'Name')}</label>
                            <Input
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">{t('details.email', 'Email')}</label>
                            <Input
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">{t('details.phone', 'Phone')}</label>
                                <PhoneInput
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="h-8 shadow-none"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">{t('details.secondaryPhone', 'Secondary Phone')}</label>
                                <PhoneInput
                                    value={formData.secondary_phone || ''}
                                    onChange={(e) => setFormData({ ...formData, secondary_phone: e.target.value })}
                                    className="h-8 shadow-none"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">{t('details.gender', 'Gender')}</label>
                                <Select
                                    dir={i18n.dir()}
                                    value={formData.gender || ''}
                                    onValueChange={(val) => setFormData({ ...formData, gender: val })}
                                >
                                    <SelectTrigger className="h-8 text-sm">
                                        <SelectValue placeholder="Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">{t('details.male')}</SelectItem>
                                        <SelectItem value="FEMALE">{t('details.female')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">{t('details.flag', 'Flag')}</label>
                                <Select
                                    dir={i18n.dir()}
                                    value={formData.flag || ''}
                                    onValueChange={(val) => setFormData({ ...formData, flag: val })}
                                >
                                    <SelectTrigger className="h-8 text-sm">
                                        <SelectValue placeholder="Flag" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ELITE">{t('details.flags.ELITE')}</SelectItem>
                                        <SelectItem value="PRO">{t('details.flags.PRO')}</SelectItem>
                                        <SelectItem value="NORMAL">{t('details.flags.NORMAL')}</SelectItem>
                                        <SelectItem value="OBSERVER">{t('details.flags.OBSERVER')}</SelectItem>
                                        <SelectItem value="Warned">{t('details.flags.Warned')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        <InfoRow
                            icon={Mail}
                            label={t('details.email')}
                            value={displayEmail}
                            dir="ltr"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 divide-x rtl:divide-x-reverse divide-border/50">
                            <InfoRow
                                icon={Phone}
                                label={t('details.phone')}
                                value={displayPhone}
                                dir="ltr"
                            />
                            {displaySecondaryPhone && (
                                <div className="ps-4">
                                    <InfoRow
                                        icon={Phone}
                                        label={t('details.secondaryPhone')}
                                        value={displaySecondaryPhone}
                                        dir="ltr"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 divide-x rtl:divide-x-reverse divide-border/50">
                            <InfoRow
                                icon={UserIcon}
                                label={t('details.gender')}
                                value={user.gender ? t(`details.${user.gender.toLowerCase()}`) : '—'}
                            />
                            <div className="ps-4">
                                <InfoRow
                                    icon={FlagIcon}
                                    label={t('details.flag')}
                                    value={user.flag ? t(`details.flags.${user.flag}`, user.flag) : t('details.flags.NORMAL')}
                                    iconClassName={flagConfig.color}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
