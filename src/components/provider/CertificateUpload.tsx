import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const certificateSchema = z.object({
  certificate_number: z.string().trim().min(1).max(50),
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  course_name: z.string().trim().min(1).max(200),
  provider_name: z.string().trim().min(1).max(200),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  expiration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional().or(z.literal('')),
});

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
    
    if (!selectedFile) return;
    
    if (selectedFile.type !== 'text/csv') {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        variant: "destructive",
      });
      return;
    }
    
    setFile(selectedFile);
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
      
      if (rows.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }
      
      // Skip header row
      const dataRows = rows.slice(1);
      const validationErrors: string[] = [];
      const validCertificates: any[] = [];
      
      // Check for duplicate certificate numbers in the file
      const certificateNumbers = new Set<string>();
      
      for (let i = 0; i < dataRows.length; i++) {
        const values = parseCsvRow(dataRows[i]);
        
        if (values.length < 6) {
          validationErrors.push(`Row ${i + 2}: Insufficient columns (expected at least 6)`);
          continue;
        }
        
        const rawCert = {
          certificate_number: values[0],
          first_name: values[1],
          last_name: values[2],
          course_name: values[3],
          provider_name: values[4],
          issue_date: values[5],
          expiration_date: values[6] || '',
        };
        
        // Validate with zod schema
        const result = certificateSchema.safeParse(rawCert);
        if (!result.success) {
          validationErrors.push(`Row ${i + 2}: ${result.error.errors.map(e => e.message).join(', ')}`);
          continue;
        }
        
        // Check for duplicate certificate number in file
        if (certificateNumbers.has(result.data.certificate_number)) {
          validationErrors.push(`Row ${i + 2}: Duplicate certificate number ${result.data.certificate_number}`);
          continue;
        }
        certificateNumbers.add(result.data.certificate_number);
        
        // Validate dates are reasonable
        const issueDate = new Date(result.data.issue_date);
        if (issueDate > new Date()) {
          validationErrors.push(`Row ${i + 2}: Issue date cannot be in the future`);
          continue;
        }
        
        if (result.data.expiration_date) {
          const expirationDate = new Date(result.data.expiration_date);
          if (expirationDate < issueDate) {
            validationErrors.push(`Row ${i + 2}: Expiration date must be after issue date`);
            continue;
          }
        }
        
        validCertificates.push({
          provider_id: providerId,
          certificate_number: result.data.certificate_number,
          first_name: result.data.first_name,
          last_name: result.data.last_name,
          course_name: result.data.course_name,
          provider_name: result.data.provider_name,
          issue_date: result.data.issue_date,
          expiration_date: result.data.expiration_date || null,
          status: 'active' as const,
        });
      }
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed:\n${validationErrors.slice(0, 5).join('\n')}${validationErrors.length > 5 ? `\n...and ${validationErrors.length - 5} more errors` : ''}`);
      }
      
      if (validCertificates.length === 0) {
        throw new Error('No valid certificates to upload');
      }
      
      // Check for existing certificate numbers in database
      const { data: existingCerts } = await supabase
        .from('certificates')
        .select('certificate_number')
        .in('certificate_number', Array.from(certificateNumbers));
      
      if (existingCerts && existingCerts.length > 0) {
        const duplicates = existingCerts.map(c => c.certificate_number).join(', ');
        throw new Error(`The following certificate numbers already exist: ${duplicates}`);
      }

      const { error } = await supabase
        .from('certificates')
        .insert(validCertificates);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${validCertificates.length} certificates uploaded successfully`,
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
        Upload File
      </Button>
    </div>
  );
};
