import { Header } from "@/components/Header";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-muted-foreground">
              Have questions? We're here to help
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Input
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={6}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
              
              <div className="bg-card p-6 rounded-lg border space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-accent mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a
                      href="mailto:admin@oshcheckpinas.com"
                      className="text-muted-foreground hover:text-accent transition-colors"
                    >
                      admin@oshcheckpinas.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-accent mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Business Hours</h3>
                    <p className="text-muted-foreground">
                      Monday - Friday: 9:00 AM - 5:00 PM
                    </p>
                    <p className="text-muted-foreground">
                      Saturday - Sunday: Closed
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-accent mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Location</h3>
                    <p className="text-muted-foreground">
                      Philippines
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold mb-3">Need Immediate Assistance?</h3>
                <p className="text-muted-foreground text-sm">
                  For urgent certificate verification issues or technical support, 
                  please email us directly at{" "}
                  <a
                    href="mailto:admin@oshcheckpinas.com"
                    className="text-accent hover:underline"
                  >
                    admin@oshcheckpinas.com
                  </a>
                  {" "}and we'll respond as quickly as possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
