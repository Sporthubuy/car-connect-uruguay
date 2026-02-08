import { SignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function BrandAdminLogin() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, isBrandAdmin } = useAuth();

  // Redirect to brand admin dashboard if already logged in as brand admin
  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (isBrandAdmin) {
        navigate('/marca');
      } else {
        // If logged in but not a brand admin, redirect to home
        navigate('/');
      }
    }
  }, [isAuthenticated, loading, isBrandAdmin, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al sitio
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          {/* Logo and title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-xl bg-primary mb-4 shadow-lg">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Portal de Marcas
            </h1>
            <p className="text-muted-foreground">
              Accede al panel de administración de tu marca
            </p>
          </div>

          <SignedOut>
            {/* Login card */}
            <div className="rounded-xl bg-card border p-6 md:p-8 shadow-lg">
              <SignIn
                fallbackRedirectUrl="/marca"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none p-0 w-full bg-transparent",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "border bg-card hover:bg-muted text-foreground",
                    socialButtonsBlockButtonText: "text-foreground",
                    dividerLine: "bg-border",
                    dividerText: "text-muted-foreground",
                    formFieldLabel: "text-foreground",
                    formFieldInput: "bg-card border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20",
                    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold",
                    footerActionLink: "text-primary hover:underline",
                    identityPreviewEditButton: "text-primary hover:underline",
                    formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
                    footer: "hidden",
                  }
                }}
              />
            </div>
          </SignedOut>

          <SignedIn>
            <div className="rounded-xl bg-card border p-6 md:p-8 text-center shadow-lg">
              <p className="text-muted-foreground mb-4">Ya iniciaste sesión</p>
              <Link to="/marca" className="text-primary hover:underline font-semibold">
                Ir al panel de marca
              </Link>
            </div>
          </SignedIn>

          {/* Help text */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿Necesitas ayuda?{' '}
            <Link to="/contacto" className="text-primary hover:underline">
              Contáctanos
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} CarConnect Uruguay. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
