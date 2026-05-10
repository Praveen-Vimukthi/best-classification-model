import { useState } from 'react';
import {
  Trophy, Layers, TrendingUp, Upload, FileSpreadsheet, Loader2, Info, X,
  ImageIcon, BarChart3, Target,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  AppSettings, MLModel, ModelMetrics, TaskType,
  ClassificationMetrics, RegressionMetrics, isRegressionMetrics,
} from '@/types/ml';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend,
} from 'recharts';

interface DashboardSectionProps {
  models: MLModel[];
  selectedCount: number;
  bestModel: string | null;
  results: ModelMetrics[] | null;
  taskType: TaskType;
  primaryMetric: string;
  isLoading: boolean;
  csvFile: File | null;
  targetColumn: string;
  onSetTargetColumn: (v: string) => void;
  onSetCsvFile: (file: File | null) => void;
  onRemoveCsvFile: () => void;
  onToggleModel: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onUploadCsv: (file: File) => void;
  onSetTaskType: (t: TaskType) => void;
  knnSelected: boolean;
  knnNeighbors: number;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
}

const REG_METRIC_LABEL: Record<string, string> = {
  mae: 'MAE',
  mse: 'MSE',
  rmse: 'RMSE',
  r2: 'R² Score',
};

const CLASS_METRIC_LABEL: Record<string, string> = {
  accuracy: 'Accuracy',
  precision: 'Precision',
  recall: 'Recall',
  f1: 'F1 Score',
};

