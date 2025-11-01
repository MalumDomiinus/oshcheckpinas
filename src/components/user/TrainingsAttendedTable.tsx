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
import { Download, Upload, Plus, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrainingsAttendedTableProps {
  userId: string;
}

export function TrainingsAttendedTable({ userId }: TrainingsAttendedTableProps) {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    training_name: '',
    conducted_by: '',
    venue: '',
    date_completed: new Date(),
    hours: '',
  });

  useEffect(() => {
    loadTrainings();
  }, [userId]);

  const loadTrainings = async () => {
    const { data, error } = await supabase
      .from('user_trainings_attended')
      .select('*')
      .eq('user_id', userId)
      .order('date_completed', { ascending: false });

    if (!error && data) {
      setTrainings(data);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    const { error } = await supabase
      .from('user_trainings_attended')
      .insert({
        user_id: userId,
        training_name: formData.training_name,
        conducted_by: formData.conducted_by,
        venue: formData.venue,
        date_completed: format(formData.date_completed, 'yyyy-MM-dd'),
        hours: Number(formData.hours),
      });

    if (error) {
      toast.error('Failed to add training');
    } else {
      toast.success('Training added successfully');
      setShowAddDialog(false);
      setFormData({
        training_name: '',
        conducted_by: '',
        venue: '',
        date_completed: new Date(),
        hours: '',
      });
      loadTrainings();
    }
  };

  const handleCertificateUpload = async (trainingId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${trainingId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('training-certificates')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error('Failed to upload certificate');
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('training-certificates')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('user_trainings_attended')
      .update({ certificate_url: publicUrl })
      .eq('id', trainingId);

    if (updateError) {
      toast.error('Failed to update certificate');
    } else {
      toast.success('Certificate uploaded successfully');
      loadTrainings();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('user_trainings_attended')
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
            <TableHead>Conducted By</TableHead>
            <TableHead>Venue</TableHead>
            <TableHead>Date Completed</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Certificate</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trainings.map((training) => (
            <TableRow key={training.id}>
              <TableCell>{training.training_name}</TableCell>
              <TableCell>{training.conducted_by}</TableCell>
              <TableCell>{training.venue}</TableCell>
              <TableCell>{format(new Date(training.date_completed), 'PP')}</TableCell>
              <TableCell>{training.hours}</TableCell>
              <TableCell>
                {training.certificate_url ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(training.certificate_url, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    View
                  </Button>
                ) : (
                  <Label htmlFor={`cert-${training.id}`} className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </span>
                    </Button>
                    <Input
                      id={`cert-${training.id}`}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCertificateUpload(training.id, file);
                      }}
                    />
                  </Label>
                )}
              </TableCell>
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
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No trainings found. Add your first training to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Add Training Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Training Attended</DialogTitle>
            <DialogDescription>
              Add a new training to your attendance record
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
              <Label>Conducted By</Label>
              <Input
                value={formData.conducted_by}
                onChange={(e) => setFormData({ ...formData, conducted_by: e.target.value })}
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
              <Label>Date Completed</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.date_completed, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date_completed}
                    onSelect={(date) => date && setFormData({ ...formData, date_completed: date })}
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
