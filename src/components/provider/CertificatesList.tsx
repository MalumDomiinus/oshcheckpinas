import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EditCertificateDialog } from "./EditCertificateDialog";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CertificatesListProps {
  providerId: string;
}

export const CertificatesList = ({ providerId }: CertificatesListProps) => {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCertificate, setEditingCertificate] = useState<any>(null);
  const [deletingCertificateId, setDeletingCertificateId] = useState<string | null>(null);

  useEffect(() => {
    if (providerId) {
      loadCertificates();
    }
  }, [providerId]);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (certificateId: string) => {
    try {
      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('id', certificateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Certificate deleted successfully",
      });
      
      loadCertificates();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingCertificateId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No certificates found. Upload a CSV file to add certificates.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Certificate #</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificates.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell className="font-medium">{cert.certificate_number}</TableCell>
                <TableCell>{cert.first_name} {cert.last_name}</TableCell>
                <TableCell>{cert.course_name}</TableCell>
                <TableCell>{new Date(cert.issue_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {cert.expiration_date 
                    ? new Date(cert.expiration_date).toLocaleDateString()
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge variant={cert.status === 'active' ? 'default' : 'secondary'}>
                    {cert.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingCertificate(cert)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeletingCertificateId(cert.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingCertificate && (
        <EditCertificateDialog
          certificate={editingCertificate}
          open={!!editingCertificate}
          onOpenChange={(open) => !open && setEditingCertificate(null)}
          onUpdate={loadCertificates}
        />
      )}

      <AlertDialog open={!!deletingCertificateId} onOpenChange={(open) => !open && setDeletingCertificateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Certificate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this certificate? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingCertificateId && handleDelete(deletingCertificateId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
