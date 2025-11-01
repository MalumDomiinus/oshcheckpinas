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

    // Calculate years of experience
    const { data: workExp } = await supabase
      .from('work_experience')
      .select('from_date')
      .eq('user_id', userId)
      .order('from_date', { ascending: true })
      .limit(1);

    let yearsOfExperience = 0;
    if (workExp && workExp.length > 0) {
      const earliestDate = new Date(workExp[0].from_date);
      const today = new Date();
      yearsOfExperience = Math.floor((today.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
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
