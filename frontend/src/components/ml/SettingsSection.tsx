import { Settings2, Sliders, Beaker, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { AppSettings } from '@/types/ml';

interface SettingsSectionProps {
  settings: AppSettings;
  onUpdate: (updates: Partial<AppSettings>) => void;
}

export function SettingsSection({ settings, onUpdate }: SettingsSectionProps) {
  const isRegression = settings.taskType === 'regression';

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Configure preprocessing, training, and evaluation options
        </p>
        <Badge variant="secondary" className="w-fit">
          Current task: {isRegression ? 'Regression' : 'Classification'}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Preprocessing
            </CardTitle>
            <CardDescription>
              How the dataset is prepared before training
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  Train/Test Split
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Percentage of data used for training vs testing
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <span className="text-sm font-mono text-muted-foreground">
                  {settings.trainTestSplit}% / {100 - settings.trainTestSplit}%
                </span>
              </div>
              <Slider
                value={[settings.trainTestSplit]}
                onValueChange={([value]) => onUpdate({ trainTestSplit: value })}
                min={50}
                max={95}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Random State</Label>
              <Input
                type="number"
                value={settings.randomState}
                onChange={(e) => onUpdate({ randomState: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label>Missing Value Handling</Label>
              <Select
                value={settings.missingValueHandling}
                onValueChange={(value) => onUpdate({ missingValueHandling: value as AppSettings['missingValueHandling'] })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="drop">Drop rows with missing values</SelectItem>
                  <SelectItem value="mean">Fill with mean</SelectItem>
                  <SelectItem value="median">Fill with median</SelectItem>
                  <SelectItem value="mode">Fill with mode</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Feature Scaling</Label>
              <Select
                value={settings.scalingMethod}
                onValueChange={(value) => onUpdate({ scalingMethod: value as AppSettings['scalingMethod'] })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="standard">Standard Scaler (Z-score)</SelectItem>
                  <SelectItem value="minmax">Min-Max Scaler</SelectItem>
                  <SelectItem value="robust">Robust Scaler</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isRegression && (
              <div className="space-y-2">
                <Label>Imbalance Handling</Label>
                <Select
                  value={settings.imbalanceHandling}
                  onValueChange={(value) => onUpdate({ imbalanceHandling: value as AppSettings['imbalanceHandling'] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="smote">SMOTE (Oversampling)</SelectItem>
                    <SelectItem value="undersample">Random Undersampling</SelectItem>
                    <SelectItem value="oversample">Random Oversampling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                Text data is valuable for training
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Include text columns when training models
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Switch
                checked={settings.textDataValuable}
                onCheckedChange={(checked) => onUpdate({ textDataValuable: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5" />
              Training & Evaluation
            </CardTitle>
            <CardDescription>
              Metrics and validation strategy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Primary Evaluation Metric</Label>
              {isRegression ? (
                <Select
                  value={settings.primaryMetricRegression}
                  onValueChange={(value) => onUpdate({ primaryMetricRegression: value as AppSettings['primaryMetricRegression'] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="r2">R² Score (higher is better)</SelectItem>
                    <SelectItem value="mae">MAE (lower is better)</SelectItem>
                    <SelectItem value="mse">MSE (lower is better)</SelectItem>
                    <SelectItem value="rmse">RMSE (lower is better)</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={settings.primaryMetricClassification}
                  onValueChange={(value) => onUpdate({ primaryMetricClassification: value as AppSettings['primaryMetricClassification'] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accuracy">Accuracy</SelectItem>
                    <SelectItem value="precision">Precision</SelectItem>
                    <SelectItem value="recall">Recall</SelectItem>
                    <SelectItem value="f1">F1 Score</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>K-Nearest Neighbors: K value</Label>
                <span className="text-sm font-mono text-muted-foreground">
                  {settings.knnNeighbors}
                </span>
              </div>
              <Slider
                value={[settings.knnNeighbors]}
                onValueChange={([value]) => onUpdate({ knnNeighbors: value })}
                min={1}
                max={25}
                step={1}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                Cross-Validation
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Enable k-fold cross-validation for more robust evaluation
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Switch
                checked={settings.crossValidation}
                onCheckedChange={(checked) => onUpdate({ crossValidation: checked })}
              />
            </div>

            {settings.crossValidation && (
              <div className="space-y-2 pl-4 border-l-2 border-muted">
                <Label>Number of Folds</Label>
                <Input
                  type="number"
                  min={2}
                  max={10}
                  value={settings.cvFolds}
                  onChange={(e) => onUpdate({ cvFolds: parseInt(e.target.value) || 5 })}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex items-center gap-4 py-6">
          <Beaker className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-medium">Experiment Settings</p>
            <p className="text-sm text-muted-foreground">
              All settings are applied to the next training run.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
