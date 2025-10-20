import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface CertificatesListProps {
  providerId: string;
}

export const CertificatesList = ({ providerId }: CertificatesListProps) => {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
