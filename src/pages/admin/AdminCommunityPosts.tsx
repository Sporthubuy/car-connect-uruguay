import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Loader2, ThumbsUp, MessageSquare } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';

export default function AdminCommunityPosts() {
  const { communityId } = useParams<{ communityId: string }>();
  const [deleteTarget, setDeleteTarget] = useState<{ id: Id<"communityPosts">; title: string } | null>(null);

  const community = useQuery(
    api.communities.getCommunity,
    communityId ? { communityId: communityId as Id<"communities"> } : 'skip'
  );

  const posts = useQuery(
    api.communities.listCommunityPosts,
    communityId ? { communityId: communityId as Id<"communities"> } : 'skip'
  );

  const deletePostMutation = useMutation(api.communities.deleteCommunityPost);

  const isLoading = posts === undefined;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePostMutation({ postId: deleteTarget.id });
      toast.success('Post eliminado');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <AdminLayout
      title={`Posts: ${community?.name ?? '...'}`}
      description="Posts de la comunidad"
    >
      <Link
        to="/admin/communities"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a comunidades
      </Link>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (posts ?? []).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No hay posts en esta comunidad
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Titulo</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Autor</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Votos</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Comentarios</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Fecha</th>
                <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(posts ?? []).map((post) => (
                <tr key={post._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground line-clamp-1">{post.title}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                    {post.author?.fullName ?? '-'}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {(post.upvotes ?? 0) - (post.downvotes ?? 0)}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {post.commentCount ?? 0}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                    {new Date(post._creationTime).toLocaleDateString('es-UY')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Eliminar"
                        onClick={() => setDeleteTarget({ id: post._id, title: post.title })}
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

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar post</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el post "{deleteTarget?.title}"?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
