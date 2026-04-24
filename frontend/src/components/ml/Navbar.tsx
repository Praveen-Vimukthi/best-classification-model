import { Moon, Sun, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

type Section = "dashboard" | "settings" | "about";

interface NavbarProps {
  currentSection: Section;
  onNavigate: (section: Section) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const navItems: { id: Section; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "settings", label: "Settings" },
  { id: "about", label: "About" },
];

export function Navbar({
  currentSection,
  onNavigate,
  isDark,
  onToggleTheme,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Brain className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            ML Model Comparator
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentSection === item.id ? "secondary" : "ghost"}
              onClick={() => onNavigate(item.id)}
              className="transition-all duration-200"
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleTheme}
            className="rounded-full"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
