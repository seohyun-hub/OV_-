import React from 'react';
import { ContentLabView } from './ContentLabView';

interface WeeklyContentPlannerProps {
  onSearchTrend?: (query: string) => void;
  onSearchCompany?: (company: string) => void;
  onNavigateTab?: (tab: any) => void;
  onOpenQRCodeModal?: (url?: string, name?: string) => void;
}

export const WeeklyContentPlanner: React.FC<WeeklyContentPlannerProps> = (props) => {
  return <ContentLabView {...props} />;
};

export default WeeklyContentPlanner;
