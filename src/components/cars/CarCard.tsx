import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Fuel, Gauge, Users, Zap } from 'lucide-react';

interface CarCardProps {
  car: {
    _id: string;
    name: string;
    year: number;
    priceUsd: number;
    horsepower: number;
    fuelType: string;
    transmission: string;
    seats: number;
    isFeatured: boolean;
    images: string[];
    brand: {
      name: string;
    };
    model: {
      name: string;
      segment: string;
    };
  };
}

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

export function CarCard({ car }: CarCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link to={`/autos/${car._id}`} className="group">
      <article className="car-card">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={car.images[0]}
            alt={`${car.brand.name} ${car.model.name} ${car.name}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {car.isFeatured && (
              <Badge className="bg-accent text-accent-foreground border-0">
                Destacado
              </Badge>
            )}
            <Badge variant="secondary" className="bg-white/90 text-foreground">
              {segmentLabels[car.model.segment]}
            </Badge>
          </div>

          {/* Price overlay */}
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-2xl font-bold text-white">
              {formatPrice(car.priceUsd)}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Brand & Model */}
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {car.brand.name}
            </p>
            <h3 className="text-lg font-semibold text-foreground">
              {car.model.name} {car.name}
            </h3>
            <p className="text-sm text-muted-foreground">{car.year}</p>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-accent" />
              <span>{car.horsepower} HP</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Fuel className="h-4 w-4 text-accent" />
              <span>{fuelTypeLabels[car.fuelType]}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gauge className="h-4 w-4 text-accent" />
              <span>{car.transmission}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 text-accent" />
              <span>{car.seats} asientos</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
