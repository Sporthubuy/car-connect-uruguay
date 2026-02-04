import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Layout } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Star, Eye, Clock, Newspaper, Loader2 } from 'lucide-react';

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </Layout>
  );
};

export default Reviews;
