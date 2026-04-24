
import { Trophy, Layers, TrendingUp, Upload, FileSpreadsheet, Loader2, Info, Check, Download, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { AppSettings } from '@/types/ml';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip';
import { MLModel, ModelMetrics } from '@/types/ml';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';

interface DashboardSectionProps {
  models: MLModel[];
  selectedCount: number;
  bestModel: string | null;
  results: ModelMetrics[] | null;
  primaryMetric: string;
  isLoading: boolean;
  csvFile: File | null;
  onSetCsvFile: (file: File | null) => void;
  onRemoveCsvFile: () => void;
  onToggleModel: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onUploadCsv: (file: File) => void;
  knnSelected: boolean;
  knnNeighbors: number;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
}

export function DashboardSection({
  models,
  selectedCount,
  bestModel,
  results,
  primaryMetric,
  isLoading,
  csvFile,
  onSetCsvFile,
  onRemoveCsvFile,
  onToggleModel,
  onSelectAll,
  onClearAll,
  onUploadCsv,
  knnSelected,
  knnNeighbors,
  onUpdateSettings,
}: DashboardSectionProps) {

  const bestResult = results?.find(r => r.name === bestModel);
  const bestMetricValue = bestResult ? bestResult[primaryMetric as keyof ModelMetrics] : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onSetCsvFile(file);
  };

  const handlePredict = () => {
    if (csvFile) onUploadCsv(csvFile);
  };

  const handleDownloadPickle = () => {
    if (!bestModel || !bestResult) return;
    // In production: fetch the actual pickle file from backend
    // e.g. const res = await fetch(`/download-model?name=${bestModel}`); const blob = await res.blob();
    const placeholderContent = `# Pickle file placeholder for model: ${bestModel}\n# Metrics: ${JSON.stringify(bestResult, null, 2)}\n# Replace with actual pickle bytes from backend.`;
    const blob = new Blob([placeholderContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bestModel.replace(/\s+/g, '_').toLowerCase()}_model.pkl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const chartConfig = {
    accuracy: { label: 'Accuracy', color: 'hsl(var(--chart-1))' },
    precision: { label: 'Precision', color: 'hsl(var(--chart-2))' },
    recall: { label: 'Recall', color: 'hsl(var(--chart-3))' },
    f1: { label: 'F1 Score', color: 'hsl(var(--chart-4))' },
  };

  const barData = results?.map(r => ({
    name: r.name.replace(' ', '\n'),
    accuracy: +(r.accuracy * 100).toFixed(1),
    precision: +(r.precision * 100).toFixed(1),
    recall: +(r.recall * 100).toFixed(1),
    f1: +(r.f1 * 100).toFixed(1),
  })) || [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">ML Model Comparator</h2>
        <p className="text-muted-foreground">
          Select models, upload your dataset, and find the best model
        </p>
      </div>

      {/* Step 1: Model Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                Select Models
              </CardTitle>
              <CardDescription className="mt-1">Choose which ML models to train and compare</CardDescription>
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

      {/* Step 2: Upload CSV & Predict */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
            Upload Dataset & Predict
          </CardTitle>
          <CardDescription>
            Upload a CSV file to train selected models and find the best one
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
              <p className="text-xs text-muted-foreground">
                Number of neighbors used by the KNN model.
              </p>
            </div>
          )}
          <Button
            onClick={handlePredict}
            disabled={!csvFile || selectedCount === 0 || isLoading}
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
                <p className="text-xs text-muted-foreground">by {primaryMetric} score</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {bestMetricValue !== null ? `${((bestMetricValue as number) * 100).toFixed(1)}%` : '—'}
                </div>
                <p className="text-xs text-muted-foreground">{primaryMetric}</p>
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
                    <CardDescription>Based on {primaryMetric} metric</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <p className="text-2xl font-bold">{bestModel}</p>
                    <Badge variant="default" className="bg-success text-success-foreground text-lg px-3 py-1">
                      {primaryMetric}: {((bestResult[primaryMetric as keyof ModelMetrics] as number) * 100).toFixed(2)}%
                    </Badge>
                  </div>
                  <Button onClick={handleDownloadPickle} className="gap-2" variant="default">
                    <Download className="h-4 w-4" />
                    Download .pkl File
                  </Button>
                </div>
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
                    <p><strong>Accuracy:</strong> Overall correctness</p>
                    <p><strong>Precision:</strong> True positives / All positive predictions</p>
                    <p><strong>Recall:</strong> True positives / All actual positives</p>
                    <p><strong>F1:</strong> Harmonic mean of precision and recall</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Accuracy</TableHead>
                    <TableHead className="text-right">Precision</TableHead>
                    <TableHead className="text-right">Recall</TableHead>
                    <TableHead className="text-right">F1 Score</TableHead>
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
                        <TableCell className="text-right font-mono">{(result.accuracy * 100).toFixed(2)}%</TableCell>
                        <TableCell className="text-right font-mono">{(result.precision * 100).toFixed(2)}%</TableCell>
                        <TableCell className="text-right font-mono">{(result.recall * 100).toFixed(2)}%</TableCell>
                        <TableCell className="text-right font-mono">{(result.f1 * 100).toFixed(2)}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <CardTitle className="mb-4">Model Comparison</CardTitle>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="accuracy" fill="hsl(var(--chart-1))" name="Accuracy" />
                    <Bar dataKey="precision" fill="hsl(var(--chart-2))" name="Precision" />
                    <Bar dataKey="recall" fill="hsl(var(--chart-3))" name="Recall" />
                    <Bar dataKey="f1" fill="hsl(var(--chart-4))" name="F1 Score" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Card>

            {bestResult && (
              <Card className="p-6">
                <CardTitle className="mb-4">Best Model Profile</CardTitle>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={[
                      { metric: 'Accuracy', value: bestResult.accuracy * 100 },
                      { metric: 'Precision', value: bestResult.precision * 100 },
                      { metric: 'Recall', value: bestResult.recall * 100 },
                      { metric: 'F1 Score', value: bestResult.f1 * 100 },
                    ]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar
                        name={bestModel!}
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </Card>
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
              Select models and upload a CSV dataset to see comparison results
            </p>
          </div>
        </Card>
      )}
    </section>
  );
}
