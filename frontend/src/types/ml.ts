export type TaskType = 'classification' | 'regression';

export interface MLModel {
  id: string;
  name: string;
  description: string;
  selected: boolean;
  task: TaskType;
}

// Classification metrics (0-1 range)
export interface ClassificationMetrics {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

// Regression metrics
export interface RegressionMetrics {
  name: string;
  mae: number;
  mse: number;
  rmse: number;
  r2: number;
}

export type ModelMetrics = ClassificationMetrics | RegressionMetrics;

export type ClassificationMetricKey = 'accuracy' | 'precision' | 'recall' | 'f1';
export type RegressionMetricKey = 'mae' | 'mse' | 'rmse' | 'r2';

export interface AppSettings {
  taskType: TaskType;
  trainTestSplit: number;
  randomState: number;
  missingValueHandling: 'drop' | 'mean' | 'median' | 'mode';
  imbalanceHandling: 'none' | 'smote' | 'undersample' | 'oversample';
  scalingMethod: 'none' | 'standard' | 'minmax' | 'robust';
  primaryMetricClassification: ClassificationMetricKey;
  primaryMetricRegression: RegressionMetricKey;
  knnNeighbors: number;
  crossValidation: boolean;
  cvFolds: number;
  textDataValuable: boolean;
}

export const CLASSIFICATION_MODELS: MLModel[] = [
  { id: 'logistic', name: 'Logistic Regression', description: 'Linear model for classification', selected: false, task: 'classification' },
  { id: 'knn', name: 'K-Nearest Neighbors', description: 'Instance-based learning algorithm', selected: false, task: 'classification' },
  { id: 'decision_tree', name: 'Decision Tree', description: 'Tree-based classification model', selected: false, task: 'classification' },
  { id: 'random_forest', name: 'Random Forest', description: 'Ensemble of decision trees', selected: false, task: 'classification' },
  { id: 'svm', name: 'Support Vector Machine', description: 'Maximum margin classifier', selected: false, task: 'classification' },
  { id: 'naive_bayes', name: 'Naive Bayes', description: 'Probabilistic classifier', selected: false, task: 'classification' },
];

export const REGRESSION_MODELS: MLModel[] = [
  { id: 'linear', name: 'Linear Regression', description: 'Ordinary least squares regression', selected: false, task: 'regression' },
  { id: 'ridge', name: 'Ridge Regression', description: 'L2-regularized linear regression', selected: false, task: 'regression' },
  { id: 'lasso', name: 'Lasso Regression', description: 'L1-regularized linear regression', selected: false, task: 'regression' },
  { id: 'dt_reg', name: 'Decision Tree Regressor', description: 'Tree-based regression model', selected: false, task: 'regression' },
  { id: 'rf_reg', name: 'Random Forest Regressor', description: 'Ensemble of regression trees', selected: false, task: 'regression' },
  { id: 'svr', name: 'Support Vector Regressor', description: 'SVM-based regression', selected: false, task: 'regression' },
  { id: 'knn_reg', name: 'KNN Regressor', description: 'Instance-based regression', selected: false, task: 'regression' },
];

export const DEFAULT_MODELS = CLASSIFICATION_MODELS;

export const DEFAULT_SETTINGS: AppSettings = {
  taskType: 'classification',
  trainTestSplit: 80,
  randomState: 42,
  missingValueHandling: 'mean',
  imbalanceHandling: 'none',
  scalingMethod: 'standard',
  primaryMetricClassification: 'f1',
  primaryMetricRegression: 'r2',
  knnNeighbors: 5,
  crossValidation: false,
  cvFolds: 5,
  textDataValuable: true,
};

export const isRegressionMetrics = (m: ModelMetrics): m is RegressionMetrics =>
  (m as RegressionMetrics).r2 !== undefined;
