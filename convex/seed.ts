import { mutation } from "./_generated/server";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingBrands = await ctx.db.query("brands").first();
    if (existingBrands) {
      return { message: "Database already seeded" };
    }

    // Create brands
    const toyota = await ctx.db.insert("brands", {
      name: "Toyota",
      slug: "toyota",
      logoUrl: "https://www.carlogos.org/car-logos/toyota-logo-2019-3700x1200.png",
      country: "Japon",
      isActive: true,
    });

    const volkswagen = await ctx.db.insert("brands", {
      name: "Volkswagen",
      slug: "volkswagen",
      logoUrl: "https://www.carlogos.org/car-logos/volkswagen-logo-2019-1500x1500.png",
      country: "Alemania",
      isActive: true,
    });

    const chevrolet = await ctx.db.insert("brands", {
      name: "Chevrolet",
      slug: "chevrolet",
      logoUrl: "https://www.carlogos.org/car-logos/chevrolet-logo-2013-2560x1440.png",
      country: "Estados Unidos",
      isActive: true,
    });

    const ford = await ctx.db.insert("brands", {
      name: "Ford",
      slug: "ford",
      logoUrl: "https://www.carlogos.org/car-logos/ford-logo-2017-1500x1101.png",
      country: "Estados Unidos",
      isActive: true,
    });

    // Create models
    const corolla = await ctx.db.insert("models", {
      brandId: toyota,
      name: "Corolla",
      slug: "corolla",
      segment: "sedan",
      yearStart: 2020,
    });

    const hilux = await ctx.db.insert("models", {
      brandId: toyota,
      name: "Hilux",
      slug: "hilux",
      segment: "pickup",
      yearStart: 2020,
    });

    const golf = await ctx.db.insert("models", {
      brandId: volkswagen,
      name: "Golf",
      slug: "golf",
      segment: "hatchback",
      yearStart: 2020,
    });

    const tiguan = await ctx.db.insert("models", {
      brandId: volkswagen,
      name: "Tiguan",
      slug: "tiguan",
      segment: "suv",
      yearStart: 2020,
    });

    const onix = await ctx.db.insert("models", {
      brandId: chevrolet,
      name: "Onix",
      slug: "onix",
      segment: "hatchback",
      yearStart: 2020,
    });

    const ranger = await ctx.db.insert("models", {
      brandId: ford,
      name: "Ranger",
      slug: "ranger",
      segment: "pickup",
      yearStart: 2020,
    });

    // Create trims
    await ctx.db.insert("trims", {
      modelId: corolla,
      name: "XEi CVT",
      slug: "corolla-xei-cvt",
      year: 2024,
      priceUsd: 32900,
      engine: "2.0L 4 cilindros",
      transmission: "CVT",
      fuelType: "gasolina",
      horsepower: 170,
      torque: 203,
      acceleration0100: 9.5,
      topSpeed: 200,
      fuelConsumption: 7.2,
      doors: 4,
      seats: 5,
      trunkCapacity: 470,
      features: [
        "Pantalla tactil 9 pulgadas",
        "Apple CarPlay / Android Auto",
        "Camara de retroceso",
        "Control crucero adaptativo",
        "Sensores de estacionamiento",
        "Llantas de aleacion 17 pulgadas",
      ],
      images: [
        "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
        "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800",
      ],
      isFeatured: true,
    });

    await ctx.db.insert("trims", {
      modelId: corolla,
      name: "SE-G CVT",
      slug: "corolla-seg-cvt",
      year: 2024,
      priceUsd: 38500,
      engine: "2.0L 4 cilindros",
      transmission: "CVT",
      fuelType: "gasolina",
      horsepower: 170,
      torque: 203,
      acceleration0100: 9.5,
      topSpeed: 200,
      fuelConsumption: 7.2,
      doors: 4,
      seats: 5,
      trunkCapacity: 470,
      features: [
        "Techo solar",
        "Asientos de cuero",
        "Pantalla tactil 12.3 pulgadas",
        "Sistema de navegacion",
        "Cargador inalambrico",
        "Sistema de sonido JBL",
      ],
      images: [
        "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
      ],
      isFeatured: false,
    });

    await ctx.db.insert("trims", {
      modelId: hilux,
      name: "SRV 4x4 AT",
      slug: "hilux-srv-4x4",
      year: 2024,
      priceUsd: 52900,
      engine: "2.8L Turbo Diesel",
      transmission: "Automatica 6 velocidades",
      fuelType: "diesel",
      horsepower: 204,
      torque: 500,
      topSpeed: 175,
      fuelConsumption: 9.5,
      doors: 4,
      seats: 5,
      trunkCapacity: 0,
      features: [
        "Traccion 4x4",
        "Control de traccion",
        "7 airbags",
        "Camara 360 grados",
        "Pantalla tactil 8 pulgadas",
      ],
      images: [
        "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800",
      ],
      isFeatured: true,
    });

    await ctx.db.insert("trims", {
      modelId: golf,
      name: "GTI",
      slug: "golf-gti",
      year: 2024,
      priceUsd: 45900,
      engine: "2.0L TSI Turbo",
      transmission: "DSG 7 velocidades",
      fuelType: "gasolina",
      horsepower: 245,
      torque: 370,
      acceleration0100: 6.2,
      topSpeed: 250,
      fuelConsumption: 7.8,
      doors: 5,
      seats: 5,
      trunkCapacity: 380,
      features: [
        "Suspension deportiva",
        "Asientos deportivos",
        "Digital Cockpit Pro",
        "Diferencial autoblocante",
        "Escape deportivo",
      ],
      images: [
        "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800",
      ],
      isFeatured: true,
    });

    await ctx.db.insert("trims", {
      modelId: tiguan,
      name: "Elegance",
      slug: "tiguan-elegance",
      year: 2024,
      priceUsd: 48500,
      engine: "2.0L TSI",
      transmission: "DSG 7 velocidades",
      fuelType: "gasolina",
      horsepower: 220,
      torque: 350,
      acceleration0100: 7.4,
      topSpeed: 215,
      fuelConsumption: 8.2,
      doors: 5,
      seats: 5,
      trunkCapacity: 615,
      features: [
        "Traccion 4Motion",
        "Techo panoramico",
        "Asientos electricos",
        "Park Assist",
        "Lane Assist",
      ],
      images: [
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
      ],
      isFeatured: false,
    });

    await ctx.db.insert("trims", {
      modelId: onix,
      name: "Premier AT",
      slug: "onix-premier",
      year: 2024,
      priceUsd: 24900,
      engine: "1.0L Turbo",
      transmission: "Automatica 6 velocidades",
      fuelType: "gasolina",
      horsepower: 116,
      torque: 165,
      acceleration0100: 10.5,
      topSpeed: 185,
      fuelConsumption: 6.5,
      doors: 5,
      seats: 5,
      trunkCapacity: 275,
      features: [
        "MyLink 8 pulgadas",
        "Wi-Fi nativo",
        "6 airbags",
        "Control de estabilidad",
        "Alerta de colision",
      ],
      images: [
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
      ],
      isFeatured: true,
    });

    await ctx.db.insert("trims", {
      modelId: ranger,
      name: "Limited 3.0 V6",
      slug: "ranger-limited-v6",
      year: 2024,
      priceUsd: 58900,
      engine: "3.0L V6 Turbo Diesel",
      transmission: "Automatica 10 velocidades",
      fuelType: "diesel",
      horsepower: 250,
      torque: 600,
      topSpeed: 180,
      fuelConsumption: 10.2,
      doors: 4,
      seats: 5,
      trunkCapacity: 0,
      features: [
        "SYNC 4A con pantalla 12 pulgadas",
        "Traccion 4x4",
        "Modo Trail",
        "Camara 360",
        "Pro Trailer Backup Assist",
      ],
      images: [
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
      ],
      isFeatured: true,
    });

    // Create communities
    await ctx.db.insert("communities", {
      name: "Toyota Owners Uruguay",
      slug: "toyota-owners",
      description: "Comunidad de propietarios de Toyota en Uruguay",
      brandId: toyota,
      memberCount: 0,
    });

    await ctx.db.insert("communities", {
      name: "VW Club Uruguay",
      slug: "vw-club",
      description: "Club de entusiastas de Volkswagen",
      brandId: volkswagen,
      memberCount: 0,
    });

    await ctx.db.insert("communities", {
      name: "4x4 Uruguay",
      slug: "4x4-uruguay",
      description: "Comunidad de amantes del offroad y las 4x4",
      memberCount: 0,
    });

    // Create events
    await ctx.db.insert("events", {
      brandId: toyota,
      title: "Test Drive Toyota Hilux 2024",
      slug: "test-drive-hilux-2024",
      description: "Ven a probar la nueva Toyota Hilux 2024 con motor turbo diesel de 204 HP",
      coverImage: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800",
      location: "Toyota Uruguay, Av. Italia 3456, Montevideo",
      eventDate: "2024-03-15",
      eventTime: "10:00",
      isPublic: true,
      requiresVerification: false,
      maxAttendees: 20,
    });

    await ctx.db.insert("events", {
      brandId: volkswagen,
      title: "Lanzamiento Golf GTI 2024",
      slug: "lanzamiento-golf-gti-2024",
      description: "Evento exclusivo de lanzamiento del nuevo Golf GTI",
      coverImage: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800",
      location: "VW Showroom, Pocitos",
      eventDate: "2024-03-20",
      eventTime: "19:00",
      isPublic: false,
      requiresVerification: true,
      maxAttendees: 50,
    });

    // Create site settings
    await ctx.db.insert("siteSettings", {
      key: "page_terminos",
      value: JSON.stringify({
        title: "Terminos y Condiciones",
        content: "Los presentes terminos regulan el uso de la plataforma CarConnect Uruguay..."
      }),
    });

    await ctx.db.insert("siteSettings", {
      key: "page_privacidad",
      value: JSON.stringify({
        title: "Politica de Privacidad",
        content: "En CarConnect Uruguay protegemos tus datos personales..."
      }),
    });

    await ctx.db.insert("siteSettings", {
      key: "page_contacto",
      value: JSON.stringify({
        title: "Contacto",
        content: "Email: hola@carconnect.uy\nTelefono: +598 99 123 456\nDireccion: Montevideo, Uruguay"
      }),
    });

    await ctx.db.insert("siteSettings", {
      key: "page_sobre-nosotros",
      value: JSON.stringify({
        title: "Sobre Nosotros",
        content: "CarConnect Uruguay es la plataforma lider para encontrar tu proximo auto 0km."
      }),
    });

    await ctx.db.insert("siteSettings", {
      key: "hero_title",
      value: "Encuentra tu proximo auto",
    });

    await ctx.db.insert("siteSettings", {
      key: "hero_subtitle",
      value: "La plataforma lider en Uruguay para autos 0km",
    });

    return { message: "Database seeded successfully!" };
  },
});
