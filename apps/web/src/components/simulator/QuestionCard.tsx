import React from 'react';
import { LatexText } from '../ui/LatexText';

interface ExamOption {
  id: string;
  text: string;
  imageUrl?: string | null;
}

interface QuestionCardProps {
  texto: string;
  imageUrl?: string | null;
  opciones: ExamOption[];
  etiqueta?: string;
  resaltar?: string;
}

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

export const QuestionCard = ({
  texto,
  imageUrl,
  opciones,
  etiqueta,
  resaltar,
}: QuestionCardProps) => {
  const renderizarTextoConResalte = (textoCompleto: string, palabra?: string) => {
    if (!palabra) return <LatexText text={textoCompleto} />;
    const regex = new RegExp(`(${palabra})`, 'gi');
    return textoCompleto.split(regex).map((part, index) =>
      part.toUpperCase() === palabra.toUpperCase() ? (
        <span key={index} className="uppercase font-black text-[#0f172a]">
          {part}
        </span>
      ) : (
        <span key={index}>
          <LatexText text={part} />
        </span>
      )
    );
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative mb-6">
      {imageUrl && (
        <div className="mb-5 -mx-2">
          <img
            src={imageUrl}
            alt="Imagen de la pregunta"
            className="w-full rounded-2xl object-contain max-h-[260px]"
            loading="lazy"
          />
        </div>
      )}

      <h2 className="text-[19px] font-bold text-[#334155] leading-snug mb-8">
        {renderizarTextoConResalte(texto, resaltar)}
      </h2>

      <div className="space-y-5 mb-16">
        {opciones.map((opc, index) => {
          const label = optionLabels[index] ?? opc.id.toUpperCase();
          return (
            <div key={opc.id} className="flex items-start gap-4">
              <span className="text-[#8ba3c7] font-black text-[17px] leading-snug shrink-0">
                {label})
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-[#1e293b] font-bold text-[17px] leading-snug">
                  <LatexText text={opc.text} />
                </span>
                {opc.imageUrl && (
                  <img
                    src={opc.imageUrl}
                    alt={`Imagen alternativa ${label}`}
                    className="mt-2 w-full rounded-xl object-contain max-h-[180px]"
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {etiqueta && (
        <div className="absolute bottom-5 right-5">
          <span className="border-2 border-[#dbeafe] text-[#3b82f6] px-4 py-1.5 rounded-xl text-[11px] font-black tracking-widest uppercase">
            {etiqueta}
          </span>
        </div>
      )}
    </div>
  );
};
