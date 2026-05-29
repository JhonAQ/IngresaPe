'use client';

import React from 'react';
import { ProfileHeader } from '../../../components/perfil/ProfileHeader';
import { StatsRow } from '../../../components/perfil/StatsRow';
import { AcademicDNA } from '../../../components/perfil/AcademicDNA';
import { TrophyRoom } from '../../../components/perfil/TrophyRoom';
import { Settings } from 'lucide-react';

export default function PerfilPage() {
  return (
    <main className="flex-1 overflow-y-auto hide-scrollbar bg-slate-50">
      <ProfileHeader
        name="Juan Pérez"
        university="Medicina Humana"
        level={12}
        currentXp={150}
        xpToNext={300}
        isPro={true}
      />
      
      <div className="px-5 -mt-6 relative z-10">
        <StatsRow
          racha={12}
          expTotal={4500}
          liga="Oro"
        />
      </div>

      <div className="px-5 mt-6">
        <AcademicDNA
          scores={{
            'R. Lógico': 85,
            'Aptitud Acad.': 70,
            'Matemática': 78,
            'C. Sociales': 45,
            'C. y Tecnología': 50,
            'DPCC': 40,
            'Comunicación': 55,
            'Idiomas': 60,
          }}
          strongIn="Números y Lógica"
          prioritize="Letras y Sociales"
        />
      </div>

      <div className="px-5 mt-6 pb-8">
        <TrophyRoom />
      </div>
    </main>
  );
}
