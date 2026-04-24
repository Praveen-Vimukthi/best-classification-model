import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';

type Section = 'dashboard' | 'settings' | 'about';

interface MobileNavProps {
  currentSection: Section;
  onNavigate: (section: Section) => void;
}

const navItems: { id: Section; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'settings', label: 'Settings' },
  { id: 'about', label: 'About' },
];

export function MobileNav({ currentSection, onNavigate }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const handleNavigate = (section: Section) => {
    onNavigate(section);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 mt-6">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentSection === item.id ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => handleNavigate(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
