import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  getBrand,
  listBrandContacts,
  addBrandContact,
  removeBrandContact,
  setDefaultContact,
} from '@/lib/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Star, Loader2 } from 'lucide-react';

export default function AdminBrandContacts() {
  const { brandId } = useParams<{ brandId: string }>();
  const queryClient = useQueryClient();

  const [newEmail, setNewEmail] = useState('');
  const [newDept, setNewDept] = useState('');
  const [adding, setAdding] = useState(false);

  const { data: brand } = useQuery({
    queryKey: ['admin', 'brand', brandId],
    queryFn: () => getBrand(brandId!),
    enabled: !!brandId,
  });

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['admin', 'brand-contacts', brandId],
    queryFn: () => listBrandContacts(brandId!),
    enabled: !!brandId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'brand-contacts', brandId] });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setAdding(true);
    try {
      await addBrandContact({
        brand_id: brandId!,
        email: newEmail.trim(),
        department: newDept.trim() || null,
        is_default: contacts.length === 0,
      });
      setNewEmail('');
      setNewDept('');
      invalidate();
      toast.success('Contacto agregado');
    } catch (err: any) {
      toast.error('Error', {
        description: err.message?.includes('duplicate')
          ? 'Este email ya existe para esta marca'
          : err.message,
      });
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeBrandContact(id);
      invalidate();
      toast.success('Contacto eliminado');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    }
  };

  const handleSetDefault = async (contactId: string) => {
    try {
      await setDefaultContact(brandId!, contactId);
      invalidate();
      toast.success('Contacto predeterminado actualizado');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    }
  };

  return (
    <AdminLayout
      title={`Contactos: ${brand?.name ?? '...'}`}
      description="Emails de contacto para recibir leads de esta marca"
    >
      <Link
        to={`/admin/brands/${brandId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a {brand?.name ?? 'marca'}
      </Link>

      {/* Add contact form */}
      <form onSubmit={handleAdd} className="rounded-xl border bg-card p-6 mb-6 max-w-lg">
        <h2 className="text-sm font-semibold text-foreground mb-4">Agregar contacto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="ventas@marca.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dept">Departamento</Label>
            <Input
              id="dept"
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              placeholder="Ej: Montevideo"
            />
          </div>
        </div>
        <Button type="submit" size="sm" disabled={adding} className="gap-2">
          {adding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Agregar
        </Button>
      </form>

      {/* Contacts list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No hay contactos configurados para esta marca
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden max-w-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Email
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                  Depto.
                </th>
                <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">{contact.email}</span>
                      {contact.is_default && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                    {contact.department ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {!contact.is_default && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Marcar como default"
                          onClick={() => handleSetDefault(contact.id)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Eliminar"
                        onClick={() => handleRemove(contact.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
