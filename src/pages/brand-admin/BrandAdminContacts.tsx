import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { BrandAdminLayout } from '@/components/brand-admin/BrandAdminLayout';
import { useBrandAdmin } from '@/hooks/useBrandAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Star, Loader2 } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';

export default function BrandAdminContacts() {
  const { brandInfo } = useBrandAdmin();
  const brandId = brandInfo?.brand_id as Id<"brands"> | undefined;

  const [newEmail, setNewEmail] = useState('');
  const [newDept, setNewDept] = useState('');
  const [adding, setAdding] = useState(false);

  const contacts = useQuery(
    api.settings.listBrandContacts,
    brandId ? { brandId } : 'skip'
  );

  const createBrandContactMutation = useMutation(api.settings.createBrandContact);
  const deleteBrandContactMutation = useMutation(api.settings.deleteBrandContact);
  const updateBrandContactMutation = useMutation(api.settings.updateBrandContact);

  const isLoading = contacts === undefined;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !brandId) return;

    setAdding(true);
    try {
      await createBrandContactMutation({
        brandId,
        email: newEmail.trim(),
        department: newDept.trim() || undefined,
        isDefault: (contacts ?? []).length === 0,
      });
      setNewEmail('');
      setNewDept('');
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

  const handleRemove = async (id: Id<"brandContacts">) => {
    try {
      await deleteBrandContactMutation({ contactId: id });
      toast.success('Contacto eliminado');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    }
  };

  const handleSetDefault = async (contactId: Id<"brandContacts">) => {
    try {
      await updateBrandContactMutation({ contactId, isDefault: true });
      toast.success('Contacto predeterminado actualizado');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    }
  };

  return (
    <BrandAdminLayout
      title="Contactos"
      description="Emails de contacto para recibir leads de tu marca"
    >
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
      ) : (contacts ?? []).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No hay contactos configurados para tu marca
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
              {(contacts ?? []).map((contact) => (
                <tr key={contact._id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">{contact.email}</span>
                      {contact.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                    {contact.department ?? '---'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {!contact.isDefault && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Marcar como default"
                          onClick={() => handleSetDefault(contact._id)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Eliminar"
                        onClick={() => handleRemove(contact._id)}
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
    </BrandAdminLayout>
  );
}
