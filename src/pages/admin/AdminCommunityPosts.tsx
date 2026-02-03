import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { listCommunityPostsAdmin, deleteCommunityPost, getCommunity } from '@/lib/adminApi';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Loader2, ThumbsUp, MessageSquare } from 'lucide-react';

export default function AdminCommunityPosts() {
  const { communityId } = useParams<{ communityId: string }>();
  const queryClient = useQueryClient();

  const { data: community } = useQuery({
    queryKey: ['admin', 'community', communityId],
    queryFn: () => getCommunity(communityId!),
    enabled: !!communityId,
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin', 'community-posts', communityId],
    queryFn: () => listCommunityPostsAdmin(communityId),
    enabled: !!communityId,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCommunityPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'community-posts', communityId] });
      toast.success('Post eliminado');
    },
    onError: (err: any) => toast.error(err.message),
  });

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
      ) : posts.length === 0 ? (
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
              {posts.map((post) => (
                <tr key={post.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground line-clamp-1">{post.title}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                    {post.author_name ?? '-'}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {post.upvotes - post.downvotes}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {post.comment_count}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                    {new Date(post.created_at).toLocaleDateString('es-UY')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Eliminar"
                        onClick={() => {
                          if (confirm('Eliminar este post?')) {
                            deleteMutation.mutate(post.id);
                          }
                        }}
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
