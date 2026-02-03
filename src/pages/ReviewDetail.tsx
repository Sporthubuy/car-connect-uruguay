import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useReviewBySlug, useComments } from '@/hooks/useSupabase';
import { submitComment } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Star,
  Eye,
  Clock,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send,
  Loader2,
  Newspaper,
  User,
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useEffect } from 'react';

const ReviewDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: review, isLoading } = useReviewBySlug(slug || '');
  const { data: comments = [], refetch: refetchComments } = useComments(review?.id || '');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !review) return;
    setSubmitting(true);
    try {
      await submitComment(review.id, commentText.trim());
      setCommentText('');
      toast.success('Comentario enviado', {
        description: 'Tu comentario sera visible una vez aprobado por un moderador.',
      });
      refetchComments();
    } catch (err: any) {
      toast.error('Error al enviar comentario', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container-wide py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!review) {
    return (
      <Layout>
        <div className="container-wide py-16 text-center">
          <Newspaper className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Review no encontrada
          </h1>
          <p className="text-muted-foreground mb-6">
            La review que buscas no existe o fue removida.
          </p>
          <Link to="/reviews">
            <Button>Ver todas las reviews</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const authorName = (review as any).author?.full_name || 'Redaccion CarConnect';

  return (
    <Layout>
      {/* Hero */}
      <div className="relative">
        <div className="aspect-[21/9] md:aspect-[3/1] overflow-hidden bg-muted">
          <img
            src={review.cover_image}
            alt={review.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container-wide pb-8">
            <Link
              to="/reviews"
              className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a reviews
            </Link>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 max-w-3xl">
              {review.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span>{authorName}</span>
              </div>
              <div className="flex items-center gap-1 text-accent">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-semibold text-white">{review.rating}/10</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{review.views.toLocaleString()} vistas</span>
              </div>
              {review.published_at && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {new Date(review.published_at).toLocaleDateString('es-UY', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Excerpt */}
            <p className="text-lg text-muted-foreground leading-relaxed">
              {review.excerpt}
            </p>

            {/* Pros / Cons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-success/5 border border-success/20 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ThumbsUp className="h-5 w-5 text-success" />
                  <h3 className="font-semibold text-foreground">Pros</h3>
                </div>
                <ul className="space-y-2">
                  {review.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-success mt-0.5">+</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ThumbsDown className="h-5 w-5 text-destructive" />
                  <h3 className="font-semibold text-foreground">Contras</h3>
                </div>
                <ul className="space-y-2">
                  {review.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-destructive mt-0.5">-</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-neutral max-w-none">
              {review.content.split('\n').map((paragraph, i) => (
                paragraph.trim() ? <p key={i}>{paragraph}</p> : null
              ))}
            </div>

            {/* Comments Section */}
            <div className="border-t pt-8">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">
                  Comentarios ({comments.length})
                </h2>
              </div>

              {/* Comment Form */}
              {user ? (
                <div className="rounded-xl bg-card border p-4 mb-6">
                  <Textarea
                    placeholder="Escribi tu comentario..."
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="mb-3"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Los comentarios se publican luego de ser aprobados
                    </p>
                    <Button
                      size="sm"
                      disabled={!commentText.trim() || submitting}
                      onClick={handleSubmitComment}
                      className="gap-2"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Enviar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-muted/50 border p-4 mb-6 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Inicia sesion para dejar un comentario
                  </p>
                  <Link to="/auth">
                    <Button size="sm" variant="outline">
                      Iniciar sesion
                    </Button>
                  </Link>
                </div>
              )}

              {/* Comments List */}
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-lg bg-card border p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">
                          {comment.author_name || 'Usuario'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString('es-UY', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No hay comentarios aun. Se el primero en comentar.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rating Card */}
            <div className="rounded-xl bg-card border p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Calificacion</p>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Star className="h-8 w-8 text-accent fill-current" />
                <span className="text-4xl font-bold text-foreground">{review.rating}</span>
                <span className="text-lg text-muted-foreground">/10</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {review.pros.slice(0, 3).map((pro, i) => (
                  <Badge key={i} variant="secondary" className="text-xs bg-success/10 text-success border-0">
                    + {pro}
                  </Badge>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="rounded-xl bg-primary p-6 text-center">
              <h3 className="font-semibold text-primary-foreground mb-2">
                Te interesa este auto?
              </h3>
              <p className="text-sm text-primary-foreground/80 mb-4">
                Explora las versiones disponibles en nuestro catalogo
              </p>
              <Link to="/autos">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Ver catalogo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReviewDetail;
