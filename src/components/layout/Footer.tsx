import { Link } from 'react-router-dom';
import { Car, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  autos: [
    { name: 'Todos los autos', href: '/autos' },
    { name: 'SUVs', href: '/autos?segment=suv' },
    { name: 'Sedanes', href: '/autos?segment=sedan' },
    { name: 'Pickups', href: '/autos?segment=pickup' },
    { name: 'Hatchbacks', href: '/autos?segment=hatchback' },
  ],
  comunidad: [
    { name: 'Reviews', href: '/reviews' },
    { name: 'Comunidades', href: '/comunidad' },
    { name: 'Eventos', href: '/eventos' },
    { name: 'Noticias', href: '/noticias' },
  ],
  empresa: [
    { name: 'Sobre nosotros', href: '/sobre-nosotros' },
    { name: 'Contacto', href: '/contacto' },
    { name: 'Términos y condiciones', href: '/terminos' },
    { name: 'Política de privacidad', href: '/privacidad' },
  ],
};

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: '#' },
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'YouTube', icon: Youtube, href: '#' },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container-wide py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Car className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground">CarWow</span>
                <span className="text-xs font-medium text-muted-foreground">LATAM (UY)</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              La plataforma líder para encontrar tu próximo auto 0km en Uruguay. 
              Compará precios, leé reviews y conectá con concesionarios.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Montevideo, Uruguay</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:hola@carwow.uy" className="hover:text-foreground transition-colors">
                  hola@carwow.uy
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+59899123456" className="hover:text-foreground transition-colors">
                  +598 99 123 456
                </a>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Autos</h3>
            <ul className="space-y-3">
              {footerLinks.autos.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Comunidad</h3>
            <ul className="space-y-3">
              {footerLinks.comunidad.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Empresa</h3>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CarWow LATAM. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <link.icon className="h-5 w-5" />
                <span className="sr-only">{link.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
