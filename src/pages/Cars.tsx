import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { CarCard } from '@/components/cars/CarCard';
import { CarFiltersComponent } from '@/components/cars/CarFilters';
import { useCars, useBrands, useModels } from '@/hooks/useSupabase';
import { CarFilters, SortOption } from '@/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal, Car, Loader2 } from 'lucide-react';

const Cars = () => {
  const [filters, setFilters] = useState<CarFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: allCars = [], isLoading } = useCars();
  const { data: brands = [] } = useBrands();
  const { data: models = [] } = useModels();

  const filteredCars = useMemo(() => {
    let result = [...allCars];

    // Apply filters
    if (filters.brand) {
      const brand = brands.find((b) => b.slug === filters.brand);
      if (brand) {
        result = result.filter((car) => car.brand.id === brand.id);
      }
    }

    if (filters.model) {
      const model = models.find((m) => m.slug === filters.model);
      if (model) {
        result = result.filter((car) => car.model.id === model.id);
      }
    }

    if (filters.segment) {
      result = result.filter((car) => car.model.segment === filters.segment);
    }

    if (filters.fuelType) {
      result = result.filter((car) => car.fuel_type === filters.fuelType);
    }

    if (filters.priceMin) {
      result = result.filter((car) => car.price_usd >= filters.priceMin!);
    }

    if (filters.priceMax) {
      result = result.filter((car) => car.price_usd <= filters.priceMax!);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price_usd - b.price_usd);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price_usd - a.price_usd);
        break;
      case 'newest':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'popular':
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    return result;
  }, [allCars, brands, models, filters, sortBy]);

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== ''
  ).length;

  return (
    <Layout>
      {/* Header */}
      <div className="bg-muted/30 border-b">
        <div className="container-wide py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Autos 0km
            </h1>
          </div>
          <p className="text-muted-foreground">
            Encontrá entre {allCars.length} vehículos disponibles en Uruguay
          </p>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-xl border p-5">
              <CarFiltersComponent
                filters={filters}
                onFiltersChange={setFilters}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredCars.length} resultado{filteredCars.length !== 1 ? 's' : ''}
              </p>
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtros
                    {activeFilterCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-xs overflow-y-auto">
                  <div className="pt-6">
                    <CarFiltersComponent
                      filters={filters}
                      onFiltersChange={(f) => {
                        setFilters(f);
                      }}
                      sortBy={sortBy}
                      onSortChange={setSortBy}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Results count - Desktop */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {filteredCars.length} resultado{filteredCars.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Loading */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredCars.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Car className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-muted-foreground mb-6">
                  Probá ajustando los filtros para ver más opciones
                </p>
                <Button variant="outline" onClick={() => setFilters({})}>
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cars;
