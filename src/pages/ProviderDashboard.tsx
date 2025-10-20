import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProviderProfileForm } from "@/components/provider/ProviderProfileForm";
import { CertificateUpload } from "@/components/provider/CertificateUpload";
import { CertificatesList } from "@/components/provider/CertificatesList";
import { Loader2 } from "lucide-react";

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<any>(null);

  useEffect(() => {
    checkProvider();
  }, []);

  const checkProvider = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth');
      return;
    }

    // Check if user has provider role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'provider')
      .single();

    if (!roles) {
      navigate('/');
      return;
    }

    // Get provider profile
    const { data: providerData } = await supabase
      .from('providers')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    setProvider(providerData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Provider Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your training provider profile and certificates
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="upload">Upload CSV</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Provider Profile</CardTitle>
                <CardDescription>
                  Manage your training provider information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProviderProfileForm provider={provider} onUpdate={checkProvider} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>Certificates</CardTitle>
                <CardDescription>
                  View and manage certificates issued by your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CertificatesList providerId={provider?.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Certificates</CardTitle>
                <CardDescription>
                  Upload a CSV file to bulk import certificates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CertificateUpload providerId={provider?.id} onUploadComplete={checkProvider} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
