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
    'Física',        // Fac. Cs Naturales
    'Matemáticas',   // Fac. Cs Naturales
    'Química',       // Fac. Cs Naturales
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
  // 3. CURSOS BÁSICOS (Ejemplo)
  // ---------------------------------------------------------
  // Creamos solo Razonamiento Matemático para probar
  const rm = await prisma.course.create({
    data: {
      name: 'Razonamiento Matemático',
      slug: 'razonamiento-matematico',
      iconUrl: 'https://img.icons8.com/color/48/math.png',
    },
  });

  // ---------------------------------------------------------
  // 4. PREGUNTAS DEMO
  // ---------------------------------------------------------
  const temaEcuaciones = await prisma.topic.create({
    data: {
      name: 'Planteo de Ecuaciones',
      slug: 'planteo-ecuaciones',
      order: 1,
      courseId: rm.id,
    },
  });

  await prisma.question.create({
    data: {
      topicId: temaEcuaciones.id,
      difficulty: Difficulty.MEDIUM,
      statement: 'Si $x + 5 = 10$, hallar $x$.',
      options: [
        { text: '3', isCorrect: false },
        { text: '5', isCorrect: true },
      ],
      explanation: 'Restando 5 a ambos lados...',
    },
  });

  console.log('✅ Base de datos poblada correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });