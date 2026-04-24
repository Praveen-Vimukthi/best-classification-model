import { useState } from 'react';
import { Navbar } from '@/components/ml/Navbar';
import { MobileNav } from '@/components/ml/MobileNav';
import { DashboardSection } from '@/components/ml/DashboardSection';
import { SettingsSection } from '@/components/ml/SettingsSection';
import { AboutSection } from '@/components/ml/AboutSection';
import { useMLState } from '@/hooks/useMLState';
import { useTheme } from '@/hooks/useTheme';

type Section = 'dashboard' | 'settings' | 'about';

const Index = () => {
  const [currentSection, setCurrentSection] = useState<Section>('dashboard');
  const { isDark, toggleTheme } = useTheme();
  const {
    models,
    selectedModels,
    settings,
    trainingResults,
    bestModel,
    isLoading,
    csvFile,
    setCsvFile,
    removeCsvFile,
    toggleModel,
    selectAllModels,
    clearAllModels,
    updateSettings,
    trainFromCsv,
  } = useMLState();

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return (
          <DashboardSection
            models={models}
            selectedCount={selectedModels.length}
            bestModel={bestModel}
            results={trainingResults}
            primaryMetric={settings.primaryMetric}
            isLoading={isLoading}
            csvFile={csvFile}
            onSetCsvFile={setCsvFile}
            onRemoveCsvFile={removeCsvFile}
            onToggleModel={toggleModel}
            onSelectAll={selectAllModels}
            onClearAll={clearAllModels}
            onUploadCsv={trainFromCsv}
            knnSelected={selectedModels.some(m => m.id === 'knn')}
            knnNeighbors={settings.knnNeighbors}
            onUpdateSettings={updateSettings}
          />
        );
      case 'settings':
        return (
          <SettingsSection
            settings={settings}
            onUpdate={updateSettings}
          />
        );
      case 'about':
        return <AboutSection />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        currentSection={currentSection}
        onNavigate={setCurrentSection}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />
      
      <div className="container py-8">
        <div className="flex items-center gap-2 mb-6 md:hidden">
          <MobileNav
            currentSection={currentSection}
            onNavigate={setCurrentSection}
          />
          <span className="font-semibold capitalize">{currentSection}</span>
        </div>
        
        {renderSection()}
      </div>
    </div>
  );
};

export default Index;
