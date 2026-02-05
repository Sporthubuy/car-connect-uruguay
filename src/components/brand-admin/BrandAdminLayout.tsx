import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useBrandAdmin } from '@/hooks/useBrandAdmin';
import {
  LayoutDashboard,
  Mail,
  ArrowLeft,
  Loader2,
  Car,
  MessageSquare,
  Calendar,
  Gift,
  ShieldCheck,
  Building2,
} from 'lucide-react';

const brandAdminNav = [
  { name: 'Dashboard', href: '/marca', icon: LayoutDashboard },
  { name: 'Mi Marca', href: '/marca/perfil', icon: Building2 },
  { name: 'Modelos', href: '/marca/modelos', icon: Car },
  { name: 'Contactos', href: '/marca/contactos', icon: Mail },
  { name: 'Leads', href: '/marca/leads', icon: MessageSquare },
  { name: 'Eventos', href: '/marca/eventos', icon: Calendar },
  { name: 'Beneficios', href: '/marca/beneficios', icon: Gift },
  { name: 'Activaciones', href: '/marca/activaciones', icon: ShieldCheck },
];

interface BrandAdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function BrandAdminLayout({ children, title, description }: BrandAdminLayoutProps) {
  const location = useLocation();
  const { brandInfo, loading } = useBrandAdmin();

  const isActive = (href: string) => {
    if (href === '/marca') return location.pathname === '/marca';
    return location.pathname.startsWith(href);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-4 px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al sitio
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            {brandInfo?.brand_logo_url && (
              <img
                src={brandInfo.brand_logo_url}
                alt={brandInfo.brand_name}
                className="h-6 w-6 rounded object-contain bg-white"
              />
            )}
            <span className="text-sm font-semibold text-foreground">
              {brandInfo?.brand_name ?? 'Mi Marca'}
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-56 flex-col border-r bg-background min-h-[calc(100vh-3.5rem)]">
          <nav className="flex flex-col gap-1 p-4">
            {brandAdminNav.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
