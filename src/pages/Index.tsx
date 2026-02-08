import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CarCard } from '@/components/cars/CarCard';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import {
  ArrowRight,
  Car,
  MessageSquare,
  Shield,
  Star,
  Users,
  Search,
  Loader2,
} from 'lucide-react';

const features = [
  {
    icon: Car,
    title: 'Catálogo completo',
    description: 'Todos los autos 0km disponibles en Uruguay con precios actualizados.',
  },
  {
    icon: MessageSquare,
    title: 'Reviews expertos',
    description: 'Análisis detallados de nuestro equipo editorial y la comunidad.',
  },
  {
    icon: Users,
    title: 'Comunidad activa',
    description: 'Conecta con otros entusiastas y propietarios de tu marca favorita.',
  },
  {
    icon: Shield,
    title: 'Beneficios exclusivos',
    description: 'Activa tu vehículo y accede a eventos y promociones especiales.',
  },
];

const HERO_DEFAULTS: Record<string, string> = {
  hero_badge: 'La plataforma #1 de autos en Uruguay',
  hero_title: 'Encontrá tu próximo auto 0km',
  hero_subtitle: 'Compará precios, leé reviews de expertos y conectá directamente con concesionarios. Todo en un solo lugar.',
  hero_cta_primary_text: 'Explorar autos',
  hero_cta_primary_link: '/autos',
  hero_cta_secondary_text: 'Ver reviews',
  hero_cta_secondary_link: '/reviews',
};

const HERO_KEYS = [
  'hero_badge',
  'hero_title',
  'hero_subtitle',
  'hero_cta_primary_text',
  'hero_cta_primary_link',
  'hero_cta_secondary_text',
  'hero_cta_secondary_link',
];

const Index = () => {
  const allCars = useQuery(api.cars.listCarsWithDetails);
  const reviews = useQuery(api.reviews.listReviews, { publishedOnly: true });
  const brands = useQuery(api.cars.listBrands, { activeOnly: true });
  const siteSettings = useQuery(api.settings.getSettings, { keys: HERO_KEYS });

  const carsLoading = allCars === undefined;

  const hero = (key: string) =>
    (siteSettings?.[key] as string) || HERO_DEFAULTS[key] || '';

  const featuredCars = (allCars ?? []).filter((car) => car.isFeatured).slice(0, 4);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 section-pattern opacity-5" />
        <div className="container-wide relative py-16 md:py-24 lg:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center px-3 py-1 mb-6 text-xs font-medium rounded-full bg-accent/20 text-accent">
              {hero('hero_badge')}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {hero('hero_title')}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">
              {hero('hero_subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={hero('hero_cta_primary_link')}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                >
                  <Search className="mr-2 h-5 w-5" />
                  {hero('hero_cta_primary_text')}
                </Button>
              </Link>
              <Link to={hero('hero_cta_secondary_link')}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10"
                >
                  <Star className="mr-2 h-5 w-5" />
                  {hero('hero_cta_secondary_text')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Brands Section */}
      <section className="py-12 bg-background">
        <div className="container-wide">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Marcas destacadas</h2>
            <Link
              to="/autos"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver todas
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {(brands ?? []).map((brand) => (
              <Link
                key={brand._id}
                to={`/autos?brand=${brand.slug}`}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-card transition-all duration-300"
              >
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="h-10 w-auto object-contain mb-2 grayscale hover:grayscale-0 transition-all"
                  />
                ) : (
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center mb-2 text-sm font-bold text-muted-foreground">
                    {brand.name[0]}
                  </div>
                )}
                <span className="text-xs font-medium text-muted-foreground">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-16 bg-muted/30">
        <div className="container-wide">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Autos destacados
              </h2>
              <p className="text-muted-foreground">
                Los modelos más populares del momento
              </p>
            </div>
            <Link to="/autos">
              <Button variant="ghost" className="hidden sm:flex gap-2">
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          {carsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCars.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>
          )}
          <div className="mt-8 text-center sm:hidden">
            <Link to="/autos">
              <Button variant="outline" className="gap-2">
                Ver todos los autos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-background">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Todo lo que necesitás en un solo lugar
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              CarWow LATAM te ofrece herramientas para tomar la mejor decisión de compra
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-card transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Reviews */}
      {(reviews ?? []).length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container-wide">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Últimas reviews
                </h2>
                <p className="text-muted-foreground">
                  Análisis detallados de nuestros expertos
                </p>
              </div>
              <Link to="/reviews">
                <Button variant="ghost" className="hidden sm:flex gap-2">
                  Ver todas
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(reviews ?? []).slice(0, 3).map((review) => (
                <Link
                  key={review._id}
                  to={`/reviews/${review.slug}`}
                  className="group"
                >
                  <article className="overflow-hidden rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-card transition-all duration-300">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={review.coverImage}
                        alt={review.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1 text-accent">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-semibold">{review.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          • {review.views.toLocaleString()} vistas
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {review.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {review.excerpt}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Banner Carousel */}
      <BannerCarousel />
    </Layout>
  );
};

export default Index;
