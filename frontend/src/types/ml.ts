export interface MLModel {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

export interface ModelMetrics {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  error?: string;
}

export interface TrainingResult {
  models: ModelMetrics[];
  best_model: string;
  best_metric: string;
}

export interface AppSettings {
  trainTestSplit: number;
  randomState: number;
  missingValueHandling: 'drop' | 'mean' | 'median' | 'mode';
  imbalanceHandling: 'none' | 'smote' | 'undersample' | 'oversample';
  scalingMethod: 'none' | 'standard' | 'minmax' | 'robust';
  primaryMetric: 'accuracy' | 'precision' | 'recall' | 'f1';
  knnNeighbors: number;
  crossValidation: boolean;
  cvFolds: number;
}

// ── IMPORTANT: these ids must exactly match the keys in backend MODEL_REGISTRY ──
export const DEFAULT_MODELS: MLModel[] = [
  { id: 'logistic',      name: 'Logistic Regression',    description: 'Linear model for classification',   selected: false },
  { id: 'knn',           name: 'K-Nearest Neighbors',    description: 'Instance-based learning algorithm', selected: false },
  { id: 'decision_tree', name: 'Decision Tree',          description: 'Tree-based classification model',   selected: false },
  { id: 'svm',           name: 'Support Vector Machine', description: 'Maximum margin classifier',         selected: false },
  { id: 'naive_bayes',   name: 'Naive Bayes',            description: 'Probabilistic classifier',          selected: false },
  { id: 'random_forest', name: 'Random Forest',          description: 'Ensemble of decison trees',         selected: false }
];

export const DEFAULT_SETTINGS: AppSettings = {
  trainTestSplit:       80,
  randomState:          69,
  missingValueHandling: 'drop',
  imbalanceHandling:    'none',
  scalingMethod:        'standard',
  primaryMetric:        'accuracy',
  knnNeighbors:         5,
  crossValidation:      false,
  cvFolds:              5,
};
