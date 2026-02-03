import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CarCard } from '@/components/cars/CarCard';
import { useBrands, useModelsByBrand, useMyActivations, useSavedCars, useMyLeads } from '@/hooks/useSupabase';
import { submitVehicleActivation, unsaveCar } from '@/lib/api';
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
  CheckCircle,
  XCircle,
  Trash2,
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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-500/10 text-yellow-600' },
  verified: { label: 'Verificado', color: 'bg-green-500/10 text-green-600' },
  rejected: { label: 'Rechazado', color: 'bg-red-500/10 text-red-600' },
  new: { label: 'Nuevo', color: 'bg-blue-500/10 text-blue-600' },
  contacted: { label: 'Contactado', color: 'bg-purple-500/10 text-purple-600' },
  qualified: { label: 'Calificado', color: 'bg-cyan-500/10 text-cyan-600' },
  converted: { label: 'Convertido', color: 'bg-green-500/10 text-green-600' },
  lost: { label: 'Perdido', color: 'bg-gray-500/10 text-gray-600' },
};

const Profile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  // Vehicle activation state
  const [activationBrandId, setActivationBrandId] = useState('');
  const [activationModelId, setActivationModelId] = useState('');
  const [activationYear, setActivationYear] = useState('');
  const [activationVin, setActivationVin] = useState('');
  const [submittingActivation, setSubmittingActivation] = useState(false);

  const { data: modelsForBrand = [] } = useModelsByBrand(activationBrandId);
  const { data: activations = [], refetch: refetchActivations } = useMyActivations();
  const { data: savedCars = [], refetch: refetchSavedCars } = useSavedCars();
  const { data: myLeads = [] } = useMyLeads();

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
    toast.success('Sesion cerrada');
    navigate('/');
  };

  const handleSubmitActivation = async () => {
    if (!activationBrandId || !activationModelId || !activationYear || !activationVin.trim()) {
      toast.error('Completa todos los campos');
      return;
    }
    setSubmittingActivation(true);
    try {
      await submitVehicleActivation({
        brand_id: activationBrandId,
        model_id: activationModelId,
        year: parseInt(activationYear),
        vin: activationVin.trim().toUpperCase(),
      });
      toast.success('Vehiculo enviado para verificacion');
      setActivationBrandId('');
      setActivationModelId('');
      setActivationYear('');
      setActivationVin('');
      refetchActivations();
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    } finally {
      setSubmittingActivation(false);
    }
  };

  const handleUnsaveCar = async (trimId: string) => {
    try {
      await unsaveCar(trimId);
      toast.success('Auto removido de guardados');
      refetchSavedCars();
      queryClient.invalidateQueries({ queryKey: ['saved-car-ids'] });
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    }
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
              Inicia sesion para acceder a tu perfil, garaje y beneficios exclusivos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  <LogIn className="h-4 w-4" />
                  Iniciar sesion
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

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
              Cerrar sesion
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
                        Activar vehiculo
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Agrega tu auto y accede a beneficios exclusivos
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Marca</Label>
                      <Select
                        value={activationBrandId}
                        onValueChange={(v) => {
                          setActivationBrandId(v);
                          setActivationModelId('');
                        }}
                      >
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
                      <Select
                        value={activationModelId}
                        onValueChange={setActivationModelId}
                        disabled={!activationBrandId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar modelo" />
                        </SelectTrigger>
                        <SelectContent>
                          {modelsForBrand.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ano</Label>
                      <Select value={activationYear} onValueChange={setActivationYear}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar ano" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Numero de chasis (VIN)</Label>
                      <Input
                        placeholder="Ej: 1HGBH41JXMN109186"
                        value={activationVin}
                        onChange={(e) => setActivationVin(e.target.value)}
                        maxLength={17}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                      onClick={handleSubmitActivation}
                      disabled={submittingActivation}
                    >
                      {submittingActivation ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        'Enviar para verificacion'
                      )}
                    </Button>
                  </div>
                </div>

                {/* My Vehicles */}
                <div className="mt-6 rounded-xl bg-card border p-6">
                  <h3 className="font-semibold text-foreground mb-4">
                    Mis vehiculos
                  </h3>
                  {activations.length > 0 ? (
                    <div className="space-y-3">
                      {activations.map((activation) => (
                        <div
                          key={activation.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <Car className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-foreground">
                                {activation.brand_name} {activation.model_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {activation.year} • VIN: {activation.vin}
                              </p>
                            </div>
                          </div>
                          <Badge className={STATUS_LABELS[activation.status]?.color || ''}>
                            {activation.status === 'verified' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {activation.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                            {activation.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                            {STATUS_LABELS[activation.status]?.label || activation.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Car className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>No tenes vehiculos activados</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Benefits Sidebar */}
              <div className="space-y-6">
                <div className="rounded-xl bg-primary p-6 text-primary-foreground">
                  <ShieldCheck className="h-8 w-8 mb-4" />
                  <h3 className="font-semibold mb-2">Beneficios de verificacion</h3>
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
                    Estado de verificacion
                  </h3>
                  {activations.some((a) => a.status === 'verified') ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-600">Verificado</p>
                        <p className="text-xs text-muted-foreground">
                          Accedes a todos los beneficios
                        </p>
                      </div>
                    </div>
                  ) : activations.some((a) => a.status === 'pending') ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-yellow-600">En revision</p>
                        <p className="text-xs text-muted-foreground">
                          Estamos verificando tu vehiculo
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Sin verificar</p>
                        <p className="text-xs text-muted-foreground">
                          Activa un vehiculo para comenzar
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved">
            {savedCars.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {savedCars.map((car) => (
                  <div key={car.id} className="relative group">
                    <CarCard car={car} />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleUnsaveCar(car.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Heart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No tenes autos guardados
                </h3>
                <p className="text-muted-foreground mb-6">
                  Guarda tus favoritos para verlos despues
                </p>
                <Link to="/autos">
                  <Button>Explorar autos</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            {myLeads.length > 0 ? (
              <div className="rounded-xl border bg-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Auto</th>
                      <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Fecha</th>
                      <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myLeads.map((lead) => (
                      <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">
                            {[lead.brand_name, lead.model_name, lead.trim_name].filter(Boolean).join(' ') || 'Auto'}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                          {new Date(lead.created_at).toLocaleDateString('es-UY', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={STATUS_LABELS[lead.status]?.color || ''}>
                            {STATUS_LABELS[lead.status]?.label || lead.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <History className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Sin historial de leads
                </h3>
                <p className="text-muted-foreground mb-6">
                  Tus consultas apareceran aca
                </p>
                <Link to="/autos">
                  <Button>Ver catalogo</Button>
                </Link>
              </div>
            )}
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
                    <Label>Telefono</Label>
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
                  <Label>Direccion</Label>
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
