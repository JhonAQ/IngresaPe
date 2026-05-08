import React from 'react';

export interface Opcion {
  letra: string;
  texto: string;
}

interface QuestionCardProps {
  texto: string;
  opciones: Opcion[];
  etiqueta: string;
  resaltar?: string;
}

export const QuestionCard = ({
  texto,
  opciones,
  etiqueta,
  resaltar,
}: QuestionCardProps) => {
  const renderizarTextoConResalte = (
    textoCompleto: string,
    palabra?: string
  ) => {
    if (!palabra) return textoCompleto;
    const regex = new RegExp(`(${palabra})`, 'gi');
    return textoCompleto.split(regex).map((part, index) =>
      part.toUpperCase() === palabra.toUpperCase() ? (
        <span key={index} className="uppercase font-black text-[#0f172a]">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative mb-6">
      <h2 className="text-[19px] font-bold text-[#334155] leading-snug mb-8">
        {renderizarTextoConResalte(texto, resaltar)}
      </h2>

      <div className="space-y-5 mb-16">
        {opciones.map((opc) => (
          <div key={opc.letra} className="flex items-start gap-4">
            <span className="text-[#8ba3c7] font-black text-[17px] leading-snug shrink-0">
              {opc.letra})
            </span>
            <span className="text-[#1e293b] font-bold text-[17px] leading-snug">
              {opc.texto}
            </span>
          </div>
        ))}
      </div>

      <div className="absolute bottom-5 right-5">
        <span className="border-2 border-[#dbeafe] text-[#3b82f6] px-4 py-1.5 rounded-xl text-[11px] font-black tracking-widest uppercase">
          {etiqueta}
        </span>
      </div>
    </div>
  );
};
