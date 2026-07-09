'use client';

import React from 'react';

export const RankingTableHeader: React.FC = () => {
  return (
    <div className="flex font-bold py-2 text-[11.5px] sm:text-[12.5px] border-y-[1.5px] border-black bg-white">
      <div className="w-[12%] text-center">Nro</div>
      <div className="w-[20%] text-center">Liga</div>
      <div className="flex-1 pl-3">Nombre de Usuario</div>
      <div className="w-[22%] text-right pr-2">Puntaje</div>
    </div>
  );
};
