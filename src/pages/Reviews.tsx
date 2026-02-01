import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { reviews } from '@/data/mockCars';
import { Badge } from '@/components/ui/badge';
import { Star, Eye, Clock, Newspaper } from 'lucide-react';

const Reviews = () => {
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
        {/* Featured Review */}
        {reviews.length > 0 && (
          <Link to={`/reviews/${reviews[0].slug}`} className="group block mb-12">
            <article className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden rounded-2xl bg-card border hover:border-primary/30 hover:shadow-card-hover transition-all duration-300">
              <div className="aspect-video lg:aspect-auto overflow-hidden">
                <img
                  src={reviews[0].cover_image}
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
                    <span>{reviews[0].views.toLocaleString()} vistas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(reviews[0].published_at!).toLocaleDateString('es-UY', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        )}

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice(1).map((review) => (
            <Link
              key={review.id}
              to={`/reviews/${review.slug}`}
              className="group"
            >
              <article className="overflow-hidden rounded-xl bg-card border hover:border-primary/30 hover:shadow-card transition-all duration-300">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={review.cover_image}
                    alt={review.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1 text-accent">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-semibold">{review.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {review.views.toLocaleString()} vistas
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {review.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {review.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {review.pros.slice(0, 2).map((pro, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-success/10 text-success border-0"
                      >
                        + {pro}
                      </Badge>
                    ))}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {reviews.length === 0 && (
          <div className="text-center py-16">
            <Newspaper className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No hay reviews disponibles
            </h3>
            <p className="text-muted-foreground">
              Pronto publicaremos nuevos análisis
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reviews;
