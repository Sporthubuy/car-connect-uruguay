import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { createUserAccount, listBrandsAdmin } from '@/lib/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { UserRole } from '@/types';

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'user', label: 'Usuario' },
  { value: 'brand_admin', label: 'Brand Admin' },
  { value: 'admin', label: 'Admin' },
];

export default function AdminCreateUser() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [brandId, setBrandId] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: brands = [] } = useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: listBrandsAdmin,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (role === 'brand_admin' && !brandId) {
      toast.error('Seleccioná una marca para el Brand Admin');
      return;
    }

    setSaving(true);
    try {
      await createUserAccount({
        email,
        password,
        fullName,
        role,
        brandId: role === 'brand_admin' ? brandId : undefined,
      });
      toast.success('Usuario creado correctamente');
      navigate('/admin/users');
    } catch (err: any) {
      toast.error('Error al crear usuario', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Nuevo usuario" description="Crear una cuenta de usuario">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a usuarios
      </Link>

      <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 max-w-lg space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@email.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña *</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            required
            minLength={8}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Nombre completo *</Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Juan Pérez"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Rol *</Label>
          <select
            id="role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value as UserRole);
              if (e.target.value !== 'brand_admin') setBrandId('');
            }}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {roleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {role === 'brand_admin' && (
          <div className="space-y-2">
            <Label htmlFor="brand">Marca *</Label>
            <select
              id="brand"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="">Seleccionar marca...</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <Button type="submit" disabled={saving} className="gap-2">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            'Crear usuario'
          )}
        </Button>
      </form>
    </AdminLayout>
  );
}
