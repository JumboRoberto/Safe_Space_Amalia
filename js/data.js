// js/data.js - Base de Datos Emocional y de Recuerdos (Versión Definitiva 32 Fotos)

const database = {
    // MÓDULO DE INYECCIÓN DE DOPAMINA: Frases de validación y amor
    compliments: [
        "Admiro muchísimo tu inteligencia y la futura gran psicóloga que eres.",
        "Tienes la sonrisa que me reinicia el día por completo.",
        "Eres capaz de todo lo que te propongas, nunca lo dudes.",
        "Me encanta esa carita hermosa que tienes.",
        "Amo cuando logramos almorzar juntos en medio de nuestras locas rutinas.",
        "Gracias por ser mi lugar seguro cuando la ingeniería me satura.",
        "Tu capacidad para entender a los demás es un don increíble.",
        "Eres la mejor copiloto que podría existir.",
        "Me encanta cómo hacemos el equipo perfecto.",
        "Verte esforzarte en tus prácticas me hace sentir súper orgulloso de ti.",
        "Eres mi persona favorita para no hacer nada y para hacerlo todo.",
        "Me das paz cuando mi mente va a mil por hora.",
        "Amo nuestras charlas profundas y cómo arreglamos el mundo desde el sofá.",
        "Tu risa es literalmente mi sonido favorito en el mundo.",
        "Gracias por estar para mí siempre, pase lo que pase.",
        "No importa qué tan pesado esté el día, pensar en ti me alivia.",
        "Eres increíblemente fuerte y resiliente.",
        "Me encanta cómo me haces sentir que todo va a estar bien.",
        "Amo esa energía que le pones a nuestra relación.",
        "Tienes un corazón inmenso y hermoso.",
        "Eres mi pausa perfecta en el día.",
        "Admiro tu dedicación y cómo te apasiona lo que estudias.",
        "Cada vez que te veo llegar a nuestros almuerzos, me vuelvo a enamorar.",
        "Haces que los días grises tengan sentido.",
        "Gracias por tener tanta paciencia conmigo cuando estoy metido en simulaciones y códigos.",
        "Eres el mejor regalo que me ha dado la vida.",
        "Me inspiras a ser mejor persona cada día.",
        "Amo cómo podemos hablar de absolutamente todo sin filtros.",
        "Tu presencia es mi terapia favorita.",
        "Eres la mujer más hermosa, por dentro y por fuera."
    ],

    // MÓDULO DE BÓVEDA DE RECUERDOS: 32 Fotos Exactas
    memories: [
        {
            id: 1,
            title: "Mitad y mitad",
            description: "Una selfie diferente, solo con nuestras mitades. El encuadre perfecto de los dos.",
            image: "assets/img/foto1.jpeg" // Selfie cortada[cite: 1]
        },
        {
            id: 2,
            title: "Beso sorpresivo",
            description: "Ese beso tuyo en el cachete que me agarró por sorpresa y quedó para el recuerdo.",
            image: "assets/img/foto2.jpeg" // Danna besando a Roberto[cite: 1]
        },
        {
            id: 3,
            title: "Nuestro lugar seguro en Roblox",
            description: "Vagabundeando juntos por el mapa, tú de azul y yo de verde, sentados en nuestra banca en roblox jajaja.",
            image: "assets/img/foto3.jpeg" // Avatares de Roblox[cite: 1]
        },
        {
            id: 4,
            title: "Beso aplastante",
            description: "Ese beso donde literal te aplasté el cachete con mi nariz. De mis favoritos.",
            image: "assets/img/foto4.jpeg" // Roberto besando a Danna[cite: 1]
        },
        {
            id: 5,
            title: "Aventuras al aire libre",
            description: "En oña relajados en el pasto, debajo de ese árbol gigante que encontramos en la ruta del lago.",
            image: "assets/img/foto5.jpeg" // Bajo el árbol[cite: 1]
        },
        {
            id: 6,
            title: "Mi chica Peace",
            description: "Tú, divina como siempre, posando relajada haciendo el símbolo de paz a la cámara xd .",
            image: "assets/img/foto6.jpeg" // Danna haciendo símbolo de paz[cite: 1]
        },
        {
            id: 7,
            title: "Beso junto a la puerta",
            description: "Un beso tierno justo en la entrada. Tu perfil es simplemente perfecto.",
            image: "assets/img/foto7.jpeg" // Beso con puerta de madera[cite: 1]
        },
        {
            id: 8,
            title: "Expresiones sinceras",
            description: "Nuestra selfie chistosa desde abajo. Yo con cara de no entender nada y tú aguantando la risa.",
            image: "assets/img/foto8.jpeg" // Cara divertida[cite: 1]
        },
        {
            id: 9,
            title: "La Cascada (Plano completo)",
            description: "Los dos juntos frente a esa cascada inmensa. Un paisaje brutal a tu lado.",
            image: "assets/img/foto9.jpeg" // Frente a la cascada de lejos[cite: 1]
        },
        {
            id: 10,
            title: "Paciencia infinita",
            description: "Tú sentadita con tu chaqueta celeste, esperando paciente. Esa carita hermosa me mata.",
            image: "assets/img/foto10.jpeg" // Danna sentada en la pared de piedra[cite: 1]
        },
        {
            id: 11,
            title: "Selfie tras las mallas",
            description: "Una foto rápida en la calle, tú otra vez posando relajada con el símbolo de paz y tus uñas impecables.",
            image: "assets/img/foto11.jpeg" // Selfie en la malla[cite: 1]
        },
        {
            id: 12,
            title: "La Cascada (Medio cuerpo)",
            description: "Nuestra foto en la cascada, abrazándonos fuerte. Un recuerdo que me da muchísima paz.",
            image: "assets/img/foto12.jpeg" // Foto de cerca en la cascada[cite: 1]
        },
        {
            id: 13,
            title: "Beso de pico bajo el árbol",
            description: "Dejándome dar ese besito en el cachete bajo las hojas que tanto me gusta darte.",
            image: "assets/img/foto13.jpeg" // Beso bajo el árbol[cite: 1]
        },
        {
            id: 14,
            title: "Beso en la calle",
            description: "Un beso cariñoso en medio de la vereda con las casas de fondo, sin importar el resto.",
            image: "assets/img/foto14.jpeg" // Beso en la vereda[cite: 1]
        },
        {
            id: 15,
            title: "Abrazo por la espalda",
            description: "Yo sonriendo a la cámara y tú fundida en un abrazo por mi espalda que me reinicia la vida.",
            image: "assets/img/foto15.jpeg" // Danna abrazando de espaldas[cite: 1]
        },
        {
            id: 16,
            title: "Nuestra complicidad",
            description: "Juntitos contra la pared gris. Me encanta esta foto amorcito TE AMO.",
            image: "assets/img/foto16.jpeg" // Pared gris[cite: 1]
        },
        {
            id: 17,
            title: "Besito de restaurante",
            description: "Aprovechando nuestra salida para robarte un beso mientras tú cierras los ojitos.",
            image: "assets/img/foto17.jpeg" // Beso con camisa a rayas[cite: 1]
        },
        {
            id: 18,
            title: "Selfie de cita",
            description: "Nosotros relajados comiendo. Yo con mi buso que me regalaste y tú hermosa con tu blusa gris.",
            image: "assets/img/foto18.jpeg" // Restaurante[cite: 1]
        },
        {
            id: 19,
            title: "CITAA",
            description: "Otra foto más que me encanta que hasta de perfil tieness",
            image: "assets/img/foto19.jpeg" // Cabina de fotos en B/N[cite: 1]
        },
        {
            id: 20,
            title: "Blanco y Negro",
            description: "Una de nuestras primeras fotos  , me acuerdo que estaba muy nervioso ese dia",
            image: "assets/img/foto20.jpeg" // Ángulo contrapicado cama[cite: 1]
        },
        {
            id: 21,
            title: "Pequeñas versiones",
            description: "Nostros acostaditos amor siempre salgo feo yo :( pero tu estas hermosa como siempre.",
            image: "assets/img/foto21.jpeg" // Polaroid niños[cite: 1]
        },
        {
            id: 22,
            title: "Foto familiar",
            description: "Nuestras versiones chiquitas abrazadas. Quién diría que el destino nos iba a tener aquí hoy.",
            image: "assets/img/foto22.jpeg" // Foto con los niños y el panda[cite: 1]
        },
        {
            id: 23,
            title: "Foto familiar",
            description: "Nosotros si Dios quiere y tenemos una familia hasta con nuestro oso bebe jajaj",
            image: "assets/img/foto23.jpeg" // Acostados serios[cite: 1]
        },
        {
            id: 24,
            title: "Tu mirandome como siempre",
            description: "Me encanta tu carita hermosa mientras me miras",
            image: "assets/img/foto24.jpeg" // Roberto durmiendo en Danna[cite: 1]
        },
        {
            id: 25,
            title: "Mi almohada favorita",
            description: "Yo literal durmiéndome apoyado en ti. Estar en tus brazos es el mejor somnífero del planeta.",
            image: "assets/img/foto25.jpeg" // Danna besando a Roberto recostados[cite: 1]
        },
        {
            id: 26,
            title: "NOSOTROSSS",
            description: "Mi cara de borracho jajaj y tu tan preciosa",
            image: "assets/img/foto26.jpeg" // Caminando en la calle[cite: 1]
        },
        {
            id: 27,
            title: "Locuras compdas",
            description: "Una de nuestras fotos favoritas , ese dia me hiciste muy feliz y me senti muy especial contigo y tu familia.",
            image: "assets/img/foto27.jpeg" // Danna sacando la lengua[cite: 1]
        },
        {
            id: 28,
            title: "Beso en el camino",
            description: "Tu y yo bn juntos en Santa Isabel y así. TE AMO.",
            image: "assets/img/foto28.jpeg" // Beso con saco negro y rosa[cite: 1]
        },
        {
            id: 29,
            title: "Miradas que hablan",
            description: "A veces no necesitamos decir absolutamente nada para entendernos. Con solo vernos sé que somos el uno para el otro.",
            image: "assets/img/foto29.jpeg"
        },
        {
            id: 30,
            title: "Construyendo futuro",
            description: "Tirados juartintos, tú sacando la lengua de la forma más linda y yo disfrutando simplemente de estar ahí.",
            image: "assets/img/foto30.jpeg"
        },
        {
            id: 31,
            title: "Mi motor",
            description: "Me impulsas a nunca rendirme, incluso cuando los circuitos de ingeniería se complican o las cosas salen mal.",
            image: "assets/img/foto31.jpeg"
        },
        {
            id: 32,
            title: "Para siempre",
            description: "Este espacio es solo un pequeño recordatorio de que te amo hoy, mañana y siempre. Eres mi hogar definitivo, Amalia.",
            image: "assets/img/foto32.jpeg"
        }
    ]
};