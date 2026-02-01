import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Car, URUGUAY_DEPARTMENTS } from '@/types';
import { submitLead } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

const leadSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email inválido').max(255),
  phone: z.string().min(8, 'Teléfono inválido').max(20),
  department: z.string().min(1, 'Selecciona un departamento'),
  city: z.string().max(100).optional(),
  message: z.string().max(500).optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadModalProps {
  car: Car;
  isOpen: boolean;
  onClose: () => void;
}

export function LeadModal({ car, isOpen, onClose }: LeadModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);

    try {
      await submitLead({
        car_id: car.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        department: data.department,
        city: data.city,
        message: data.message,
      });

      setIsSuccess(true);

      toast.success('¡Solicitud enviada!', {
        description: 'Un asesor se pondrá en contacto contigo pronto.',
      });

      setTimeout(() => {
        setIsSuccess(false);
        reset();
        onClose();
      }, 2000);
    } catch {
      toast.error('Error al enviar', {
        description: 'Intentá de nuevo más tarde.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsSuccess(false);
      reset();
      onClose();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              ¡Solicitud enviada!
            </h3>
            <p className="text-muted-foreground">
              Un asesor de {car.brand.name} se pondrá en contacto contigo pronto.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Estoy interesado</DialogTitle>
              <DialogDescription>
                Completa el formulario y un asesor te contactará sobre el{' '}
                <span className="font-medium text-foreground">
                  {car.brand.name} {car.model.name} {car.name}
                </span>{' '}
                ({formatPrice(car.price_usd)})
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo *</Label>
                <Input
                  id="name"
                  placeholder="Juan Pérez"
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan@ejemplo.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono / WhatsApp *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="099 123 456"
                  {...register('phone')}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone.message}</p>
                )}
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department">Departamento *</Label>
                <Select onValueChange={(v) => setValue('department', v)}>
                  <SelectTrigger
                    className={errors.department ? 'border-destructive' : ''}
                  >
                    <SelectValue placeholder="Selecciona tu departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {URUGUAY_DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-xs text-destructive">
                    {errors.department.message}
                  </p>
                )}
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad (opcional)</Label>
                <Input
                  id="city"
                  placeholder="Tu ciudad"
                  {...register('city')}
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Mensaje (opcional)</Label>
                <Textarea
                  id="message"
                  placeholder="¿Alguna pregunta o comentario?"
                  rows={3}
                  {...register('message')}
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar solicitud
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Al enviar, aceptas nuestra{' '}
                <a href="/privacidad" className="underline hover:text-foreground">
                  política de privacidad
                </a>
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
