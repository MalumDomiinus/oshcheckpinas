import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VerificationResult } from "./VerificationResult";

interface Certificate {
  id: string;
  first_name: string;
  last_name: string;
  certificate_number: string;
  issue_date: string;
  expiration_date: string | null;
  provider_name: string;
  course_name: string;
  status: string;
}

export const VerificationForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; certificate?: Certificate } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim() || !certificateNumber.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('verify-certificate', {
        body: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          certificateNumber: certificateNumber.trim(),
        },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`,
        } : undefined,
      });

      if (error) throw error;

      setResult(data);
      
      if (data.success) {
        toast.success("Certificate verified successfully!");
      } else {
        toast.error("Certificate not found");
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.message || "Failed to verify certificate");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFirstName("");
    setLastName("");
    setCertificateNumber("");
    setResult(null);
  };

  if (result) {
    return <VerificationResult result={result} onReset={handleReset} />;
  }

  return (
    <Card className="w-full max-w-2xl shadow-elevated">
      <CardHeader>
        <CardTitle className="text-2xl">Verify Certificate</CardTitle>
        <CardDescription>
          Enter the certificate details to verify its authenticity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="certificateNumber">Certificate Number</Label>
            <Input
              id="certificateNumber"
              placeholder="Enter certificate number"
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Verify Certificate
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
