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

// Seed reviews with admin user as author
export const seedReviews = mutation({
  args: {},
  handler: async (ctx) => {
    // Get admin user
    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "hola@sporthub.com.uy"))
      .first();

    if (!adminUser) {
      return { message: "Admin user not found. Please login first." };
    }

    // Check if reviews already exist
    const existingReviews = await ctx.db.query("reviewPosts").first();
    if (existingReviews) {
      return { message: "Reviews already seeded" };
    }

    // Get some trims to associate with reviews
    const trims = await ctx.db.query("trims").take(5);

    // Create sample reviews
    await ctx.db.insert("reviewPosts", {
      authorId: adminUser._id,
      carId: trims[0]?._id,
      title: "Toyota Corolla 2024: El sedan que sigue marcando tendencia",
      slug: "toyota-corolla-2024-review",
      excerpt: "Probamos el nuevo Corolla XEi y te contamos todo lo que necesitas saber antes de comprarlo.",
      content: `## Introduccion

El Toyota Corolla sigue siendo uno de los sedanes mas vendidos en Uruguay, y la version 2024 trae mejoras significativas que lo mantienen competitivo en el segmento.

## Diseno Exterior

El nuevo Corolla presenta lineas mas agresivas y modernas. La parrilla frontal es mas prominente y los faros LED le dan un aspecto premium que no pasa desapercibido.

## Interior y Equipamiento

El interior es donde mas se nota la evolucion. La pantalla tactil de 9 pulgadas responde de manera fluida y la integracion con Apple CarPlay y Android Auto es impecable.

Los materiales han mejorado considerablemente, con plasticos suaves al tacto en las zonas de contacto frecuente.

## Manejo y Rendimiento

El motor 2.0L de 170 HP combinado con la transmision CVT ofrece una conduccion suave y eficiente. El consumo promedio de 7.2 L/100km es excelente para un sedan de este tamano.

## Conclusion

El Corolla 2024 es una opcion solida para quienes buscan confiabilidad, eficiencia y tecnologia en un sedan compacto premium.`,
      coverImage: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
      pros: [
        "Excelente consumo de combustible",
        "Equipamiento tecnologico completo",
        "Confiabilidad probada de Toyota",
        "Buen espacio interior"
      ],
      cons: [
        "Transmision CVT puede sentirse artificial",
        "Precio elevado vs competencia",
        "Baul algo justo para viajes largos"
      ],
      rating: 4.5,
      views: 1250,
      publishedAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    });

    await ctx.db.insert("reviewPosts", {
      authorId: adminUser._id,
      carId: trims[2]?._id,
      title: "Volkswagen Golf GTI 2024: Pasion por el manejo",
      slug: "vw-golf-gti-2024-review",
      excerpt: "El hot hatch por excelencia llega con mas potencia y tecnologia. Lo pusimos a prueba.",
      content: `## El legado GTI continua

El Golf GTI es sinonimo de hot hatch desde hace decadas, y la version 2024 mantiene esa esencia mientras abraza la modernidad.

## Rendimiento Puro

Con 245 HP del motor 2.0 TSI y la transmision DSG de 7 velocidades, el GTI acelera de 0 a 100 km/h en apenas 6.2 segundos. La entrega de potencia es lineal y adictiva.

## Chasis y Suspension

La suspension deportiva mantiene el auto pegado al asfalto. El diferencial autoblocante XDS mejora la traccion en curvas, permitiendo atacar con confianza.

## Interior Deportivo

Los asientos deportivos con el clasico tartan de VW son iconicos. El Digital Cockpit Pro ofrece toda la informacion necesaria de forma clara y personalizable.

## Tecnologia de Punta

El sistema de infoentretenimiento responde rapido y la conectividad es excelente. Los sistemas de asistencia al conductor estan presentes pero no son intrusivos.

## Veredicto

El Golf GTI 2024 es la eleccion perfecta para quienes quieren un auto practico de lunes a viernes y emocionante los fines de semana.`,
      coverImage: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800",
      pros: [
        "Rendimiento excepcional",
        "Manejo preciso y divertido",
        "Practicidad de un hatchback",
        "Calidad de construccion alemana"
      ],
      cons: [
        "Precio premium",
        "Suspension firme en calles rotas",
        "Consumo elevado si lo exiges"
      ],
      rating: 4.8,
      views: 2340,
      publishedAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    });

    await ctx.db.insert("reviewPosts", {
      authorId: adminUser._id,
      carId: trims[1]?._id,
      title: "Toyota Hilux SRV 2024: La reina de las pickups",
      slug: "toyota-hilux-srv-2024-review",
      excerpt: "Evaluamos la pickup mas vendida de Uruguay en su version SRV 4x4 automatica.",
      content: `## Dominando el mercado

La Toyota Hilux no necesita presentacion en Uruguay. Es la pickup mas vendida ano tras ano, y la version 2024 SRV 4x4 justifica esa preferencia.

## Motor y Capacidad

El motor 2.8L turbo diesel de 204 HP y 500 Nm de torque es una maravilla. La capacidad de remolque de 3,500 kg la hace ideal para trabajo pesado.

## Sistema 4x4

El sistema de traccion 4x4 con reductora permite enfrentar cualquier terreno. Los modos de conduccion se adaptan a arena, piedras o barro.

## Confort de Camioneta Premium

A pesar de ser una herramienta de trabajo, la Hilux SRV ofrece comodidades de SUV: asientos de cuero, climatizador bizona y sistema de audio de calidad.

## Seguridad

Con 7 airbags, control de estabilidad y camara 360 grados, la seguridad esta bien cubierta tanto en ruta como en maniobras de estacionamiento.

## Conclusion

La Hilux SRV 2024 es la opcion logica para quienes necesitan una pickup capaz pero no quieren sacrificar confort.`,
      coverImage: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800",
      pros: [
        "Motor diesel potente y eficiente",
        "Capacidad offroad sobresaliente",
        "Valor de reventa excepcional",
        "Red de servicio extensa"
      ],
      cons: [
        "Precio inicial elevado",
        "Consumo en ciudad",
        "Tamano dificulta estacionamiento"
      ],
      rating: 4.6,
      views: 3120,
      publishedAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
    });

    await ctx.db.insert("reviewPosts", {
      authorId: adminUser._id,
      carId: trims[4]?._id,
      title: "Chevrolet Onix Premier 2024: El compacto inteligente",
      slug: "chevrolet-onix-premier-2024-review",
      excerpt: "Analizamos el hatchback turbo de Chevrolet que conquista el segmento de entrada.",
      content: `## Compacto pero completo

El Chevrolet Onix Premier demuestra que no hace falta gastar mucho para tener un auto bien equipado y eficiente.

## Motor Turbo

El pequeno motor 1.0 turbo de 116 HP sorprende por su empuje. La transmision automatica de 6 velocidades hace un buen trabajo manteniendo el motor en su zona optima.

## Conectividad Total

El sistema MyLink de 8 pulgadas incluye Wi-Fi nativo, algo unico en el segmento. La integracion con smartphones es fluida y practica.

## Espacio Interior

Aunque es compacto por fuera, el Onix aprovecha bien su espacio interior. Cuatro adultos viajan comodos y el baul de 275 litros es suficiente para uso urbano.

## Seguridad Activa

Con 6 airbags, alerta de colision frontal y control de estabilidad, el Onix ofrece seguridad de nivel superior para su categoria.

## Veredicto

El Onix Premier es la opcion inteligente para quienes quieren tecnologia y seguridad sin romper el presupuesto.`,
      coverImage: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
      pros: [
        "Excelente relacion precio-equipamiento",
        "Motor turbo eficiente",
        "Conectividad Wi-Fi de serie",
        "Bajo costo de mantenimiento"
      ],
      cons: [
        "Espacio trasero justo",
        "Materiales de calidad basica",
        "Ruido de motor a altas revoluciones"
      ],
      rating: 4.2,
      views: 1890,
      publishedAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    });

    await ctx.db.insert("reviewPosts", {
      authorId: adminUser._id,
      carId: trims[5]?._id,
      title: "Ford Ranger Limited V6 2024: Potencia sin limites",
      slug: "ford-ranger-limited-v6-2024-review",
      excerpt: "La nueva generacion de la Ranger llega con motor V6 y tecnologia de vanguardia.",
      content: `## Nueva generacion, nuevo nivel

La Ford Ranger 2024 es completamente nueva y el motor V6 turbo diesel la posiciona como la pickup mas potente del segmento.

## Motor V6 Impresionante

El 3.0L V6 turbo diesel de 250 HP y 600 Nm es una obra de ingenieria. La transmision automatica de 10 velocidades es suave y siempre encuentra la marcha correcta.

## Tecnologia SYNC 4A

La pantalla de 12 pulgadas con SYNC 4A es la mejor del segmento. El sistema es rapido, intuitivo y ofrece navegacion con actualizaciones en tiempo real.

## Capacidades Todoterreno

El modo Trail con control de velocidad en descenso hace que el offroad sea accesible para cualquier conductor. La camara 360 ayuda en maniobras complicadas.

## Asistente de Remolque

El Pro Trailer Backup Assist es revolucionario: permite controlar el trailer con una perilla mientras el auto se encarga del volante.

## Conclusion

La Ranger Limited V6 es la pickup mas avanzada tecnologicamente disponible en Uruguay. Si el presupuesto lo permite, es dificil pedir mas.`,
      coverImage: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
      pros: [
        "Motor V6 potentisimo",
        "Tecnologia de punta",
        "Capacidad de remolque superior",
        "Asistentes de manejo innovadores"
      ],
      cons: [
        "Precio muy elevado",
        "Consumo considerable",
        "Tamano imponente para ciudad"
      ],
      rating: 4.7,
      views: 2780,
      publishedAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    });

    return { message: "Reviews seeded successfully!" };
  },
});

