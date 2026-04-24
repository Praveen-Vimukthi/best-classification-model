import { useState, useCallback } from 'react';
import { MLModel, ModelMetrics, AppSettings, DEFAULT_MODELS, DEFAULT_SETTINGS } from '@/types/ml';

const BACKEND_URL = 'http://localhost:5000';

export function useMLState() {
  const [models, setModels] = useState<MLModel[]>(DEFAULT_MODELS);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [trainingResults, setTrainingResults] = useState<ModelMetrics[] | null>(null);
  const [bestModel, setBestModel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const selectedModels = models.filter(m => m.selected);

  const toggleModel = useCallback((id: string) => {
    setModels(prev => prev.map(m =>
      m.id === id ? { ...m, selected: !m.selected } : m
    ));
  }, []);

  const selectAllModels = useCallback(() => {
    setModels(prev => prev.map(m => ({ ...m, selected: true })));
  }, []);

  const clearAllModels = useCallback(() => {
    setModels(prev => prev.map(m => ({ ...m, selected: false })));
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const removeCsvFile = useCallback(() => {
    setCsvFile(null);
    setTrainingResults(null);
    setBestModel(null);
    setError(null);
  }, []);

  const trainFromCsv = useCallback(async (file: File) => {
    if (selectedModels.length === 0) return;

    setIsLoading(true);
    setTrainingResults(null);
    setBestModel(null);
    setError(null);

    try {
      // Map frontend values → backend expected values
      const missingMethodMap: Record<string, string> = {
        drop:   'drop',
        mean:   'impute',
        median: 'impute',
        mode:   'impute',
      };
      const imbalanceMethodMap: Record<string, string> = {
        none:        'skip',
        smote:       'smote',
        undersample: 'under',
        oversample:  'over',
      };

      const formData = new FormData();
      formData.append('file',             file);
      formData.append('models',           selectedModels.map(m => m.id).join(','));
      formData.append('test_size',        String((100 - settings.trainTestSplit) / 100));
      formData.append('random_state',     String(settings.randomState));
      formData.append('label_col_index',  '-1');
      formData.append('missing_method',   missingMethodMap[settings.missingValueHandling] ?? 'drop');
      formData.append('imbalance_method', imbalanceMethodMap[settings.imbalanceHandling]  ?? 'skip');
      formData.append('scaling_method',   settings.scalingMethod);
      formData.append('primary_metric',   settings.primaryMetric);
      formData.append('knn_neighbors',    String(settings.knnNeighbors));
      formData.append('cross_validation', String(settings.crossValidation));
      formData.append('cv_folds',         String(settings.cvFolds));

      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        body:   formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error');
      }

      setTrainingResults(data.results);
      setBestModel(data.best_model);

    } catch (err: any) {
      setError(
        err.message?.includes('fetch')
          ? 'Cannot connect to backend. Make sure Flask is running: python app.py'
          : err.message || 'Unknown error'
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedModels, settings]);

  return {
    models,
    selectedModels,
    settings,
    trainingResults,
    bestModel,
    isLoading,
    error,
    csvFile,
    setCsvFile,
    removeCsvFile,
    toggleModel,
    selectAllModels,
    clearAllModels,
    updateSettings,
    trainFromCsv,
  };
}
