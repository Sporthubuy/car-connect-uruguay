import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Building2,
  Car,
  MessageSquare,
  Calendar,
  Gift,
  ShieldCheck,
  Users,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboard() {
  const stats = useQuery(api.settings.getAdminStats);
  const trends = useQuery(api.settings.getAdminTrends);

  const isLoading = stats === undefined;

  const cards = [
    { name: 'Marcas', href: '/admin/brands', icon: Building2, count: stats?.brands, badge: null },
    { name: 'Modelos', href: '/admin/models', icon: Car, count: stats?.models, badge: stats?.trims ? `${stats.trims} versiones` : null },
    { name: 'Leads', href: '/admin/leads', icon: MessageSquare, count: stats?.leads, badge: stats?.newLeads ? `${stats.newLeads} nuevos` : null },
    { name: 'Eventos', href: '/admin/events', icon: Calendar, count: stats?.events, badge: null },
    { name: 'Beneficios', href: '/admin/benefits', icon: Gift, count: stats?.benefits, badge: null },
    { name: 'Activaciones', href: '/admin/activations', icon: ShieldCheck, count: stats?.activations, badge: stats?.pendingActivations ? `${stats.pendingActivations} pendientes` : null },
    { name: 'Usuarios', href: '/admin/users', icon: Users, count: stats?.users, badge: null },
  ];

  return (
    <AdminLayout title="Dashboard" description="Panel de administración de CarWow LATAM">
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cards.map((card) => (
              <Link
                key={card.href}
                to={card.href}
                className="rounded-xl border bg-card p-6 hover:border-primary/30 hover:shadow-md transition-all"
              >
                <card.icon className="h-8 w-8 text-primary mb-4" />
                <h2 className="text-lg font-semibold text-foreground mb-1">{card.name}</h2>
                <p className="text-2xl font-bold text-foreground">{card.count ?? 0}</p>
                {card.badge && (
                  <Badge variant="secondary" className="mt-2">{card.badge}</Badge>
                )}
              </Link>
            ))}
          </div>

          {/* Trends Section */}
          {trends && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-6">Tendencias</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leads per week */}
                <div className="rounded-xl border bg-card p-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">Leads por semana (ultimas 8 semanas)</h3>
                  <div className="aspect-[16/9]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trends.leadsPerWeek}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="label" className="text-xs" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} className="text-xs" tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" name="Leads" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Users per week */}
                <div className="rounded-xl border bg-card p-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">Usuarios nuevos por semana (ultimas 8 semanas)</h3>
                  <div className="aspect-[16/9]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trends.usersPerWeek}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="label" className="text-xs" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} className="text-xs" tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" name="Usuarios" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Activations per month */}
                <div className="rounded-xl border bg-card p-6 lg:col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">Activaciones por mes (ultimos 6 meses)</h3>
                  <div className="aspect-[16/9] max-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trends.activationsPerMonth}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="label" className="text-xs" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} className="text-xs" tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" name="Activaciones" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
