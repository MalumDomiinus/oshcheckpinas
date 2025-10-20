import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CertificateUploadProps {
  providerId: string;
  onUploadComplete: () => void;
}

export const CertificateUpload = ({ providerId, onUploadComplete }: CertificateUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a CSV file",
        variant: "destructive",
      });
    }
  };

  const parseCsvRow = (row: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleUpload = async () => {
    if (!file || !providerId) return;

    setUploading(true);
    try {
      const text = await file.text();
      const rows = text.split('\n').filter(row => row.trim());
      
      // Skip header row
      const dataRows = rows.slice(1);
      const certificates = dataRows.map(row => {
        const values = parseCsvRow(row);
        return {
          provider_id: providerId,
          certificate_number: values[0],
          first_name: values[1],
          last_name: values[2],
          course_name: values[3],
          provider_name: values[4],
          issue_date: values[5],
          expiration_date: values[6] || null,
          status: 'active' as const,
        };
      });

      const { error } = await supabase
        .from('certificates')
        .insert(certificates);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${certificates.length} certificates uploaded successfully`,
      });
      setFile(null);
      onUploadComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = "certificate_number,first_name,last_name,course_name,provider_name,issue_date,expiration_date\nCERT001,John,Doe,Safety Training,ABC Training,2025-01-01,2026-01-01";
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'certificate_template.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">CSV Format Requirements:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Columns: certificate_number, first_name, last_name, course_name, provider_name, issue_date, expiration_date</li>
              <li>Date format: YYYY-MM-DD</li>
              <li>Expiration date is optional</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      <Button variant="outline" onClick={downloadTemplate} className="w-full">
        <Download className="mr-2 h-4 w-4" />
        Download Template
      </Button>

      <div>
        <Label htmlFor="csv-file">Select CSV File</Label>
        <Input
          id="csv-file"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>

      {file && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm">
            <span className="font-medium">Selected file:</span> {file.name}
          </p>
          <p className="text-sm text-muted-foreground">
            Size: {(file.size / 1024).toFixed(2)} KB
          </p>
        </div>
      )}

      <Button 
        onClick={handleUpload} 
        disabled={!file || uploading || !providerId}
        className="w-full"
      >
        {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <Upload className="mr-2 h-4 w-4" />
        Upload Certificates
      </Button>
    </div>
  );
};
