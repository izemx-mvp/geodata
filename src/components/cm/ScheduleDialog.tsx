import { CalendarDays, Clock, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FUSEAUX = ["Africa/Casablanca", "Europe/Paris", "Europe/London", "UTC"];

export function ScheduleDialog({
  open,
  onOpenChange,
  onConfirm,
  initialDate,
  initialTime,
  label = "Planifier la publication",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: (v: { date: string; time: string; timezone: string }) => void;
  initialDate?: string | undefined;
  initialTime?: string | undefined;
  label?: string | undefined;
}) {
  const [date, setDate] = useState(initialDate ?? "2026-09-15");
  const [time, setTime] = useState(initialTime ?? "09:00");
  const [timezone, setTimezone] = useState(FUSEAUX[0]!);

  useEffect(() => {
    if (open) {
      setDate(initialDate ?? "2026-09-15");
      setTime(initialTime ?? "09:00");
    }
  }, [open, initialDate, initialTime]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" /> {label}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="flex items-center gap-1.5 text-xs">
                <CalendarDays className="size-3.5" /> Date
              </Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 text-xs">
                <Clock className="size-3.5" /> Heure
              </Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="flex items-center gap-1.5 text-xs">
              <Globe className="size-3.5" /> Fuseau horaire
            </Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FUSEAUX.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg border border-border bg-secondary/50 p-3 text-xs text-muted-foreground">
            La publication sera automatiquement mise en ligne le {date} à {time} ({timezone}).
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={() => {
              onConfirm({ date, time, timezone });
              onOpenChange(false);
            }}
          >
            Planifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
