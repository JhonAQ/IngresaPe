"use client";

import { useState } from "react";
import { DashboardHeader } from "../../../components/dashboard/Header";
import { CourseProgress } from "../../../components/dashboard/CourseProgress";
import { TopicList } from "../../../components/dashboard/TopicList";
import { SummaryModal } from "../../../components/dashboard/SummaryModal";
import { BottomNav } from "../../../components/dashboard/BottomNav";
import { temarioMock, userStats } from "../../../data/dashboard-mock";
import { TemaData } from "../../../types/dashboard";

export default function DashboardPage() {
  const [resumenActivo, setResumenActivo] = useState<TemaData | null>(null);

  return (
    <div 
      className="w-full max-w-md mx-auto relative bg-white flex flex-col shadow-2xl overflow-hidden sm:border-x-2 border-slate-800/30 font-sans"
      style={{ height: "100dvh" }}
    >
      {/* Top Section */}
      <div className="bg-white border-b-2 border-slate-200 shrink-0 z-40 relative flex flex-col">
        <DashboardHeader racha={userStats.racha} gemas={userStats.gemas} />
        <CourseProgress />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-5 pb-32 hide-scrollbar relative bg-app-canvas">
        <TopicList 
          temario={temarioMock} 
          onOpenSummary={setResumenActivo} 
        />
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav />

      {/* Floating Modal for Summaries */}
      <SummaryModal 
        resumenActivo={resumenActivo} 
        onClose={() => setResumenActivo(null)} 
      />
    </div>
  );
}
