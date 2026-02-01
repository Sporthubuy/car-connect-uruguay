import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBrands } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { URUGUAY_DEPARTMENTS } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Car,
  Heart,
  History,
  Settings,
  Plus,
  ShieldCheck,
  Clock,
  Gift,
  LogIn,
  LogOut,
  Loader2,
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface ProfileData {
  full_name: string;
  phone: string;
  department: string;
  city: string;
  address: string;
  birth_date: string;
  gender: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'settings' ? 'settings' : 'garage';
  const { data: brands = [] } = useBrands();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    phone: '',
    department: '',
    city: '',
    address: '',
    birth_date: '',
    gender: '',
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        loadProfile(user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, phone, department, city, address, birth_date, gender')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name || '',
        phone: data.phone || '',
        department: data.department || '',
        city: data.city || '',
        address: data.address || '',
        birth_date: data.birth_date || '',
        gender: data.gender || '',
      });
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone || null,
        department: profile.department || null,
        city: profile.city || null,
        address: profile.address || null,
        birth_date: profile.birth_date || null,
        gender: profile.gender || null,
      })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      toast.error('Error al guardar', { description: error.message });
    } else {
      toast.success('Perfil actualizado');
    }
  };

  const updateField = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Sesión cerrada');
    navigate('/');
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-wide py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container-wide py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-6">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Mi Perfil
            </h1>
            <p className="text-muted-foreground mb-8">
              Iniciá sesión para acceder a tu perfil, garaje y beneficios exclusivos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  <LogIn className="h-4 w-4" />
                  Iniciar sesión
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Crear cuenta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const fullName = profile.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Layout>
      <div className="bg-muted/30 border-b">
        <div className="container-wide py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                {initials}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="container-wide py-8">
        <Tabs defaultValue={defaultTab} className="space-y-8">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="garage" className="gap-2">
              <Car className="h-4 w-4" />
              Mi Garaje
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <Heart className="h-4 w-4" />
              Guardados
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Historial
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Ajustes
            </TabsTrigger>
          </TabsList>

          {/* Garage Tab */}
          <TabsContent value="garage">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Vehicle Activation Form */}
              <div className="lg:col-span-2">
                <div className="rounded-xl bg-card border p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        Activar vehículo
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Agregá tu auto y accedé a beneficios exclusivos
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Marca</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar marca" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Modelo</Label>
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar modelo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Modelo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Año</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar año" />
                        </SelectTrigger>
                        <SelectContent>
                          {[2024, 2023, 2022, 2021, 2020].map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Número de chasis (VIN)</Label>
                      <Input placeholder="Ej: 1HGBH41JXMN109186" />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                      Enviar para verificación
                    </Button>
                  </div>
                </div>

                {/* My Vehicles */}
                <div className="mt-6 rounded-xl bg-card border p-6">
                  <h3 className="font-semibold text-foreground mb-4">
                    Mis vehículos
                  </h3>
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No tenés vehículos activados</p>
                  </div>
                </div>
              </div>

              {/* Benefits Sidebar */}
              <div className="space-y-6">
                <div className="rounded-xl bg-primary p-6 text-primary-foreground">
                  <ShieldCheck className="h-8 w-8 mb-4" />
                  <h3 className="font-semibold mb-2">Beneficios de verificación</h3>
                  <ul className="text-sm space-y-2 text-primary-foreground/80">
                    <li className="flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      Descuentos en servicios
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Eventos exclusivos
                    </li>
                    <li className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Test drives prioritarios
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl bg-muted/50 border p-6">
                  <h3 className="font-semibold text-foreground mb-4">
                    Estado de verificación
                  </h3>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Sin verificar</p>
                      <p className="text-xs text-muted-foreground">
                        Activa un vehículo para comenzar
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved">
            <div className="text-center py-16">
              <Heart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No tenés autos guardados
              </h3>
              <p className="text-muted-foreground mb-6">
                Guardá tus favoritos para verlos después
              </p>
              <Link to="/autos">
                <Button>Explorar autos</Button>
              </Link>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="text-center py-16">
              <History className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Sin historial de leads
              </h3>
              <p className="text-muted-foreground mb-6">
                Tus consultas aparecerán acá
              </p>
              <Link to="/autos">
                <Button>Ver catálogo</Button>
              </Link>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="max-w-xl">
              <div className="rounded-xl bg-card border p-6 space-y-6">
                <div className="space-y-2">
                  <Label>Nombre completo</Label>
                  <Input
                    value={profile.full_name}
                    onChange={(e) => updateField('full_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue={user.email} disabled />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input
                      placeholder="099 123 456"
                      value={profile.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de nacimiento</Label>
                    <Input
                      type="date"
                      value={profile.birth_date}
                      onChange={(e) => updateField('birth_date', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Sexo</Label>
                  <Select
                    value={profile.gender}
                    onValueChange={(v) => updateField('gender', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                      <SelectItem value="no_especifica">Prefiero no decir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Departamento</Label>
                    <Select
                      value={profile.department}
                      onValueChange={(v) => updateField('department', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {URUGUAY_DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ciudad</Label>
                    <Input
                      placeholder="Tu ciudad"
                      value={profile.city}
                      onChange={(e) => updateField('city', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Dirección</Label>
                  <Input
                    placeholder="Av. 18 de Julio 1234"
                    value={profile.address}
                    onChange={(e) => updateField('address', e.target.value)}
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar cambios'
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
