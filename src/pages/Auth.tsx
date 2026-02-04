import { SignIn, SignUp, SignedIn, SignedOut } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('login');

  // Redirect if already logged in - all users go to profile
  // Admins and brand admins can access their panels via header buttons
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/perfil');
    }
  }, [isAuthenticated, loading, navigate]);

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
              Bienvenido a CarConnect
            </h1>
            <p className="text-muted-foreground">
              Ingresa a tu cuenta o crea una nueva
            </p>
          </div>

          <SignedOut>
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

                <TabsContent value="login" className="flex justify-center">
                  <SignIn
                    fallbackRedirectUrl="/perfil"
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        card: "shadow-none p-0 w-full bg-transparent",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        socialButtonsBlockButton: "border border-border",
                        formButtonPrimary: "bg-primary hover:bg-primary/90",
                        footer: "hidden",
                      }
                    }}
                  />
                </TabsContent>

                <TabsContent value="signup" className="flex justify-center">
                  <SignUp
                    fallbackRedirectUrl="/perfil"
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        card: "shadow-none p-0 w-full bg-transparent",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        socialButtonsBlockButton: "border border-border",
                        formButtonPrimary: "bg-accent hover:bg-accent/90",
                        footer: "hidden",
                      }
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="rounded-2xl bg-card border p-6 md:p-8 text-center">
              <p className="text-muted-foreground mb-4">Ya iniciaste sesion</p>
              <Link to="/perfil" className="text-primary hover:underline">
                Ir a mi perfil
              </Link>
            </div>
          </SignedIn>

          {/* Info */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Necesitas ayuda?{' '}
            <Link to="/contacto" className="text-primary hover:underline">
              Contactanos
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
