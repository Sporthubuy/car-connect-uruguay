import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { communities } from '@/data/mockCars';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, Plus, TrendingUp } from 'lucide-react';

const Community = () => {
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
                Conectá con otros entusiastas y propietarios
              </p>
            </div>
            <Button className="hidden sm:flex gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4" />
              Crear publicación
            </Button>
          </div>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trending Posts Placeholder */}
            <div className="rounded-xl bg-card border p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold text-foreground">
                  Publicaciones populares
                </h2>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">
                          Toyota Uruguay • hace {i} hora{i > 1 ? 's' : ''}
                        </p>
                        <h3 className="font-medium text-foreground mb-2">
                          {i === 1 && '¿Cuál es el mejor SUV para familia en 2024?'}
                          {i === 2 && 'Tips de mantenimiento para tu Hilux'}
                          {i === 3 && 'Comparativa: Golf GTI vs Civic Type R'}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>↑ {120 - i * 20} votos</span>
                          <span>{30 - i * 5} comentarios</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Iniciá sesión para participar en la comunidad
                </p>
                <Link to="/auth">
                  <Button variant="outline">Ingresar</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar - Communities */}
          <div className="space-y-6">
            <div className="rounded-xl bg-card border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Comunidades
              </h2>
              <div className="space-y-4">
                {communities.map((community) => (
                  <div
                    key={community.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
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
                    <Button size="sm" variant="outline" className="text-xs">
                      Unirse
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-primary p-6 text-center">
              <h3 className="font-semibold text-primary-foreground mb-2">
                ¿Tenés un auto?
              </h3>
              <p className="text-sm text-primary-foreground/80 mb-4">
                Activa tu vehículo y accedé a beneficios exclusivos
              </p>
              <Link to="/perfil">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Activar vehículo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Community;
