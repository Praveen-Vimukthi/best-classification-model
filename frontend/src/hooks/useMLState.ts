import { useState, useCallback } from 'react';
import {
  MLModel, ModelMetrics, AppSettings, DEFAULT_SETTINGS,
  CLASSIFICATION_MODELS, REGRESSION_MODELS, TaskType,
  ClassificationMetrics, RegressionMetrics,
} from '@/types/ml';

export function useMLState() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [models, setModels] = useState<MLModel[]>(CLASSIFICATION_MODELS);
  const [trainingResults, setTrainingResults] = useState<ModelMetrics[] | null>(null);
  const [bestModel, setBestModel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [targetColumn, setTargetColumn] = useState<string>('');

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

  const setTaskType = useCallback((task: TaskType) => {
    setSettings(prev => ({ ...prev, taskType: task }));
    setModels(task === 'classification' ? CLASSIFICATION_MODELS : REGRESSION_MODELS);
    setTrainingResults(null);
    setBestModel(null);
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      if (updates.taskType && updates.taskType !== prev.taskType) {
        setModels(updates.taskType === 'classification' ? CLASSIFICATION_MODELS : REGRESSION_MODELS);
        setTrainingResults(null);
        setBestModel(null);
      }
      return next;
    });
  }, []);

  const trainFromCsv = useCallback(async (file: File) => {
    if (selectedModels.length === 0) return;

    setIsLoading(true);
    setTrainingResults(null);
    setBestModel(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (settings.taskType === 'classification') {
        const results: ClassificationMetrics[] = selectedModels.map(model => ({
          name: model.name,
          accuracy: Math.random() * 0.3 + 0.7,
          precision: Math.random() * 0.3 + 0.7,
          recall: Math.random() * 0.3 + 0.7,
          f1: Math.random() * 0.3 + 0.7,
        }));
        const metric = settings.primaryMetricClassification;
        const best = results.reduce((p, c) => (c[metric] > p[metric] ? c : p));
        setTrainingResults(results);
        setBestModel(best.name);
      } else {
        const results: RegressionMetrics[] = selectedModels.map(model => {
          const mse = Math.random() * 50 + 5;
          return {
            name: model.name,
            mae: Math.random() * 5 + 1,
            mse,
            rmse: Math.sqrt(mse),
            r2: Math.random() * 0.4 + 0.55,
          };
        });
        const metric = settings.primaryMetricRegression;
        // Higher is better for r2, lower for error metrics
        const higherBetter = metric === 'r2';
        const best = results.reduce((p, c) =>
          higherBetter ? (c[metric] > p[metric] ? c : p) : (c[metric] < p[metric] ? c : p)
        );
        setTrainingResults(results);
        setBestModel(best.name);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedModels, settings.taskType, settings.primaryMetricClassification, settings.primaryMetricRegression]);

  const removeCsvFile = useCallback(() => {
    setCsvFile(null);
    setTrainingResults(null);
    setBestModel(null);
    setTargetColumn('');
  }, []);

  return {
    models,
    selectedModels,
    settings,
    trainingResults,
    bestModel,
    isLoading,
    csvFile,
    targetColumn,
    setTargetColumn,
    setCsvFile,
    removeCsvFile,
    toggleModel,
    selectAllModels,
    clearAllModels,
    updateSettings,
    setTaskType,
    trainFromCsv,
  };
}
