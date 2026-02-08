import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  Users2,
  ArrowLeft,
  Car,
  MessageSquare,
  MessageCircle,
  Calendar,
  Gift,
  ShieldCheck,
  Newspaper,
  Settings,
  Image,
} from 'lucide-react';

const adminNav = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Banners', href: '/admin/banners', icon: Image },
  { name: 'Marcas', href: '/admin/brands', icon: Building2 },
  { name: 'Modelos', href: '/admin/models', icon: Car },
  { name: 'Leads', href: '/admin/leads', icon: MessageSquare },
  { name: 'Eventos', href: '/admin/events', icon: Calendar },
  { name: 'Beneficios', href: '/admin/benefits', icon: Gift },
  { name: 'Activaciones', href: '/admin/activations', icon: ShieldCheck },
  { name: 'Usuarios', href: '/admin/users', icon: Users },
  { name: 'Reviews', href: '/admin/reviews', icon: Newspaper },
  { name: 'Comentarios', href: '/admin/comments', icon: MessageCircle },
  { name: 'Comunidad', href: '/admin/communities', icon: Users2 },
  { name: 'Sitio', href: '/admin/settings', icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(href);
  };

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
          <span className="text-sm font-semibold text-foreground">
            SuperAdmin
          </span>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-56 flex-col border-r bg-background min-h-[calc(100vh-3.5rem)]">
          <nav className="flex flex-col gap-1 p-4">
            {adminNav.map((item) => (
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
