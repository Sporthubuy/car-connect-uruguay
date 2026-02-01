import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { LeadModal } from '@/components/cars/LeadModal';
import { useCarById, useCars } from '@/hooks/useSupabase';
import { CarCard } from '@/components/cars/CarCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  Zap,
  Users,
  Heart,
  Share2,
  Check,
  Car,
  Loader2,
} from 'lucide-react';

const fuelTypeLabels: Record<string, string> = {
  gasolina: 'Gasolina',
  diesel: 'Diesel',
  hibrido: 'Híbrido',
  electrico: 'Eléctrico',
  gnc: 'GNC',
};

const segmentLabels: Record<string, string> = {
  sedan: 'Sedán',
  hatchback: 'Hatchback',
  suv: 'SUV',
  crossover: 'Crossover',
  pickup: 'Pickup',
  coupe: 'Coupé',
  convertible: 'Convertible',
  wagon: 'Wagon',
  van: 'Van',
  sports: 'Deportivo',
};

const CarDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: car, isLoading } = useCarById(id || '');
  const { data: allCars = [] } = useCars();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  if (isLoading) {
    return (
      <Layout>
        <div className="container-wide py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!car) {
    return (
      <Layout>
        <div className="container-wide py-16 text-center">
          <Car className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Auto no encontrado
          </h1>
          <p className="text-muted-foreground mb-6">
            El vehículo que buscás no existe o fue removido.
          </p>
          <Link to="/autos">
            <Button>Ver todos los autos</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const relatedCars = allCars
    .filter(
      (c) =>
        c.id !== car.id &&
        (c.brand.id === car.brand.id || c.model.segment === car.model.segment)
    )
    .slice(0, 4);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === car.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? car.images.length - 1 : prev - 1
    );
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b">
        <div className="container-wide py-4">
          <Link
            to="/autos"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al catálogo
          </Link>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
              <img
                src={car.images[currentImageIndex]}
                alt={`${car.brand.name} ${car.model.name}`}
                className="h-full w-full object-cover"
              />
              {car.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              {car.is_featured && (
                <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground border-0">
                  Destacado
                </Badge>
              )}
            </div>
            {car.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {car.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex
                        ? 'border-primary'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={car.brand.logo_url}
                  alt={car.brand.name}
                  className="h-6 w-auto"
                />
                <Badge variant="secondary">{segmentLabels[car.model.segment]}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {car.brand.name} {car.model.name}
              </h1>
              <p className="text-lg text-muted-foreground">
                {car.name} • {car.year}
              </p>
            </div>

            {/* Price */}
            <div className="mb-6 p-4 rounded-xl bg-muted/50 border">
              <p className="text-sm text-muted-foreground mb-1">Precio desde</p>
              <p className="text-3xl font-bold text-foreground">
                {formatPrice(car.price_usd)}
              </p>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
                <Zap className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Potencia</p>
                  <p className="font-semibold">{car.horsepower} HP</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
                <Fuel className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Combustible</p>
                  <p className="font-semibold">{fuelTypeLabels[car.fuel_type]}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
                <Gauge className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Transmisión</p>
                  <p className="font-semibold text-sm">{car.transmission}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
                <Users className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Capacidad</p>
                  <p className="font-semibold">{car.seats} asientos</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <Button
                size="lg"
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                onClick={() => setIsLeadModalOpen(true)}
              >
                Estoy interesado
              </Button>
              <Button size="lg" variant="outline" className="px-4">
                <Heart className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="px-4">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="specs">
              <TabsList className="w-full">
                <TabsTrigger value="specs" className="flex-1">
                  Especificaciones
                </TabsTrigger>
                <TabsTrigger value="features" className="flex-1">
                  Equipamiento
                </TabsTrigger>
              </TabsList>
              <TabsContent value="specs" className="mt-4">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Motor</span>
                    <span className="font-medium">{car.engine}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Potencia</span>
                    <span className="font-medium">{car.horsepower} HP</span>
                  </div>
                  {car.torque && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Torque</span>
                      <span className="font-medium">{car.torque} Nm</span>
                    </div>
                  )}
                  {car.acceleration_0_100 && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">0-100 km/h</span>
                      <span className="font-medium">{car.acceleration_0_100}s</span>
                    </div>
                  )}
                  {car.top_speed && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Velocidad máxima</span>
                      <span className="font-medium">{car.top_speed} km/h</span>
                    </div>
                  )}
                  {car.fuel_consumption && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Consumo combinado</span>
                      <span className="font-medium">{car.fuel_consumption} L/100km</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Puertas</span>
                    <span className="font-medium">{car.doors}</span>
                  </div>
                  {car.trunk_capacity && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Baúl</span>
                      <span className="font-medium">{car.trunk_capacity} L</span>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="features" className="mt-4">
                <div className="grid grid-cols-1 gap-2">
                  {car.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 py-2 border-b last:border-0"
                    >
                      <Check className="h-4 w-4 text-success" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Related Cars */}
        {relatedCars.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              También te puede interesar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedCars.map((relatedCar) => (
                <CarCard key={relatedCar.id} car={relatedCar} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Lead Modal */}
      <LeadModal
        car={car}
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
      />
    </Layout>
  );
};

export default CarDetail;
