import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, UserPlus, Loader2 } from "lucide-react";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  role: z.enum(["user", "provider", "admin"], { required_error: "Please select a role" }),
  fullName: z.string().trim().max(100, "Name must be less than 100 characters").optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export const InviteUserForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: "user",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: InviteFormData) => {
    setIsSubmitting(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: data.email,
          role: data.role,
          fullName: data.fullName || null,
        },
      });

      if (error) throw error;

      toast({
        title: "Invitation sent!",
        description: `An invitation email has been sent to ${data.email}`,
      });
      
      reset();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Failed to send invitation",
        description: error.message || "An error occurred while sending the invitation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Invite New User
        </CardTitle>
        <CardDescription>
          Send an invitation email to add a new user to the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                className="pl-9"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name (Optional)</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setValue("role", value as "user" | "provider" | "admin")}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="provider">Provider</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Invitation...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
