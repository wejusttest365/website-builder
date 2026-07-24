import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: {
    name: string;
    type: 'blank' | 'template';
  }) => void;
}

export function ProjectDialog({ open, onOpenChange, onCreate }: ProjectDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'blank' | 'template'>('blank');

  useEffect(() => {
    if (!open) {
      setName('');
      setType('blank');
    }
  }, [open]);

  const trimmedName = name.trim();
  const isNameValid = useMemo(() => {
    return trimmedName.length >= 3 && trimmedName.length <= 50;
  }, [trimmedName]);

  const handleCreate = () => {
    if (!isNameValid) {
      return;
    }

    onCreate({ name: trimmedName, type });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold">Create New Project</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Start a fresh project or begin from a template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="space-y-2">
            <Label htmlFor="project-name" className="text-sm font-medium">
              Project Name
            </Label>
            <Input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="My Project"
              autoFocus
              maxLength={50}
              className="h-10"
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Choose Project Type</p>

            <RadioGroup value={type} onValueChange={(value) => setType(value as 'blank' | 'template')} className="space-y-3">
              <label className="flex items-start gap-3 rounded-lg border border-border bg-background p-3 shadow-sm">
                <RadioGroupItem value="blank" id="blank-project" className="mt-1" />
                <span className="space-y-1">
                  <span className="block text-sm font-medium">Blank Project</span>
                  <span className="block text-sm text-muted-foreground">Creates an empty website.</span>
                </span>
              </label>

              <label className="flex items-start gap-3 rounded-lg border border-border bg-background p-3 shadow-sm">
                <RadioGroupItem value="template" id="template-project" className="mt-1" />
                <span className="space-y-1">
                  <span className="block text-sm font-medium">Use Template</span>
                  <span className="block text-sm text-muted-foreground">Start from a professionally designed template.</span>
                </span>
              </label>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleCreate} disabled={!isNameValid}>
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
