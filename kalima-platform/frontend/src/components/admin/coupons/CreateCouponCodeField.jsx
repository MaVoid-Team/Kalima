/* eslint-disable react/prop-types */

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function CreateCouponCodeField({ form, t, loading, onGenerateCode }) {
    return (
        <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('coupons.form.code')}</FormLabel>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <FormControl>
                            <Input
                                {...field}
                                placeholder={t('coupons.form.codePlaceholder')}
                                data-testid="coupons-create-code-input"
                            />
                        </FormControl>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onGenerateCode}
                            disabled={loading}
                            className="w-full sm:w-auto"
                            data-testid="coupons-create-generate-code-button"
                        >
                            <RefreshCw className="me-2 h-4 w-4" />
                            {t('coupons.actions.generateCode')}
                        </Button>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
