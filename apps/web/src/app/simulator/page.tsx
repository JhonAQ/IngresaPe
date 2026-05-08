'use client';

import React, { useState, useEffect } from 'react';
import { TopBar, ProgressBar, QuestionHeader, ReadingContextCard, QuestionCard, FooterNavigation, AnswerBubbles, FichaOpticaModal } from '../../components/simulator';

export default function SimulatorPage() {
  const TOTAL_PREGUNTAS = 80;
  
  const [preguntaActual, setPreguntaActual] = useState(1);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [marcadas, setMarcadas] = useState<number[]>([]);
  const [fichaAbierta, setFichaAbierta] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(10795); // 02:59:55

  useEffect(() => {
    const timer = setInterval(() => {
      setTiempoRestante((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPreguntaData = (id: number) => {
    const lecturaTexto1 = "La inteligencia artificial (IA) generativa es una rama de la informática que se enfoca en crear sistemas capaces de originar texto, imágenes u otros medios a partir de patrones aprendidos. A diferencia de la IA tradicional, que está diseñada para clasificar o predecir datos existentes, la IA generativa produce contenido completamente nuevo y original. Sin embargo, esto plantea grandes dilemas éticos sobre la propiedad intelectual y la veracidad de la información.";

    const db: Record<number, any> = {
      1: {
        area: "RAZONAMIENTO VERBAL",
        texto: "Señale el sinónimo de la palabra subrayada: El comportamiento del reo fue EXECRABLE durante el juicio.",
        resaltar: "EXECRABLE",
        opciones: [
          { letra: 'A', texto: 'loable' },
          { letra: 'B', texto: 'abominable' },
          { letra: 'C', texto: 'misterioso' },
          { letra: 'D', texto: 'inusual' },
          { letra: 'E', texto: 'pacífico' }
        ],
        etiqueta: "ORDINARIO 2026"
      },
      2: {
        area: "RAZONAMIENTO MATEMÁTICO",
        texto: "Determine el número que continúa en la siguiente sucesión: 2, 5, 10, 17, 26, ...",
        opciones: [
          { letra: 'A', texto: '35' },
          { letra: 'B', texto: '37' },
          { letra: 'C', texto: '39' },
          { letra: 'D', texto: '41' },
          { letra: 'E', texto: '45' }
        ],
        etiqueta: "CEPRUNSA 2025"
      },
      3: {
        area: "COMPRENSIÓN LECTORA",
        contexto: lecturaTexto1, 
        texto: "Según el texto, ¿cuál es la diferencia principal entre la IA generativa y la IA tradicional?",
        opciones: [
          { letra: 'A', texto: 'La IA tradicional no utiliza algoritmos.' },
          { letra: 'B', texto: 'La IA generativa produce contenido nuevo, mientras que la tradicional clasifica o predice datos.' },
          { letra: 'C', texto: 'La IA generativa solo crea imágenes, no textos.' },
          { letra: 'D', texto: 'No existe ninguna diferencia significativa entre ambas.' },
          { letra: 'E', texto: 'La IA tradicional es más moderna que la IA generativa.' }
        ],
        etiqueta: "TEXTO 1"
      },
      4: {
        area: "COMPRENSIÓN LECTORA",
        contexto: lecturaTexto1, 
        texto: "De la lectura se puede inferir que el avance de la IA generativa:",
        opciones: [
          { letra: 'A', texto: 'Ha resuelto todos los problemas de la propiedad intelectual.' },
          { letra: 'B', texto: 'Solo es útil para predecir datos existentes.' },
          { letra: 'C', texto: 'Viene acompañado de importantes debates éticos.' },
          { letra: 'D', texto: 'Es un retroceso para la informática moderna.' },
          { letra: 'E', texto: 'Ha reemplazado por completo a la inteligencia humana.' }
        ],
        etiqueta: "TEXTO 1"
      }
    };
    
    return db[id] || {
      area: "CONOCIMIENTOS GENERALES",
      texto: `Pregunta de simulacro número ${id}. Seleccione la alternativa que considere correcta según sus conocimientos del temario.`,
      opciones: [
        { letra: 'A', texto: 'Primera alternativa posible' },
        { letra: 'B', texto: 'Segunda alternativa posible' },
        { letra: 'C', texto: 'Tercera alternativa posible' },
        { letra: 'D', texto: 'Cuarta alternativa posible' },
        { letra: 'E', texto: 'Quinta alternativa posible' }
      ],
      etiqueta: "SIMULACRO GENERAL"
    };
  };

  const preguntaActualData = getPreguntaData(preguntaActual);

  const handleToggleBandera = () => {
    setMarcadas(prev => prev.includes(preguntaActual) 
      ? prev.filter(id => id !== preguntaActual) 
      : [...prev, preguntaActual]
    );
  };

  const handleCambiarPregunta = (numero: number) => {
    if (numero >= 1 && numero <= TOTAL_PREGUNTAS) {
      setPreguntaActual(numero);
      setFichaAbierta(false);
    }
  };

  const handleSeleccionarRespuesta = (letra: string) => {
    setRespuestas(prev => ({ ...prev, [preguntaActual]: letra }));
    
    if (preguntaActual < TOTAL_PREGUNTAS) {
      setTimeout(() => {
        setPreguntaActual(prev => Math.min(prev + 1, TOTAL_PREGUNTAS));
      }, 350);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative bg-[#f8f9fc] h-[100dvh] flex flex-col shadow-2xl overflow-hidden border-x border-slate-200">
      <TopBar 
        tiempoRestante={tiempoRestante} 
        onClose={() => alert('Salir del simulacro')}
      />

      <ProgressBar 
        respondidas={Object.keys(respuestas).length} 
        total={TOTAL_PREGUNTAS} 
      />

      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-5 pb-36 custom-scrollbar relative">
        <div key={preguntaActual} className="animate-in slide-in-from-right-4 fade-in duration-300 w-full">
          <QuestionHeader 
            preguntaActual={preguntaActual}
            totalPreguntas={TOTAL_PREGUNTAS}
            area={preguntaActualData.area}
            isMarcada={marcadas.includes(preguntaActual)}
            onToggleBandera={handleToggleBandera}
          />

          <ReadingContextCard contexto={preguntaActualData.contexto} />

          <QuestionCard 
            texto={preguntaActualData.texto}
            opciones={preguntaActualData.opciones}
            etiqueta={preguntaActualData.etiqueta}
            resaltar={preguntaActualData.resaltar}
          />
        </div>
      </main>

      <div className="absolute bottom-0 left-0 right-0 bg-white z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <FooterNavigation 
          onAnterior={() => handleCambiarPregunta(preguntaActual - 1)}
          onPasar={() => handleCambiarPregunta(preguntaActual + 1)}
          onOpenFicha={() => setFichaAbierta(true)}
          isFirst={preguntaActual === 1}
          isLast={preguntaActual === TOTAL_PREGUNTAS}
        />

        <AnswerBubbles 
          preguntaActual={preguntaActual}
          respuestaSeleccionada={respuestas[preguntaActual]}
          onSelect={handleSeleccionarRespuesta}
        />
      </div>

      <FichaOpticaModal 
        isOpen={fichaAbierta}
        onClose={() => setFichaAbierta(false)}
        respuestas={respuestas}
        marcadas={marcadas}
        preguntaActual={preguntaActual}
        totalPreguntas={TOTAL_PREGUNTAS}
        onCambiarPregunta={handleCambiarPregunta}
      />
    </div>
  );
}