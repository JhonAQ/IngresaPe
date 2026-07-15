'use client';

import React from 'react';

interface RankingTableHeaderProps {
  showDelta?: boolean;
}

export const RankingTableHeader: React.FC<RankingTableHeaderProps> = ({
  showDelta = false,
}) => {
  return (
    <div className="flex font-bold py-2 text-[11.5px] sm:text-[12.5px] border-y-[1.5px] border-black bg-white">
      <div className="w-[12%] text-center">Nro</div>
      <div className="w-[20%] text-center">Liga</div>
      <div className="flex-1 pl-3">Nombre de Usuario</div>
      <div className={`text-right pr-2 ${showDelta ? 'w-[16%]' : 'w-[22%]'}`}>
        Puntaje
      </div>
      {showDelta && <div className="w-[14%] text-right pr-2">+/-</div>}
    </div>
  );
};
