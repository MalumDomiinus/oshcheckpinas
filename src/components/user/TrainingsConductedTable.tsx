import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, Trash2, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TrainingsConductedTableProps {
  userId: string;
}

export function TrainingsConductedTable({ userId }: TrainingsConductedTableProps) {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    training_name: '',
    venue: '',
    date_conducted: new Date(),
    hours: '',
  });

  useEffect(() => {
    loadTrainings();
  }, [userId]);

  const loadTrainings = async () => {
    const { data, error } = await supabase
      .from('user_trainings_conducted')
      .select('*')
      .eq('user_id', userId)
      .order('date_conducted', { ascending: false });

    if (!error && data) {
      setTrainings(data);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    const { error } = await supabase
      .from('user_trainings_conducted')
      .insert({
        user_id: userId,
        training_name: formData.training_name,
        venue: formData.venue,
        date_conducted: format(formData.date_conducted, 'yyyy-MM-dd'),
        hours: Number(formData.hours),
      });

    if (error) {
      toast.error('Failed to add training');
    } else {
      toast.success('Training added successfully');
      setShowAddDialog(false);
      setFormData({
        training_name: '',
        venue: '',
        date_conducted: new Date(),
        hours: '',
      });
      loadTrainings();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('user_trainings_conducted')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete training');
    } else {
      toast.success('Training deleted');
      loadTrainings();
    }
  };

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Training
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Training Name</TableHead>
            <TableHead>Venue</TableHead>
            <TableHead>Date Conducted</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trainings.map((training) => (
            <TableRow key={training.id}>
              <TableCell>{training.training_name}</TableCell>
              <TableCell>{training.venue}</TableCell>
              <TableCell>{format(new Date(training.date_conducted), 'PP')}</TableCell>
              <TableCell>{training.hours}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(training.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {trainings.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No trainings found. Add your first training as a resource speaker.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Add Training Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Training Conducted</DialogTitle>
            <DialogDescription>
              Add a new training you conducted as a resource speaker
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Training Name</Label>
              <Input
                value={formData.training_name}
                onChange={(e) => setFormData({ ...formData, training_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Venue</Label>
              <Input
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Date Conducted</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.date_conducted, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date_conducted}
                    onSelect={(date) => date && setFormData({ ...formData, date_conducted: date })}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Number of Hours</Label>
              <Input
                type="number"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAdd}>Add Training</Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