export function DashboardSection({
  models,
  selectedCount,
  bestModel,
  results,
  taskType,
  primaryMetric,
  isLoading,
  csvFile,
  targetColumn,
  onSetTargetColumn,
  onSetCsvFile,
  onRemoveCsvFile,
  onToggleModel,
  onSelectAll,
  onClearAll,
  onUploadCsv,
  onSetTaskType,
  knnSelected,
  knnNeighbors,
  onUpdateSettings,
}: DashboardSectionProps) {
  const isRegression = taskType === 'regression';
  const bestResult = results?.find(r => r.name === bestModel);
  const [targetIsLast, setTargetIsLast] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onSetCsvFile(file);
  };

  const handlePredict = () => {
    if (csvFile) onUploadCsv(csvFile);
  };

  const formatMetricValue = (v: number, key: string) => {
    if (key === 'r2') return v.toFixed(3);
    if (['mae', 'mse', 'rmse'].includes(key)) return v.toFixed(3);
    return `${(v * 100).toFixed(2)}%`;
  };

  const bestMetricDisplay = bestResult
    ? formatMetricValue((bestResult as any)[primaryMetric], primaryMetric)
    : '—';

  const metricLabel = isRegression
    ? REG_METRIC_LABEL[primaryMetric]
    : CLASS_METRIC_LABEL[primaryMetric];

  // Bar chart data
  const barData = results?.map(r => {
    if (isRegressionMetrics(r)) {
      return { name: r.name, value: +r.r2.toFixed(3) };
    } else {
      const cm = r as ClassificationMetrics;
      return { name: r.name, value: +(cm.f1 * 100).toFixed(1) };
    }
  }) || [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Best Model Predictor</h2>
        <p className="text-muted-foreground">
          Choose your task, select models, upload your dataset, and find the best model
        </p>
      </div>

      {/* Step 0: Task Type Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
            Task Type
          </CardTitle>
          <CardDescription>
            Choose whether you want to predict a category or a continuous value
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="inline-flex rounded-lg border p-1 bg-muted/30">
            <Button
              variant={taskType === 'classification' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onSetTaskType('classification')}
              className="gap-2"
            >
              <Target className="h-4 w-4" />
              Classification
            </Button>
            <Button
              variant={taskType === 'regression' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onSetTaskType('regression')}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Regression
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {isRegression
              ? 'Regression: predict numeric values (e.g. price, temperature). Evaluated with MAE, MSE, RMSE, R².'
              : 'Classification: predict categories (e.g. spam/not spam). Evaluated with Accuracy, Precision, Recall, F1.'}
          </p>
        </CardContent>
      </Card>

      {/* Step 2: Model Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                Select Models
              </CardTitle>
              <CardDescription className="mt-1">
                Choose which {isRegression ? 'regression' : 'classification'} models to train and compare
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onSelectAll}>Select All</Button>
              <Button variant="outline" size="sm" onClick={onClearAll}>Clear All</Button>
              <Badge variant="secondary">{selectedCount} selected</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {models.map((model) => (
              <div
                key={model.id}
                className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                  model.selected ? 'ring-2 ring-primary bg-primary/5' : 'hover:border-primary/50'
                }`}
                onClick={() => onToggleModel(model.id)}
              >
                <Checkbox
                  checked={model.selected}
                  onCheckedChange={() => onToggleModel(model.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div>
                  <p className="font-medium text-sm">{model.name}</p>
                  <p className="text-xs text-muted-foreground">{model.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Upload CSV & Predict */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
            Upload Dataset & Predict
          </CardTitle>
          <CardDescription>
            Upload a CSV file and specify the target column
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center transition-colors hover:border-primary/50">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <div className="space-y-2">
              <Label htmlFor="csv-upload" className="cursor-pointer">
                <span className="text-primary hover:underline font-medium">Click to upload</span>
                {' '}or drag and drop
              </Label>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-sm text-muted-foreground">CSV files only</p>
            </div>
            {csvFile && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Badge variant="secondary">
                  <FileSpreadsheet className="h-3 w-3 mr-1" />
                  {csvFile.name}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemoveCsvFile}
                  className="h-7 px-2 text-destructive hover:text-destructive"
                >
                  <X className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="target-is-last"
                checked={targetIsLast}
                onCheckedChange={(checked) => {
                  const isLast = checked === true;
                  setTargetIsLast(isLast);
                  if (isLast) onSetTargetColumn('');
                }}
              />
              <Label htmlFor="target-is-last" className="cursor-pointer">
                Target is the last column in the CSV
              </Label>
            </div>

            {!targetIsLast && (
              <div className="space-y-2">
                <Label htmlFor="target-col">Target Column</Label>
                <Input
                  id="target-col"
                  placeholder="e.g. price, label, target"
                  value={targetColumn}
                  onChange={(e) => onSetTargetColumn(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Name of the column to predict.
                </p>
              </div>
            )}
          </div>

          {knnSelected && (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  K-Nearest Neighbors: K value
                </Label>
                <span className="text-sm font-mono text-muted-foreground">
                  {knnNeighbors}
                </span>
              </div>
              <Slider
                value={[knnNeighbors]}
                onValueChange={([value]) => onUpdateSettings({ knnNeighbors: value })}
                min={1}
                max={25}
                step={1}
              />
            </div>
          )}

          <Button
            onClick={handlePredict}
            disabled={!csvFile || selectedCount === 0 || (!targetIsLast && !targetColumn) || isLoading}
            className="w-full gap-2"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Training {selectedCount} models...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Predict & Find Best Model ({selectedCount} selected)
              </>
            )}
          </Button>
          {selectedCount === 0 && csvFile && (
            <p className="text-sm text-destructive text-center">Please select at least one model above</p>
          )}
          {csvFile && selectedCount > 0 && !targetIsLast && !targetColumn && (
            <p className="text-sm text-destructive text-center">Please specify the target column name</p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results && results.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Models Evaluated</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{results.length}</div>
                <p className="text-xs text-muted-foreground">trained & compared</p>
              </CardContent>
            </Card>

            <Card className={bestModel ? 'ring-2 ring-success' : ''}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Model</CardTitle>
                <Trophy className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold truncate">{bestModel || '—'}</div>
                <p className="text-xs text-muted-foreground">by {metricLabel}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bestMetricDisplay}</div>
                <p className="text-xs text-muted-foreground">{metricLabel}</p>
              </CardContent>
            </Card>
          </div>

          {/* Best Model Highlight */}
          {bestResult && (
            <Card className="border-success bg-success/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20">
                    <Trophy className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-success">Best Performing Model</CardTitle>
                    <CardDescription>Based on {metricLabel}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-2xl font-bold">{bestModel}</p>
                  <Badge variant="default" className="bg-success text-success-foreground text-lg px-3 py-1">
                    {metricLabel}: {bestMetricDisplay}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Model export (.pkl) will be available once a Python backend is connected.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Model Metrics Comparison
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px]">
                    {isRegression ? (
                      <>
                        <p><strong>MAE:</strong> Mean Absolute Error (lower is better)</p>
                        <p><strong>MSE:</strong> Mean Squared Error (lower is better)</p>
                        <p><strong>RMSE:</strong> Root Mean Squared Error (lower is better)</p>
                        <p><strong>R²:</strong> Coefficient of determination (higher is better)</p>
                      </>
                    ) : (
                      <>
                        <p><strong>Accuracy:</strong> Overall correctness</p>
                        <p><strong>Precision:</strong> True positives / All positive predictions</p>
                        <p><strong>Recall:</strong> True positives / All actual positives</p>
                        <p><strong>F1:</strong> Harmonic mean of precision and recall</p>
                      </>
                    )}
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    {isRegression ? (
                      <>
                        <TableHead className="text-right">MAE</TableHead>
                        <TableHead className="text-right">MSE</TableHead>
                        <TableHead className="text-right">RMSE</TableHead>
                        <TableHead className="text-right">R² Score</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="text-right">Accuracy</TableHead>
                        <TableHead className="text-right">Precision</TableHead>
                        <TableHead className="text-right">Recall</TableHead>
                        <TableHead className="text-right">F1 Score</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => {
                    const isBest = result.name === bestModel;
                    return (
                      <TableRow
                        key={result.name}
                        className={isBest ? 'bg-success/10 border-l-4 border-l-success' : ''}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {result.name}
                            {isBest && (
                              <Badge variant="default" className="bg-success text-success-foreground">
                                <Trophy className="h-3 w-3 mr-1" />
                                Best
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        {isRegressionMetrics(result) ? (
                          <>
                            <TableCell className="text-right font-mono">{result.mae.toFixed(3)}</TableCell>
                            <TableCell className="text-right font-mono">{result.mse.toFixed(3)}</TableCell>
                            <TableCell className="text-right font-mono">{result.rmse.toFixed(3)}</TableCell>
                            <TableCell className="text-right font-mono">{result.r2.toFixed(3)}</TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="text-right font-mono">{((result as ClassificationMetrics).accuracy * 100).toFixed(2)}%</TableCell>
                            <TableCell className="text-right font-mono">{((result as ClassificationMetrics).precision * 100).toFixed(2)}%</TableCell>
                            <TableCell className="text-right font-mono">{((result as ClassificationMetrics).recall * 100).toFixed(2)}%</TableCell>
                            <TableCell className="text-right font-mono">{((result as ClassificationMetrics).f1 * 100).toFixed(2)}%</TableCell>
                          </>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Comparison chart */}
          <Card className="p-6">
            <CardTitle className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {isRegression ? 'R² Score Comparison' : 'F1 Score Comparison'}
            </CardTitle>
            <ChartContainer config={{ value: { label: metricLabel, color: 'hsl(var(--primary))' } }} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <XAxis type="number" domain={isRegression ? [0, 1] : [0, 100]} />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="value" fill="hsl(var(--primary))" name={isRegression ? 'R²' : 'F1 Score'} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>

          {/* Visualization placeholders (backend-rendered) */}
          <div className="grid gap-6 lg:grid-cols-2">
            <VisualizationPlaceholder
              title="Correlation Heatmap"
              description="Pairwise feature correlations from the dataset."
            />
            <VisualizationPlaceholder
              title="Feature Importance"
              description="Importance scores from tree-based models."
            />
            {isRegression ? (
              <VisualizationPlaceholder
                title="Predicted vs Actual"
                description="Scatter plot comparing predictions to true values."
              />
            ) : (
              <VisualizationPlaceholder
                title="Confusion Matrix"
                description="Counts of true vs predicted labels for the best model."
              />
            )}
          </div>
        </>
      )}

      {!results && !isLoading && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Layers className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No Results Yet</h3>
            <p className="text-muted-foreground mt-2">
              Choose a task, select models, and upload a CSV to see comparison results
            </p>
          </div>
        </Card>
      )}
    </section>
  );
}

function VisualizationPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center gap-2 rounded-lg border-2 border-dashed bg-muted/20 p-8 min-h-[220px]">
          <ImageIcon className="h-10 w-10 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">Rendered by backend</p>
          <p className="text-xs text-muted-foreground">
            Connect a Python backend to display this image
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
