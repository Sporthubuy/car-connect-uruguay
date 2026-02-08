import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Layout } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Star, Eye, Clock, Newspaper, Loader2, TrendingUp } from 'lucide-react';

// Most Read Sidebar Component
function MostReadSidebar() {
  const mostRead = useQuery(api.reviews.getMostReadThisMonth, { limit: 5 });

  if (mostRead === undefined) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Más leídas del mes</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (mostRead.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Más leídas del mes</h3>
      </div>
      <div className="space-y-1">
        {mostRead.map((review, index) => (
          <Link
            key={review._id}
            to={`/reviews/${review.slug}`}
            className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {review.title}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{review.views?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-accent">
                  <Star className="h-3 w-3 fill-current" />
                  <span>{review.rating}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const Reviews = () => {
  const reviews = useQuery(api.reviews.listReviews) || [];
  const isLoading = reviews === undefined;

  return (
    <Layout>
      {/* Header */}
      <div className="bg-muted/30 border-b">
        <div className="container-wide py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Newspaper className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Reviews
            </h1>
          </div>
          <p className="text-muted-foreground">
            Análisis detallados de nuestros expertos automotrices
          </p>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                No hay reviews disponibles
              </div>
            ) : (
              <>
                {/* Featured Review */}
                <Link to={`/reviews/${reviews[0].slug}`} className="group block mb-12">
                  <article className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden rounded-2xl bg-card border hover:border-primary/30 hover:shadow-card-hover transition-all duration-300">
                    <div className="aspect-video lg:aspect-auto overflow-hidden">
                      <img
                        src={reviews[0].coverImage}
                        alt={reviews[0].title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6 lg:p-8 flex flex-col justify-center">
                      <Badge className="w-fit mb-4 bg-accent/10 text-accent border-0">
                        Review destacada
                      </Badge>
                      <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                        {reviews[0].title}
                      </h2>
                      <p className="text-muted-foreground mb-6 line-clamp-3">
                        {reviews[0].excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 text-accent">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-semibold">{reviews[0].rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{reviews[0].views?.toLocaleString()} vistas</span>
                        </div>
                        {reviews[0].publishedAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {new Date(reviews[0].publishedAt).toLocaleDateString('es-UY', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>

                {/* Reviews Grid */}
                {reviews.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.slice(1).map((review) => (
                      <Link key={review._id} to={`/reviews/${review.slug}`} className="group">
                        <article className="h-full rounded-xl bg-card border hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 overflow-hidden">
                          <div className="aspect-video overflow-hidden">
                            <img
                              src={review.coverImage}
                              alt={review.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          <div className="p-5">
                            <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                              {review.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {review.excerpt}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1 text-accent">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="font-semibold">{review.rating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>{review.views?.toLocaleString()}</span>
                              </div>
                              {review.author && (
                                <span className="ml-auto text-xs">
                                  Por {review.author.fullName}
                                </span>
                              )}
                            </div>
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <MostReadSidebar />
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default Reviews;
