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
});

export default function CreateRequiredFieldDialog({
  open,
  onOpenChange,
  onSubmitField,
  loading,
}) {
  const { t, i18n } = useTranslation('admin');

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      label: '',
      field_type: 'text',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values) => {
    const result = await onSubmitField(values);
    if (result) {
      form.reset({
        label: '',
        field_type: 'text',
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md" 
        data-testid="requiredFields-create-dialog"
        dir={i18n.dir()}
      >
        <DialogHeader>
          <DialogTitle>{t('requiredFields.create.title')}</DialogTitle>
          <DialogDescription>
            {t('requiredFields.create.description')}
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
                      placeholder={t('requiredFields.create.labelPlaceholder')}
                      data-testid="requiredFields-label-input"
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="requiredFields-fieldType-select">
                        <SelectValue placeholder={t('requiredFields.create.fieldTypePlaceholder')} />
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                data-testid="requiredFields-create-cancel-button"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading || !form.formState.isValid}
                data-testid="requiredFields-create-submit-button"
              >
                {loading ? <LoadingSpinner className="h-4 w-4" /> : t('common.confirm')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
