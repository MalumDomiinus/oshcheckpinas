import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Calendar, Building, GraduationCap } from "lucide-react";
import { format } from "date-fns";

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

interface VerificationResultProps {
  result: {
    success: boolean;
    certificate?: Certificate;
  };
  onReset: () => void;
}

export const VerificationResult = ({ result, onReset }: VerificationResultProps) => {
  const { success, certificate } = result;

  if (!success) {
    return (
      <Card className="w-full max-w-2xl shadow-elevated border-destructive">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-destructive">Certificate Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            The certificate details you provided could not be verified. Please check the information and try again.
          </p>
          <Button onClick={onReset} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl shadow-elevated border-success">
      <CardHeader className="text-center bg-gradient-success text-success-foreground">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-16 w-16" />
        </div>
        <CardTitle className="text-2xl">Certificate Verified</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Certificate Holder</p>
              <p className="font-semibold text-lg">
                {certificate?.first_name} {certificate?.last_name}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Provider</p>
              <p className="font-semibold">{certificate?.provider_name}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Course</p>
              <p className="font-semibold">{certificate?.course_name}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Issue Date</p>
              <p className="font-semibold">
                {certificate?.issue_date && format(new Date(certificate.issue_date), 'PPP')}
              </p>
            </div>
          </div>

          {certificate?.expiration_date && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Expiration Date</p>
                <p className="font-semibold">
                  {format(new Date(certificate.expiration_date), 'PPP')}
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Certificate Number</p>
              <Badge variant="outline" className="font-mono">
                {certificate?.certificate_number}
              </Badge>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className="bg-gradient-success">
                {certificate?.status}
              </Badge>
            </div>
          </div>
        </div>

        <Button onClick={onReset} className="w-full" variant="outline">
          Verify Another Certificate
        </Button>
      </CardContent>
    </Card>
  );
};
