import { BookOpen, Target, Smartphone, Layers } from "lucide-react";
import { TemaData, UserStats } from "../types/dashboard";

export const userStats: UserStats = { racha: 12, vidas: 5, gemas: 450, xp: 2850 };

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
    resumenData: {
      introduccion: "La célula eucariota es la unidad básica y funcional de organismos complejos. Se caracteriza por tener un núcleo definido protegido por una membrana nuclear que alberga el material genético.",
      imagenExplicativa: true,
      puntosClave: [
        { titulo: "Núcleo Celular", texto: "Almacena y protege el material genético (ADN)." },
        { titulo: "Mitocondrias", texto: "La 'planta de energía'." },
      ],
      formulaDestacada: "C₆H₁₂O₆ + 6O₂ ➔ 6CO₂ + 6H₂O + ATP",
      tipExamen: "Diferencia clásica: Las vegetales tienen pared celular de celulosa."
    }
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
    resumenData: {
      introduccion: "El metabolismo es el conjunto de reacciones químicas que ocurren en la célula para mantener la vida, dividiéndose en procesos de construcción y de degradación.",
      imagenExplicativa: false,
      puntosClave: [
        { titulo: "Catabolismo", texto: "Degrada moléculas complejas liberando energía." },
        { titulo: "Anabolismo", texto: "Construye moléculas complejas consumiendo energía." }
      ],
      formulaDestacada: "ATP ➔ ADP + Pᵢ + Energía",
      tipExamen: "Recuerda: Anabolismo 'Arma', Catabolismo 'Corta'."
    }
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
    resumenData: {
      introduccion: "Proceso por el cual una célula madre se divide para formar nuevas células hijas, esencial para el crecimiento, reparación de tejidos y reproducción sexual.",
      imagenExplicativa: true,
      puntosClave: [
        { titulo: "Mitosis", texto: "Genera 2 células hijas diploides (idénticas)." },
        { titulo: "Meiosis", texto: "Genera 4 células hijas haploides (gametos)." }
      ],
      formulaDestacada: "2n ➔ 2n (Mitosis) / 2n ➔ n (Meiosis)",
      tipExamen: "El crossing-over (variabilidad genética) ocurre exclusivamente en la Profase I de la Meiosis."
    }
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
    resumenData: {
      introduccion: "Estudio de cómo los caracteres se transmiten de generación en generación a través de los genes, fundamentado por los experimentos de Gregor Mendel.",
      imagenExplicativa: true,
      puntosClave: [
        { titulo: "Ley de Segregación", texto: "Los alelos se separan durante la formación de gametos." },
        { titulo: "Fenotipo y Genotipo", texto: "Fenotipo es lo visible; genotipo la carga genética." }
      ],
      formulaDestacada: "Proporción Fenotípica F2 (Aa x Aa) = 3:1",
      tipExamen: "Cuidado con la dominancia incompleta en problemas prácticos, ahí la proporción F2 es 1:2:1."
    }
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
    resumenData: {
      introduccion: "Explica cómo la información contenida en el ADN se traduce en proteínas funcionales, pasando por un intermediario de ARN.",
      imagenExplicativa: true,
      puntosClave: [
        { titulo: "Transcripción", texto: "Copia de ADN a ARNm en el núcleo." },
        { titulo: "Traducción", texto: "Síntesis de proteínas en los ribosomas." }
      ],
      formulaDestacada: "ADN ➔ ARN ➔ Proteína",
      tipExamen: "Recuerda que los retrovirus (como el VIH) hacen transcripción inversa: ARN ➔ ADN."
    }
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
    resumenData: {
      introduccion: "Proceso de transformación de las especies a lo largo del tiempo, impulsado por mecanismos como la selección natural y las mutaciones.",
      imagenExplicativa: false,
      puntosClave: [
        { titulo: "Lamarckismo", texto: "Teoría obsoleta del uso y desuso de órganos." },
        { titulo: "Neodarwinismo", texto: "Selección natural combinada con genética moderna." }
      ],
      formulaDestacada: "Variabilidad Genética + Presión Ambiental = Adaptación",
      tipExamen: "Órganos homólogos (mismo origen, diferente función) prueban evolución divergente."
    }
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
    resumenData: {
      introduccion: "La ecología estudia las interacciones de los seres vivos entre sí y con su entorno físico (biotopo y biocenosis).",
      imagenExplicativa: true,
      puntosClave: [
        { titulo: "Productores", texto: "Autótrofos, base de la pirámide alimenticia." },
        { titulo: "Descomponedores", texto: "Reciclan la materia orgánica (hongos y bacterias)." }
      ],
      formulaDestacada: "Biotopo (inerte) + Biocenosis (vivo) = Ecosistema",
      tipExamen: "Solo el 10% de la energía fluye de un nivel trófico al siguiente (Ley del 10%)."
    }
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
    resumenData: {
      introduccion: "Red compleja de células, tejidos y órganos que trabajan en conjunto para defender el cuerpo contra patógenos invasores.",
      imagenExplicativa: false,
      puntosClave: [
        { titulo: "Inmunidad Innata", texto: "Respuesta rápida y general (piel, macrófagos)." },
        { titulo: "Inmunidad Adaptativa", texto: "Respuesta específica con memoria (Linfocitos T y B)." }
      ],
      formulaDestacada: "Antígeno (invasor) + Anticuerpo (defensa) ➔ Complejo Inmune",
      tipExamen: "Las vacunas generan inmunidad activa artificial mediante células de memoria."
    }
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
    resumenData: {
      introduccion: "Sistema encargado de recibir estímulos, procesar la información y generar respuestas coordinadas mediante impulsos eléctricos.",
      imagenExplicativa: true,
      puntosClave: [
        { titulo: "Sinapsis", texto: "Comunicación entre neuronas usando neurotransmisores." },
        { titulo: "SNC vs SNP", texto: "Central (procesamiento) vs Periférico (transmisión)." }
      ],
      formulaDestacada: "Estímulo ➔ Receptor ➔ Centro Nervioso ➔ Efector",
      tipExamen: "El potencial de acción neuronal se despolariza por la entrada masiva de Sodio (Na+)."
    }
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
    resumenData: {
      introduccion: "Estudio de las agrupaciones celulares en las plantas terrestres que cumplen funciones específicas como soporte, crecimiento y transporte.",
      imagenExplicativa: false,
      puntosClave: [
        { titulo: "Meristemos", texto: "Tejidos responsables del crecimiento continuo." },
        { titulo: "Tejidos Conductores", texto: "Transporte de fluidos en plantas vasculares." }
      ],
      formulaDestacada: "Xilema = Savia bruta / Floema = Savia elaborada",
      tipExamen: "El xilema transporta agua de forma unidireccional (raíz a hoja), el floema es bidireccional."
    }
  }
];