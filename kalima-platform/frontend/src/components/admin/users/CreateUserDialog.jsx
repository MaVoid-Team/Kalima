import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PhoneInput, egyptPhoneSchema } from '@/components/ui/phone-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { GENDERS } from '@/lib/adminConstants';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import { useRole } from '@/hooks/useRole';
import useLookups from '@/hooks/useLookups';

export default function CreateUserDialog({ onSuccess }) {
    const { t, i18n } = useTranslation('userManagement');
    const { hasAdminAccess } = useRole();
    const {
        createAdminUser,
        createSubAdminUser,
        createModeratorUser,
        createAssistantUser,
        createTeacherUser,
        actionLoading
    } = useAdminUsers();

    const [isOpen, setIsOpen] = useState(false);

    const { governments, zones, getZonesByGovernment, subjects } = useLookups();

    const formSchema = z.object({
        type: z.enum(['Admin', 'SubAdmin', 'Moderator', 'Assistant', 'Teacher']),
        name: z.string().min(1, { message: t('common:validation.required', 'Required') }),
        email: z.string().email({ message: t('common:validation.email', 'Invalid email') }),
        password: z.string().min(6, { message: t('common:validation.minLength', { min: 6, defaultValue: 'Min 6 chars' }) }),
        phone: egyptPhoneSchema,
        secondary_phone: z.union([egyptPhoneSchema, z.literal(""), z.literal("+20"), z.undefined(), z.null()]),
        gender: z.enum(['male', 'female'], { message: t('common:validation.required', 'Required') }),
        // Teacher-specific fields (validated conditionally)
        government_id: z.string().optional(),
        zone_id: z.string().optional(),
        subject_id: z.string().optional(),
        is_primary: z.boolean().default(false),
        is_preparatory: z.boolean().default(false),
        is_secondary: z.boolean().default(false),
    }).superRefine((data, ctx) => {
        if (data.type === 'Teacher') {
            if (!data.government_id || data.government_id.length === 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('common:validation.required', 'Required'), path: ['government_id'] });
            }
            if (!data.zone_id || data.zone_id.length === 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('common:validation.required', 'Required'), path: ['zone_id'] });
            }
            if (!data.subject_id || data.subject_id.length === 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('common:validation.required', 'Required'), path: ['subject_id'] });
            }
        }
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: 'Moderator',
            name: '',
            email: '',
            password: '',
            phone: '',
            secondary_phone: '',
            gender: 'male',
            government_id: '',
            zone_id: '',
            subject_id: '',
            is_primary: false,
            is_preparatory: false,
            is_secondary: false,
        },
    });

    const selectedType = form.watch('type');
    const isTeacher = selectedType === 'Teacher';
    const selectedGov = form.watch('government_id');

    const handleGovChange = (value) => {
        form.setValue('government_id', value);
        form.setValue('zone_id', '');
        getZonesByGovernment(value);
    };

    const onSubmit = async (values) => {
        let success = false;
        let payload = { ...values };

        // Parse teacher-specific fields to integers for the API
        if (values.type === 'Teacher') {
            payload.government_id = parseInt(values.government_id);
            payload.zone_id = parseInt(values.zone_id);
            payload.subject_id = parseInt(values.subject_id);
        } else {
            // Remove teacher fields for non-teacher types
            delete payload.government_id;
            delete payload.zone_id;
            delete payload.subject_id;
            delete payload.is_primary;
            delete payload.is_preparatory;
            delete payload.is_secondary;
        }

        switch (values.type) {
            case 'Admin':
                success = await createAdminUser(payload);
                break;
            case 'SubAdmin':
                success = await createSubAdminUser(payload);
                break;
            case 'Moderator':
                success = await createModeratorUser(payload);
                break;
            case 'Assistant':
                success = await createAssistantUser(payload);
                break;
            case 'Teacher':
                success = await createTeacherUser(payload);
                break;
        }

        if (success) {
            setIsOpen(false);
            form.reset();
            if (onSuccess) onSuccess();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) form.reset();
        }}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t('actions.create')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh] custom-scrollbar">
                <DialogHeader>
                    <DialogTitle>{t('createDialog.title')}</DialogTitle>
                    <DialogDescription>
                        {t('createDialog.description')}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('createDialog.type')}</FormLabel>
                                    <Select dir={i18n.dir()} onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {hasAdminAccess && <SelectItem value="Admin">{t('roles.Admin')}</SelectItem>}
                                            {hasAdminAccess && <SelectItem value="SubAdmin">{t('roles.SubAdmin')}</SelectItem>}
                                            <SelectItem value="Moderator">{t('roles.Moderator')}</SelectItem>
                                            {/* <SelectItem value="Assistant">{t('roles.Assistant')}</SelectItem> */}
                                            <SelectItem value="Teacher">{t('roles.Teacher')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('createDialog.name')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('createDialog.email')}</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="john@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('createDialog.password')}</FormLabel>
                                    <FormControl>
                                        <Input type="password" autoComplete="new-password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('createDialog.phone')}</FormLabel>
                                    <FormControl>
                                        <PhoneInput dir="ltr" placeholder="010..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="secondary_phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('createDialog.secondaryPhone')}</FormLabel>
                                    <FormControl>
                                        <PhoneInput dir="ltr" {...field} value={field.value || ''} required={false} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('createDialog.gender')}</FormLabel>
                                    <Select dir={i18n.dir()} onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {GENDERS.map(g => (
                                                <SelectItem key={g} value={g}>{t(`createDialog.${g}`)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Teacher-specific fields */}
                        {isTeacher && (
                            <div className="space-y-4 border-t pt-4">
                                <FormLabel className="text-base font-semibold">{t('createDialog.teacherFields')}</FormLabel>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="government_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('createDialog.government')}</FormLabel>
                                                <Select dir={i18n.dir()} onValueChange={handleGovChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t('createDialog.selectGovernment')} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {governments.map((gov) => (
                                                            <SelectItem key={gov.id} value={String(gov.id)}>
                                                                {gov.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="zone_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('createDialog.zone')}</FormLabel>
                                                <Select
                                                    dir={i18n.dir()}
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    disabled={!selectedGov || zones.length === 0}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t('createDialog.selectZone')} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {zones.map((zone) => (
                                                            <SelectItem key={zone.id} value={String(zone.id)}>
                                                                {zone.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="subject_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('createDialog.subject')}</FormLabel>
                                            <Select dir={i18n.dir()} onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('createDialog.selectSubject')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {subjects.map((sub) => (
                                                        <SelectItem key={sub.id} value={String(sub.id)}>
                                                            {sub.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-2">
                                    <FormLabel>{t('createDialog.teachingLevels')}</FormLabel>
                                    <div className="flex flex-col space-y-2 rounded-md border p-4">
                                        <FormField
                                            control={form.control}
                                            name="is_primary"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            className={i18n.language === 'ar' ? 'scale-x-[-1]' : ''}
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>{t('createDialog.primary')}</FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="is_preparatory"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            className={i18n.language === 'ar' ? 'scale-x-[-1]' : ''}
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>{t('createDialog.preparatory')}</FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="is_secondary"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            className={i18n.language === 'ar' ? 'scale-x-[-1]' : ''}
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>{t('createDialog.secondary')}</FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={actionLoading} data-testid="admin-users-create-cancel-button">
                                {t('actions.close')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={actionLoading}
                                className="min-w-[100px]"
                                data-testid="admin-users-create-submit-button"
                            >
                                {actionLoading ? <LoadingSpinner className="h-4 w-4" /> : t('actions.confirm')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
