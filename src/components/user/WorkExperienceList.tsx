import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Trash2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WorkExperience {
  id: string;
  position: string;
  organization: string;
  from_date: string;
  to_date: string | null;
  is_present: boolean;
  appointment_type: string;
}

interface WorkExperienceListProps {
  userId: string;
}

export function WorkExperienceList({ userId }: WorkExperienceListProps) {
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    position: '',
    organization: '',
    from_date: new Date(),
    to_date: new Date(),
    is_present: false,
    appointment_type: 'Permanent',
  });

  useEffect(() => {
    loadExperiences();
  }, [userId]);

  const loadExperiences = async () => {
    const { data, error } = await supabase
      .from('work_experience')
      .select('*')
      .eq('user_id', userId)
      .order('from_date', { ascending: false });

    if (!error && data) {
      setExperiences(data);
    }
  };

  const handleAdd = async () => {
    const { error } = await supabase
      .from('work_experience')
      .insert({
        user_id: userId,
        position: formData.position,
        organization: formData.organization,
        from_date: format(formData.from_date, 'yyyy-MM-dd'),
        to_date: formData.is_present ? null : format(formData.to_date, 'yyyy-MM-dd'),
        is_present: formData.is_present,
        appointment_type: formData.appointment_type,
      });

    if (error) {
      toast.error('Failed to add work experience');
    } else {
      toast.success('Work experience added');
      setShowForm(false);
      setFormData({
        position: '',
        organization: '',
        from_date: new Date(),
        to_date: new Date(),
        is_present: false,
        appointment_type: 'Permanent',
      });
      loadExperiences();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('work_experience')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete work experience');
    } else {
      toast.success('Work experience deleted');
      loadExperiences();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Work Experience</h3>
        <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </div>

      {showForm && (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <Label>Position</Label>
            <Input
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Organization</Label>
            <Input
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.from_date, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.from_date}
                    onSelect={(date) => date && setFormData({ ...formData, from_date: date })}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left"
                    disabled={formData.is_present}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.is_present ? 'Present' : format(formData.to_date, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.to_date}
                    onSelect={(date) => date && setFormData({ ...formData, to_date: date })}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_present"
              checked={formData.is_present}
              onCheckedChange={(checked) => setFormData({ ...formData, is_present: checked as boolean })}
            />
            <Label htmlFor="is_present">I currently work here</Label>
          </div>

          <div className="space-y-2">
            <Label>Type of Appointment</Label>
            <Select
              value={formData.appointment_type}
              onValueChange={(value) => setFormData({ ...formData, appointment_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Permanent">Permanent</SelectItem>
                <SelectItem value="Contractual">Contractual</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Consultant">Consultant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="button" onClick={handleAdd}>Add</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* List of experiences */}
      <div className="space-y-2">
        {experiences.map((exp) => (
          <div key={exp.id} className="border rounded-lg p-4 flex justify-between items-start">
            <div>
              <h4 className="font-semibold">{exp.position}</h4>
              <p className="text-sm text-muted-foreground">{exp.organization}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(exp.from_date), 'MMM yyyy')} - {exp.is_present ? 'Present' : format(new Date(exp.to_date!), 'MMM yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">{exp.appointment_type}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(exp.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
