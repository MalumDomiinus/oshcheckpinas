import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Award, Users } from "lucide-react";

interface MetricsCardsProps {
  userId: string;
  showResourceSpeaker: boolean;
}

export function MetricsCards({ userId, showResourceSpeaker }: MetricsCardsProps) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    yearsOfExperience: 0,
    trainingHoursAttended: 0,
    trainingHoursConducted: 0,
  });

  useEffect(() => {
    loadMetrics();
  }, [userId]);

  const loadMetrics = async () => {
    setLoading(true);

    // Calculate years of experience by summing actual employment periods
    const { data: workExp } = await supabase
      .from('work_experience')
      .select('from_date, to_date, is_present')
      .eq('user_id', userId)
      .order('from_date', { ascending: true });

    let yearsOfExperience = 0;
    if (workExp && workExp.length > 0) {
      // Convert work experiences to time periods
      const periods = workExp.map(exp => ({
        start: new Date(exp.from_date).getTime(),
        end: exp.is_present ? new Date().getTime() : new Date(exp.to_date || new Date()).getTime()
      })).sort((a, b) => a.start - b.start);

      // Merge overlapping periods
      const merged: Array<{ start: number; end: number }> = [];
      for (const period of periods) {
        if (merged.length === 0 || merged[merged.length - 1].end < period.start) {
          merged.push(period);
        } else {
          merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, period.end);
        }
      }

      // Sum total time
      const totalMs = merged.reduce((sum, period) => sum + (period.end - period.start), 0);
      yearsOfExperience = Math.floor(totalMs / (1000 * 60 * 60 * 24 * 365.25) * 10) / 10; // Round to 1 decimal
    }

    // Calculate training hours attended
    const { data: attendedTrainings } = await supabase
      .from('user_trainings_attended')
      .select('hours')
      .eq('user_id', userId);

    const trainingHoursAttended = attendedTrainings?.reduce((sum, t) => sum + Number(t.hours), 0) || 0;

    // Calculate training hours conducted
    const { data: conductedTrainings } = await supabase
      .from('user_trainings_conducted')
      .select('hours')
      .eq('user_id', userId);

    const trainingHoursConducted = conductedTrainings?.reduce((sum, t) => sum + Number(t.hours), 0) || 0;

    setMetrics({
      yearsOfExperience,
      trainingHoursAttended,
      trainingHoursConducted,
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        {showResourceSpeaker && <Skeleton className="h-32" />}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Years of Experience</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.yearsOfExperience}</div>
          <p className="text-xs text-muted-foreground">Professional experience</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Training Hours Attended</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.trainingHoursAttended}</div>
          <p className="text-xs text-muted-foreground">Total hours completed</p>
        </CardContent>
      </Card>

      {showResourceSpeaker && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Hours Conducted</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.trainingHoursConducted}</div>
            <p className="text-xs text-muted-foreground">As resource speaker</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
