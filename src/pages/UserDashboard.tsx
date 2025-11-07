import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, MessageCircle } from "lucide-react";
import { ProfileSettingsModal } from "@/components/user/ProfileSettingsModal";
import { MetricsCards } from "@/components/user/MetricsCards";
import { TrainingsAttendedTable } from "@/components/user/TrainingsAttendedTable";
import { TrainingsConductedTable } from "@/components/user/TrainingsConductedTable";
import { AIChatAssistant } from "@/components/user/AIChatAssistant";
import { WorkExperienceList } from "@/components/user/WorkExperienceList";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth');
      return;
    }

    // Get user profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    setProfile(profileData);
    setLoading(false);
  };

  const refreshProfile = () => {
    checkUser();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  const showResourceSpeaker = profile?.professional_accreditation === 'OSH Practitioner' || 
                               profile?.professional_accreditation === 'OSH Consultant';

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome, {profile?.first_name || 'User'}!
            </h1>
            <p className="text-muted-foreground">
              Track your professional development and training history
            </p>
          </div>
          <Button 
            onClick={() => setShowProfileModal(true)}
            variant="outline"
            className="gap-2"
          >
            <User className="h-4 w-4" />
            My Profile
          </Button>
        </div>

        {/* Metrics Cards */}
        <MetricsCards 
          userId={profile?.id} 
          showResourceSpeaker={showResourceSpeaker}
        />

        {/* Work Experience */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Work Experience</CardTitle>
            <CardDescription>
              Your professional work history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkExperienceList userId={profile?.id} />
          </CardContent>
        </Card>

        {/* Trainings Attended */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Trainings Attended</CardTitle>
            <CardDescription>
              Your training participation history and certificates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrainingsAttendedTable userId={profile?.id} />
          </CardContent>
        </Card>

        {/* Trainings as Resource Speaker */}
        {showResourceSpeaker && (
          <Card>
            <CardHeader>
              <CardTitle>Trainings as Resource Speaker</CardTitle>
              <CardDescription>
                Trainings you have conducted as a resource speaker
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrainingsConductedTable userId={profile?.id} />
            </CardContent>
          </Card>
        )}
      </main>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal 
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        profile={profile}
        onUpdate={refreshProfile}
      />

      {/* AI Chat Assistant */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setShowChat(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      
      <AIChatAssistant 
        open={showChat}
        onOpenChange={setShowChat}
        userId={profile?.id}
      />
    </div>
  );
}
