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
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[#65676b] hover:text-[#1c1e21] transition-colors"
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
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#1877f2] mb-4 shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#1c1e21] mb-2">
              Portal de Marcas
            </h1>
            <p className="text-[#65676b]">
              Accede al panel de administración de tu marca
            </p>
          </div>

          <SignedOut>
            {/* Login card */}
            <div className="rounded-lg bg-white border border-[#dadde1] p-6 md:p-8 shadow-md">
              <SignIn
                fallbackRedirectUrl="/marca"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none p-0 w-full bg-transparent",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "border border-[#dadde1] bg-white hover:bg-[#f0f2f5] text-[#1c1e21]",
                    socialButtonsBlockButtonText: "text-[#1c1e21]",
                    dividerLine: "bg-[#dadde1]",
                    dividerText: "text-[#65676b]",
                    formFieldLabel: "text-[#1c1e21]",
                    formFieldInput: "bg-white border-[#dadde1] text-[#1c1e21] placeholder:text-[#8a8d91] focus:border-[#1877f2] focus:ring-[#1877f2]/20",
                    formButtonPrimary: "bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold",
                    footerActionLink: "text-[#1877f2] hover:underline",
                    identityPreviewEditButton: "text-[#1877f2] hover:underline",
                    formFieldInputShowPasswordButton: "text-[#65676b] hover:text-[#1c1e21]",
                    footer: "hidden",
                  }
                }}
              />
            </div>
          </SignedOut>

          <SignedIn>
            <div className="rounded-lg bg-white border border-[#dadde1] p-6 md:p-8 text-center shadow-md">
              <p className="text-[#65676b] mb-4">Ya iniciaste sesión</p>
              <Link to="/marca" className="text-[#1877f2] hover:underline font-semibold">
                Ir al panel de marca
              </Link>
            </div>
          </SignedIn>

          {/* Help text */}
          <p className="text-center text-sm text-[#65676b] mt-6">
            ¿Necesitas ayuda?{' '}
            <Link to="/contacto" className="text-[#1877f2] hover:underline">
              Contáctanos
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-xs text-[#65676b]">
          © {new Date().getFullYear()} CarConnect Uruguay. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
