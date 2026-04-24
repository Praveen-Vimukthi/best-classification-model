import { Brain, Code2, Layers, Sparkles, Github, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AboutSection() {
  const techStack = [
    { name: "React 18", category: "Frontend" },
    { name: "TypeScript", category: "Language" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "Recharts", category: "Visualization" },
    { name: "Radix UI", category: "Components" },
    { name: "Vite", category: "Build Tool" },
  ];

  const features = [
    {
      icon: Layers,
      title: "Multi-Model Comparison",
      description: "Train and compare multiple ML models simultaneously",
    },
    {
      icon: Sparkles,
      title: "Interactive Dashboard",
      description: "Visual charts and metrics for easy model comparison",
    },
    {
      icon: Code2,
      title: "Production Ready",
      description: "Enterprise-grade UI with dark/light mode support",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">About</h2>
        <p className="text-muted-foreground">
          Learn more about ML Model Comparator
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Brain className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-2xl">ML Model Comparator</CardTitle>
              <CardDescription>
                Professional Machine Learning Model Evaluation Platform
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            ML Model Comparator is a professional-grade web application designed
            to simplify the process of training, evaluating, and comparing
            machine learning classification models. With an intuitive interface
            and powerful visualization tools, data scientists and ML engineers
            can quickly identify the best performing model for their use case.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The platform supports multiple popular classification algorithms
            including Logistic Regression, K-Nearest Neighbors, Decision Trees,
            Random Forest, Support Vector Machines, and Naive Bayes. Each model
            is evaluated using industry-standard metrics to ensure accurate and
            reliable comparisons.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                <feature.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Technology Stack</CardTitle>
          <CardDescription>
            Built with modern web technologies for performance and reliability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <Badge key={tech.name} variant="secondary" className="text-sm">
                {tech.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com/Praveen-Vimukthi"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              target="_blank"
            >
              <Github className="h-5 w-5" />
              GitHub Repository
            </a>
            <a
              href="mailto:praveenvimukthi328@gmail.com?subject=Help&body=I need help"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              target="_blank"
            >
              <Mail className="h-5 w-5" />
              Contact Support
            </a>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
