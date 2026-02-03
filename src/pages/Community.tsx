import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { useCommunities, useCommunityPosts, useUserMemberships } from '@/hooks/useSupabase';
import { joinCommunity, leaveCommunity } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { CreatePostDialog } from '@/components/community/CreatePostDialog';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Plus, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const Community = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: communities = [], isLoading: loadingCommunities } = useCommunities();
  const { data: posts = [], isLoading: loadingPosts } = useCommunityPosts();
  const { data: memberships = [], refetch: refetchMemberships } = useUserMemberships();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [joiningCommunity, setJoiningCommunity] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const handleCreatePost = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setIsPostDialogOpen(true);
  };

  const handleJoinLeave = async (communityId: string, isMember: boolean) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setJoiningCommunity(communityId);
    try {
      if (isMember) {
        await leaveCommunity(communityId);
        toast.success('Saliste de la comunidad');
      } else {
        await joinCommunity(communityId);
        toast.success('Te uniste a la comunidad');
      }
      refetchMemberships();
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    } finally {
      setJoiningCommunity(null);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `hace ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffMins > 0) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    return 'hace un momento';
  };

  return (
    <Layout>
      {/* Header */}
      <div className="bg-muted/30 border-b">
        <div className="container-wide py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <MessageSquare className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Comunidad
                </h1>
              </div>
              <p className="text-muted-foreground">
                Conecta con otros entusiastas y propietarios
              </p>
            </div>
            <Button
              className="hidden sm:flex gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleCreatePost}
            >
              <Plus className="h-4 w-4" />
              Crear publicacion
            </Button>
          </div>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Posts */}
            <div className="rounded-xl bg-card border p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold text-foreground">
                  Publicaciones recientes
                </h2>
              </div>

              {loadingPosts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground mb-1">
                            {post.community_name || 'Comunidad'} • {formatTimeAgo(post.created_at)}
                          </p>
                          <h3 className="font-medium text-foreground mb-2">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Por {post.author_name || 'Usuario'}</span>
                            <span>{post.comment_count} comentarios</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No hay publicaciones aun</p>
                  {user ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={handleCreatePost}
                    >
                      Se el primero en publicar
                    </Button>
                  ) : (
                    <Link to="/auth">
                      <Button variant="outline" size="sm" className="mt-4">
                        Inicia sesion para publicar
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {!user && posts.length > 0 && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Inicia sesion para participar en la comunidad
                  </p>
                  <Link to="/auth">
                    <Button variant="outline">Ingresar</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile create post button */}
            <div className="sm:hidden">
              <Button
                className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleCreatePost}
              >
                <Plus className="h-4 w-4" />
                Crear publicacion
              </Button>
            </div>
          </div>

          {/* Sidebar - Communities */}
          <div className="space-y-6">
            <div className="rounded-xl bg-card border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Comunidades
              </h2>
              {loadingCommunities ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {communities.map((community) => {
                    const isMember = memberships.includes(community.id);
                    const isJoining = joiningCommunity === community.id;
                    return (
                      <div
                        key={community.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted">
                          {community.cover_image ? (
                            <img
                              src={community.cover_image}
                              alt={community.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-primary/10">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground text-sm">
                            {community.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {community.member_count.toLocaleString()} miembros
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={isMember ? 'secondary' : 'outline'}
                          className="text-xs"
                          disabled={isJoining}
                          onClick={() => handleJoinLeave(community.id, isMember)}
                        >
                          {isJoining ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : isMember ? (
                            'Salir'
                          ) : (
                            'Unirse'
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-primary p-6 text-center">
              <h3 className="font-semibold text-primary-foreground mb-2">
                Tenes un auto?
              </h3>
              <p className="text-sm text-primary-foreground/80 mb-4">
                Activa tu vehiculo y accede a beneficios exclusivos
              </p>
              <Link to="/perfil">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Activar vehiculo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Dialog */}
      <CreatePostDialog
        isOpen={isPostDialogOpen}
        onClose={() => setIsPostDialogOpen(false)}
      />
    </Layout>
  );
};

export default Community;
