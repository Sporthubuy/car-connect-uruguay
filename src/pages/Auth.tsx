import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Car, Loader2, Mail, Lock, User, ArrowLeft, CheckCircle } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // For password update after reset
  const [showNewPasswordForm, setShowNewPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Check for password recovery hash in URL
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    if (type === 'recovery') {
      setShowNewPasswordForm(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setIsLoading(false);
      toast.error('Error al iniciar sesion', {
        description: error.message === 'Invalid login credentials'
          ? 'Email o contrasena incorrectos'
          : error.message,
      });
      return;
    }

    // Fetch role to redirect accordingly
    let destination = '/perfil';
    if (authData.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profile?.role === 'admin') {
        destination = '/admin';
      } else if (profile?.role === 'brand_admin') {
        destination = '/marca';
      }
    }

    setIsLoading(false);
    toast.success('Bienvenido de vuelta!');
    navigate(destination);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: {
          full_name: signupName,
        },
      },
    });

    setIsLoading(false);

    if (error) {
      toast.error('Error al crear cuenta', {
        description: error.message,
      });
    } else {
      toast.success('Cuenta creada!', {
        description: 'Revisa tu email para confirmar tu cuenta.',
      });
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth`,
    });

    setIsLoading(false);

    if (error) {
      toast.error('Error', { description: error.message });
    } else {
      setResetSent(true);
      toast.success('Email enviado', {
        description: 'Revisa tu bandeja de entrada para restablecer tu contrasena.',
      });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Las contrasenas no coinciden');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('La contrasena debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsLoading(false);

    if (error) {
      toast.error('Error', { description: error.message });
    } else {
      toast.success('Contrasena actualizada');
      setShowNewPasswordForm(false);
      // Clear the hash from URL
      window.history.replaceState(null, '', window.location.pathname);
      navigate('/perfil');
    }
  };

  // New password form after clicking reset link
  if (showNewPasswordForm) {
    return (
      <Layout>
        <div className="container-wide py-8 md:py-16">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                  <Car className="h-7 w-7 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Nueva contrasena
              </h1>
              <p className="text-muted-foreground">
                Ingresa tu nueva contrasena
              </p>
            </div>

            <div className="rounded-2xl bg-card border p-6 md:p-8">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nueva contrasena</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="********"
                      className="pl-10"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirmar contrasena</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="********"
                      className="pl-10"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimo 8 caracteres
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Actualizar contrasena'
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Password reset request form
  if (showResetForm) {
    return (
      <Layout>
        <div className="container-wide py-8 md:py-16">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => {
                setShowResetForm(false);
                setResetSent(false);
              }}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al login
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                  <Car className="h-7 w-7 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Recuperar contrasena
              </h1>
              <p className="text-muted-foreground">
                Te enviaremos un link para restablecer tu contrasena
              </p>
            </div>

            <div className="rounded-2xl bg-card border p-6 md:p-8">
              {resetSent ? (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">
                    Email enviado
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Revisa tu bandeja de entrada y sigue el link para restablecer tu contrasena.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-10"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar link de recuperacion'
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-wide py-8 md:py-16">
        <div className="max-w-md mx-auto">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <Car className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Bienvenido a CarWow
            </h1>
            <p className="text-muted-foreground">
              Ingresa a tu cuenta o crea una nueva
            </p>
          </div>

          {/* Auth Tabs */}
          <div className="rounded-2xl bg-card border p-6 md:p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-6">
                <TabsTrigger value="login" className="flex-1">
                  Iniciar sesion
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex-1">
                  Registrarse
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-10"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contrasena</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="********"
                        className="pl-10"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline"
                      onClick={() => setShowResetForm(true)}
                    >
                      Olvidaste tu contrasena?
                    </button>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Ingresando...
                      </>
                    ) : (
                      'Iniciar sesion'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Form */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nombre completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Juan Perez"
                        className="pl-10"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-10"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Contrasena</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="********"
                        className="pl-10"
                        required
                        minLength={8}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Minimo 8 caracteres
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      'Crear cuenta'
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Al crear una cuenta, aceptas nuestros{' '}
                    <a href="/terminos" className="underline hover:text-foreground">
                      terminos
                    </a>{' '}
                    y{' '}
                    <a href="/privacidad" className="underline hover:text-foreground">
                      politica de privacidad
                    </a>
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {/* Info */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Necesitas ayuda?{' '}
            <a href="/contacto" className="text-primary hover:underline">
              Contactanos
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
