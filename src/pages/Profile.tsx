import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CarCard } from '@/components/cars/CarCard';
import { useAuth } from '@/hooks/useAuth';
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
import type { Id } from '../../convex/_generated/dataModel';

interface ProfileData {
  fullName: string;
  phone: string;
  department: string;
  city: string;
  address: string;
  birthDate: string;
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
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'settings' ? 'settings' : 'garage';

  const { user, loading, isAuthenticated, signOut } = useAuth();

  // Form state for profile
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    fullName: '',
    phone: '',
    department: '',
    city: '',
    address: '',
    birthDate: '',
    gender: '',
  });
  const [profileInitialized, setProfileInitialized] = useState(false);

  // Vehicle activation state
  const [activationBrandId, setActivationBrandId] = useState<string>('');
  const [activationModelId, setActivationModelId] = useState<string>('');
  const [activationYear, setActivationYear] = useState('');
  const [activationVin, setActivationVin] = useState('');
  const [submittingActivation, setSubmittingActivation] = useState(false);

  // Convex queries
  const brands = useQuery(api.cars.listBrands, { activeOnly: true }) || [];
  const modelsForBrand = useQuery(
    api.cars.listModels,
    activationBrandId ? { brandId: activationBrandId as Id<'brands'> } : 'skip'
  ) || [];

  const activations = useQuery(
    api.activations.getMyActivations,
    user?._id ? { userId: user._id } : 'skip'
  ) || [];

  const savedCars = useQuery(
    api.cars.getSavedCars,
    user?._id ? { userId: user._id } : 'skip'
  ) || [];

  const myLeads = useQuery(
    api.leads.getMyLeads,
    user?._id ? { userId: user._id } : 'skip'
  ) || [];

  // Convex mutations
  const updateProfileMutation = useMutation(api.auth.updateProfile);
  const createActivationMutation = useMutation(api.activations.createActivation);
  const unsaveCarMutation = useMutation(api.cars.unsaveCar);

  // Initialize profile form when user loads
  if (user && !profileInitialized) {
    setProfile({
      fullName: user.fullName || '',
      phone: user.phone || '',
      department: user.department || '',
      city: user.city || '',
      address: user.address || '',
      birthDate: user.birthDate || '',
      gender: user.gender || '',
    });
    setProfileInitialized(true);
  }

  const handleSaveProfile = async () => {
    if (!user?._id) return;
    setSaving(true);

    try {
      await updateProfileMutation({
        userId: user._id,
        fullName: profile.fullName || undefined,
        phone: profile.phone || undefined,
        department: profile.department || undefined,
        city: profile.city || undefined,
        address: profile.address || undefined,
        birthDate: profile.birthDate || undefined,
        gender: profile.gender || undefined,
      });
      toast.success('Perfil actualizado');
    } catch (err: any) {
      toast.error('Error al guardar', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Sesion cerrada');
    navigate('/');
  };

  const handleSubmitActivation = async () => {
    if (!user?._id || !activationBrandId || !activationModelId || !activationYear || !activationVin.trim()) {
      toast.error('Completa todos los campos');
      return;
    }
    setSubmittingActivation(true);
    try {
      await createActivationMutation({
        userId: user._id,
        brandId: activationBrandId as Id<'brands'>,
        modelId: activationModelId as Id<'models'>,
        year: parseInt(activationYear),
        vin: activationVin.trim().toUpperCase(),
      });
      toast.success('Vehiculo enviado para verificacion');
      setActivationBrandId('');
      setActivationModelId('');
      setActivationYear('');
      setActivationVin('');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    } finally {
      setSubmittingActivation(false);
    }
  };

  const handleUnsaveCar = async (trimId: string) => {
    if (!user?._id) return;
    try {
      await unsaveCarMutation({
        userId: user._id,
        trimId: trimId as Id<'trims'>,
      });
      toast.success('Auto removido de guardados');
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

  if (!isAuthenticated || !user) {
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

  const fullName = profile.fullName || user.fullName || user.email?.split('@')[0] || 'Usuario';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <Layout>
      <div className="container-wide py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              {user.role && user.role !== 'user' && user.role !== 'visitor' && (
                <Badge variant="secondary" className="mt-1">
                  {user.role === 'admin' ? 'Administrador' :
                   user.role === 'brand_admin' ? 'Admin de Marca' :
                   user.role === 'verified_user' ? 'Usuario Verificado' : user.role}
                </Badge>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Cerrar sesion
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="garage" className="gap-2">
              <Car className="h-4 w-4" />
              <span className="hidden sm:inline">Mi Garaje</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Guardados</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Historial</span>
            </TabsTrigger>
            <TabsTrigger value="benefits" className="gap-2">
              <Gift className="h-4 w-4" />
              <span className="hidden sm:inline">Beneficios</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Ajustes</span>
            </TabsTrigger>
          </TabsList>

          {/* Garage Tab */}
          <TabsContent value="garage">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Vehicles List */}
              <div className="rounded-2xl bg-card border p-6">
                <h2 className="text-lg font-semibold mb-4">Mis Vehiculos</h2>
                {activations.length === 0 ? (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">
                      No tienes vehiculos registrados
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Registra tu vehiculo para acceder a beneficios exclusivos
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activations.map((activation) => (
                      <div
                        key={activation._id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">
                            {activation.brand?.name} {activation.model?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activation.year} • VIN: {activation.vin}
                          </p>
                        </div>
                        <Badge className={STATUS_LABELS[activation.status]?.color || ''}>
                          {activation.status === 'verified' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {activation.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {activation.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                          {STATUS_LABELS[activation.status]?.label || activation.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Vehicle Form */}
              <div className="rounded-2xl bg-card border p-6">
                <h2 className="text-lg font-semibold mb-4">Registrar Vehiculo</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Activa tu vehiculo 0km para acceder a beneficios exclusivos de la marca.
                </p>
                <div className="space-y-4">
                  <div>
                    <Label>Marca</Label>
                    <Select
                      value={activationBrandId}
                      onValueChange={(value) => {
                        setActivationBrandId(value);
                        setActivationModelId('');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una marca" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand._id} value={brand._id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Modelo</Label>
                    <Select
                      value={activationModelId}
                      onValueChange={setActivationModelId}
                      disabled={!activationBrandId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        {modelsForBrand.map((model) => (
                          <SelectItem key={model._id} value={model._id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ano</Label>
                    <Select value={activationYear} onValueChange={setActivationYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el ano" />
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
                  <div>
                    <Label>Numero de VIN</Label>
                    <Input
                      value={activationVin}
                      onChange={(e) => setActivationVin(e.target.value)}
                      placeholder="Ej: 1HGBH41JXMN109186"
                      maxLength={17}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      El VIN se encuentra en la tarjeta verde del vehiculo
                    </p>
                  </div>
                  <Button
                    onClick={handleSubmitActivation}
                    disabled={submittingActivation || !activationBrandId || !activationModelId || !activationYear || !activationVin}
                    className="w-full gap-2"
                  >
                    {submittingActivation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Registrar vehiculo
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved">
            <div className="rounded-2xl bg-card border p-6">
              <h2 className="text-lg font-semibold mb-4">Autos Guardados</h2>
              {savedCars.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No tienes autos guardados
                  </p>
                  <Link to="/autos">
                    <Button>Explorar autos</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {savedCars.map((car: any) => (
                    <div key={car._id} className="relative">
                      <CarCard car={car} />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => handleUnsaveCar(car._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="rounded-2xl bg-card border p-6">
              <h2 className="text-lg font-semibold mb-4">Mis Consultas</h2>
              {myLeads.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No tienes consultas registradas
                  </p>
                  <Link to="/autos">
                    <Button>Ver autos disponibles</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myLeads.map((lead: any) => (
                    <div
                      key={lead._id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">
                          {lead.car?.brand?.name} {lead.car?.model?.name} {lead.car?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {lead.car?.year} • USD {lead.car?.priceUsd?.toLocaleString()}
                        </p>
                      </div>
                      <Badge className={STATUS_LABELS[lead.status]?.color || ''}>
                        {STATUS_LABELS[lead.status]?.label || lead.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Benefits Tab */}
          <TabsContent value="benefits">
            <div className="rounded-2xl bg-card border p-6">
              <h2 className="text-lg font-semibold mb-4">Beneficios Exclusivos</h2>
              {activations.filter((a) => a.status === 'verified').length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Registra y verifica tu vehiculo para acceder a beneficios exclusivos
                  </p>
                  <Button variant="outline" onClick={() => {}}>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Verificar vehiculo
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="font-medium mb-2">Tienes vehiculos verificados!</p>
                  <p className="text-muted-foreground">
                    Proximamente podras ver tus beneficios exclusivos aqui.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="rounded-2xl bg-card border p-6">
              <h2 className="text-lg font-semibold mb-6">Informacion Personal</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <Input
                    id="fullName"
                    value={profile.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="099 123 456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Select
                    value={profile.department}
                    onValueChange={(value) => updateField('department', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu departamento" />
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
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={profile.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="Tu ciudad"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Direccion</Label>
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="Tu direccion"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={profile.birthDate}
                    onChange={(e) => updateField('birthDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Genero</Label>
                  <Select
                    value={profile.gender}
                    onValueChange={(value) => updateField('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu genero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                      <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Guardar cambios
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
