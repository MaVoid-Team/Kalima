/* eslint-disable react/prop-types */

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';

export default function EditCouponActiveField({ form, t }) {
    return (
        <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                    <div className="space-y-0.5">
                        <FormLabel>{t('coupons.form.isActive')}</FormLabel>
                        <p className="text-sm text-muted-foreground">{t('coupons.edit.toggleHelp')}</p>
                    </div>
                    <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="coupons-edit-active-switch"
                        />
                    </FormControl>
                </FormItem>
            )}
        />
    );
}
