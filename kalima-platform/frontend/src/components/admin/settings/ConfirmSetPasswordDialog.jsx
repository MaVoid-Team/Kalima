import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Password validation schema
const passwordSetSchema = z.object({
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function ConfirmSetPasswordDialog({ 
    open, 
    onOpenChange, 
    onConfirm, 
    loading 
}) {
    const { t } = useTranslation('admin');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset
    } = useForm({
        resolver: zodResolver(passwordSetSchema),
        mode: 'onChange'
    });

    const handleConfirm = (data) => {
        onConfirm(data);
        reset();
    };

    const handleCancel = () => {
        reset();
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />
                        {t('settings.password.confirmSetTitle')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('settings.password.confirmSet')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                <form onSubmit={handleSubmit(handleConfirm)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="set-password">
                            {t('settings.password.newPassword')}
                        </Label>
                        <div className="relative">
                            <Input
                                id="set-password"
                                type={showPassword ? "text" : "password"}
                                {...register('password')}
                                placeholder={t('settings.password.newPasswordPlaceholder')}
                                disabled={loading}
                                className={errors.password ? 'border-destructive' : ''}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4" />
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-set-password">
                            {t('settings.password.confirmPassword')}
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirm-set-password"
                                type={showConfirmPassword ? "text" : "password"}
                                {...register('confirmPassword')}
                                placeholder={t('settings.password.confirmPasswordPlaceholder')}
                                disabled={loading}
                                className={errors.confirmPassword ? 'border-destructive' : ''}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={loading}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4" />
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel type="button" disabled={loading} onClick={handleCancel}>
                            {t('common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            type="submit"
                            disabled={loading || !isValid}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {loading ? t('common.loading') : t('settings.password.setPassword')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
