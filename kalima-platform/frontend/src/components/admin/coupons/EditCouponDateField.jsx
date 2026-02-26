/* eslint-disable react/prop-types */

import { format } from 'date-fns';
import { arSA } from 'react-day-picker/locale';
import { Calendar as CalendarIcon } from 'lucide-react';

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export default function EditCouponDateField({
    form,
    name,
    label,
    placeholder,
    selectedDate,
    isRtl,
    testId,
}) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-start font-normal',
                                        !selectedDate && 'text-muted-foreground'
                                    )}
                                    data-testid={testId}
                                >
                                    <CalendarIcon className="me-2 h-4 w-4" />
                                    {selectedDate
                                        ? format(new Date(selectedDate), 'PPP', { locale: isRtl ? arSA : undefined })
                                        : placeholder}
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate ? new Date(selectedDate) : undefined}
                                    onSelect={(date) => {
                                        if (!date) return;
                                        field.onChange(date.toISOString());
                                    }}
                                    locale={isRtl ? arSA : undefined}
                                    dir={isRtl ? 'rtl' : 'ltr'}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
