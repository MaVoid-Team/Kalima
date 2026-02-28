import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import LoadingSpinner from '@/components/ui/loading-spinner';

const schema = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'Label is required')
    .max(255, 'Label must be less than 255 characters'),
  field_type: z.enum(['text', 'number', 'date', 'image'], {
    required_error: 'Field type is required',
  }),
  active: z.boolean(),
});

export default function EditRequiredFieldDialog({
  open,
  onOpenChange,
  field,
  onSubmitField,
  loading,
}) {
  const { t, i18n } = useTranslation('admin');

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      label: '',
      field_type: 'text',
      active: true,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (field) {
      form.reset({
        label: field.label || '',
        field_type: field.field_type || 'text',
        active: field.active !== undefined ? field.active : true,
      });
    }
  }, [field, form]);

  const onSubmit = async (values) => {
    const result = await onSubmitField(field.id, values);
    if (result) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md" 
        data-testid="requiredFields-edit-dialog"
        dir={i18n.dir()}
      >
        <DialogHeader>
          <DialogTitle>{t('requiredFields.edit.title')}</DialogTitle>
          <DialogDescription>
            {t('requiredFields.edit.description')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('requiredFields.fields.label')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('requiredFields.edit.labelPlaceholder')}
                      data-testid="requiredFields-edit-label-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="field_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('requiredFields.fields.fieldType')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="requiredFields-edit-fieldType-select">
                        <SelectValue placeholder={t('requiredFields.edit.fieldTypePlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="text">
                        {t('requiredFields.types.text')}
                      </SelectItem>
                      <SelectItem value="number">
                        {t('requiredFields.types.number')}
                      </SelectItem>
                      <SelectItem value="date">
                        {t('requiredFields.types.date')}
                      </SelectItem>
                      <SelectItem value="image">
                        {t('requiredFields.types.image')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t('requiredFields.fields.active')}
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {t('requiredFields.edit.activeDescription')}
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="requiredFields-edit-active-switch"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                data-testid="requiredFields-edit-cancel-button"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading || !form.formState.isValid}
                data-testid="requiredFields-edit-submit-button"
              >
                {loading ? <LoadingSpinner className="h-4 w-4" /> : t('common.update')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
