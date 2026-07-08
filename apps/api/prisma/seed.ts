import { PrismaClient, Area, Difficulty, QuestionType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function makeOptionId(index: number): string {
  return String.fromCharCode(97 + index); // a, b, c, d, e
}

async function main() {
  console.log('🌱 Iniciando sembrado masivo de datos...');

  // 1. Limpieza inicial (Opcional: descomentar si quieres borrar todo antes)
    await prisma.answerLog.deleteMany();
    await prisma.userProgress.deleteMany();
    await prisma.question.deleteMany();
    await prisma.examQuestion.deleteMany();
    await prisma.exam.deleteMany();
    await prisma.topic.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();
    await prisma.career.deleteMany();

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

  // Tipo para las preguntas del seed (solo opción múltiple por ahora)
  interface PreguntaSeed {
    difficulty: Difficulty;
    statement: string;
    options: { text: string; isCorrect: boolean }[];
    explanation: string;
  }

  interface MatchingPairSeed {
    left: string;
    right: string;
  }

  type SummaryBlockSeed =
    | { type: 'HEADING'; level: 1 | 2 | 3; text: string }
    | { type: 'PARAGRAPH'; text: string }
    | { type: 'FORMULA'; latex: string; label?: string }
    | { type: 'KEY_POINTS'; items: { title: string; text: string }[] }
    | { type: 'TIP'; title?: string; text: string; variant?: 'exam' | 'memory' | 'warning' }
    | { type: 'IMAGE'; src: string; alt: string; caption?: string }
    | { type: 'CALLOUT'; title?: string; text: string; tone?: 'info' | 'success' | 'warning' | 'danger' }
    | { type: 'RESOURCES'; title?: string; items: { title: string; url: string; description?: string }[] }
    | { type: 'TABLE'; title?: string; headers: string[]; rows: string[][] }
    | { type: 'STEPS'; items: { title: string; text: string }[] }
    | { type: 'DEFINITION'; term: string; definition: string }
    | { type: 'EXAMPLE'; title?: string; problem: string; solution: string }
    | { type: 'QUOTE'; text: string; author?: string };

  interface TemaSeed {
    nombre: string;
    slug: string;
    preguntas: PreguntaSeed[];
    matching?: MatchingPairSeed[];
    summary?: SummaryBlockSeed[];
  }

  function buildMultipleChoiceContent(options: PreguntaSeed['options']) {
    return {
      type: QuestionType.MULTIPLE_CHOICE,
      options: options.map((o, i) => ({
        id: makeOptionId(i),
        text: o.text,
        isCorrect: o.isCorrect,
      })),
    };
  }

  function buildMatchingContent(pairs: MatchingPairSeed[]) {
    return {
      type: QuestionType.MATCHING,
      pairs: pairs.map((p, i) => ({
        id: `m-${makeOptionId(i)}`,
        left: p.left,
        right: p.right,
      })),
    };
  }

  function generarPreguntasPlaceholder(
    temaNombre: string,
    temaNumero: number,
    cantidad: number
  ): PreguntaSeed[] {
    return Array.from({ length: cantidad }, (_, i) => {
      const n = i + 1;
      return {
        difficulty: [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD][n % 3],
        statement: `${temaNombre}, Biología - Pregunta ${n}`,
        options: [
          { text: 'Alternativa incorrecta 1', isCorrect: false },
          { text: 'Alternativa incorrecta 2', isCorrect: false },
          { text: 'Alternativa correcta', isCorrect: true },
          { text: 'Alternativa incorrecta 3', isCorrect: false },
          { text: 'Alternativa incorrecta 4', isCorrect: false },
        ],
        explanation: `Respuesta de prueba para ${temaNombre}, pregunta ${n}.`,
      };
    });
  }

  function generarMatchingPlaceholder(temaNombre: string): MatchingPairSeed[] {
    return [
      { left: `Concepto clave 1 de ${temaNombre}`, right: 'Definición correspondiente 1' },
      { left: `Concepto clave 2 de ${temaNombre}`, right: 'Definición correspondiente 2' },
      { left: `Concepto clave 3 de ${temaNombre}`, right: 'Definición correspondiente 3' },
      { left: `Concepto clave 4 de ${temaNombre}`, right: 'Definición correspondiente 4' },
    ];
  }

  function buildTrueFalseContent(
    correctSide: 'left' | 'right',
    cardText: string,
    leftLabel = 'Falso',
    rightLabel = 'Verdadero'
  ) {
    return {
      type: QuestionType.TRUE_FALSE_SWIPE,
      category: {
        left: { label: leftLabel, color: '#ff4b4b', darkColor: '#df2b2b' },
        right: { label: rightLabel, color: '#58cc02', darkColor: '#58a700' },
      },
      correctSide,
      cardText,
    };
  }

  function buildFillInBlankContent(
    sentence: string,
    bank: { id: string; text: string }[],
    correctWordIds: string[]
  ) {
    return {
      type: QuestionType.FILL_IN_BLANK,
      sentence,
      bank,
      correctWordIds,
    };
  }

  function generarTrueFalsePlaceholder(temaNombre: string) {
    const opciones = [
      {
        statement: 'Clasifica la siguiente afirmación como verdadera o falsa.',
        cardText: `El tema "${temaNombre}" no es evaluado en el examen de admisión UNSA.`,
        correctSide: 'left' as const,
        explanation: 'Todos los temas del plan de estudios pueden aparecer en el examen.',
      },
      {
        statement: 'Desliza la tarjeta hacia la categoría correcta.',
        cardText: `Es importante repasar "${temaNombre}" para el examen de admisión UNSA.`,
        correctSide: 'right' as const,
        explanation: 'Sí es un tema relevante para la preparación.',
      },
    ];
    return opciones[temaNombre.length % opciones.length];
  }

  function generarFillInBlankPlaceholder(temaNombre: string) {
    return {
      statement: 'Completa la oración con las palabras correctas del banco.',
      sentence: `El estudio de [slot] permite comprender las [slot] en el tema de ${temaNombre}.`,
      bank: [
        { id: 'f-a', text: 'conceptos' },
        { id: 'f-b', text: 'relaciones' },
        { id: 'f-c', text: 'fórmulas' },
        { id: 'f-d', text: 'ejemplos' },
      ],
      correctWordIds: ['f-a', 'f-b'],
    };
  }

  function buildOrderingContent(
    items: { id: string; text: string }[],
    correctOrder: string[]
  ) {
    return {
      type: QuestionType.ORDERING,
      items,
      correctOrder,
    };
  }

  function generarOrderingPlaceholder(temaNombre: string) {
    return {
      statement: 'Ordena los siguientes pasos arrastrándolos.',
      items: [
        { id: 'o-a', text: `Paso inicial sobre ${temaNombre}` },
        { id: 'o-b', text: `Desarrollo de ${temaNombre}` },
        { id: 'o-c', text: `Aplicación de ${temaNombre}` },
        { id: 'o-d', text: `Conclusión de ${temaNombre}` },
      ],
      correctOrder: ['o-a', 'o-b', 'o-c', 'o-d'],
      explanation: `El orden correcto muestra la secuencia lógica del tema ${temaNombre}.`,
    };
  }

  // Función helper para crear cursos con temas y preguntas
  const DEFAULT_NODE_SIZE = 7;

  async function crearCurso(nombre: string, slug: string, icon: string, temas: TemaSeed[]) {
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

      const topicData = {
        name: tema.nombre,
        slug: tema.slug,
        order: i + 1,
        summary: tema.summary ? (tema.summary as any) : undefined,
        nodeSize: DEFAULT_NODE_SIZE,
        nodeCount: Math.max(1, Math.ceil(tema.preguntas.length / DEFAULT_NODE_SIZE)),
      };

      const topicCreated = existingTopic
        ? await prisma.topic.update({
            where: { id: existingTopic.id },
            data: topicData,
          })
        : await prisma.topic.create({
            data: {
              ...topicData,
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
            type: QuestionType.MULTIPLE_CHOICE,
            content: buildMultipleChoiceContent(pregunta.options),
            explanation: pregunta.explanation,
          },
        });
      }

      const matchingPairs = tema.matching ?? generarMatchingPlaceholder(tema.nombre);
      if (matchingPairs.length >= 2) {
        await prisma.question.create({
          data: {
            topicId: topicCreated.id,
            difficulty: Difficulty.MEDIUM,
            statement: 'Relaciona cada concepto de la columna izquierda con su correspondiente de la derecha.',
            type: QuestionType.MATCHING,
            content: buildMatchingContent(matchingPairs),
          },
        });
      }

      const tfPlaceholder = generarTrueFalsePlaceholder(tema.nombre);
      await prisma.question.create({
        data: {
          topicId: topicCreated.id,
          difficulty: Difficulty.MEDIUM,
          statement: tfPlaceholder.statement,
          type: QuestionType.TRUE_FALSE_SWIPE,
          content: buildTrueFalseContent(
            tfPlaceholder.correctSide,
            tfPlaceholder.cardText,
            'Falso',
            'Verdadero'
          ),
          explanation: tfPlaceholder.explanation,
        },
      });

      const fibPlaceholder = generarFillInBlankPlaceholder(tema.nombre);
      await prisma.question.create({
        data: {
          topicId: topicCreated.id,
          difficulty: Difficulty.MEDIUM,
          statement: fibPlaceholder.statement,
          type: QuestionType.FILL_IN_BLANK,
          content: buildFillInBlankContent(
            fibPlaceholder.sentence,
            fibPlaceholder.bank,
            fibPlaceholder.correctWordIds
          ),
        },
      });

      const orderingPlaceholder = generarOrderingPlaceholder(tema.nombre);
      await prisma.question.create({
        data: {
          topicId: topicCreated.id,
          difficulty: Difficulty.MEDIUM,
          statement: orderingPlaceholder.statement,
          type: QuestionType.ORDERING,
          content: buildOrderingContent(
            orderingPlaceholder.items,
            orderingPlaceholder.correctOrder
          ),
          explanation: orderingPlaceholder.explanation,
        },
      });
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
        summary: [
          { type: 'HEADING', level: 1, text: 'Planteo de Ecuaciones' },
          { type: 'PARAGRAPH', text: 'El planteo de ecuaciones transforma situaciones cotidianas en lenguaje algebraico. Identificar la incógnita y traducir las relaciones del problema es la clave para resolverlo.' },
          { type: 'IMAGE', src: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80', alt: 'Ecuaciones en un pizarrón', caption: 'Traducir palabras a símbolos es el primer paso.' },
          { type: 'STEPS', items: [
            { title: 'Lee el enunciado', text: 'Entiende qué situación describe y qué te piden calcular.' },
            { title: 'Define la incógnita', text: 'Asigna una letra a la cantidad desconocida.' },
            { title: 'Plante la ecuación', text: 'Convierte las relaciones del problema en una igualdad algebraica.' },
            { title: 'Resuelve y verifica', text: 'Despeja la incógnita y comprueba el resultado en el contexto.' },
          ]},
          { type: 'EXAMPLE', title: 'Edades de padre e hijo', problem: 'Un padre tiene 32 años más que su hijo. Dentro de 10 años, el padre tendrá el doble de la edad de su hijo. ¿Cuántos años tiene el hijo ahora?', solution: 'Sea $h$ la edad del hijo. Entonces $(h+32)+10 = 2(h+10) \\Rightarrow h = 22$.' },
          { type: 'FORMULA', latex: 'x = \\frac{c - b}{a}', label: 'Fórmula clave' },
          { type: 'TIP', title: 'Tip de examen', text: 'Lee el problema dos veces: una para entender la situación y otra para extraer los datos numéricos.', variant: 'exam' },
          { type: 'RESOURCES', title: 'Aprende más', items: [
            { title: 'Planteo de ecuaciones paso a paso', url: 'https://www.youtube.com/results?search_query=planteo+de+ecuaciones+preuniversitario', description: 'Videos explicativos de YouTube.' },
          ]},
        ],
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
        summary: [
          { type: 'HEADING', level: 1, text: 'Ecuaciones de Primer Grado' },
          { type: 'DEFINITION', term: 'Ecuación de primer grado', definition: 'Igualdad algebraica en la que la incógnita tiene exponente 1 y se cumple para un único valor.' },
          { type: 'PARAGRAPH', text: 'Una ecuación de primer grado con una incógnita expresa una igualdad que se cumple para un único valor de la variable. Su resolución se basa en operaciones inversas.' },
          { type: 'FORMULA', latex: 'ax + b = c \\Rightarrow x = \\frac{c - b}{a}', label: 'Despeje de x' },
          { type: 'EXAMPLE', title: 'Con paréntesis', problem: 'Resuelve $3(x - 2) = 2x + 5$.', solution: 'Distribuye: $3x - 6 = 2x + 5$. Resta $2x$ y suma 6: $x = 11$.' },
          { type: 'KEY_POINTS', items: [
            { title: 'Aislar la variable', text: 'Usa suma/resta para dejar la x en un solo lado.' },
            { title: 'Simplifica coeficientes', text: 'Divide o multiplica para obtener x = valor.' },
            { title: 'Comprueba', text: 'Sustituye en la ecuación original para validar.' },
          ]},
          { type: 'TIP', title: 'Memotécnica', text: '"Lo que suma pasa restando, lo que multiplica pasa dividiendo."', variant: 'memory' },
          { type: 'CALLOUT', title: 'Importante', text: 'Si hay paréntesis, elimínalos primero distribuyendo antes de despejar la variable.', tone: 'info' },
          { type: 'RESOURCES', title: 'Refuerza', items: [
            { title: 'Ecuaciones de primer grado - Khan Academy', url: 'https://es.wikipedia.org/wiki/Ecuaci%C3%B3n_de_primer_grado', description: 'Teoría, ejemplos y ejercicios.' },
          ]},
        ],
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
        summary: [
          { type: 'HEADING', level: 1, text: 'Triángulos' },
          { type: 'DEFINITION', term: 'Triángulo', definition: 'Polígono de tres lados y tres ángulos; es la figura geométrica más estable.' },
          { type: 'IMAGE', src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80', alt: 'Triángulos geométricos', caption: 'El polígono más simple y estable.' },
          { type: 'FORMULA', latex: '\\angle A + \\angle B + \\angle C = 180^\\circ', label: 'Suma de ángulos internos' },
          { type: 'TABLE', title: 'Clasificación de triángulos', headers: ['Por lados', 'Por ángulos'], rows: [
            ['Equilátero: 3 iguales', 'Acutángulo: todos < 90°'],
            ['Isósceles: 2 iguales', 'Rectángulo: uno = 90°'],
            ['Escaleno: todos distintos', 'Obtusángulo: uno > 90°'],
          ]},
          { type: 'KEY_POINTS', items: [
            { title: 'Suma de ángulos internos', text: 'Siempre suman 180°.' },
            { title: 'Desigualdad triangular', text: 'Un lado siempre es menor que la suma de los otros dos.' },
          ]},
          { type: 'CALLOUT', title: 'Recuerda', text: 'En un triángulo rectángulo no olvides el Teorema de Pitágoras y las razones trigonométricas.', tone: 'warning' },
          { type: 'TIP', title: 'Tip de examen', text: 'Marca los ángulos y lados conocidos en la figura antes de aplicar cualquier fórmula.', variant: 'exam' },
          { type: 'RESOURCES', title: 'Recursos visuales', items: [
            { title: 'Triángulos en Wikipedia', url: 'https://es.wikipedia.org/wiki/Tri%C3%A1ngulo', description: 'Definiciones, clasificación y propiedades.' },
          ]},
        ],
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
        summary: [
          { type: 'HEADING', level: 1, text: 'Estructura Atómica' },
          { type: 'DEFINITION', term: 'Átomo', definition: 'Unidad más pequeña de un elemento químico que conserva sus propiedades, formado por protones, neutrones y electrones.' },
          { type: 'PARAGRAPH', text: 'La estructura atómica explica la composición de la materia a partir de protones, neutrones y electrones organizados en niveles de energía.' },
          { type: 'TABLE', title: 'Partículas subatómicas', headers: ['Partícula', 'Carga', 'Ubicación'], rows: [
            ['Protón', '+1', 'Núcleo'],
            ['Neutrón', '0', 'Núcleo'],
            ['Electrón', '−1', 'Nube electrónica'],
          ]},
          { type: 'FORMULA', latex: 'A = Z + N', label: 'Número de masa' },
          { type: 'IMAGE', src: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80', alt: 'Modelo atómico', caption: 'El núcleo concentra la mayor parte de la masa.' },
          { type: 'KEY_POINTS', items: [
            { title: 'Número de masa', text: 'Suma de protones y neutrones del núcleo.' },
            { title: 'Configuración electrónica', text: 'Distribución de electrones en niveles o subniveles.' },
          ]},
          { type: 'TIP', title: 'Memotécnica', text: 'En un átomo neutro: protones = electrones. Los iones pierden o ganan electrones, no protones.', variant: 'memory' },
          { type: 'RESOURCES', title: 'Lee más', items: [
            { title: 'Estructura atómica en Wikipedia', url: 'https://es.wikipedia.org/wiki/Estructura_at%C3%B3mica', description: 'Historia, modelos y partículas.' },
          ]},
        ],
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
  // FÍSICA — Curso de pruebas con muchos nodos
  // ============================================================
  await crearCurso(
    'Física',
    'fisica',
    'https://img.icons8.com/color/48/physics.png',
    [
      {
        nombre: 'Cinemática',
        slug: 'cinematica',
        summary: [
          { type: 'HEADING', level: 1, text: 'Cinemática' },
          { type: 'DEFINITION', term: 'Cinemática', definition: 'Rama de la física que describe el movimiento sin explicar sus causas.' },
          { type: 'PARAGRAPH', text: 'La cinemática describe el movimiento de los cuerpos sin considerar las causas que lo producen. Se basa en magnitudes como posición, velocidad y aceleración.' },
          { type: 'FORMULA', latex: 'v = v_0 + at \\quad ; \\quad d = v_0t + \\frac{1}{2}at^2', label: 'MRU y MRUV' },
          { type: 'EXAMPLE', title: 'Caída libre', problem: 'Un objeto en caída libre ($g = 10 \\text{ m/s}^2$) tarda 3 s en caer. ¿Desde qué altura cayó?', solution: '$h = \\frac{1}{2}gt^2 = \\frac{1}{2} \\cdot 10 \\cdot 3^2 = 45$ m.' },
          { type: 'KEY_POINTS', items: [
            { title: 'Velocidad media', text: 'Cociente entre desplazamiento y tiempo transcurrido.' },
            { title: 'MRU', text: 'Velocidad constante.' },
            { title: 'MRUV', text: 'Aceleración constante.' },
          ]},
          { type: 'CALLOUT', title: 'Cuidado con los signos', text: 'Si un cuerpo frena, su aceleración tiene signo opuesto a la velocidad.', tone: 'danger' },
          { type: 'TIP', title: 'Tip de examen', text: 'Dibuja el esquema del problema y elige un sentido positivo antes de aplicar las fórmulas.', variant: 'exam' },
          { type: 'RESOURCES', title: 'Videos recomendados', items: [
            { title: 'Cinemática básica', url: 'https://www.youtube.com/results?search_query=cinematica+basica+fisica', description: 'Playlist introductoria de YouTube.' },
          ]},
        ],
        preguntas: [
          { difficulty: Difficulty.EASY, statement: 'Si un auto viaja a 60 km/h durante 2 horas, ¿qué distancia recorre?', options: [{ text: 'A) 30 km', isCorrect: false }, { text: 'B) 60 km', isCorrect: false }, { text: 'C) 120 km', isCorrect: true }, { text: 'D) 180 km', isCorrect: false }, { text: 'E) 240 km', isCorrect: false }], explanation: 'Distancia = velocidad × tiempo = 60 km/h × 2 h = 120 km' },
          { difficulty: Difficulty.MEDIUM, statement: 'Un objeto en caída libre (g = 10 m/s²) tarda 3 segundos en caer. ¿Desde qué altura cayó?', options: [{ text: 'A) 30 m', isCorrect: false }, { text: 'B) 45 m', isCorrect: true }, { text: 'C) 60 m', isCorrect: false }, { text: 'D) 75 m', isCorrect: false }, { text: 'E) 90 m', isCorrect: false }], explanation: '$h = \\frac{1}{2}gt^2 = \\frac{1}{2} \\times 10 \\times 3^2 = 45$ m' },
          { difficulty: Difficulty.EASY, statement: '¿A qué velocidad llega un objeto en caída libre (g = 10 m/s²) después de 2 segundos?', options: [{ text: 'A) 5 m/s', isCorrect: false }, { text: 'B) 10 m/s', isCorrect: false }, { text: 'C) 20 m/s', isCorrect: true }, { text: 'D) 40 m/s', isCorrect: false }, { text: 'E) 200 m/s', isCorrect: false }], explanation: '$v = gt = 10 \\times 2 = 20$ m/s' },
          { difficulty: Difficulty.MEDIUM, statement: 'Un auto parte del reposo y alcanza 20 m/s en 4 segundos. ¿Cuál es su aceleración?', options: [{ text: 'A) 2 m/s²', isCorrect: false }, { text: 'B) 4 m/s²', isCorrect: false }, { text: 'C) 5 m/s²', isCorrect: true }, { text: 'D) 8 m/s²', isCorrect: false }, { text: 'E) 10 m/s²', isCorrect: false }], explanation: '$a = \\Delta v / \\Delta t = (20 - 0)/4 = 5$ m/s²' },
          { difficulty: Difficulty.MEDIUM, statement: 'Un móvil tiene velocidad inicial 4 m/s y acelera a 2 m/s² durante 5 s. ¿Qué desplazamiento recorre?', options: [{ text: 'A) 20 m', isCorrect: false }, { text: 'B) 35 m', isCorrect: false }, { text: 'C) 45 m', isCorrect: true }, { text: 'D) 50 m', isCorrect: false }, { text: 'E) 60 m', isCorrect: false }], explanation: '$d = v_0t + \\frac{1}{2}at^2 = 4(5) + \\frac{1}{2}(2)(25) = 20 + 25 = 45$ m' },
          { difficulty: Difficulty.EASY, statement: 'Un atleta recorre 100 m en 20 s. ¿Cuál es su velocidad media?', options: [{ text: 'A) 2 m/s', isCorrect: false }, { text: 'B) 4 m/s', isCorrect: false }, { text: 'C) 5 m/s', isCorrect: true }, { text: 'D) 10 m/s', isCorrect: false }, { text: 'E) 20 m/s', isCorrect: false }], explanation: '$v_m = d/t = 100/20 = 5$ m/s' },
          { difficulty: Difficulty.EASY, statement: 'Convertir 36 km/h a m/s.', options: [{ text: 'A) 6 m/s', isCorrect: false }, { text: 'B) 10 m/s', isCorrect: true }, { text: 'C) 12 m/s', isCorrect: false }, { text: 'D) 15 m/s', isCorrect: false }, { text: 'E) 36 m/s', isCorrect: false }], explanation: '$36 \\times \\frac{1000}{3600} = 10$ m/s' },
          { difficulty: Difficulty.MEDIUM, statement: 'Un auto frena uniformemente desde 20 m/s hasta detenerse en 4 s. ¿Qué distancia recorre?', options: [{ text: 'A) 20 m', isCorrect: false }, { text: 'B) 30 m', isCorrect: false }, { text: 'C) 40 m', isCorrect: true }, { text: 'D) 60 m', isCorrect: false }, { text: 'E) 80 m', isCorrect: false }], explanation: '$d = \\frac{v_0+v_f}{2}t = \\frac{20+0}{2} \\times 4 = 40$ m' },
          { difficulty: Difficulty.EASY, statement: '¿Qué distancia recorre un objeto en caída libre durante 4 s (g = 10 m/s²)?', options: [{ text: 'A) 40 m', isCorrect: false }, { text: 'B) 60 m', isCorrect: false }, { text: 'C) 80 m', isCorrect: true }, { text: 'D) 100 m', isCorrect: false }, { text: 'E) 160 m', isCorrect: false }], explanation: '$h = \\frac{1}{2}gt^2 = \\frac{1}{2} \\times 10 \\times 16 = 80$ m' },
          { difficulty: Difficulty.MEDIUM, statement: 'Se lanza una pelota verticalmente hacia arriba con velocidad inicial 30 m/s (g = 10 m/s²). ¿Cuánto tarda en llegar a su altura máxima?', options: [{ text: 'A) 1 s', isCorrect: false }, { text: 'B) 2 s', isCorrect: false }, { text: 'C) 3 s', isCorrect: true }, { text: 'D) 4 s', isCorrect: false }, { text: 'E) 6 s', isCorrect: false }], explanation: '$t = v_0/g = 30/10 = 3$ s' },
          { difficulty: Difficulty.MEDIUM, statement: '¿Cuál es la altura máxima alcanzada por la pelota del problema anterior?', options: [{ text: 'A) 30 m', isCorrect: false }, { text: 'B) 45 m', isCorrect: true }, { text: 'C) 60 m', isCorrect: false }, { text: 'D) 90 m', isCorrect: false }, { text: 'E) 120 m', isCorrect: false }], explanation: '$h_{max} = \\frac{v_0^2}{2g} = \\frac{900}{20} = 45$ m' },
          { difficulty: Difficulty.EASY, statement: 'Si la velocidad de un móvil es constante, su aceleración es:', options: [{ text: 'A) Positiva', isCorrect: false }, { text: 'B) Negativa', isCorrect: false }, { text: 'C) Cero', isCorrect: true }, { text: 'D) Variable', isCorrect: false }, { text: 'E) Igual a la velocidad', isCorrect: false }], explanation: 'En MRU la velocidad no cambia, por lo tanto la aceleración es cero.' },
          { difficulty: Difficulty.MEDIUM, statement: 'Una persona camina 50 m al este y luego 30 m al oeste. ¿Cuál es su desplazamiento neto?', options: [{ text: 'A) 80 m al este', isCorrect: false }, { text: 'B) 20 m al oeste', isCorrect: false }, { text: 'C) 20 m al este', isCorrect: true }, { text: 'D) 50 m al este', isCorrect: false }, { text: 'E) 30 m al oeste', isCorrect: false }], explanation: '$50 - 30 = 20$ m hacia el este.' },
          { difficulty: Difficulty.EASY, statement: 'Un tren se mueve a 15 m/s durante 10 s. ¿Qué distancia recorre?', options: [{ text: 'A) 100 m', isCorrect: false }, { text: 'B) 150 m', isCorrect: true }, { text: 'C) 200 m', isCorrect: false }, { text: 'D) 250 m', isCorrect: false }, { text: 'E) 25 m', isCorrect: false }], explanation: '$d = vt = 15 \\times 10 = 150$ m' },
          { difficulty: Difficulty.MEDIUM, statement: 'Un auto acelera desde el reposo a 3 m/s² durante 6 s. ¿Qué distancia recorre?', options: [{ text: 'A) 18 m', isCorrect: false }, { text: 'B) 36 m', isCorrect: false }, { text: 'C) 54 m', isCorrect: true }, { text: 'D) 72 m', isCorrect: false }, { text: 'E) 90 m', isCorrect: false }], explanation: '$d = \\frac{1}{2}at^2 = \\frac{1}{2} \\times 3 \\times 36 = 54$ m' },
          { difficulty: Difficulty.EASY, statement: '¿Cuánto tiempo tarda un avión en recorrer 1000 m a 250 m/s?', options: [{ text: 'A) 2 s', isCorrect: false }, { text: 'B) 4 s', isCorrect: true }, { text: 'C) 5 s', isCorrect: false }, { text: 'D) 10 s', isCorrect: false }, { text: 'E) 20 s', isCorrect: false }], explanation: '$t = d/v = 1000/250 = 4$ s' },
          { difficulty: Difficulty.MEDIUM, statement: 'En un gráfico velocidad-tiempo, la aceleración se representa por:', options: [{ text: 'A) El área bajo la curva', isCorrect: false }, { text: 'B) La pendiente de la curva', isCorrect: true }, { text: 'C) La ordenada al origen', isCorrect: false }, { text: 'D) El intercepto con el eje x', isCorrect: false }, { text: 'E) La velocidad máxima', isCorrect: false }], explanation: 'La pendiente en un gráfico v-t representa la aceleración.' },
          { difficulty: Difficulty.EASY, statement: 'Un móvil recorre 240 km en 3 horas. ¿Cuál es su velocidad?', options: [{ text: 'A) 60 km/h', isCorrect: false }, { text: 'B) 80 km/h', isCorrect: true }, { text: 'C) 90 km/h', isCorrect: false }, { text: 'D) 120 km/h', isCorrect: false }, { text: 'E) 240 km/h', isCorrect: false }], explanation: '$v = 240/3 = 80$ km/h' },
          { difficulty: Difficulty.HARD, statement: 'Desde lo alto de un edificio se deja caer una piedra y tarda 5 s en tocar el suelo (g = 10 m/s²). ¿Cuál es la altura del edificio?', options: [{ text: 'A) 25 m', isCorrect: false }, { text: 'B) 50 m', isCorrect: false }, { text: 'C) 100 m', isCorrect: false }, { text: 'D) 125 m', isCorrect: true }, { text: 'E) 250 m', isCorrect: false }], explanation: '$h = \\frac{1}{2}gt^2 = \\frac{1}{2} \\times 10 \\times 25 = 125$ m' },
          { difficulty: Difficulty.MEDIUM, statement: 'Un móvil frena con aceleración de -2 m/s². Si su velocidad inicial es 12 m/s, ¿en cuánto tiempo se detiene?', options: [{ text: 'A) 4 s', isCorrect: false }, { text: 'B) 5 s', isCorrect: false }, { text: 'C) 6 s', isCorrect: true }, { text: 'D) 8 s', isCorrect: false }, { text: 'E) 10 s', isCorrect: false }], explanation: '$t = (0 - 12)/(-2) = 6$ s' },
        ],
      },
      {
        nombre: 'Leyes de Newton',
        slug: 'leyes-newton',
        summary: [
          { type: 'HEADING', level: 1, text: 'Leyes de Newton' },
          { type: 'DEFINITION', term: 'Primera Ley (Inercia)', definition: 'Un cuerpo permanece en reposo o en movimiento rectilíneo uniforme a menos que una fuerza neta actúe sobre él.' },
          { type: 'PARAGRAPH', text: 'Las tres leyes de Newton relacionan fuerzas y movimiento. Son la base de la mecánica clásica y permiten analizar desde el movimiento de un auto hasta el de planetas.' },
          { type: 'FORMULA', latex: '\\sum F = ma', label: 'Segunda Ley' },
          { type: 'EXAMPLE', title: 'Fuerza sobre un carrito', problem: 'Un carrito de 4 kg acelera a 3 m/s². ¿Qué fuerza neta actúa sobre él?', solution: '$F = ma = 4 \\times 3 = 12$ N.' },
          { type: 'KEY_POINTS', items: [
            { title: 'Inercia', text: 'Tendencia de los cuerpos a mantener su estado de movimiento.' },
            { title: 'Fuerza neta', text: 'Suma vectorial de todas las fuerzas sobre un cuerpo.' },
            { title: 'Acción y reacción', text: 'Toda fuerza produce una fuerza igual y contraria sobre cuerpos distintos.' },
          ]},
          { type: 'CALLOUT', title: 'No confundir', text: 'El peso y la masa no son lo mismo: la masa es inercial (kg) y el peso es una fuerza (N).', tone: 'warning' },
          { type: 'TIP', title: 'Tip de examen', text: 'Dibuja el diagrama de cuerpo libre antes de aplicar $\\sum F = ma$.', variant: 'exam' },
          { type: 'RESOURCES', title: 'Refuerza', items: [
            { title: 'Leyes de Newton - Khan Academy', url: 'https://es.wikipedia.org/wiki/Leyes_de_Newton', description: 'Teoría, ejemplos y ejercicios.' },
          ]},
        ],
        preguntas: [
          { difficulty: Difficulty.EASY, statement: 'La Primera Ley de Newton también se conoce como:', options: [{ text: 'A) Ley de la Inercia', isCorrect: true }, { text: 'B) Ley de la Acción y Reacción', isCorrect: false }, { text: 'C) Ley de la Gravedad', isCorrect: false }, { text: 'D) Ley de la Energía', isCorrect: false }, { text: 'E) Ley del Movimiento', isCorrect: false }], explanation: 'La Primera Ley establece que un cuerpo permanece en reposo o movimiento uniforme a menos que actúe una fuerza (Inercia)' },
          { difficulty: Difficulty.MEDIUM, statement: 'Si aplicamos una fuerza de 20 N a un objeto de 5 kg, ¿cuál es su aceleración?', options: [{ text: 'A) 2 m/s²', isCorrect: false }, { text: 'B) 4 m/s²', isCorrect: true }, { text: 'C) 5 m/s²', isCorrect: false }, { text: 'D) 10 m/s²', isCorrect: false }, { text: 'E) 15 m/s²', isCorrect: false }], explanation: '$F = ma \\Rightarrow a = F/m = 20/5 = 4$ m/s²' },
          { difficulty: Difficulty.EASY, statement: '¿Cuál es el peso de un cuerpo de 6 kg (g = 10 m/s²)?', options: [{ text: 'A) 0.6 N', isCorrect: false }, { text: 'B) 6 N', isCorrect: false }, { text: 'C) 60 N', isCorrect: true }, { text: 'D) 600 N', isCorrect: false }, { text: 'E) 6000 N', isCorrect: false }], explanation: '$P = mg = 6 \\times 10 = 60$ N' },
          { difficulty: Difficulty.MEDIUM, statement: 'Si el peso de un cuerpo es 490 N y g = 9.8 m/s², ¿cuál es su masa?', options: [{ text: 'A) 40 kg', isCorrect: false }, { text: 'B) 50 kg', isCorrect: true }, { text: 'C) 60 kg', isCorrect: false }, { text: 'D) 490 kg', isCorrect: false }, { text: 'E) 980 kg', isCorrect: false }], explanation: '$m = P/g = 490/9.8 = 50$ kg' },
          { difficulty: Difficulty.EASY, statement: 'La Tercera Ley de Newton establece que:', options: [{ text: 'A) F = ma', isCorrect: false }, { text: 'B) Toda acción tiene una reacción igual y contraria', isCorrect: true }, { text: 'C) Los cuerpos tienden al reposo', isCorrect: false }, { text: 'D) La energía se conserva', isCorrect: false }, { text: 'E) La masa es constante', isCorrect: false }], explanation: 'Tercera Ley: a cada acción corresponde una reacción de igual magnitud y dirección contraria sobre cuerpos diferentes.' },
          { difficulty: Difficulty.MEDIUM, statement: 'Si la fuerza neta sobre un cuerpo es cero, entonces su aceleración es:', options: [{ text: 'A) Positiva', isCorrect: false }, { text: 'B) Negativa', isCorrect: false }, { text: 'C) Cero', isCorrect: true }, { text: 'D) Constante pero distinta de cero', isCorrect: false }, { text: 'E) Variable', isCorrect: false }], explanation: 'Por la Segunda Ley, $\\sum F = ma$. Si la fuerza neta es cero, la aceleración es cero.' },
          { difficulty: Difficulty.EASY, statement: 'La fuerza de fricción siempre se opone al:', options: [{ text: 'A) Peso', isCorrect: false }, { text: 'B) Movimiento o intento de movimiento', isCorrect: true }, { text: 'C) Tiempo', isCorrect: false }, { text: 'D) Trabajo', isCorrect: false }, { text: 'E) Calor', isCorrect: false }], explanation: 'La fricción es una fuerza que se opone al movimiento relativo entre superficies.' },
          { difficulty: Difficulty.MEDIUM, statement: 'Sobre una superficie horizontal sin rozamiento, una fuerza horizontal de 10 N actúa sobre un cuerpo de 2 kg. ¿Cuál es su aceleración?', options: [{ text: 'A) 2 m/s²', isCorrect: false }, { text: 'B) 5 m/s²', isCorrect: true }, { text: 'C) 10 m/s²', isCorrect: false }, { text: 'D) 20 m/s²', isCorrect: false }, { text: 'E) 12 m/s²', isCorrect: false }], explanation: '$a = F/m = 10/2 = 5$ m/s²' },
          { difficulty: Difficulty.MEDIUM, statement: 'Un cuerpo de 8 kg cuelga de una cuerda en equilibrio. ¿Cuál es la tensión de la cuerda? (g = 10 m/s²)', options: [{ text: 'A) 8 N', isCorrect: false }, { text: 'B) 18 N', isCorrect: false }, { text: 'C) 80 N', isCorrect: true }, { text: 'D) 88 N', isCorrect: false }, { text: 'E) 0 N', isCorrect: false }], explanation: 'En equilibrio, $T = mg = 8 \\times 10 = 80$ N' },
          { difficulty: Difficulty.EASY, statement: 'Dos fuerzas de 6 N y 8 N actúan en la misma dirección y sentido. La fuerza resultante es:', options: [{ text: 'A) 2 N', isCorrect: false }, { text: 'B) 6 N', isCorrect: false }, { text: 'C) 8 N', isCorrect: false }, { text: 'D) 14 N', isCorrect: true }, { text: 'E) 48 N', isCorrect: false }], explanation: 'Fuerzas en el mismo sentido se suman: $6 + 8 = 14$ N' },
          { difficulty: Difficulty.EASY, statement: 'Dos fuerzas de 10 N actúan en direcciones opuestas sobre un cuerpo. La resultante es:', options: [{ text: 'A) 20 N', isCorrect: false }, { text: 'B) 10 N', isCorrect: false }, { text: 'C) 0 N', isCorrect: true }, { text: 'D) 100 N', isCorrect: false }, { text: 'E) -20 N', isCorrect: false }], explanation: 'Fuerzas iguales y opuestas se anulan: resultante cero.' },
          { difficulty: Difficulty.EASY, statement: 'La Segunda Ley de Newton se expresa matemáticamente como:', options: [{ text: 'A) $E = mc^2$', isCorrect: false }, { text: 'B) $F = ma$', isCorrect: true }, { text: 'C) $W = Fd$', isCorrect: false }, { text: 'D) $P = mv$', isCorrect: false }, { text: 'E) $v = d/t$', isCorrect: false }], explanation: '$F = ma$ relaciona fuerza, masa y aceleración.' },
          { difficulty: Difficulty.MEDIUM, statement: 'La inercia de un cuerpo depende de:', options: [{ text: 'A) Su velocidad', isCorrect: false }, { text: 'B) Su masa', isCorrect: true }, { text: 'C) Su volumen', isCorrect: false }, { text: 'D) Su temperatura', isCorrect: false }, { text: 'E) Su color', isCorrect: false }], explanation: 'La inercia es la resistencia al cambio de movimiento y depende de la masa.' },
          { difficulty: Difficulty.MEDIUM, statement: 'Si sobre un cuerpo se duplica la fuerza neta manteniendo su masa constante, su aceleración:', options: [{ text: 'A) Se reduce a la mitad', isCorrect: false }, { text: 'B) No cambia', isCorrect: false }, { text: 'C) Se duplica', isCorrect: true }, { text: 'D) Se cuadruplica', isCorrect: false }, { text: 'E) Se anula', isCorrect: false }], explanation: 'Como $a = F/m$, al duplicar $F$ se duplica $a$.' },
          { difficulty: Difficulty.EASY, statement: 'Durante la caída libre, la aceleración de un cuerpo es causada por:', options: [{ text: 'A) Su masa', isCorrect: false }, { text: 'B) La gravedad', isCorrect: true }, { text: 'C) La fricción', isCorrect: false }, { text: 'D) Su velocidad', isCorrect: false }, { text: 'E) La presión del aire', isCorrect: false }], explanation: 'En caída libre la única fuerza que actúa (idealmente) es el peso debido a la gravedad.' },
          { difficulty: Difficulty.HARD, statement: 'En un plano inclinado sin rozamiento, ¿qué componente del peso hace que el cuerpo descienda?', options: [{ text: 'A) $mg\\cos\\theta$', isCorrect: false }, { text: 'B) $mg\\sin\\theta$', isCorrect: true }, { text: 'C) $mg/\\theta$', isCorrect: false }, { text: 'D) $mg$', isCorrect: false }, { text: 'E) $mg\\tan\\theta$', isCorrect: false }], explanation: 'La componente paralela al plano es $mg\\sin\\theta$.' },
          { difficulty: Difficulty.MEDIUM, statement: 'Un sistema formado por dos bloques de 2 kg y 3 kg es arrastrado por una fuerza de 10 N sobre una superficie sin rozamiento. ¿Cuál es la aceleración del sistema?', options: [{ text: 'A) 1 m/s²', isCorrect: false }, { text: 'B) 2 m/s²', isCorrect: true }, { text: 'C) 5 m/s²', isCorrect: false }, { text: 'D) 10 m/s²', isCorrect: false }, { text: 'E) 6 m/s²', isCorrect: false }], explanation: '$a = F/(m_1+m_2) = 10/(2+3) = 2$ m/s²' },
          { difficulty: Difficulty.MEDIUM, statement: 'Un cuerpo de 4 kg es acelerado por una cuerda horizontal con una tensión de 12 N sobre una superficie sin rozamiento. ¿Cuál es su aceleración?', options: [{ text: 'A) 2 m/s²', isCorrect: false }, { text: 'B) 3 m/s²', isCorrect: true }, { text: 'C) 4 m/s²', isCorrect: false }, { text: 'D) 12 m/s²', isCorrect: false }, { text: 'E) 48 m/s²', isCorrect: false }], explanation: '$a = T/m = 12/4 = 3$ m/s²' },
          { difficulty: Difficulty.EASY, statement: '¿Cuál de las siguientes unidades corresponde a la masa?', options: [{ text: 'A) Newton', isCorrect: false }, { text: 'B) Joule', isCorrect: false }, { text: 'C) Kilogramo', isCorrect: true }, { text: 'D) Metro', isCorrect: false }, { text: 'E) Vatio', isCorrect: false }], explanation: 'La unidad de masa en el SI es el kilogramo (kg).' },
          { difficulty: Difficulty.HARD, statement: 'Según la Tercera Ley de Newton, la fuerza de acción y la fuerza de reacción actúan sobre:', options: [{ text: 'A) El mismo cuerpo', isCorrect: false }, { text: 'B) Cuerpos diferentes', isCorrect: true }, { text: 'C) Superficies iguales', isCorrect: false }, { text: 'D) El centro de masa', isCorrect: false }, { text: 'E) La Tierra únicamente', isCorrect: false }], explanation: 'Acción y reacción actúan sobre cuerpos distintos, por eso no se cancelan.' },
        ],
      },
      {
        nombre: 'Energía y Trabajo',
        slug: 'energia-trabajo',
        summary: [
          { type: 'HEADING', level: 1, text: 'Energía y Trabajo' },
          { type: 'DEFINITION', term: 'Trabajo mecánico', definition: 'Transferencia de energía que ocurre cuando una fuerza desplaza un cuerpo.' },
          { type: 'PARAGRAPH', text: 'El trabajo y la energía son conceptos centrales para resolver problemas de movimiento sin analizar fuerzas en cada instante. La conservación de la energía mecánica simplifica muchos cálculos.' },
          { type: 'FORMULA', latex: 'W = Fd\\cos\\theta', label: 'Trabajo' },
          { type: 'FORMULA', latex: 'E_c = \\frac{1}{2}mv^2 \\quad ; \\quad E_p = mgh', label: 'Energía cinética y potencial' },
          { type: 'EXAMPLE', title: 'Trabajo con ángulo', problem: 'Se arrastra una caja con una fuerza de 20 N que forma 60° con la horizontal durante 5 m. ¿Qué trabajo se realiza?', solution: '$W = Fd\\cos60° = 20 \\times 5 \\times 0.5 = 50$ J.' },
          { type: 'KEY_POINTS', items: [
            { title: 'Trabajo neto', text: 'Es igual al cambio de energía cinética (teorema del trabajo-energía).' },
            { title: 'Conservación', text: 'Sin fricción, la energía mecánica total se conserva.' },
            { title: 'Potencia', text: 'Rapidez con la que se realiza trabajo: $P = W/t$.' },
          ]},
          { type: 'CALLOUT', title: 'Cuidado', text: 'Si la fuerza es perpendicular al desplazamiento, el trabajo que realiza es cero.', tone: 'info' },
          { type: 'TIP', title: 'Tip de examen', text: 'En caída libre o planos sin rozamiento, transforma energía potencial en cinética y viceversa sin pérdidas.', variant: 'exam' },
          { type: 'RESOURCES', title: 'Refuerza', items: [
            { title: 'Trabajo y energía - Wikipedia', url: 'https://es.wikipedia.org/wiki/Trabajo_(f%C3%ADsica)', description: 'Teoría, fórmulas y ejemplos.' },
          ]},
        ],
        preguntas: [
          { difficulty: Difficulty.EASY, statement: 'El trabajo mecánico y la energía se miden en:', options: [{ text: 'A) Vatios', isCorrect: false }, { text: 'B) Joules', isCorrect: true }, { text: 'C) Newtons', isCorrect: false }, { text: 'D) Pascales', isCorrect: false }, { text: 'E) Ergios', isCorrect: false }], explanation: 'En el SI, el trabajo y la energía se miden en Joules (J).' },
          { difficulty: Difficulty.MEDIUM, statement: 'Un cuerpo de 2 kg se mueve a 3 m/s. ¿Cuál es su energía cinética?', options: [{ text: 'A) 3 J', isCorrect: false }, { text: 'B) 6 J', isCorrect: false }, { text: 'C) 9 J', isCorrect: true }, { text: 'D) 12 J', isCorrect: false }, { text: 'E) 18 J', isCorrect: false }], explanation: 'Ec = ½mv² = ½ × 2 × 3² = 9 J' },
          { difficulty: Difficulty.EASY, statement: 'Una fuerza de 50 N desplaza un cuerpo 4 m en su misma dirección. ¿Qué trabajo realiza?', options: [{ text: 'A) 12.5 J', isCorrect: false }, { text: 'B) 54 J', isCorrect: false }, { text: 'C) 200 J', isCorrect: true }, { text: 'D) 400 J', isCorrect: false }, { text: 'E) 1000 J', isCorrect: false }], explanation: '$W = Fd = 50 \\times 4 = 200$ J' },
          { difficulty: Difficulty.MEDIUM, statement: 'Si se realiza un trabajo de 600 J en 10 s, ¿cuál es la potencia desarrollada?', options: [{ text: 'A) 6 W', isCorrect: false }, { text: 'B) 60 W', isCorrect: true }, { text: 'C) 600 W', isCorrect: false }, { text: 'D) 6000 W', isCorrect: false }, { text: 'E) 120 W', isCorrect: false }], explanation: '$P = W/t = 600/10 = 60$ W' },
          { difficulty: Difficulty.MEDIUM, statement: '¿Cuál es la energía potencial gravitatoria de un cuerpo de 5 kg situado a 10 m de altura? (g = 10 m/s²)', options: [{ text: 'A) 5 J', isCorrect: false }, { text: 'B) 50 J', isCorrect: false }, { text: 'C) 500 J', isCorrect: true }, { text: 'D) 1000 J', isCorrect: false }, { text: 'E) 250 J', isCorrect: false }], explanation: '$E_p = mgh = 5 \\times 10 \\times 10 = 500$ J' },
          { difficulty: Difficulty.EASY, statement: 'En ausencia de rozamiento, la energía mecánica total de un sistema:', options: [{ text: 'A) Aumenta', isCorrect: false }, { text: 'B) Disminuye', isCorrect: false }, { text: 'C) Se conserva', isCorrect: true }, { text: 'D) Se anula', isCorrect: false }, { text: 'E) Depende de la masa', isCorrect: false }], explanation: 'Sin fuerzas disipativas, la suma de energía cinética y potencial se conserva.' },
          { difficulty: Difficulty.EASY, statement: 'El rendimiento de una máquina nunca puede ser:', options: [{ text: 'A) 0%', isCorrect: false }, { text: 'B) 50%', isCorrect: false }, { text: 'C) 80%', isCorrect: false }, { text: 'D) 100%', isCorrect: false }, { text: 'E) Mayor que 100%', isCorrect: true }], explanation: 'Por conservación de energía, una máquina no puede entregar más energía útil de la que recibe.' },
          { difficulty: Difficulty.MEDIUM, statement: 'Una fuerza actúa perpendicularmente al desplazamiento de un cuerpo. El trabajo realizado por esa fuerza es:', options: [{ text: 'A) Positivo', isCorrect: false }, { text: 'B) Negativo', isCorrect: false }, { text: 'C) Cero', isCorrect: true }, { text: 'D) Máximo', isCorrect: false }, { text: 'E) Variable', isCorrect: false }], explanation: '$W = Fd\\cos90° = 0$' },
          { difficulty: Difficulty.MEDIUM, statement: 'Si la altura de un cuerpo se duplica, su energía potencial gravitatoria:', options: [{ text: 'A) Se reduce a la mitad', isCorrect: false }, { text: 'B) No cambia', isCorrect: false }, { text: 'C) Se duplica', isCorrect: true }, { text: 'D) Se cuadruplica', isCorrect: false }, { text: 'E) Se anula', isCorrect: false }], explanation: '$E_p = mgh$; si $h$ se duplica, $E_p$ también.' },
          { difficulty: Difficulty.MEDIUM, statement: 'Si la velocidad de un cuerpo se duplica, su energía cinética:', options: [{ text: 'A) Se reduce a la mitad', isCorrect: false }, { text: 'B) No cambia', isCorrect: false }, { text: 'C) Se duplica', isCorrect: false }, { text: 'D) Se cuadruplica', isCorrect: true }, { text: 'E) Se divide entre cuatro', isCorrect: false }], explanation: '$E_c = \\frac{1}{2}mv^2$; si $v$ se duplica, $E_c$ se cuadruplica.' },
          { difficulty: Difficulty.HARD, statement: 'Una fuerza de 10 N actúa sobre un cuerpo formando 60° con la horizontal y lo desplaza 5 m. ¿Qué trabajo realiza?', options: [{ text: 'A) 10 J', isCorrect: false }, { text: 'B) 25 J', isCorrect: true }, { text: 'C) 50 J', isCorrect: false }, { text: 'D) 100 J', isCorrect: false }, { text: 'E) 0 J', isCorrect: false }], explanation: '$W = Fd\\cos60° = 10 \\times 5 \\times 0.5 = 25$ J' },
          { difficulty: Difficulty.EASY, statement: 'La potencia se calcula como:', options: [{ text: 'A) Trabajo × tiempo', isCorrect: false }, { text: 'B) Trabajo / tiempo', isCorrect: true }, { text: 'C) Fuerza × distancia', isCorrect: false }, { text: 'D) Masa × velocidad', isCorrect: false }, { text: 'E) Energía × distancia', isCorrect: false }], explanation: '$P = W/t$' },
          { difficulty: Difficulty.EASY, statement: 'La energía mecánica de un cuerpo es la suma de:', options: [{ text: 'A) Su masa y su velocidad', isCorrect: false }, { text: 'B) Su energía cinética y potencial', isCorrect: true }, { text: 'C) Su peso y su altura', isCorrect: false }, { text: 'D) Su trabajo y su potencia', isCorrect: false }, { text: 'E) Su fuerza y desplazamiento', isCorrect: false }], explanation: '$E_m = E_c + E_p$' },
          { difficulty: Difficulty.MEDIUM, statement: 'Una máquina recibe 500 J de energía y entrega 400 J de trabajo útil. ¿Cuál es su rendimiento?', options: [{ text: 'A) 20%', isCorrect: false }, { text: 'B) 40%', isCorrect: false }, { text: 'C) 80%', isCorrect: true }, { text: 'D) 100%', isCorrect: false }, { text: 'E) 125%', isCorrect: false }], explanation: '$\\eta = (W_{util}/E_{entrada}) \\times 100 = (400/500) \\times 100 = 80$%' },
          { difficulty: Difficulty.EASY, statement: 'Al frenar, la energía cinética de un vehículo se transforma principalmente en:', options: [{ text: 'A) Energía potencial', isCorrect: false }, { text: 'B) Energía eléctrica', isCorrect: false }, { text: 'C) Calor', isCorrect: true }, { text: 'D) Energía sonora', isCorrect: false }, { text: 'E) Energía química', isCorrect: false }], explanation: 'La fricción de frenado disipa la energía cinética en forma de calor.' },
          { difficulty: Difficulty.MEDIUM, statement: 'Un cuerpo es lanzado verticalmente hacia arriba. En su altura máxima:', options: [{ text: 'A) Su energía cinética es máxima', isCorrect: false }, { text: 'B) Su energía potencial es mínima', isCorrect: false }, { text: 'C) Su energía cinética es cero y la potencial es máxima', isCorrect: true }, { text: 'D) Su velocidad es máxima', isCorrect: false }, { text: 'E) Su energía mecánica es cero', isCorrect: false }], explanation: 'En la altura máxima la velocidad es cero, por tanto $E_c = 0$ y $E_p$ es máxima.' },
          { difficulty: Difficulty.MEDIUM, statement: 'El trabajo neto sobre un cuerpo es igual a:', options: [{ text: 'A) La fuerza aplicada', isCorrect: false }, { text: 'B) El cambio de energía cinética', isCorrect: true }, { text: 'C) El cambio de energía potencial', isCorrect: false }, { text: 'D) La energía mecánica total', isCorrect: false }, { text: 'E) La potencia desarrollada', isCorrect: false }], explanation: 'Teorema del trabajo-energía: $W_{neto} = \\Delta E_c$.' },
          { difficulty: Difficulty.EASY, statement: 'Para elevar un libro 2 m se aplica una fuerza vertical de 30 N. ¿Qué trabajo se realiza contra la gravedad?', options: [{ text: 'A) 15 J', isCorrect: false }, { text: 'B) 30 J', isCorrect: false }, { text: 'C) 60 J', isCorrect: true }, { text: 'D) 90 J', isCorrect: false }, { text: 'E) 120 J', isCorrect: false }], explanation: '$W = Fd = 30 \\times 2 = 60$ J' },
          { difficulty: Difficulty.EASY, statement: 'La unidad de potencia en el SI es:', options: [{ text: 'A) Joule', isCorrect: false }, { text: 'B) Newton', isCorrect: false }, { text: 'C) Vatio', isCorrect: true }, { text: 'D) Amperio', isCorrect: false }, { text: 'E) Pascal', isCorrect: false }], explanation: 'La potencia se mide en vatios (W).' },
          { difficulty: Difficulty.EASY, statement: 'El principio de conservación de la energía establece que la energía:', options: [{ text: 'A) Se crea', isCorrect: false }, { text: 'B) Se destruye', isCorrect: false }, { text: 'C) No se crea ni se destruye, solo se transforma', isCorrect: true }, { text: 'D) Aumenta con el tiempo', isCorrect: false }, { text: 'E) Disminuye con el rozamiento', isCorrect: false }], explanation: 'La energía total del universo se conserva; solo cambia de forma.' },
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
        summary: [
          { type: 'HEADING', level: 1, text: 'La Célula' },
          { type: 'DEFINITION', term: 'Célula', definition: 'Unidad estructural y funcional básica de todo ser vivo; puede ser procariota o eucariota.' },
          { type: 'IMAGE', src: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=800&q=80', alt: 'Célula microscópica', caption: 'Unidad estructural y funcional de la vida.' },
          { type: 'TABLE', title: 'Procariota vs Eucariota', headers: ['Característica', 'Procariota', 'Eucariota'], rows: [
            ['Núcleo', 'No definido', 'Definido con membrana'],
            ['Organelos', 'Sin membrana', 'Con membrana'],
            ['Ejemplos', 'Bacterias', 'Animales, plantas, hongos'],
          ]},
          { type: 'KEY_POINTS', items: [
            { title: 'Membrana plasmática', text: 'Regula el intercambio de sustancias con el medio.' },
            { title: 'Núcleo', text: 'Centro de control que alberga el material genético.' },
            { title: 'Mitocondrias', text: 'Generan ATP mediante la respiración celular.' },
          ]},
          { type: 'CALLOUT', title: 'Flujo de información', text: 'ADN → ARN → Proteína', tone: 'success' },
          { type: 'TIP', title: 'Memotécnica', text: 'Recuerda: las células procariotas no tienen núcleo definido ni organelos membranosos.', variant: 'memory' },
          { type: 'RESOURCES', title: 'Recursos recomendados', items: [
            { title: 'La célula - Khan Academy', url: 'https://es.wikipedia.org/wiki/C%C3%A9lula', description: 'Estructura, tipos y funciones celulares.' },
            { title: 'Video: Estructura de la célula', url: 'https://www.youtube.com/results?search_query=estructura+de+la+celula+khan+academy', description: 'Explicación animada en YouTube.' },
          ]},
        ],
        preguntas: generarPreguntasPlaceholder('La Célula', 1, 20),
      },
      {
        nombre: 'Genética',
        slug: 'genetica',
        preguntas: generarPreguntasPlaceholder('Genética', 2, 20),
      },
      {
        nombre: 'Evolución',
        slug: 'evolucion',
        preguntas: generarPreguntasPlaceholder('Evolución', 3, 20),
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
        summary: [
          { type: 'HEADING', level: 1, text: 'Literatura Universal' },
          { type: 'PARAGRAPH', text: 'La literatura universal reúne obras de todas las épocas y culturas que han marcado la historia de la humanidad. Conocer sus movimientos y autores es clave para el examen de admisión.' },
          { type: 'QUOTE', text: 'Ser o no ser, esa es la cuestión.', author: 'William Shakespeare, Hamlet' },
          { type: 'TABLE', title: 'Movimientos y representantes', headers: ['Movimiento', 'Representante', 'Obra'], rows: [
            ['Renacimiento', 'Miguel de Cervantes', 'Don Quijote'],
            ['Romanticismo', 'Victor Hugo', 'Los miserables'],
            ['Realismo mágico', 'Gabriel García Márquez', 'Cien años de soledad'],
          ]},
          { type: 'KEY_POINTS', items: [
            { title: 'Géneros literarios', text: 'Lírico, épico/narrativo y dramático.' },
            { title: 'Figuras retóricas', text: 'Metáfora, hipérbole, personificación, sinestesia.' },
          ]},
          { type: 'TIP', title: 'Tip de examen', text: 'Memoriza las obras cumbre y sus autores; el examen suele mezclar movimientos.', variant: 'exam' },
          { type: 'RESOURCES', title: 'Lecturas y videos', items: [
            { title: 'Literatura universal en Wikipedia', url: 'https://es.wikipedia.org/wiki/Literatura_universal', description: 'Cronología y autores clave.' },
            { title: 'Resumen animado: Don Quijote', url: 'https://www.youtube.com/results?search_query=don+quijote+resumen', description: 'Video introductorio en YouTube.' },
          ]},
        ],
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
      {
        nombre: 'Análisis Literario',
        slug: 'analisis-literario',
        preguntas: [
          {
            difficulty: Difficulty.EASY,
            statement: 'El recurso que atribuye características humanas a objetos o animales se llama:',
            options: [
              { text: 'A) Metáfora', isCorrect: false },
              { text: 'B) Hipérbole', isCorrect: false },
              { text: 'C) Personificación', isCorrect: true },
              { text: 'D) Símil', isCorrect: false },
              { text: 'E) Anáfora', isCorrect: false },
            ],
            explanation: 'La personificación otorga cualidades humanas a seres no humanos.',
          },
          {
            difficulty: Difficulty.MEDIUM,
            statement: 'En un texto literario, el narrador que participa en la historia y usa "yo" es:',
            options: [
              { text: 'A) Narrador omnisciente', isCorrect: false },
              { text: 'B) Narrador protagonista', isCorrect: true },
              { text: 'C) Narrador testigo', isCorrect: false },
              { text: 'D) Narrador en tercera persona', isCorrect: false },
              { text: 'E) Narrador objetivo', isCorrect: false },
            ],
            explanation: 'El narrador protagonista es un personaje que cuenta su propia historia usando la primera persona.',
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
        summary: [
          { type: 'HEADING', level: 1, text: 'Época Prehispánica' },
          { type: 'IMAGE', src: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80', alt: 'Machu Picchu', caption: 'Cusco, capital del Tahuantinsuyo.' },
          { type: 'PARAGRAPH', text: 'La época prehispánica abarca las culturas que habitaron el territorio peruano antes de la llegada de los españoles, culminando con el Imperio Inca y su organización social, política y religiosa.' },
          { type: 'TABLE', title: 'Culturas y aportes', headers: ['Cultura', 'Aporte icónico'], rows: [
            ['Caral', 'Civilización más antigua de América'],
            ['Chavín', 'Cabeza clava y culto al jaguar'],
            ['Nazca', 'Líneas y geoglifos'],
            ['Moche', 'Huacas del Sol y de la Luna'],
            ['Inca', 'Tahuantinsuyo y Cusco'],
          ]},
          { type: 'KEY_POINTS', items: [
            { title: 'Imperio Inca', text: 'Organización política basada en el Tahuantinsuyo con Cusco como capital.' },
            { title: 'Sociedad inca', text: 'Ayllu como base social; reciprocidad y mita como sistemas de trabajo.' },
          ]},
          { type: 'QUOTE', text: 'El Tahuantinsuyo fue el mayor imperio prehispánico de América, unido por caminos y administrado desde Cusco.', author: 'Historiografía peruana' },
          { type: 'TIP', title: 'Tip de examen', text: 'Relaciona cada cultura con una obra o aporte distintivo; eso facilita la memoria.', variant: 'exam' },
          { type: 'RESOURCES', title: 'Material de consulta', items: [
            { title: 'Historia del Perú en Wikipedia', url: 'https://es.wikipedia.org/wiki/Historia_del_Per%C3%BA', description: 'Desde Caral hasta la República.' },
            { title: 'Documental: Imperio Inca', url: 'https://www.youtube.com/results?search_query=imperio+inca+documental', description: 'Video introductorio en YouTube.' },
          ]},
        ],
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
      {
        nombre: 'Perú Republicano',
        slug: 'peru-republicano',
        preguntas: [
          {
            difficulty: Difficulty.EASY,
            statement: '¿Quién fue el primer presidente constitucional del Perú?',
            options: [
              { text: 'A) José de San Martín', isCorrect: false },
              { text: 'B) Simón Bolívar', isCorrect: false },
              { text: 'C) José Rufino Echenique', isCorrect: false },
              { text: 'D) José Luis Bustamante y Rivero', isCorrect: false },
              { text: 'E) José de la Riva Agüero', isCorrect: true },
            ],
            explanation: 'José de la Riva Agüero fue el primer presidente constitucional del Perú en 1823.',
          },
          {
            difficulty: Difficulty.MEDIUM,
            statement: 'La Guerra del Pacífico (1879-1883) enfrentó al Perú contra:',
            options: [
              { text: 'A) Argentina', isCorrect: false },
              { text: 'B) Chile', isCorrect: true },
              { text: 'C) Bolivia', isCorrect: false },
              { text: 'D) Ecuador', isCorrect: false },
              { text: 'E) Colombia', isCorrect: false },
            ],
            explanation: 'La Guerra del Pacífico enfrentó a Perú y Bolivia contra Chile por recursos salitreros.',
          },
        ],
      },
    ]
  );

  console.log('✅ Base de datos poblada correctamente con cursos, temas y preguntas.');

  // ---------------------------------------------------------
  // 4. CARRERAS: puntajes mínimos históricos de ejemplo
  // ---------------------------------------------------------
  console.log('🎯 Asignando puntajes mínimos a carreras...');
  const careerMinimumScores: Record<string, number> = {
    'Medicina': 82.5,
    'Enfermería': 72.0,
    'Ingeniería Civil': 78.3,
    'Ingeniería de Sistemas': 70.5,
    'Ingeniería Industrial': 68.0,
    'Arquitectura': 75.0,
    'Derecho': 73.5,
    'Psicología': 69.0,
    'Administración': 65.0,
    'Contabilidad': 64.0,
    'Economía': 66.0,
    'Ciencia de la Computación': 71.0,
    'Física': 67.0,
    'Química': 66.5,
    'Biología': 68.5,
    'Agronomía': 63.0,
    'Marketing': 64.5,
    'Trabajo Social': 62.0,
  };

  for (const [name, minimumScore] of Object.entries(careerMinimumScores)) {
    await prisma.career.updateMany({
      where: { name },
      data: { minimumScore },
    });
  }

  // ---------------------------------------------------------
  // 5. EXÁMENES HISTÓRICOS DE EJEMPLO (archivo de simulacros)
  // ---------------------------------------------------------
  console.log('📜 Creando exámenes históricos de ejemplo...');
  await seedHistoricalExams();

  // ---------------------------------------------------------
  // 6. USUARIO DE PRUEBA PREMIUM
  // ---------------------------------------------------------
  console.log('👤 Creando usuario premium de prueba...');
  const testCareer = await prisma.career.findFirst({
    where: { name: 'Ingeniería de Sistemas' },
  });

  const hashedPassword = await bcrypt.hash('test1234', 12);

  await prisma.user.upsert({
    where: { email: 'premium@test.com' },
    update: {},
    create: {
      email: 'premium@test.com',
      name: 'Premium Tester',
      password: hashedPassword,
      provider: 'credentials',
      role: 'USER',
      isPremium: true,
      subExpiresAt: new Date('2027-01-01T00:00:00Z'),
      careerId: testCareer?.id ?? null,
      energy: 25,
      coins: 500,
      inventory: ['default'],
    },
  });

  console.log('🌱 Sembrado completado.');
}

async function findTopicBySlug(courseSlug: string, topicSlug: string) {
  return prisma.topic.findFirst({
    where: {
      slug: topicSlug,
      course: { slug: courseSlug },
    },
  });
}

async function seedHistoricalExams() {
  const exams = [
    {
      title: 'Admisión UNSA 2024 - Fase I',
      year: 2024,
      phase: 'I',
      type: 'ORDINARIO',
      timeLimitMinutes: 120,
      questions: [
        {
          courseSlug: 'razonamiento-matematico',
          topicSlug: 'planteo-ecuaciones',
          order: 1,
          difficulty: Difficulty.EASY,
          statement: 'Si $x + 5 = 10$, hallar $x$.',
          options: [
            { id: 'a', text: 'A) 3', isCorrect: false },
            { id: 'b', text: 'B) 5', isCorrect: true },
            { id: 'c', text: 'C) 7', isCorrect: false },
            { id: 'd', text: 'D) 10', isCorrect: false },
            { id: 'e', text: 'E) 15', isCorrect: false },
          ],
          explanation: 'Restando 5 a ambos lados: $x = 10 - 5 = 5$',
        },
        {
          courseSlug: 'razonamiento-matematico',
          topicSlug: 'series-numericas',
          order: 2,
          difficulty: Difficulty.MEDIUM,
          statement: 'Hallar el término que sigue: 1, 1, 2, 3, 5, 8, ...',
          options: [
            { id: 'a', text: 'A) 10', isCorrect: false },
            { id: 'b', text: 'B) 11', isCorrect: false },
            { id: 'c', text: 'C) 13', isCorrect: true },
            { id: 'd', text: 'D) 15', isCorrect: false },
            { id: 'e', text: 'E) 16', isCorrect: false },
          ],
          explanation: 'Serie de Fibonacci: cada término es la suma de los dos anteriores. $5 + 8 = 13$',
        },
        {
          courseSlug: 'algebra',
          topicSlug: 'ecuaciones-primer-grado',
          order: 3,
          difficulty: Difficulty.EASY,
          statement: 'Resolver: $2x - 4 = 10$',
          options: [
            { id: 'a', text: 'A) 5', isCorrect: false },
            { id: 'b', text: 'B) 6', isCorrect: false },
            { id: 'c', text: 'C) 7', isCorrect: true },
            { id: 'd', text: 'D) 8', isCorrect: false },
            { id: 'e', text: 'E) 9', isCorrect: false },
          ],
          explanation: '$2x = 14 \\Rightarrow x = 7$',
        },
        {
          courseSlug: 'geometria',
          topicSlug: 'triangulos',
          order: 4,
          difficulty: Difficulty.EASY,
          statement: 'La suma de los ángulos internos de un triángulo es:',
          options: [
            { id: 'a', text: 'A) 90°', isCorrect: false },
            { id: 'b', text: 'B) 180°', isCorrect: true },
            { id: 'c', text: 'C) 270°', isCorrect: false },
            { id: 'd', text: 'D) 360°', isCorrect: false },
            { id: 'e', text: 'E) 540°', isCorrect: false },
          ],
          explanation: 'Teorema fundamental: la suma de ángulos internos de un triángulo es siempre 180°',
        },
        {
          courseSlug: 'quimica',
          topicSlug: 'estructura-atomica',
          order: 5,
          difficulty: Difficulty.EASY,
          statement: 'El núcleo del átomo está formado por:',
          options: [
            { id: 'a', text: 'A) Protones y electrones', isCorrect: false },
            { id: 'b', text: 'B) Protones y neutrones', isCorrect: true },
            { id: 'c', text: 'C) Electrones y neutrones', isCorrect: false },
            { id: 'd', text: 'D) Solo protones', isCorrect: false },
            { id: 'e', text: 'E) Solo electrones', isCorrect: false },
          ],
          explanation: 'El núcleo atómico contiene protones (carga +) y neutrones (sin carga)',
        },
        {
          courseSlug: 'biologia',
          topicSlug: 'la-celula',
          order: 6,
          difficulty: Difficulty.MEDIUM,
          statement: '¿Cuál de las siguientes estructuras es característica de las células eucariotas pero no de las procariotas?',
          options: [
            { id: 'a', text: 'A) Membrana plasmática', isCorrect: false },
            { id: 'b', text: 'B) Ribosomas', isCorrect: false },
            { id: 'c', text: 'C) Núcleo definido', isCorrect: true },
            { id: 'd', text: 'D) Citoplasma', isCorrect: false },
            { id: 'e', text: 'E) ADN', isCorrect: false },
          ],
          explanation: 'Las células eucariotas poseen núcleo rodeado de membrana; las procariotas no.',
        },
        {
          courseSlug: 'literatura',
          topicSlug: 'literatura-universal',
          order: 7,
          difficulty: Difficulty.EASY,
          statement: '¿Quién escribió "Don Quijote de la Mancha"?',
          options: [
            { id: 'a', text: 'A) Gabriel García Márquez', isCorrect: false },
            { id: 'b', text: 'B) Miguel de Cervantes', isCorrect: true },
            { id: 'c', text: 'C) William Shakespeare', isCorrect: false },
            { id: 'd', text: 'D) Jorge Luis Borges', isCorrect: false },
            { id: 'e', text: 'E) Pablo Neruda', isCorrect: false },
          ],
          explanation: 'Miguel de Cervantes Saavedra es el autor de esta obra cumbre de la literatura española',
        },
        {
          courseSlug: 'historia-peru',
          topicSlug: 'epoca-prehispanica',
          order: 8,
          difficulty: Difficulty.EASY,
          statement: 'La capital del Imperio Inca fue:',
          options: [
            { id: 'a', text: 'A) Lima', isCorrect: false },
            { id: 'b', text: 'B) Cusco', isCorrect: true },
            { id: 'c', text: 'C) Arequipa', isCorrect: false },
            { id: 'd', text: 'D) Machu Picchu', isCorrect: false },
            { id: 'e', text: 'E) Ollantaytambo', isCorrect: false },
          ],
          explanation: 'Cusco (Qosqo en quechua: "ombligo del mundo") fue la capital del Tahuantinsuyo',
        },
      ],
    },
    {
      title: 'CEPRUNSA 2024 - II Fase',
      year: 2024,
      phase: 'II',
      type: 'CEPRUNSA',
      timeLimitMinutes: 90,
      questions: [
        {
          courseSlug: 'razonamiento-matematico',
          topicSlug: 'conteo-combinatoria',
          order: 1,
          difficulty: Difficulty.MEDIUM,
          statement: '¿De cuántas formas se pueden ordenar 3 libros en un estante?',
          options: [
            { id: 'a', text: 'A) 3', isCorrect: false },
            { id: 'b', text: 'B) 6', isCorrect: true },
            { id: 'c', text: 'C) 8', isCorrect: false },
            { id: 'd', text: 'D) 9', isCorrect: false },
            { id: 'e', text: 'E) 12', isCorrect: false },
          ],
          explanation: 'Permutaciones de 3 elementos: $3! = 6$',
        },
        {
          courseSlug: 'algebra',
          topicSlug: 'productos-notables',
          order: 2,
          difficulty: Difficulty.EASY,
          statement: 'Desarrollar: $(x + 3)^2$',
          options: [
            { id: 'a', text: 'A) $x^2 + 6x + 9$', isCorrect: true },
            { id: 'b', text: 'B) $x^2 + 9$', isCorrect: false },
            { id: 'c', text: 'C) $x^2 + 3x + 9$', isCorrect: false },
            { id: 'd', text: 'D) $x^2 + 6x + 6$', isCorrect: false },
            { id: 'e', text: 'E) $x^2 + 3x + 6$', isCorrect: false },
          ],
          explanation: '$(a+b)^2 = a^2 + 2ab + b^2 = x^2 + 6x + 9$',
        },
        {
          courseSlug: 'fisica',
          topicSlug: 'cinematica',
          order: 3,
          difficulty: Difficulty.EASY,
          statement: 'Si un auto viaja a 60 km/h durante 2 horas, ¿qué distancia recorre?',
          options: [
            { id: 'a', text: 'A) 30 km', isCorrect: false },
            { id: 'b', text: 'B) 60 km', isCorrect: false },
            { id: 'c', text: 'C) 120 km', isCorrect: true },
            { id: 'd', text: 'D) 180 km', isCorrect: false },
            { id: 'e', text: 'E) 240 km', isCorrect: false },
          ],
          explanation: 'Distancia = velocidad × tiempo = 60 km/h × 2 h = 120 km',
        },
        {
          courseSlug: 'quimica',
          topicSlug: 'tabla-periodica',
          order: 4,
          difficulty: Difficulty.MEDIUM,
          statement: 'Los elementos del grupo 1 (metales alcalinos) tienen:',
          options: [
            { id: 'a', text: 'A) 1 electrón de valencia', isCorrect: true },
            { id: 'b', text: 'B) 2 electrones de valencia', isCorrect: false },
            { id: 'c', text: 'C) 3 electrones de valencia', isCorrect: false },
            { id: 'd', text: 'D) 7 electrones de valencia', isCorrect: false },
            { id: 'e', text: 'E) 8 electrones de valencia', isCorrect: false },
          ],
          explanation: 'Los metales alcalinos (grupo 1) tienen 1 electrón en su última capa',
        },
        {
          courseSlug: 'biologia',
          topicSlug: 'la-celula',
          order: 5,
          difficulty: Difficulty.MEDIUM,
          statement: 'La función principal de las mitocondrias es:',
          options: [
            { id: 'a', text: 'A) Fotosíntesis', isCorrect: false },
            { id: 'b', text: 'B) Respiración celular y producción de ATP', isCorrect: true },
            { id: 'c', text: 'C) Síntesis de proteínas', isCorrect: false },
            { id: 'd', text: 'D) Digestión de macromoléculas', isCorrect: false },
            { id: 'e', text: 'E) Almacenamiento de agua', isCorrect: false },
          ],
          explanation: 'Las mitocondrias son la "central energética" celular: generan ATP mediante respiración celular.',
        },
        {
          courseSlug: 'historia-peru',
          topicSlug: 'independencia-peru',
          order: 6,
          difficulty: Difficulty.EASY,
          statement: '¿En qué año se proclamó la Independencia del Perú?',
          options: [
            { id: 'a', text: 'A) 1810', isCorrect: false },
            { id: 'b', text: 'B) 1821', isCorrect: true },
            { id: 'c', text: 'C) 1824', isCorrect: false },
            { id: 'd', text: 'D) 1830', isCorrect: false },
            { id: 'e', text: 'E) 1814', isCorrect: false },
          ],
          explanation: 'José de San Martín proclamó la Independencia del Perú el 28 de julio de 1821 en Lima',
        },
      ],
    },
    {
      title: 'Admisión UNSA 2024 - Comprensión Lectora',
      year: 2024,
      phase: 'I',
      type: 'ORDINARIO',
      timeLimitMinutes: 15,
      questions: [
        {
          courseSlug: 'literatura',
          topicSlug: 'analisis-literario',
          order: 1,
          difficulty: Difficulty.MEDIUM,
          passage:
            'El realismo mágico es un movimiento literario surgido en América Latina durante el siglo XX. Sus narraciones mezclan lo cotidiano con elementos fantásticos de manera natural, sin llamar la atención sobre lo improbable. El lector acepta que un personaje pueda ascender al cielo o que una casa tenga un alma, porque en el universo de la historia esas maravillas son tan reales como cualquier objeto. Gabriel García Márquez, con su obra "Cien años de soledad", es considerado uno de los máximos exponentes de este estilo.',
          statement: 'Según el texto, ¿qué característica distingue al realismo mágico?',
          options: [
            { id: 'a', text: 'A) Presenta hechos fantásticos como si fueran normales', isCorrect: true },
            { id: 'b', text: 'B) Explica científicamente los fenómenos sobrenaturales', isCorrect: false },
            { id: 'c', text: 'C) Solo describe la vida cotidiana sin fantasía', isCorrect: false },
            { id: 'd', text: 'D) Rechaza cualquier elemento maravilloso', isCorrect: false },
            { id: 'e', text: 'E) Se originó en Europa durante el siglo XIX', isCorrect: false },
          ],
          explanation: 'El texto indica que el realismo mágico mezcla lo cotidiano con lo fantástico de manera natural.',
        },
        {
          courseSlug: 'literatura',
          topicSlug: 'analisis-literario',
          order: 2,
          difficulty: Difficulty.MEDIUM,
          passage:
            'El realismo mágico es un movimiento literario surgido en América Latina durante el siglo XX. Sus narraciones mezclan lo cotidiano con elementos fantásticos de manera natural, sin llamar la atención sobre lo improbable. El lector acepta que un personaje pueda ascender al cielo o que una casa tenga un alma, porque en el universo de la historia esas maravillas son tan reales como cualquier objeto. Gabriel García Márquez, con su obra "Cien años de soledad", es considerado uno de los máximos exponentes de este estilo.',
          statement: '¿Cuál de las siguientes obras es mencionada en el texto como ejemplo de realismo mágico?',
          options: [
            { id: 'a', text: 'A) Don Quijote de la Mancha', isCorrect: false },
            { id: 'b', text: 'B) Cien años de soledad', isCorrect: true },
            { id: 'c', text: 'C) Los ríos profundos', isCorrect: false },
            { id: 'd', text: 'D) La ciudad y los perros', isCorrect: false },
            { id: 'e', text: 'E) Pedro Páramo', isCorrect: false },
          ],
          explanation: 'El texto menciona explícitamente "Cien años de soledad" de Gabriel García Márquez.',
        },
        {
          courseSlug: 'literatura',
          topicSlug: 'analisis-literario',
          order: 3,
          difficulty: Difficulty.MEDIUM,
          passage:
            'El realismo mágico es un movimiento literario surgido en América Latina durante el siglo XX. Sus narraciones mezclan lo cotidiano con elementos fantásticos de manera natural, sin llamar la atención sobre lo improbable. El lector acepta que un personaje pueda ascender al cielo o que una casa tenga un alma, porque en el universo de la historia esas maravillas son tan reales como cualquier objeto. Gabriel García Márquez, con su obra "Cien años de soledad", es considerado uno de los máximos exponentes de este estilo.',
          statement: 'Según el texto, ¿dónde surgió el realismo mágico?',
          options: [
            { id: 'a', text: 'A) En Europa durante el siglo XIX', isCorrect: false },
            { id: 'b', text: 'B) En América Latina durante el siglo XX', isCorrect: true },
            { id: 'c', text: 'C) En Asia durante el siglo XXI', isCorrect: false },
            { id: 'd', text: 'D) En África durante el siglo XVIII', isCorrect: false },
            { id: 'e', text: 'E) En Norteamérica durante el siglo XX', isCorrect: false },
          ],
          explanation: 'El primer párrafo señala que el realismo mágico surgió en América Latina en el siglo XX.',
        },
        {
          courseSlug: 'fisica',
          topicSlug: 'cinematica',
          order: 4,
          difficulty: Difficulty.EASY,
          statement: 'Observa la gráfica y responde: ¿cuál es la velocidad del móvil en el tramo recto?',
          imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80',
          options: [
            { id: 'a', text: 'A) 5 m/s', isCorrect: false },
            { id: 'b', text: 'B) 10 m/s', isCorrect: true, imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&q=80' },
            { id: 'c', text: 'C) 15 m/s', isCorrect: false },
            { id: 'd', text: 'D) 20 m/s', isCorrect: false },
            { id: 'e', text: 'E) 25 m/s', isCorrect: false },
          ],
          explanation: 'La pendiente del tramo recto indica una velocidad constante de 10 m/s.',
        },
      ],
    },
  ];

  for (const examSeed of exams) {
    const existing = await prisma.exam.findFirst({
      where: { title: examSeed.title, year: examSeed.year },
    });

    if (existing) {
      console.log(`  ↳ Examen "${examSeed.title}" ya existe, omitiendo.`);
      continue;
    }

    const exam = await prisma.exam.create({
      data: {
        title: examSeed.title,
        year: examSeed.year,
        phase: examSeed.phase,
        type: examSeed.type,
        questionCount: examSeed.questions.length,
        timeLimitMinutes: examSeed.timeLimitMinutes,
      },
    });

    console.log(`  ✓ Examen: ${exam.title}`);

    for (const q of examSeed.questions) {
      const topic = await findTopicBySlug(q.courseSlug, q.topicSlug);
      if (!topic) {
        console.warn(`    ⚠ Tema no encontrado: ${q.courseSlug}/${q.topicSlug}`);
        continue;
      }

      await prisma.examQuestion.create({
        data: {
          examId: exam.id,
          order: q.order,
          statement: q.statement,
          passage: (q as any).passage,
          imageUrl: (q as any).imageUrl,
          options: q.options as any,
          explanation: q.explanation,
          difficulty: q.difficulty,
          topicId: topic.id,
          courseId: topic.courseId,
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });