import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isActive?: boolean;
  agentType?: string;
  capabilities?: string[];
  description?: string;
}

interface TeamContextType {
  selectedMember: TeamMember | null;
  setSelectedMember: (member: TeamMember | null) => void;
  openMetaGPTWithAgent: (agentType: string) => void;
  teamMembers: TeamMember[];
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

interface TeamProviderProps {
  children: ReactNode;
  onOpenMetaGPT?: (agentType?: string) => void;
}

export const TeamProvider: React.FC<TeamProviderProps> = ({ children, onOpenMetaGPT }) => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Product Manager',
      avatar: '👩‍💼',
      isActive: true
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      role: 'Architect',
      avatar: '👨‍💻',
      isActive: true
    },
    {
      id: '3',
      name: 'Alex Thompson',
      role: 'Engineer',
      avatar: '👨‍🔧',
      isActive: true
    },
    {
      id: '4',
      name: 'Chris Lee',
      role: 'QA Engineer',
      avatar: '👨‍🔬',
      isActive: true
    },
    {
      id: '5',
      name: 'Maria Garcia',
      role: 'Technical Writer',
      avatar: '👩‍📝',
      isActive: true
    }
  ]);

  const openMetaGPTWithAgent = (agentType: string) => {
    if (onOpenMetaGPT) {
      onOpenMetaGPT(agentType);
    }
  };

  const value: TeamContextType = {
    selectedMember,
    setSelectedMember,
    openMetaGPTWithAgent,
    teamMembers
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = (): TeamContextType => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}; 