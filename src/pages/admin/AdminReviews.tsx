import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Eye, EyeOff, Trash2, Loader2, Star } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';

export default function AdminReviews() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  const reviews = useQuery(api.reviews.listReviews) || [];
  const isLoading = reviews === undefined;

  const publishMutation = useMutation(api.reviews.publishReview);
  const unpublishMutation = useMutation(api.reviews.unpublishReview);
  const deleteMutation = useMutation(api.reviews.deleteReview);

  const handlePublish = async (reviewId: Id<'reviewPosts'>) => {
    try {
      await publishMutation({ reviewId });
      toast.success('Review publicada');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUnpublish = async (reviewId: Id<'reviewPosts'>) => {
    try {
      await unpublishMutation({ reviewId });
      toast.success('Review despublicada');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (reviewId: Id<'reviewPosts'>) => {
    if (!confirm('¿Eliminar esta review?')) return;
    try {
      await deleteMutation({ reviewId });
      toast.success('Review eliminada');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filtered = reviews
    .filter((r) => {
      if (filter === 'published') return !!r.publishedAt;
      if (filter === 'draft') return !r.publishedAt;
      return true;
    })
    .filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout title="Reviews" description="Gestionar reviews del sitio">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar review..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'published', 'draft'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Todas' : f === 'published' ? 'Publicadas' : 'Borradores'}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {search ? 'No se encontraron reviews' : 'No hay reviews'}
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Review</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Autor</th>
                <th className="text-center p-4 font-medium">Rating</th>
                <th className="text-center p-4 font-medium hidden sm:table-cell">Vistas</th>
                <th className="text-center p-4 font-medium">Estado</th>
                <th className="text-right p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <tr key={review._id} className="border-t">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={review.coverImage}
                        alt={review.title}
                        className="w-16 h-10 rounded object-cover hidden sm:block"
                      />
                      <div>
                        <p className="font-medium line-clamp-1">{review.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {review.excerpt}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-sm">{review.author?.fullName || 'Desconocido'}</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-accent">
                      <Star className="h-4 w-4 fill-current" />
                      <span>{review.rating}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center hidden sm:table-cell">
                    {review.views?.toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant={review.publishedAt ? 'default' : 'secondary'}>
                      {review.publishedAt ? 'Publicada' : 'Borrador'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {review.publishedAt ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUnpublish(review._id)}
                          title="Despublicar"
                        >
                          <EyeOff className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePublish(review._id)}
                          title="Publicar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(review._id)}
                        className="text-destructive hover:text-destructive"
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
