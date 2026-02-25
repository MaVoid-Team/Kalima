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
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { GENDERS } from '@/lib/adminConstants';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import { useRole } from '@/hooks/useRole';

export default function CreateUserDialog({ onSuccess }) {
    const { t } = useTranslation('userManagement');
    const { isAdmin } = useRole();
    const {
        createAdminUser,
        createSubAdminUser,
        createModeratorUser,
        createAssistantUser,
        actionLoading
    } = useAdminUsers();

    const [isOpen, setIsOpen] = useState(false);

    const formSchema = z.object({
        type: z.enum(['Admin', 'SubAdmin', 'Moderator', 'Assistant']),
        name: z.string().min(1, { message: t('common:validation.required', 'Required') }),
        email: z.string().email({ message: t('common:validation.email', 'Invalid email') }),
        password: z.string().min(6, { message: t('common:validation.minLength', { min: 6, defaultValue: 'Min 6 chars' }) }),
        phone: z.string().min(1, { message: t('common:validation.required', 'Required') }),
        secondary_phone: z.string().optional().nullable(),
        gender: z.enum(['male', 'female'], { message: t('common:validation.required', 'Required') }),
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
        },
    });

    const onSubmit = async (values) => {
        let success = false;

        switch (values.type) {
            case 'Admin':
                success = await createAdminUser(values);
                break;
            case 'SubAdmin':
                success = await createSubAdminUser(values);
                break;
            case 'Moderator':
                success = await createModeratorUser(values);
                break;
            case 'Assistant':
                success = await createAssistantUser(values);
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
            <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{t('createDialog.title')}</DialogTitle>
                    <DialogDescription>
                        Create a new user with administrative privileges.
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {isAdmin && <SelectItem value="Admin">{t('roles.Admin')}</SelectItem>}
                                            {isAdmin && <SelectItem value="SubAdmin">{t('roles.SubAdmin')}</SelectItem>}
                                            <SelectItem value="Moderator">{t('roles.Moderator')}</SelectItem>
                                            <SelectItem value="Assistant">{t('roles.Assistant')}</SelectItem>
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
                                        <Input placeholder="010..." {...field} />
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
                                        <Input {...field} value={field.value || ''} />
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={actionLoading} data-testid="admin-users-create-cancel-button">
                                {t('common:cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={actionLoading}
                                className="min-w-[100px]"
                                data-testid="admin-users-create-submit-button"
                            >
                                {actionLoading ? <LoadingSpinner className="h-4 w-4" /> : t('common:confirm')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
