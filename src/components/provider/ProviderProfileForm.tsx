import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProviderProfileFormProps {
  provider: any;
  onUpdate: () => void;
}

export const ProviderProfileForm = ({ provider, onUpdate }: ProviderProfileFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: provider?.name || "",
    accreditation_number: provider?.accreditation_number || "",
    accreditation_expiration: provider?.accreditation_expiration || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      if (provider) {
        await supabase
          .from('providers')
          .update(formData)
          .eq('id', provider.id);
      } else {
        await supabase
          .from('providers')
          .insert({
            ...formData,
            user_id: session.user.id,
          });
      }

      toast({
        title: "Success",
        description: "Provider profile updated successfully",
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('provider-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('provider-logos')
        .getPublicUrl(filePath);

      await supabase
        .from('providers')
        .update({ logo_url: publicUrl })
        .eq('id', provider.id);

      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
      onUpdate();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={provider?.logo_url} />
          <AvatarFallback>{formData.name?.[0] || "P"}</AvatarFallback>
        </Avatar>
        <div>
          <Label htmlFor="logo" className="cursor-pointer">
            <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Logo"}
            </div>
          </Label>
          <Input
            id="logo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
            disabled={uploading || !provider}
          />
          {!provider && (
            <p className="text-xs text-muted-foreground mt-1">
              Save profile first to upload logo
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Provider Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="accreditation_number">Accreditation Number</Label>
          <Input
            id="accreditation_number"
            value={formData.accreditation_number}
            onChange={(e) => setFormData({ ...formData, accreditation_number: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="accreditation_expiration">Accreditation Expiration Date</Label>
          <Input
            id="accreditation_expiration"
            type="date"
            value={formData.accreditation_expiration}
            onChange={(e) => setFormData({ ...formData, accreditation_expiration: e.target.value })}
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {provider ? "Update Profile" : "Create Profile"}
      </Button>
    </form>
  );
};
