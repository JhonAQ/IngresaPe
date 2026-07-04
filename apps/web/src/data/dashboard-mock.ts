import { BookOpen, Target, Smartphone, Layers } from "lucide-react";
import { TemaData, UserStats } from "@ingresa-pe/domain";

export const userStats: UserStats = { racha: 12, vidas: 5, gemas: 450, xp: 2850 };

export interface Course {
  id: string;
  title: string;
  progress: number;
}

export const mockCourses: Course[] = [
  { id: '1', title: 'Biología Celular', progress: 35 },
  { id: '2', title: 'Álgebra Lineal', progress: 12 },
  { id: '3', title: 'Historia del Perú', progress: 80 },
  { id: '4', title: 'Física Clásica', progress: 50 },
];

export const temarioMock: TemaData[] = [
  {
    id: 1,
    tema: 1,
    titulo: "La Célula Eucariota",
    descripcion: "Organelas y funciones básicas",
    variant: "primary",
    actividades: [
      { id: 101, name: "Teoría", state: "completed", icon: BookOpen },
      { id: 102, name: "Modo Swipe", state: "completed", icon: Smartphone },
      { id: 103, name: "Match", state: "current", icon: Layers, color: "warning" },
      { id: 104, name: "Quiz Final", state: "locked", icon: Target },
    ],
    resumenData: [
      { type: 'HEADING', level: 1, text: 'La Célula Eucariota' },
      { type: 'PARAGRAPH', text: "La célula eucariota es la unidad básica y funcional de organismos complejos. Se caracteriza por tener un núcleo definido protegido por una membrana nuclear que alberga el material genético." },
      { type: 'IMAGE', src: 'https://placehold.co/600x300?text=Resumen', alt: 'Célula eucariota', caption: 'Estructura general de una célula animal.' },
      { type: 'KEY_POINTS', items: [
        { title: "Núcleo Celular", text: "Almacena y protege el material genético (ADN)." },
        { title: "Mitocondrias", text: "La 'planta de energía'." },
      ]},
      { type: 'FORMULA', latex: 'C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + ATP', label: 'Respiración celular' },
      { type: 'TIP', title: 'Tip de examen', text: 'Diferencia clásica: Las vegetales tienen pared celular de celulosa.', variant: 'exam' },
    ],
  },
  {
    id: 2,
    tema: 2,
    titulo: "Metabolismo Celular",
    descripcion: "Respiración y Fotosíntesis",
    variant: "primary",
    actividades: [
      { id: 201, name: "Teoría", state: "locked", icon: BookOpen },
      { id: 202, name: "Modo Swipe", state: "locked", icon: Smartphone },
      { id: 203, name: "Match", state: "locked", icon: Layers },
      { id: 204, name: "Quiz Final", state: "locked", icon: Target },
    ],
    resumenData: [
      { type: 'HEADING', level: 1, text: 'Metabolismo Celular' },
      { type: 'PARAGRAPH', text: "El metabolismo es el conjunto de reacciones químicas que ocurren en la célula para mantener la vida, dividiéndose en procesos de construcción y de degradación." },
      { type: 'KEY_POINTS', items: [
        { title: "Catabolismo", text: "Degrada moléculas complejas liberando energía." },
        { title: "Anabolismo", text: "Construye moléculas complejas consumiendo energía." },
      ]},
      { type: 'FORMULA', latex: 'ATP \\rightarrow ADP + P_i + \\text{Energía}', label: 'Hidrólisis del ATP' },
      { type: 'TIP', title: 'Memotécnica', text: "Recuerda: Anabolismo 'Arma', Catabolismo 'Corta'.", variant: 'memory' },
    ],
  },
  {
    id: 3,
    tema: 3,
    titulo: "División Celular",
    descripcion: "Mitosis y Meiosis",
    variant: "primary",
    actividades: [
      { id: 301, name: "Teoría", state: "locked", icon: BookOpen },
      { id: 302, name: "Modo Swipe", state: "locked", icon: Smartphone },
      { id: 303, name: "Match", state: "locked", icon: Layers },
      { id: 304, name: "Quiz Final", state: "locked", icon: Target },
    ],
    resumenData: [
      { type: 'HEADING', level: 1, text: 'División Celular' },
      { type: 'PARAGRAPH', text: "Proceso por el cual una célula madre se divide para formar nuevas células hijas, esencial para el crecimiento, reparación de tejidos y reproducción sexual." },
      { type: 'IMAGE', src: 'https://placehold.co/600x300?text=Resumen', alt: 'División celular', caption: 'Mitosis y meiosis en comparación.' },
      { type: 'KEY_POINTS', items: [
        { title: "Mitosis", text: "Genera 2 células hijas diploides (idénticas)." },
        { title: "Meiosis", text: "Genera 4 células hijas haploides (gametos)." },
      ]},
      { type: 'FORMULA', latex: '2n \\rightarrow 2n \\text{ (Mitosis)} \\quad ; \\quad 2n \\rightarrow n \\text{ (Meiosis)}', label: 'Cambio de número cromosómico' },
      { type: 'TIP', title: 'Tip de examen', text: 'El crossing-over (variabilidad genética) ocurre exclusivamente en la Profase I de la Meiosis.', variant: 'exam' },
    ],
  },
  {
    id: 4,
    tema: 4,
    titulo: "Genética Mendeliana",
    descripcion: "Leyes de la herencia",
    variant: "primary",
    actividades: [
      { id: 401, name: "Teoría", state: "locked", icon: BookOpen },
      { id: 402, name: "Modo Swipe", state: "locked", icon: Smartphone },
      { id: 403, name: "Match", state: "locked", icon: Layers },
      { id: 404, name: "Quiz Final", state: "locked", icon: Target },
    ],
    resumenData: [
      { type: 'HEADING', level: 1, text: 'Genética Mendeliana' },
      { type: 'PARAGRAPH', text: "Estudio de cómo los caracteres se transmiten de generación en generación a través de los genes, fundamentado por los experimentos de Gregor Mendel." },
      { type: 'IMAGE', src: 'https://placehold.co/600x300?text=Resumen', alt: 'Cruzamiento genético', caption: 'Proporciones fenotípicas en F2.' },
      { type: 'KEY_POINTS', items: [
        { title: "Ley de Segregación", text: "Los alelos se separan durante la formación de gametos." },
        { title: "Fenotipo y Genotipo", text: "Fenotipo es lo visible; genotipo la carga genética." },
      ]},
      { type: 'FORMULA', latex: '\\text{Proporción fenotípica F2 (Aa x Aa)} = 3:1', label: 'Proporción clásica' },
      { type: 'CALLOUT', title: 'Cuidado', text: 'Con dominancia incompleta la proporción F2 es 1:2:1.', tone: 'warning' },
    ],
  },
  {
    id: 5,
    tema: 5,
    titulo: "Dogma Central",
    descripcion: "Flujo de la información genética",
    variant: "primary",
    actividades: [
      { id: 501, name: "Teoría", state: "locked", icon: BookOpen },
      { id: 502, name: "Modo Swipe", state: "locked", icon: Smartphone },
      { id: 503, name: "Match", state: "locked", icon: Layers },
      { id: 504, name: "Quiz Final", state: "locked", icon: Target },
    ],
    resumenData: [
      { type: 'HEADING', level: 1, text: 'Dogma Central' },
      { type: 'PARAGRAPH', text: "Explica cómo la información contenida en el ADN se traduce en proteínas funcionales, pasando por un intermediario de ARN." },
      { type: 'IMAGE', src: 'https://placehold.co/600x300?text=Resumen', alt: 'Dogma central', caption: 'ADN → ARN → Proteína.' },
      { type: 'KEY_POINTS', items: [
        { title: "Transcripción", text: "Copia de ADN a ARNm en el núcleo." },
        { title: "Traducción", text: "Síntesis de proteínas en los ribosomas." },
      ]},
      { type: 'FORMULA', latex: 'ADN \\rightarrow ARN \\rightarrow \\text{Proteína}', label: 'Flujo de información' },
      { type: 'TIP', title: 'Tip de examen', text: 'Los retrovirus (como el VIH) hacen transcripción inversa: ARN → ADN.', variant: 'exam' },
    ],
  },
  {
    id: 6,
    tema: 6,
    titulo: "Evolución Biológica",
    descripcion: "Teorías y evidencias",
    variant: "primary",
    actividades: [
      { id: 601, name: "Teoría", state: "locked", icon: BookOpen },
      { id: 602, name: "Modo Swipe", state: "locked", icon: Smartphone },
      { id: 603, name: "Match", state: "locked", icon: Layers },
      { id: 604, name: "Quiz Final", state: "locked", icon: Target },
    ],
    resumenData: [
      { type: 'HEADING', level: 1, text: 'Evolución Biológica' },
      { type: 'PARAGRAPH', text: "Proceso de transformación de las especies a lo largo del tiempo, impulsado por mecanismos como la selección natural y las mutaciones." },
      { type: 'KEY_POINTS', items: [
        { title: "Lamarckismo", text: "Teoría obsoleta del uso y desuso de órganos." },
        { title: "Neodarwinismo", text: "Selección natural combinada con genética moderna." },
      ]},
      { type: 'FORMULA', latex: '\\text{Variabilidad Genética} + \\text{Presión Ambiental} = \\text{Adaptación}', label: 'Evolución en resumen' },
      { type: 'TIP', title: 'Tip de examen', text: 'Órganos homólogos (mismo origen, diferente función) prueban evolución divergente.', variant: 'exam' },
    ],
  },
  {
    id: 7,
    tema: 7,
    titulo: "Ecología y Ecosistemas",
    descripcion: "Cadenas tróficas y ciclos",
    variant: "primary",
    actividades: [
      { id: 701, name: "Teoría", state: "locked", icon: BookOpen },
      { id: 702, name: "Modo Swipe", state: "locked", icon: Smartphone },
      { id: 703, name: "Match", state: "locked", icon: Layers },
      { id: 704, name: "Quiz Final", state: "locked", icon: Target },
    ],
    resumenData: [
      { type: 'HEADING', level: 1, text: 'Ecología y Ecosistemas' },
      { type: 'PARAGRAPH', text: "La ecología estudia las interacciones de los seres vivos entre sí y con su entorno físico (biotopo y biocenosis)." },
      { type: 'IMAGE', src: 'https://placehold.co/600x300?text=Resumen', alt: 'Ecosistema', caption: 'Componentes bióticos y abióticos.' },
      { type: 'KEY_POINTS', items: [
        { title: "Productores", text: "Autótrofos, base de la pirámide alimenticia." },
        { title: "Descomponedores", text: "Reciclan la materia orgánica (hongos y bacterias)." },
      ]},
      { type: 'FORMULA', latex: '\\text{Biotopo (inerte)} + \\text{Biocenosis (vivo)} = \\text{Ecosistema}', label: 'Definición' },
      { type: 'CALLOUT', title: 'Ley del 10%', text: 'Solo el 10% de la energía fluye de un nivel trófico al siguiente.', tone: 'info' },
    ],
  },
  {
    id: 8,
    tema: 8,
    titulo: "Sistema Inmunológico",
    descripcion: "Defensas del organismo",
    variant: "primary",
    actividades: [
      { id: 801, name: "Teoría", state: "locked", icon: BookOpen },
      { id: 802, name: "Modo Swipe", state: "locked", icon: Smartphone },
      { id: 803, name: "Match", state: "locked", icon: Layers },
      { id: 804, name: "Quiz Final", state: "locked", icon: Target },
    ],
    resumenData: [
      { type: 'HEADING', level: 1, text: 'Sistema Inmunológico' },
      { type: 'PARAGRAPH', text: "Red compleja de células, tejidos y órganos que trabajan en conjunto para defender el cuerpo contra patógenos invasores." },
      { type: 'KEY_POINTS', items: [
        { title: "Inmunidad Innata", text: "Respuesta rápida y general (piel, macrófagos)." },
        { title: "Inmunidad Adaptativa", text: "Respuesta específica con memoria (Linfocitos T y B)." },
      ]},
      { type: 'FORMULA', latex: '\\text{Antígeno (invasor)} + \\text{Anticuerpo (defensa)} \\rightarrow \\text{Complejo Inmune}', label: 'Reacción inmune' },
      { type: 'TIP', title: 'Memotécnica', text: 'Las vacunas generan inmunidad activa artificial mediante células de memoria.', variant: 'memory' },
    ],
  },
  {
    id: 9,
    tema: 9,
    titulo: "Sistema Nervioso",
    descripcion: "Impulsos y neurotransmisores",
    variant: "primary",
    actividades: [
      { id: 901, name: "Teoría", state: "locked", icon: BookOpen },
      { id: 902, name: "Modo Swipe", state: "locked", icon: Smartphone },
      { id: 903, name: "Match", state: "locked", icon: Layers },
      { id: 904, name: "Quiz Final", state: "locked", icon: Target },
    ],
    resumenData: [
      { type: 'HEADING', level: 1, text: 'Sistema Nervioso' },
      { type: 'PARAGRAPH', text: "Sistema encargado de recibir estímulos, procesar la información y generar respuestas coordinadas mediante impulsos eléctricos." },
      { type: 'IMAGE', src: 'https://placehold.co/600x300?text=Resumen', alt: 'Neurona', caption: 'El potencial de acción viaja por el axón.' },
      { type: 'KEY_POINTS', items: [
        { title: "Sinapsis", text: "Comunicación entre neuronas usando neurotransmisores." },
        { title: "SNC vs SNP", text: "Central (procesamiento) vs Periférico (transmisión)." },
      ]},
      { type: 'FORMULA', latex: '\\text{Estímulo} \\rightarrow \\text{Receptor} \\rightarrow \\text{Centro Nervioso} \\rightarrow \\text{Efector}', label: 'Arco reflejo' },
      { type: 'TIP', title: 'Tip de examen', text: 'El potencial de acción neuronal se despolariza por la entrada masiva de Sodio (Na+).', variant: 'exam' },
    ],
  },
  {
    id: 10,
    tema: 10,
    titulo: "Histología Vegetal",
    descripcion: "Tejidos y transporte",
    variant: "primary",
    actividades: [
      { id: 1001, name: "Teoría", state: "locked", icon: BookOpen },
      { id: 1002, name: "Modo Swipe", state: "locked", icon: Smartphone },
      { id: 1003, name: "Match", state: "locked", icon: Layers },
      { id: 1004, name: "Quiz Final", state: "locked", icon: Target },
    ],
    resumenData: [
      { type: 'HEADING', level: 1, text: 'Histología Vegetal' },
      { type: 'PARAGRAPH', text: "Estudio de las agrupaciones celulares en las plantas terrestres que cumplen funciones específicas como soporte, crecimiento y transporte." },
      { type: 'KEY_POINTS', items: [
        { title: "Meristemos", text: "Tejidos responsables del crecimiento continuo." },
        { title: "Tejidos Conductores", text: "Transporte de fluidos en plantas vasculares." },
      ]},
      { type: 'FORMULA', latex: '\\text{Xilema} = \\text{savia bruta} \\quad ; \\quad \\text{Floema} = \\text{savia elaborada}', label: 'Tejidos conductores' },
      { type: 'CALLOUT', title: 'Importante', text: 'El xilema transporta agua de forma unidireccional (raíz a hoja), el floema es bidireccional.', tone: 'warning' },
    ],
  },
];
