import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Search, Loader2 } from 'lucide-react';

export default function AdminBrandAdmins() {
  const { brandId } = useParams<{ brandId: string }>();

  const [searchEmail, setSearchEmail] = useState('');
  const [adding, setAdding] = useState(false);

  const brand = useQuery(
    api.cars.getBrand,
    brandId ? { brandId: brandId as Id<"brands"> } : 'skip',
  );

  const admins = useQuery(
    api.settings.listBrandAdmins,
    brandId ? { brandId: brandId as Id<"brands"> } : 'skip',
  );
  const isLoading = admins === undefined;

  const searchResults = useQuery(
    api.admin.searchUsersByEmail,
    searchEmail.length >= 3 ? { email: searchEmail } : 'skip',
  );
  const searching = searchEmail.length >= 3 && searchResults === undefined;

  const addBrandAdmin = useMutation(api.settings.addBrandAdmin);
  const removeBrandAdmin = useMutation(api.settings.removeBrandAdmin);

  const handleAdd = async (userId: string) => {
    if (!brandId) return;
    setAdding(true);
    try {
      await addBrandAdmin({
        brandId: brandId as Id<"brands">,
        userId,
      });
      setSearchEmail('');
      toast.success('Brand admin asignado');
    } catch (err: any) {
      toast.error('Error', {
        description: err.message?.includes('duplicate')
          ? 'Este usuario ya es admin de esta marca'
          : err.message,
      });
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id: Id<"brandAdmins">) => {
    try {
      await removeBrandAdmin({ brandAdminId: id });
      toast.success('Brand admin removido');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    }
  };

  return (
    <AdminLayout
      title={`Admins: ${brand?.name ?? '...'}`}
      description="Usuarios administradores de esta marca"
    >
      <Link
        to={`/admin/brands/${brandId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a {brand?.name ?? 'marca'}
      </Link>

      {/* Search user form */}
      <div className="rounded-xl border bg-card p-6 mb-6 max-w-lg">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Buscar usuario para asignar
        </h2>
        <div className="flex gap-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="search-email" className="sr-only">
              Email
            </Label>
            <Input
              id="search-email"
              type="text"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Buscar por email (min. 3 caracteres)..."
            />
          </div>
          {searching && (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Search results */}
        {(searchResults ?? []).length > 0 && (
          <div className="mt-4 space-y-2">
            {(searchResults ?? []).map((user) => {
              const alreadyAdmin = (admins ?? []).some((a) => a.userId === user._id);
              return (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {user.fullName ?? 'Sin nombre'}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  {alreadyAdmin ? (
                    <span className="text-xs text-muted-foreground">Ya es admin</span>
                  ) : (
                    <Button
                      size="sm"
                      disabled={adding}
                      onClick={() => handleAdd(user._id)}
                      className="gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Asignar
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Current admins list */}
      <h2 className="text-sm font-semibold text-foreground mb-3">
        Admins actuales
      </h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (admins ?? []).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No hay brand admins asignados
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden max-w-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Usuario
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                  Email
                </th>
                <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">
                  Accion
                </th>
              </tr>
            </thead>
            <tbody>
              {(admins ?? []).map((admin) => (
                <tr key={admin._id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {admin.user?.fullName ?? 'Sin nombre'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                    {admin.user?.email ?? '\u2014'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Quitar admin"
                        onClick={() => handleRemove(admin._id)}
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