// Seed all additional content (comments, community posts, benefits, etc.)
export const seedAllContent = mutation({
  args: {},
  handler: async (ctx) => {
    // Get admin user
    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "hola@sporthub.com.uy"))
      .first();

    if (!adminUser) {
      return { message: "Admin user not found. Please login first." };
    }

    // Get existing data
    const brands = await ctx.db.query("brands").collect();
    const reviews = await ctx.db.query("reviewPosts").collect();
    const communities = await ctx.db.query("communities").collect();
    const existingComments = await ctx.db.query("comments").first();
    const existingPosts = await ctx.db.query("communityPosts").first();

    // ============ COMMENTS ON REVIEWS ============
    if (!existingComments && reviews.length > 0) {
      // Comments for first review (Corolla)
      const corollaReview = reviews.find(r => r.slug === "toyota-corolla-2024-review");
      if (corollaReview) {
        await ctx.db.insert("comments", {
          postId: corollaReview._id,
          authorId: adminUser._id,
          content: "Excelente review! Tengo el Corolla hace 6 meses y puedo confirmar todo lo que dicen. El consumo es realmente muy bueno.",
          isApproved: true,
        });
        await ctx.db.insert("comments", {
          postId: corollaReview._id,
          authorId: adminUser._id,
          content: "Que tal es el servicio post-venta de Toyota? Estoy entre el Corolla y el Civic.",
          isApproved: true,
        });
        await ctx.db.insert("comments", {
          postId: corollaReview._id,
          authorId: adminUser._id,
          content: "La transmision CVT se siente rara al principio pero te acostumbras rapido. Muy suave para ciudad.",
          isApproved: true,
        });
      }

      // Comments for Golf GTI review
      const gtiReview = reviews.find(r => r.slug === "vw-golf-gti-2024-review");
      if (gtiReview) {
        await ctx.db.insert("comments", {
          postId: gtiReview._id,
          authorId: adminUser._id,
          content: "El GTI es un sueno! Lo probe en el concesionario y es adictivo. Ahorrando para comprarlo.",
          isApproved: true,
        });
        await ctx.db.insert("comments", {
          postId: gtiReview._id,
          authorId: adminUser._id,
          content: "Alguien sabe como es el tema de los repuestos? Es muy caro mantenerlo?",
          isApproved: true,
        });
      }

      // Comments for Hilux review
      const hiluxReview = reviews.find(r => r.slug === "toyota-hilux-srv-2024-review");
      if (hiluxReview) {
        await ctx.db.insert("comments", {
          postId: hiluxReview._id,
          authorId: adminUser._id,
          content: "La Hilux es indestructible. Tengo una del 2018 con 200.000 km y anda perfecta.",
          isApproved: true,
        });
        await ctx.db.insert("comments", {
          postId: hiluxReview._id,
          authorId: adminUser._id,
          content: "El unico problema es estacionar en Montevideo jaja. Pero para salir al campo no hay nada mejor.",
          isApproved: true,
        });
        await ctx.db.insert("comments", {
          postId: hiluxReview._id,
          authorId: adminUser._id,
          content: "Comparada con la Ranger V6, cual recomiendan? El precio es similar.",
          isApproved: true,
        });
        await ctx.db.insert("comments", {
          postId: hiluxReview._id,
          authorId: adminUser._id,
          content: "La SRV viene con camara 360? O solo la SRX?",
          isApproved: false, // Pending approval
        });
      }

      // Comments for Ranger review
      const rangerReview = reviews.find(r => r.slug === "ford-ranger-limited-v6-2024-review");
      if (rangerReview) {
        await ctx.db.insert("comments", {
          postId: rangerReview._id,
          authorId: adminUser._id,
          content: "El motor V6 es una locura. La probe y tiene una respuesta impresionante.",
          isApproved: true,
        });
        await ctx.db.insert("comments", {
          postId: rangerReview._id,
          authorId: adminUser._id,
          content: "La pantalla SYNC 4A es la mejor que he visto en una pickup. Muy intuitiva.",
          isApproved: true,
        });
      }
    }

    // ============ COMMUNITY POSTS ============
    if (!existingPosts && communities.length > 0) {
      const toyotaCommunity = communities.find(c => c.slug === "toyota-owners");
      const vwCommunity = communities.find(c => c.slug === "vw-club");
      const offroad = communities.find(c => c.slug === "4x4-uruguay");

      if (toyotaCommunity) {
        await ctx.db.insert("communityPosts", {
          communityId: toyotaCommunity._id,
          authorId: adminUser._id,
          title: "Tips para el primer service de mi Corolla",
          content: "Hola a todos! Acabo de hacer los 10.000 km con mi Corolla 2024. Queria compartir mi experiencia con el primer service:\n\n1. El cambio de aceite salio $3.500 en el service oficial\n2. Revisaron frenos, suspension y filtros sin costo adicional\n3. Me dieron auto de cortesia mientras esperaba\n\nAlguno tiene tips para el proximo service? Que cosas conviene hacer en el taller oficial vs mecanico de confianza?",
          upvotes: 24,
          downvotes: 1,
          commentCount: 8,
        });
        await ctx.db.insert("communityPosts", {
          communityId: toyotaCommunity._id,
          authorId: adminUser._id,
          title: "Juntada Toyota Owners - Rambla Montevideo",
          content: "Buenas! Estamos organizando una juntada para el proximo sabado 15 de marzo en la Rambla de Pocitos.\n\nHora: 10:00 AM\nPunto de encuentro: Frente al Club Nautico\n\nTodos los Toyota son bienvenidos! La idea es tomar unos mates, conocernos y sacar fotos de los autos.\n\nConfirmen si vienen!",
          upvotes: 45,
          downvotes: 0,
          commentCount: 23,
        });
        await ctx.db.insert("communityPosts", {
          communityId: toyotaCommunity._id,
          authorId: adminUser._id,
          title: "Problema con ruido en suspension - Corolla 2023",
          content: "Gente, tengo un ruido molesto en la suspension delantera cuando paso por pozos. Es como un 'toc toc' metalico.\n\nEl auto tiene 25.000 km y esta en garantia todavia. Alguien tuvo este problema?\n\nYa lo lleve al service y dicen que es 'normal' pero no me convence.",
          upvotes: 12,
          downvotes: 0,
          commentCount: 15,
        });
      }

      if (vwCommunity) {
        await ctx.db.insert("communityPosts", {
          communityId: vwCommunity._id,
          authorId: adminUser._id,
          title: "Mi experiencia con el Golf GTI despues de 1 ano",
          content: "Cumpli un ano con mi Golf GTI y quiero compartir mi experiencia:\n\n**Lo bueno:**\n- El manejo es increible, no me canso de manejarlo\n- Consumo en ruta: 6.5 L/100km (mejor de lo esperado)\n- La caja DSG es perfecta\n\n**Lo no tan bueno:**\n- El consumo en ciudad sube a 10-11 L/100km\n- Los services son caros (aprox $8.000 cada 15.000 km)\n- La suspension es dura para las calles de Montevideo\n\nEn resumen: 100% recomendado si te gusta manejar!",
          upvotes: 67,
          downvotes: 3,
          commentCount: 31,
        });
        await ctx.db.insert("communityPosts", {
          communityId: vwCommunity._id,
          authorId: adminUser._id,
          title: "Donde comprar accesorios originales VW?",
          content: "Hola! Estoy buscando las alfombras originales para mi Tiguan y el deflector de capot.\n\nEn el concesionario me piden un ojo de la cara. Alguien conoce otro lugar donde vendan repuestos originales a mejor precio?\n\nGracias!",
          upvotes: 8,
          downvotes: 0,
          commentCount: 12,
        });
        await ctx.db.insert("communityPosts", {
          communityId: vwCommunity._id,
          authorId: adminUser._id,
          title: "Comparativa: Tiguan vs T-Cross vs Nivus",
          content: "Estoy por comprar mi primer VW y estoy entre estos tres modelos. Mi uso seria 80% ciudad y 20% viajes.\n\nPresupuesto: hasta 45.000 USD\n\nQue me recomiendan? Que version de cada uno seria la mejor relacion precio/equipamiento?\n\nAgradezco cualquier consejo!",
          upvotes: 19,
          downvotes: 1,
          commentCount: 27,
        });
      }

      if (offroad) {
        await ctx.db.insert("communityPosts", {
          communityId: offroad._id,
          authorId: adminUser._id,
          title: "Recorrido 4x4 por Rocha - Fotos y tips",
          content: "El finde pasado hicimos un recorrido por los caminos de Rocha con un grupo de 8 camionetas.\n\nRecorrido: La Paloma → Cabo Polonio → Punta del Diablo\n\nTips importantes:\n- Bajar las ruedas a 20 PSI para la arena\n- Llevar soga y kit de recuperacion\n- El tramo a Cabo Polonio es exigente, solo 4x4 con reductora\n- Llevar agua y comida, no hay servicios en el camino\n\nSubo fotos en los comentarios!",
          upvotes: 89,
          downvotes: 2,
          commentCount: 45,
        });
        await ctx.db.insert("communityPosts", {
          communityId: offroad._id,
          authorId: adminUser._id,
          title: "Hilux vs Ranger vs Amarok - Cual es mejor offroad?",
          content: "Debate eterno pero quiero opiniones actualizadas.\n\nTengo una Hilux 2019 y estoy pensando en cambiarla. Me tienta la Ranger V6 por potencia y la Amarok V6 por confort.\n\nAlguien que haya tenido las tres me puede dar su opinion honesta?\n\nUso: 50% ruta, 30% campo, 20% ciudad",
          upvotes: 34,
          downvotes: 5,
          commentCount: 52,
        });
        await ctx.db.insert("communityPosts", {
          communityId: offroad._id,
          authorId: adminUser._id,
          title: "Proxima salida grupal - Sierra de las Animas",
          content: "Estamos armando una salida a la Sierra de las Animas para el 22 de marzo.\n\nDificultad: Media-Alta\nDuracion: Dia completo\nRequisitos: 4x4 con reductora, neumaticos AT minimo\n\nIncluye almuerzo en un campo de la zona.\n\nCupos limitados a 12 vehiculos. Confirmar por privado.",
          upvotes: 56,
          downvotes: 0,
          commentCount: 38,
        });
      }

      // Update member counts
      if (toyotaCommunity) {
        await ctx.db.patch(toyotaCommunity._id, { memberCount: 156 });
      }
      if (vwCommunity) {
        await ctx.db.patch(vwCommunity._id, { memberCount: 89 });
      }
      if (offroad) {
        await ctx.db.patch(offroad._id, { memberCount: 234 });
      }
    }

    // ============ BENEFITS ============
    const existingBenefits = await ctx.db.query("benefits").first();
    if (!existingBenefits && brands.length > 0) {
      const toyota = brands.find(b => b.slug === "toyota");
      const vw = brands.find(b => b.slug === "volkswagen");
      const chevrolet = brands.find(b => b.slug === "chevrolet");
      const ford = brands.find(b => b.slug === "ford");

      if (toyota) {
        await ctx.db.insert("benefits", {
          brandId: toyota._id,
          title: "15% OFF en Service Oficial",
          description: "Descuento exclusivo en todos los services programados para propietarios registrados en CarConnect.",
          terms: "Valido para vehiculos Toyota 0km comprados en 2023-2024. No acumulable con otras promociones. Presentar codigo de la app.",
          validFrom: "2024-01-01",
          validUntil: "2024-12-31",
          isActive: true,
        });
        await ctx.db.insert("benefits", {
          brandId: toyota._id,
          title: "Revision pre-viaje gratuita",
          description: "Antes de tus vacaciones, llevá tu Toyota a una revisión completa sin cargo.",
          terms: "Valido una vez por año. Incluye revision de 25 puntos. No incluye repuestos ni mano de obra adicional.",
          validFrom: "2024-01-01",
          validUntil: "2024-12-31",
          isActive: true,
        });
        await ctx.db.insert("benefits", {
          brandId: toyota._id,
          title: "Accesorios con 20% OFF",
          description: "Descuento en accesorios originales Toyota: barras de techo, cobertores, alfombras y más.",
          terms: "Valido en compras mayores a $5.000. Stock sujeto a disponibilidad.",
          validFrom: "2024-03-01",
          validUntil: "2024-06-30",
          isActive: true,
        });
      }

      if (vw) {
        await ctx.db.insert("benefits", {
          brandId: vw._id,
          title: "Plan de Mantenimiento Extendido",
          description: "Extiende la garantía de tu Volkswagen por 2 años adicionales con 50% de descuento.",
          terms: "Aplicable a vehiculos con menos de 60.000 km. Debe contratarse antes del vencimiento de garantía original.",
          validFrom: "2024-01-01",
          validUntil: "2024-12-31",
          isActive: true,
        });
        await ctx.db.insert("benefits", {
          brandId: vw._id,
          title: "Upgrade de Llantas GTI",
          description: "Cambia tus llantas estándar por las llantas deportivas GTI con precio especial para miembros.",
          terms: "Solo para Golf, Polo y Virtus. Instalacion incluida. Stock limitado.",
          validFrom: "2024-02-01",
          validUntil: "2024-05-31",
          isActive: true,
        });
      }

      if (chevrolet) {
        await ctx.db.insert("benefits", {
          brandId: chevrolet._id,
          title: "Wi-Fi Gratis por 1 Año",
          description: "Activa el Wi-Fi de tu Chevrolet con datos ilimitados gratis durante 12 meses.",
          terms: "Valido para Onix, Tracker y Equinox 2023-2024. Requiere activacion en concesionario oficial.",
          validFrom: "2024-01-01",
          validUntil: "2024-12-31",
          isActive: true,
        });
        await ctx.db.insert("benefits", {
          brandId: chevrolet._id,
          title: "Cambio de Aceite Bonificado",
          description: "Tu primer cambio de aceite gratis al registrar tu Chevrolet en CarConnect.",
          terms: "Valido para vehiculos nuevos. Un cambio por vehiculo. Incluye aceite y filtro original.",
          validFrom: "2024-01-01",
          validUntil: "2024-12-31",
          isActive: true,
        });
      }

      if (ford) {
        await ctx.db.insert("benefits", {
          brandId: ford._id,
          title: "Accesorios Ranger con 25% OFF",
          description: "Equipá tu Ranger con accesorios originales: barra antivuelco, cubre caja, estribos y más.",
          terms: "Valido para Ranger 2023-2024. Instalacion incluida en seleccion de productos.",
          validFrom: "2024-01-01",
          validUntil: "2024-06-30",
          isActive: true,
        });
        await ctx.db.insert("benefits", {
          brandId: ford._id,
          title: "Curso de Manejo 4x4",
          description: "Aprende a sacar el máximo provecho de tu Ranger o Bronco Sport en nuestro curso offroad.",
          terms: "Cupos limitados. Inscripcion previa requerida. Incluye almuerzo y certificado.",
          validFrom: "2024-03-01",
          validUntil: "2024-12-31",
          isActive: true,
        });
      }
    }

    // ============ MORE EVENTS ============
    const eventCount = (await ctx.db.query("events").collect()).length;
    if (eventCount <= 2 && brands.length > 0) {
      const toyota = brands.find(b => b.slug === "toyota");
      const vw = brands.find(b => b.slug === "volkswagen");
      const chevrolet = brands.find(b => b.slug === "chevrolet");
      const ford = brands.find(b => b.slug === "ford");

      if (chevrolet) {
        await ctx.db.insert("events", {
          brandId: chevrolet._id,
          title: "Lanzamiento Chevrolet Equinox EV",
          slug: "lanzamiento-equinox-ev",
          description: "Se el primero en conocer el nuevo Equinox 100% electrico. Test drive exclusivo para miembros CarConnect.",
          coverImage: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800",
          location: "Chevrolet Center, Av. Italia 4567, Montevideo",
          eventDate: "2024-04-10",
          eventTime: "18:30",
          isPublic: true,
          requiresVerification: false,
          maxAttendees: 100,
        });
      }

      if (ford) {
        await ctx.db.insert("events", {
          brandId: ford._id,
          title: "Ford Ranger Experience - Offroad Day",
          slug: "ranger-experience-offroad",
          description: "Un dia completo de aventura offroad con instructores profesionales. Aprende tecnicas de manejo 4x4 en terrenos extremos.",
          coverImage: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
          location: "Estancia La Paz, Ruta 5 Km 120, Durazno",
          eventDate: "2024-04-20",
          eventTime: "08:00",
          isPublic: false,
          requiresVerification: true,
          maxAttendees: 30,
        });
      }

      // General events (no brand)
      await ctx.db.insert("events", {
        title: "Expo Auto Uruguay 2024",
        slug: "expo-auto-uruguay-2024",
        description: "La exposicion automotriz mas grande del pais. Todas las marcas, todos los modelos, en un solo lugar.",
        coverImage: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800",
        location: "Antel Arena, Montevideo",
        eventDate: "2024-05-15",
        eventTime: "10:00",
        isPublic: true,
        requiresVerification: false,
        maxAttendees: 5000,
      });

      await ctx.db.insert("events", {
        title: "Curso de Manejo Defensivo",
        slug: "curso-manejo-defensivo",
        description: "Aprende tecnicas de manejo seguro con instructores certificados. Ideal para conductores nuevos y experimentados.",
        coverImage: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800",
        location: "Autodromo Victor Borrat Fabini, El Pinar",
        eventDate: "2024-04-05",
        eventTime: "09:00",
        isPublic: true,
        requiresVerification: false,
        maxAttendees: 40,
      });

      if (toyota) {
        await ctx.db.insert("events", {
          brandId: toyota._id,
          title: "Toyota GR Experience",
          slug: "toyota-gr-experience",
          description: "Vivi la experiencia Gazoo Racing. Proba los modelos deportivos de Toyota: GR Corolla, GR86 y Supra.",
          coverImage: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
          location: "Autodromo de Rivera",
          eventDate: "2024-05-25",
          eventTime: "10:00",
          isPublic: false,
          requiresVerification: true,
          maxAttendees: 50,
        });
      }

      if (vw) {
        await ctx.db.insert("events", {
          brandId: vw._id,
          title: "VW Track Day - Punta del Este",
          slug: "vw-track-day-pde",
          description: "Lleva tu Golf GTI o cualquier VW al circuito y disfruta de una jornada de pista libre.",
          coverImage: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800",
          location: "Autodromo Eduardo Cabrera, Punta del Este",
          eventDate: "2024-06-08",
          eventTime: "08:30",
          isPublic: false,
          requiresVerification: true,
          maxAttendees: 25,
        });
      }
    }

    // ============ SAMPLE LEADS ============
    const existingLeads = await ctx.db.query("leads").first();
    const trims = await ctx.db.query("trims").collect();
    if (!existingLeads && trims.length > 0) {
      const sampleLeads = [
        { name: "Juan Rodriguez", email: "juan.rodriguez@email.com", phone: "099 123 456", department: "Montevideo", city: "Pocitos", status: "new" as const },
        { name: "Maria Gonzalez", email: "maria.g@email.com", phone: "098 765 432", department: "Canelones", city: "Ciudad de la Costa", status: "contacted" as const },
        { name: "Carlos Perez", email: "carlos.p@email.com", phone: "097 111 222", department: "Maldonado", city: "Punta del Este", status: "qualified" as const },
        { name: "Ana Martinez", email: "ana.m@email.com", phone: "096 333 444", department: "Montevideo", city: "Carrasco", status: "converted" as const },
        { name: "Pedro Silva", email: "pedro.s@email.com", phone: "095 555 666", department: "Colonia", city: "Colonia del Sacramento", status: "new" as const },
        { name: "Laura Fernandez", email: "laura.f@email.com", phone: "094 777 888", department: "Montevideo", city: "Centro", status: "contacted" as const },
        { name: "Diego Lopez", email: "diego.l@email.com", phone: "093 999 000", department: "Rocha", city: "La Paloma", status: "new" as const },
        { name: "Sofia Diaz", email: "sofia.d@email.com", phone: "092 111 333", department: "Montevideo", city: "Punta Carretas", status: "qualified" as const },
      ];

      for (let i = 0; i < sampleLeads.length; i++) {
        const lead = sampleLeads[i];
        const trim = trims[i % trims.length];
        await ctx.db.insert("leads", {
          carId: trim._id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          department: lead.department,
          city: lead.city,
          message: `Hola, estoy interesado en el ${trim.name}. Me gustaria recibir mas informacion sobre precio y disponibilidad.`,
          status: lead.status,
        });
      }
    }

    // ============ UPDATE SITE SETTINGS ============
    const heroImageSetting = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "hero_image"))
      .first();

    if (!heroImageSetting) {
      await ctx.db.insert("siteSettings", {
        key: "hero_image",
        value: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920",
      });
      await ctx.db.insert("siteSettings", {
        key: "hero_cta_text",
        value: "Explorar autos",
      });
      await ctx.db.insert("siteSettings", {
        key: "hero_cta_link",
        value: "/autos",
      });
      await ctx.db.insert("siteSettings", {
        key: "featured_brands_title",
        value: "Marcas destacadas",
      });
      await ctx.db.insert("siteSettings", {
        key: "footer_text",
        value: "CarConnect Uruguay - Tu plataforma para encontrar el auto perfecto",
      });
    }

    return {
      message: "All content seeded successfully!",
      seeded: {
        comments: !existingComments,
        communityPosts: !existingPosts,
        benefits: !existingBenefits,
        events: eventCount <= 2,
        leads: !existingLeads,
        settings: !heroImageSetting,
      }
    };
  },
});
