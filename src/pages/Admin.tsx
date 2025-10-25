import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, FileCheck, Users, Activity } from "lucide-react";
import { InviteUserForm } from "@/components/admin/InviteUserForm";
import { UserManagementTable } from "@/components/admin/UserManagementTable";

const Admin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCertificates: 0,
    totalVerifications: 0,
    successfulVerifications: 0,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      
      // Verify admin role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();
      
      if (!roleData) {
        navigate('/');
        return;
      }
      
      await loadStats();
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const loadStats = async () => {
    try {
      const [certificatesRes, logsRes, successLogsRes] = await Promise.all([
        supabase.from('certificates').select('id', { count: 'exact', head: true }),
        supabase.from('verification_logs').select('id', { count: 'exact', head: true }),
        supabase.from('verification_logs').select('id', { count: 'exact', head: true }).eq('success', true),
      ]);

      setStats({
        totalCertificates: certificatesRes.count || 0,
        totalVerifications: logsRes.count || 0,
        successfulVerifications: successLogsRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage certificates and monitor verification activity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCertificates}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVerifications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalVerifications > 0
                  ? Math.round((stats.successfulVerifications / stats.totalVerifications) * 100)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Management</CardTitle>
            <CardDescription>Manage your certificate system</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="certificates">Certificates</TabsTrigger>
                <TabsTrigger value="logs">Verification Logs</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="users" className="mt-6">
                <div className="space-y-6">
                  <InviteUserForm />
                  <div>
                    <h3 className="text-lg font-semibold mb-4">All Users</h3>
                    <UserManagementTable />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="certificates" className="mt-6">
                <p className="text-muted-foreground text-center py-12">
                  Certificate management interface coming soon
                </p>
              </TabsContent>
              <TabsContent value="logs" className="mt-6">
                <p className="text-muted-foreground text-center py-12">
                  Verification logs interface coming soon
                </p>
              </TabsContent>
              <TabsContent value="settings" className="mt-6">
                <p className="text-muted-foreground text-center py-12">
                  Settings interface coming soon
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
