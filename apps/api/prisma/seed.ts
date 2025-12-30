import { PrismaClient, Area, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando sembrado masivo de datos...');

  // 1. Limpieza inicial (Opcional: descomentar si quieres borrar todo antes)
  // await prisma.answerLog.deleteMany();
  // await prisma.userProgress.deleteMany();
  // await prisma.question.deleteMany();
  // await prisma.topic.deleteMany();
  // await prisma.course.deleteMany();
  // await prisma.user.deleteMany();
  // await prisma.career.deleteMany();

 // ÁREA DE INGENIERÍAS (Proceso A)
  const ingenierias = [
    'Ingeniería Química',
    'Ingeniería Ambiental',
    'Ingeniería de Materiales',
    'Ingeniería Metalúrgica',
    'Ingeniería de Industrias Alimentarias',
    'Ingeniería de Sistemas',
    'Ingeniería Eléctrica',
    'Ingeniería Electrónica',
    'Ingeniería Mecánica',
    'Ingeniería Industrial',
    'Ciencia de la Computación', 
    'Ingeniería de Telecomunicaciones',
    'Ingeniería Geofísica',
    'Ingeniería Geológica',
    'Ingeniería de Minas',
    'Ingeniería Civil',
    'Ingeniería Sanitaria',
    'Física',        
    'Matemáticas',   
    'Química',       
    'Arquitectura'
  ];

  // ÁREA DE BIOMÉDICAS (Proceso B)
  const biomedicas = [
    'Biología',
    'Ciencias de la Nutrición',
    'Ingeniería Pesquera',
    'Medicina',
    'Enfermería',
    'Agronomía'
  ];

  // ÁREA DE SOCIALES (Proceso C)
  const sociales = [
    'Contabilidad',
    'Finanzas',
    'Economía',
    'Derecho',
    'Trabajo Social',
    'Antropología',
    'Turismo y Hotelería',
    'Sociología',
    'Historia',
    'Psicología',
    'Relaciones Industriales',
    'Ciencias de la Comunicación',
    'Filosofía',
    'Literatura y Lingüística',
    'Artes',
    'Administración',
    'Marketing',
    'Banca y Seguros',
    'Gestión', // Incluye Gestión Pública y Empresas
    'Ciencias de la Educación' // Engloba todas las especialidades del PDF
  ];

  // ---------------------------------------------------------
  // 2. INSERCIÓN INTELIGENTE (Upsert)
  // ---------------------------------------------------------
  
  console.log(`🏗️ Procesando ${ingenierias.length} carreras de Ingenierías...`);
  for (const name of ingenierias) {
    await prisma.career.upsert({
      where: { id: `ing-${name.replace(/\s+/g, '-').toLowerCase()}` }, // ID slug generado
      update: { name, area: Area.INGENIERIAS },
      create: { name, area: Area.INGENIERIAS },
    }).catch(() => prisma.career.create({ data: { name, area: Area.INGENIERIAS } }));
  }

  console.log(`🧬 Procesando ${biomedicas.length} carreras de Biomédicas...`);
  for (const name of biomedicas) {
    await prisma.career.upsert({
      where: { id: `bio-${name.replace(/\s+/g, '-').toLowerCase()}` },
      update: { name, area: Area.BIOMEDICAS },
      create: { name, area: Area.BIOMEDICAS },
    }).catch(() => prisma.career.create({ data: { name, area: Area.BIOMEDICAS } }));
  }

  console.log(`⚖️ Procesando ${sociales.length} carreras de Sociales...`);
  for (const name of sociales) {
    await prisma.career.upsert({
      where: { id: `soc-${name.replace(/\s+/g, '-').toLowerCase()}` },
      update: { name, area: Area.SOCIALES },
      create: { name, area: Area.SOCIALES },
    }).catch(() => prisma.career.create({ data: { name, area: Area.SOCIALES } }));
  }
  // ---------------------------------------------------------
  // 3. CURSOS COMPLETOS (Para todas las áreas)
  // ---------------------------------------------------------
  console.log('📚 Creando Cursos y Contenido Académico...');

  // Tipo para las preguntas del seed
  interface PreguntaSeed {
    difficulty: Difficulty;
    statement: string;
    options: { text: string; isCorrect: boolean }[];
    explanation: string;
  }

  // Función helper para crear cursos con temas y preguntas
  async function crearCurso(nombre: string, slug: string, icon: string, temas: { nombre: string; slug: string; preguntas: PreguntaSeed[] }[]) {
    const curso = await prisma.course.upsert({
      where: { slug },
      update: { name: nombre, iconUrl: icon },
      create: { name: nombre, slug, iconUrl: icon },
    });

    console.log(`  ✓ Curso: ${nombre}`);

    for (let i = 0; i < temas.length; i++) {
      const tema = temas[i];
      
      // Buscar si el tema ya existe
      const existingTopic = await prisma.topic.findFirst({
        where: { courseId: curso.id, slug: tema.slug },
      });

      const topicCreated = existingTopic 
        ? await prisma.topic.update({
            where: { id: existingTopic.id },
            data: { name: tema.nombre, order: i + 1 },
          })
        : await prisma.topic.create({
            data: {
              name: tema.nombre,
              slug: tema.slug,
              order: i + 1,
              courseId: curso.id,
            },
          });

      console.log(`    ↳ Tema: ${tema.nombre} (${tema.preguntas.length} preguntas)`);

      for (const pregunta of tema.preguntas) {
        await prisma.question.create({
          data: {
            topicId: topicCreated.id,
            difficulty: pregunta.difficulty,
            statement: pregunta.statement,
            options: pregunta.options,
            explanation: pregunta.explanation,
          },
        });
      }
    }
  }

  // ============================================================
  // RAZONAMIENTO MATEMÁTICO
  // ============================================================
  await crearCurso(
    'Razonamiento Matemático',
    'razonamiento-matematico',
    'https://img.icons8.com/color/48/math.png',
    [
      {
        nombre: 'Planteo de Ecuaciones',
        slug: 'planteo-ecuaciones',
        preguntas: [
          {
            difficulty: Difficulty.EASY,
            statement: 'Si $x + 5 = 10$, hallar $x$.',
            options: [
              { text: 'A) 3', isCorrect: false },
              { text: 'B) 5', isCorrect: true },
              { text: 'C) 7', isCorrect: false },
              { text: 'D) 10', isCorrect: false },
              { text: 'E) 15', isCorrect: false },
            ],
            explanation: 'Restando 5 a ambos lados: $x = 10 - 5 = 5$',
          },
          {
            difficulty: Difficulty.MEDIUM,
            statement: 'La suma de dos números consecutivos es 25. ¿Cuál es el mayor?',
            options: [
              { text: 'A) 11', isCorrect: false },
              { text: 'B) 12', isCorrect: false },
              { text: 'C) 13', isCorrect: true },
              { text: 'D) 14', isCorrect: false },
              { text: 'E) 15', isCorrect: false },
            ],
            explanation: 'Sean $x$ y $x+1$. Entonces $x + (x+1) = 25 \\Rightarrow 2x = 24 \\Rightarrow x = 12$. El mayor es $13$.',
          },
          {
            difficulty: Difficulty.HARD,
            statement: 'Un padre tiene 32 años más que su hijo. Dentro de 10 años, tendrá el doble de la edad de su hijo. ¿Cuántos años tiene el hijo ahora?',
            options: [
              { text: 'A) 18', isCorrect: false },
              { text: 'B) 20', isCorrect: false },
              { text: 'C) 22', isCorrect: true },
              { text: 'D) 24', isCorrect: false },
              { text: 'E) 26', isCorrect: false },
            ],
            explanation: 'Sea $h$ la edad del hijo. Entonces $(h+32) + 10 = 2(h+10) \\Rightarrow h = 22$',
          },
        ],
      },
      {
        nombre: 'Series Numéricas',
        slug: 'series-numericas',
        preguntas: [
          {
            difficulty: Difficulty.EASY,
            statement: '¿Qué número sigue en la serie: 2, 4, 6, 8, ...?',
            options: [
              { text: 'A) 9', isCorrect: false },
              { text: 'B) 10', isCorrect: true },
              { text: 'C) 11', isCorrect: false },
              { text: 'D) 12', isCorrect: false },
              { text: 'E) 14', isCorrect: false },
            ],
            explanation: 'La serie aumenta de 2 en 2. Siguiente: $8 + 2 = 10$',
          },
          {
            difficulty: Difficulty.MEDIUM,
            statement: 'Hallar el término que sigue: 1, 1, 2, 3, 5, 8, ...',
            options: [
              { text: 'A) 10', isCorrect: false },
              { text: 'B) 11', isCorrect: false },
              { text: 'C) 13', isCorrect: true },
              { text: 'D) 15', isCorrect: false },
              { text: 'E) 16', isCorrect: false },
            ],
            explanation: 'Serie de Fibonacci: cada término es la suma de los dos anteriores. $5 + 8 = 13$',
          },
        ],
      },
      {
        nombre: 'Conteo y Combinatoria',
        slug: 'conteo-combinatoria',
        preguntas: [
          {
            difficulty: Difficulty.MEDIUM,
            statement: '¿De cuántas formas se pueden ordenar 3 libros en un estante?',
            options: [
              { text: 'A) 3', isCorrect: false },
              { text: 'B) 6', isCorrect: true },
              { text: 'C) 8', isCorrect: false },
              { text: 'D) 9', isCorrect: false },
              { text: 'E) 12', isCorrect: false },
            ],
            explanation: 'Permutaciones de 3 elementos: $3! = 6$',
          },
          {
            difficulty: Difficulty.HARD,
            statement: '¿Cuántos números de 3 cifras diferentes se pueden formar con los dígitos 1, 2, 3, 4 y 5?',
            options: [
              { text: 'A) 30', isCorrect: false },
              { text: 'B) 40', isCorrect: false },
              { text: 'C) 50', isCorrect: false },
              { text: 'D) 60', isCorrect: true },
              { text: 'E) 125', isCorrect: false },
            ],
            explanation: 'Permutaciones de 5 tomados de 3: $P(5,3) = 5 \\times 4 \\times 3 = 60$',
          },
        ],
      },
    ]
  );

  // ============================================================
  // ÁLGEBRA
  // ============================================================
  await crearCurso(
    'Álgebra',
    'algebra',
    'https://img.icons8.com/color/48/calculator.png',
    [
      {
        nombre: 'Ecuaciones de Primer Grado',
        slug: 'ecuaciones-primer-grado',
        preguntas: [
          {
            difficulty: Difficulty.EASY,
            statement: 'Resolver: $2x - 4 = 10$',
            options: [
              { text: 'A) 5', isCorrect: false },
              { text: 'B) 6', isCorrect: false },
              { text: 'C) 7', isCorrect: true },
              { text: 'D) 8', isCorrect: false },
              { text: 'E) 9', isCorrect: false },
            ],
            explanation: '$2x = 14 \\Rightarrow x = 7$',
          },
          {
            difficulty: Difficulty.MEDIUM,
            statement: 'Resolver: $3(x - 2) = 2x + 5$',
            options: [
              { text: 'A) 9', isCorrect: false },
              { text: 'B) 10', isCorrect: false },
              { text: 'C) 11', isCorrect: true },
              { text: 'D) 12', isCorrect: false },
              { text: 'E) 13', isCorrect: false },
            ],
            explanation: '$3x - 6 = 2x + 5 \\Rightarrow x = 11$',
          },
        ],
      },
      {
        nombre: 'Productos Notables',
        slug: 'productos-notables',
        preguntas: [
          {
            difficulty: Difficulty.EASY,
            statement: 'Desarrollar: $(x + 3)^2$',
            options: [
              { text: 'A) $x^2 + 6x + 9$', isCorrect: true },
              { text: 'B) $x^2 + 9$', isCorrect: false },
              { text: 'C) $x^2 + 3x + 9$', isCorrect: false },
              { text: 'D) $x^2 + 6x + 6$', isCorrect: false },
              { text: 'E) $x^2 + 3x + 6$', isCorrect: false },
            ],
            explanation: '$(a+b)^2 = a^2 + 2ab + b^2 = x^2 + 6x + 9$',
          },
          {
            difficulty: Difficulty.MEDIUM,
            statement: 'Desarrollar: $(x - 5)(x + 5)$',
            options: [
              { text: 'A) $x^2 - 25$', isCorrect: true },
              { text: 'B) $x^2 + 25$', isCorrect: false },
              { text: 'C) $x^2 - 10x - 25$', isCorrect: false },
              { text: 'D) $x^2 + 10x + 25$', isCorrect: false },
              { text: 'E) $x^2 - 5$', isCorrect: false },
            ],
            explanation: 'Diferencia de cuadrados: $(a-b)(a+b) = a^2 - b^2 = x^2 - 25$',
          },
        ],
      },
      {
        nombre: 'Factorización',
        slug: 'factorizacion',
        preguntas: [
          {
            difficulty: Difficulty.MEDIUM,
            statement: 'Factorizar: $x^2 - 9$',
            options: [
              { text: 'A) $(x-3)^2$', isCorrect: false },
              { text: 'B) $(x+3)^2$', isCorrect: false },
              { text: 'C) $(x-3)(x+3)$', isCorrect: true },
              { text: 'D) $(x-9)(x+1)$', isCorrect: false },
              { text: 'E) $(x-1)(x+9)$', isCorrect: false },
            ],
            explanation: 'Diferencia de cuadrados: $a^2 - b^2 = (a-b)(a+b)$',
          },
          {
            difficulty: Difficulty.HARD,
            statement: 'Factorizar: $x^2 + 7x + 12$',
            options: [
              { text: 'A) $(x+3)(x+4)$', isCorrect: true },
              { text: 'B) $(x+2)(x+6)$', isCorrect: false },
              { text: 'C) $(x+1)(x+12)$', isCorrect: false },
              { text: 'D) $(x+7)(x+12)$', isCorrect: false },
              { text: 'E) $(x+5)(x+2)$', isCorrect: false },
            ],
            explanation: 'Buscamos dos números que sumen 7 y multipliquen 12: 3 y 4',
          },
        ],
      },
    ]
  );

  // ============================================================
  // GEOMETRÍA
  // ============================================================
  await crearCurso(
    'Geometría',
    'geometria',
    'https://img.icons8.com/color/48/geometry.png',
    [
      {
        nombre: 'Triángulos',
        slug: 'triangulos',
        preguntas: [
          {
            difficulty: Difficulty.EASY,
            statement: 'La suma de los ángulos internos de un triángulo es:',
            options: [
              { text: 'A) 90°', isCorrect: false },
              { text: 'B) 180°', isCorrect: true },
              { text: 'C) 270°', isCorrect: false },
              { text: 'D) 360°', isCorrect: false },
              { text: 'E) 540°', isCorrect: false },
            ],
            explanation: 'Teorema fundamental: la suma de ángulos internos de un triángulo es siempre 180°',
          },
          {
            difficulty: Difficulty.MEDIUM,
            statement: 'En un triángulo rectángulo, si un cateto mide 3 y otro mide 4, ¿cuánto mide la hipotenusa?',
            options: [
              { text: 'A) 5', isCorrect: true },
              { text: 'B) 6', isCorrect: false },
              { text: 'C) 7', isCorrect: false },
              { text: 'D) 10', isCorrect: false },
              { text: 'E) 12', isCorrect: false },
            ],
            explanation: 'Por el Teorema de Pitágoras: $c^2 = 3^2 + 4^2 = 9 + 16 = 25 \\Rightarrow c = 5$',
          },
        ],
      },
      {
        nombre: 'Áreas y Perímetros',
        slug: 'areas-perimetros',
        preguntas: [
          {
            difficulty: Difficulty.EASY,
            statement: 'El área de un cuadrado de lado 5 cm es:',
            options: [
              { text: 'A) 10 cm²', isCorrect: false },
              { text: 'B) 20 cm²', isCorrect: false },
              { text: 'C) 25 cm²', isCorrect: true },
              { text: 'D) 30 cm²', isCorrect: false },
              { text: 'E) 50 cm²', isCorrect: false },
            ],
            explanation: 'Área = $lado^2 = 5^2 = 25$ cm²',
          },
          {
            difficulty: Difficulty.MEDIUM,
            statement: 'El perímetro de un rectángulo de base 8 m y altura 3 m es:',
            options: [
              { text: 'A) 11 m', isCorrect: false },
              { text: 'B) 16 m', isCorrect: false },
              { text: 'C) 22 m', isCorrect: true },
              { text: 'D) 24 m', isCorrect: false },
              { text: 'E) 30 m', isCorrect: false },
            ],
            explanation: 'Perímetro = $2(base + altura) = 2(8 + 3) = 22$ m',
          },
        ],
      },
      {
        nombre: 'Circunferencia y Círculo',
        slug: 'circunferencia-circulo',
        preguntas: [
          {
            difficulty: Difficulty.MEDIUM,
            statement: 'El área de un círculo de radio 3 cm es: (usar $\\pi \\approx 3.14$)',
            options: [
              { text: 'A) 9.42 cm²', isCorrect: false },
              { text: 'B) 18.84 cm²', isCorrect: false },
              { text: 'C) 28.26 cm²', isCorrect: true },
              { text: 'D) 37.68 cm²', isCorrect: false },
              { text: 'E) 56.52 cm²', isCorrect: false },
            ],
            explanation: 'Área = $\\pi r^2 = 3.14 \\times 3^2 = 28.26$ cm²',
          },
        ],
      },
    ]
  );

  // ============================================================
  // QUÍMICA
  // ============================================================
  await crearCurso(
    'Química',
    'quimica',
    'https://img.icons8.com/color/48/chemistry.png',
    [
      {
        nombre: 'Estructura Atómica',
        slug: 'estructura-atomica',
        preguntas: [
          {
            difficulty: Difficulty.EASY,
            statement: 'El núcleo del átomo está formado por:',
            options: [
              { text: 'A) Protones y electrones', isCorrect: false },
              { text: 'B) Protones y neutrones', isCorrect: true },
              { text: 'C) Electrones y neutrones', isCorrect: false },
              { text: 'D) Solo protones', isCorrect: false },
              { text: 'E) Solo electrones', isCorrect: false },
            ],
            explanation: 'El núcleo atómico contiene protones (carga +) y neutrones (sin carga)',
          },
          {
            difficulty: Difficulty.MEDIUM,
            statement: 'Un átomo con 6 protones y 8 neutrones tiene un número de masa de:',
            options: [
              { text: 'A) 2', isCorrect: false },
              { text: 'B) 6', isCorrect: false },
              { text: 'C) 8', isCorrect: false },
              { text: 'D) 12', isCorrect: false },
              { text: 'E) 14', isCorrect: true },
            ],
            explanation: 'Número de masa = protones + neutrones = 6 + 8 = 14',
          },
        ],
      },
      {
        nombre: 'Tabla Periódica',
        slug: 'tabla-periodica',
        preguntas: [
          {
            difficulty: Difficulty.EASY,
            statement: 'El símbolo químico del Oxígeno es:',
            options: [
              { text: 'A) Ox', isCorrect: false },
              { text: 'B) O', isCorrect: true },
              { text: 'C) O2', isCorrect: false },
              { text: 'D) Og', isCorrect: false },
              { text: 'E) Oz', isCorrect: false },
            ],
            explanation: 'El símbolo del Oxígeno es simplemente O',
          },
          {
            difficulty: Difficulty.MEDIUM,
            statement: 'Los elementos del grupo 1 (metales alcalinos) tienen:',
            options: [
              { text: 'A) 1 electrón de valencia', isCorrect: true },
              { text: 'B) 2 electrones de valencia', isCorrect: false },
              { text: 'C) 3 electrones de valencia', isCorrect: false },
              { text: 'D) 7 electrones de valencia', isCorrect: false },
              { text: 'E) 8 electrones de valencia', isCorrect: false },
            ],
            explanation: 'Los metales alcalinos (grupo 1) tienen 1 electrón en su última capa',
          },
        ],
      },
      {
        nombre: 'Enlaces Químicos',
        slug: 'enlaces-quimicos',
        preguntas: [
          {
            difficulty: Difficulty.MEDIUM,
            statement: 'El enlace iónico se forma entre:',
            options: [
              { text: 'A) Dos metales', isCorrect: false },
              { text: 'B) Un metal y un no metal', isCorrect: true },
              { text: 'C) Dos no metales', isCorrect: false },
              { text: 'D) Gases nobles', isCorrect: false },
              { text: 'E) Dos gases nobles', isCorrect: false },
            ],
            explanation: 'El enlace iónico ocurre por transferencia de electrones entre un metal (dona) y un no metal (acepta)',
          },
        ],
      },
    ]
  );

  // ============================================================
  // FÍSICA
  // ============================================================
  await crearCurso(
    'Física',
    'fisica',
    'https://img.icons8.com/color/48/physics.png',
    [
      {
        nombre: 'Cinemática',
        slug: 'cinematica',
        preguntas: [
          {
            difficulty: Difficulty.EASY,
            statement: 'Si un auto viaja a 60 km/h durante 2 horas, ¿qué distancia recorre?',
            options: [
              { text: 'A) 30 km', isCorrect: false },
              { text: 'B) 60 km', isCorrect: false },
              { text: 'C) 120 km', isCorrect: true },
              { text: 'D) 180 km', isCorrect: false },
              { text: 'E) 240 km', isCorrect: false },
            ],
            explanation: 'Distancia = velocidad × tiempo = 60 km/h × 2 h = 120 km',
          },
          {
            difficulty: Difficulty.MEDIUM,
            statement: 'Un objeto en caída libre (g = 10 m/s²) tarda 3 segundos en caer. ¿Desde qué altura cayó?',
            options: [
              { text: 'A) 30 m', isCorrect: false },
              { text: 'B) 45 m', isCorrect: true },
              { text: 'C) 60 m', isCorrect: false },
              { text: 'D) 75 m', isCorrect: false },
              { text: 'E) 90 m', isCorrect: false },
            ],
            explanation: '$h = \\frac{1}{2}gt^2 = \\frac{1}{2} \\times 10 \\times 3^2 = 45$ m',
          },
        ],
      },
      {
        nombre: 'Leyes de Newton',
        slug: 'leyes-newton',
        preguntas: [
          {
            difficulty: Difficulty.EASY,
            statement: 'La Primera Ley de Newton también se conoce como:',
            options: [
              { text: 'A) Ley de la Inercia', isCorrect: true },
              { text: 'B) Ley de la Acción y Reacción', isCorrect: false },
              { text: 'C) Ley de la Gravedad', isCorrect: false },
              { text: 'D) Ley de la Energía', isCorrect: false },
              { text: 'E) Ley del Movimiento', isCorrect: false },
            ],
            explanation: 'La Primera Ley establece que un cuerpo permanece en reposo o movimiento uniforme a menos que actúe una fuerza (Inercia)',
          },
          {
            difficulty: Difficulty.MEDIUM,
            statement: 'Si aplicamos una fuerza de 20 N a un objeto de 5 kg, ¿cuál es su aceleración?',
            options: [
              { text: 'A) 2 m/s²', isCorrect: false },
              { text: 'B) 4 m/s²', isCorrect: true },
              { text: 'C) 5 m/s²', isCorrect: false },
              { text: 'D) 10 m/s²', isCorrect: false },
              { text: 'E) 15 m/s²', isCorrect: false },
            ],
            explanation: '$F = ma \\Rightarrow a = F/m = 20/5 = 4$ m/s²',
          },
        ],
      },
    ]
  );

  // ============================================================
  // BIOLOGÍA
  // ============================================================
  await crearCurso(
    'Biología',
    'biologia',
    'https://img.icons8.com/color/48/dna.png',
    [
      {
        nombre: 'La Célula',
        slug: 'la-celula',
        preguntas: [
          {
            difficulty: Difficulty.EASY,
            statement: 'La unidad básica de la vida es:',
            options: [
              { text: 'A) El átomo', isCorrect: false },
              { text: 'B) La molécula', isCorrect: false },
              { text: 'C) La célula', isCorrect: true },
              { text: 'D) El tejido', isCorrect: false },
              { text: 'E) El órgano', isCorrect: false },
            ],
            explanation: 'La célula es la unidad estructural y funcional más pequeña de los seres vivos',
          },
          {
            difficulty: Difficulty.MEDIUM,
            statement: 'Las mitocondrias son responsables de:',
            options: [
              { text: 'A) La fotosíntesis', isCorrect: false },
              { text: 'B) La producción de energía (ATP)', isCorrect: true },
              { text: 'C) La síntesis de proteínas', isCorrect: false },
              { text: 'D) El almacenamiento de agua', isCorrect: false },
              { text: 'E) La división celular', isCorrect: false },
            ],
            explanation: 'Las mitocondrias son las "centrales energéticas" de la célula, producen ATP mediante respiración celular',
          },
        ],
      },
      {
        nombre: 'Genética',
        slug: 'genetica',
        preguntas: [
          {
            difficulty: Difficulty.MEDIUM,
            statement: 'El ADN está formado por:',
            options: [
              { text: 'A) Aminoácidos', isCorrect: false },
              { text: 'B) Nucleótidos', isCorrect: true },
              { text: 'C) Lípidos', isCorrect: false },
              { text: 'D) Carbohidratos', isCorrect: false },
              { text: 'E) Proteínas', isCorrect: false },
            ],
            explanation: 'El ADN es un polímero formado por unidades llamadas nucleótidos (base nitrogenada + azúcar + fosfato)',
          },
          {
            difficulty: Difficulty.HARD,
            statement: 'En un cruce de dos heterocigotos (Aa × Aa), ¿qué proporción de descendencia será homocigota recesiva (aa)?',
            options: [
              { text: 'A) 1/4', isCorrect: true },
              { text: 'B) 1/2', isCorrect: false },
              { text: 'C) 3/4', isCorrect: false },
              { text: 'D) 1/3', isCorrect: false },
              { text: 'E) 2/3', isCorrect: false },
            ],
            explanation: 'Cuadro de Punnett: AA (1/4), Aa (2/4), aa (1/4). La proporción de aa es 1/4',
          },
        ],
      },
    ]
  );

  // ============================================================
  // LITERATURA
  // ============================================================
  await crearCurso(
    'Literatura',
    'literatura',
    'https://img.icons8.com/color/48/book.png',
    [
      {
        nombre: 'Literatura Universal',
        slug: 'literatura-universal',
        preguntas: [
          {
            difficulty: Difficulty.EASY,
            statement: '¿Quién escribió "Don Quijote de la Mancha"?',
            options: [
              { text: 'A) Gabriel García Márquez', isCorrect: false },
              { text: 'B) Miguel de Cervantes', isCorrect: true },
              { text: 'C) William Shakespeare', isCorrect: false },
              { text: 'D) Jorge Luis Borges', isCorrect: false },
              { text: 'E) Pablo Neruda', isCorrect: false },
            ],
            explanation: 'Miguel de Cervantes Saavedra es el autor de esta obra cumbre de la literatura española',
          },
          {
            difficulty: Difficulty.MEDIUM,
            statement: 'La obra "Cien Años de Soledad" pertenece al movimiento literario:',
            options: [
              { text: 'A) Romanticismo', isCorrect: false },
              { text: 'B) Realismo Mágico', isCorrect: true },
              { text: 'C) Modernismo', isCorrect: false },
              { text: 'D) Surrealismo', isCorrect: false },
              { text: 'E) Naturalismo', isCorrect: false },
            ],
            explanation: 'Gabriel García Márquez es uno de los máximos exponentes del Realismo Mágico latinoamericano',
          },
        ],
      },
      {
        nombre: 'Literatura Peruana',
        slug: 'literatura-peruana',
        preguntas: [
          {
            difficulty: Difficulty.MEDIUM,
            statement: '¿Quién escribió "Los Ríos Profundos"?',
            options: [
              { text: 'A) Mario Vargas Llosa', isCorrect: false },
              { text: 'B) César Vallejo', isCorrect: false },
              { text: 'C) José María Arguedas', isCorrect: true },
              { text: 'D) Ciro Alegría', isCorrect: false },
              { text: 'E) Julio Ramón Ribeyro', isCorrect: false },
            ],
            explanation: 'José María Arguedas es el autor de esta obra indigenista que retrata la cosmovisión andina',
          },
        ],
      },
    ]
  );

  // ============================================================
  // HISTORIA DEL PERÚ
  // ============================================================
  await crearCurso(
    'Historia del Perú',
    'historia-peru',
    'https://img.icons8.com/color/48/peru.png',
    [
      {
        nombre: 'Época Prehispánica',
        slug: 'epoca-prehispanica',
        preguntas: [
          {
            difficulty: Difficulty.EASY,
            statement: 'La capital del Imperio Inca fue:',
            options: [
              { text: 'A) Lima', isCorrect: false },
              { text: 'B) Cusco', isCorrect: true },
              { text: 'C) Arequipa', isCorrect: false },
              { text: 'D) Machu Picchu', isCorrect: false },
              { text: 'E) Ollantaytambo', isCorrect: false },
            ],
            explanation: 'Cusco (Qosqo en quechua: "ombligo del mundo") fue la capital del Tahuantinsuyo',
          },
          {
            difficulty: Difficulty.MEDIUM,
            statement: 'La cultura preinca conocida por sus líneas y geoglifos en el desierto es:',
            options: [
              { text: 'A) Chavín', isCorrect: false },
              { text: 'B) Moche', isCorrect: false },
              { text: 'C) Nazca', isCorrect: true },
              { text: 'D) Paracas', isCorrect: false },
              { text: 'E) Chimú', isCorrect: false },
            ],
            explanation: 'La cultura Nazca (200 a.C. - 600 d.C.) es famosa por las Líneas de Nazca, geoglifos monumentales',
          },
        ],
      },
      {
        nombre: 'Independencia del Perú',
        slug: 'independencia-peru',
        preguntas: [
          {
            difficulty: Difficulty.EASY,
            statement: '¿En qué año se proclamó la Independencia del Perú?',
            options: [
              { text: 'A) 1810', isCorrect: false },
              { text: 'B) 1821', isCorrect: true },
              { text: 'C) 1824', isCorrect: false },
              { text: 'D) 1830', isCorrect: false },
              { text: 'E) 1814', isCorrect: false },
            ],
            explanation: 'José de San Martín proclamó la Independencia del Perú el 28 de julio de 1821 en Lima',
          },
        ],
      },
    ]
  );

  console.log('✅ Base de datos poblada correctamente con cursos, temas y preguntas.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });