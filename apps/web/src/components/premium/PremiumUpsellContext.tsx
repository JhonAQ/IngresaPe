'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UpsellModal, UpsellTriggerType } from './UpsellModal';

interface PremiumUpsellContextType {
  triggerUpsell: (type: UpsellTriggerType) => void;
  isOpen: boolean;
  closeUpsell: () => void;
}

const PremiumUpsellContext = createContext<PremiumUpsellContextType | undefined>(undefined);

export function PremiumUpsellProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerType, setTriggerType] = useState<UpsellTriggerType>('GENERIC');

  const triggerUpsell = (type: UpsellTriggerType = 'GENERIC') => {
    setTriggerType(type);
    setIsOpen(true);
  };

  const closeUpsell = () => {
    setIsOpen(false);
  };

  return (
    <PremiumUpsellContext.Provider value={{ triggerUpsell, isOpen, closeUpsell }}>
      {children}
      <UpsellModal isOpen={isOpen} onClose={closeUpsell} triggerType={triggerType} />
    </PremiumUpsellContext.Provider>
  );
}

export function usePremiumUpsell() {
  const context = useContext(PremiumUpsellContext);
  if (context === undefined) {
    throw new Error('usePremiumUpsell must be used within a PremiumUpsellProvider');
  }
  return context;
}
