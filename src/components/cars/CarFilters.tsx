import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { CarFilters, CarSegment, FuelType, SortOption } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';

interface CarFiltersProps {
  filters: CarFilters;
  onFiltersChange: (filters: CarFilters) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const segmentOptions: { value: CarSegment; label: string }[] = [
  { value: 'sedan', label: 'Sedán' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'suv', label: 'SUV' },
  { value: 'crossover', label: 'Crossover' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'coupe', label: 'Coupé' },
  { value: 'sports', label: 'Deportivo' },
];

const fuelTypeOptions: { value: FuelType; label: string }[] = [
  { value: 'gasolina', label: 'Gasolina' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'electrico', label: 'Eléctrico' },
  { value: 'gnc', label: 'GNC' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'popular', label: 'Más populares' },
];

export function CarFiltersComponent({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
}: CarFiltersProps) {
  const brands = useQuery(api.cars.listBrands, {}) || [];
  const models = useQuery(api.cars.listModels, {}) || [];

  const updateFilter = (key: keyof CarFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== ''
  );

  const filteredModels = filters.brand
    ? models.filter(
        (m) => brands.find((b) => b.slug === filters.brand)?._id === m.brandId
      )
    : models;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Sort */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Ordenar por</Label>
        <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brand */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Marca</Label>
        <Select
          value={filters.brand || '__all__'}
          onValueChange={(v) => {
            updateFilter('brand', v === '__all__' ? undefined : v);
            updateFilter('model', undefined);
          }}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Todas las marcas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas las marcas</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand._id} value={brand.slug}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Modelo</Label>
        <Select
          value={filters.model || '__all__'}
          onValueChange={(v) => updateFilter('model', v === '__all__' ? undefined : v)}
          disabled={!filters.brand}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Todos los modelos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos los modelos</SelectItem>
            {filteredModels.map((model) => (
              <SelectItem key={model._id} value={model.slug}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Segment */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Segmento</Label>
        <Select
          value={filters.segment || '__all__'}
          onValueChange={(v) => updateFilter('segment', v === '__all__' ? undefined : v)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Todos los segmentos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos los segmentos</SelectItem>
            {segmentOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fuel Type */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Combustible</Label>
        <Select
          value={filters.fuelType || '__all__'}
          onValueChange={(v) => updateFilter('fuelType', v === '__all__' ? undefined : v)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos</SelectItem>
            {fuelTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <Label className="text-xs text-muted-foreground">Rango de precio</Label>
        <Slider
          defaultValue={[20000, 80000]}
          min={15000}
          max={100000}
          step={1000}
          value={[filters.priceMin || 15000, filters.priceMax || 100000]}
          onValueChange={([min, max]) => {
            updateFilter('priceMin', min);
            updateFilter('priceMax', max);
          }}
          className="mt-2"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatPrice(filters.priceMin || 15000)}</span>
          <span>{formatPrice(filters.priceMax || 100000)}</span>
        </div>
      </div>
    </div>
  );
}
