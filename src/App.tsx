/**
 * PROOFPATH — Advanced Multi-Agent AI Career Operating System
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { CareerDataProvider, useCareerData } from './contexts/CareerDataContext';
import { ToastContainer } from './components/common/ToastContainer';
import { AppLayout, NavTab } from './components/layout/AppLayout';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { CareerAssistantChat } from './components/chat/CareerAssistantChat';
import { CareerProfileView } from './components/profile/CareerProfileView';
import { JobMarketIntelligenceView } from './components/jobs/JobMarketIntelligenceView';
import { SkillIntelligenceView } from './components/skills/SkillIntelligenceView';
import { RoadmapView } from './components/roadmap/RoadmapView';
import { PortfolioStudioView } from './components/projects/PortfolioStudioView';
import { MockInterviewArena } from './components/interview/MockInterviewArena';
import { ApplicationTrackerView } from './components/applications/ApplicationTrackerView';
import { CareerAnalyticsView } from './components/analytics/CareerAnalyticsView';
import { SettingsMemoryView } from './components/settings/SettingsMemoryView';

function AppContent({ activeTab, setActiveTab }: { activeTab: NavTab; setActiveTab: (tab: NavTab) => void }) {
  const { setNavigateToTab } = useCareerData();

  useEffect(() => {
    if (setNavigateToTab) {
      setNavigateToTab((tab: string) => setActiveTab(tab as NavTab));
    }
  }, [setNavigateToTab, setActiveTab]);

  return (
    <>
      <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'dashboard' && <OverviewDashboard setActiveTab={setActiveTab} />}
        {activeTab === 'assistant' && <CareerAssistantChat />}
        {activeTab === 'profile' && <CareerProfileView />}
        {activeTab === 'jobs' && <JobMarketIntelligenceView />}
        {activeTab === 'skills' && <SkillIntelligenceView />}
        {activeTab === 'roadmap' && <RoadmapView />}
        {activeTab === 'projects' && <PortfolioStudioView />}
        {activeTab === 'interview' && <MockInterviewArena />}
        {activeTab === 'applications' && <ApplicationTrackerView />}
        {activeTab === 'analytics' && <CareerAnalyticsView />}
        {activeTab === 'settings' && <SettingsMemoryView />}
      </AppLayout>
      <ToastContainer />
    </>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  return (
    <AuthProvider>
      <ToastProvider>
        <CareerDataProvider>
          <AppContent activeTab={activeTab} setActiveTab={setActiveTab} />
        </CareerDataProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
