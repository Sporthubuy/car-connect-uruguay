import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Pencil, Mail, Users, Loader2 } from 'lucide-react';

export default function AdminBrands() {
  const [search, setSearch] = useState('');
  const brands = useQuery(api.cars.listBrands);
  const isLoading = brands === undefined;

  const filtered = (brands ?? []).filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout title="Marcas" description="Gestionar marcas del catálogo">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar marca..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link to="/admin/brands/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva marca
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {search ? 'No se encontraron marcas' : 'No hay marcas creadas'}
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Marca
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                  Slug
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                  País
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Estado
                </th>
                <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((brand) => (
                <tr key={brand._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {brand.logoUrl ? (
                        <img
                          src={brand.logoUrl}
                          alt={brand.name}
                          className="h-8 w-8 rounded object-contain bg-white"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {brand.name[0]}
                        </div>
                      )}
                      <span className="font-medium text-foreground">{brand.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                    {brand.slug}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                    {brand.country}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={brand.isActive ? 'default' : 'secondary'}>
                      {brand.isActive ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/admin/brands/${brand._id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/admin/brands/${brand._id}/contacts`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Contactos">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/admin/brands/${brand._id}/admins`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Admins">
                          <Users className="h-4 w-4" />
                        </Button>
                      </Link>
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
