import { Header } from "@/components/Header";
import { Shield, Eye, Users, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">About CertifyCheck</h1>
            <p className="text-lg text-muted-foreground">
              Your trusted partner in OSH certificate verification and management
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 mb-12">
            <div className="bg-card p-6 rounded-lg border">
              <Shield className="h-12 w-12 text-accent mb-4" />
              <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
              <p className="text-muted-foreground">
                To provide a secure, reliable, and efficient platform for verifying 
                Occupational Safety and Health (OSH) training certificates, ensuring 
                authenticity and maintaining the highest standards of workplace safety.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <Eye className="h-12 w-12 text-accent mb-4" />
              <h2 className="text-2xl font-semibold mb-3">Our Vision</h2>
              <p className="text-muted-foreground">
                To become the leading certificate verification system in the Philippines, 
                promoting transparency and trust in OSH training credentials across all 
                industries.
              </p>
            </div>
          </div>

          <div className="bg-card p-8 rounded-lg border mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-center">What We Offer</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <Users className="h-10 w-10 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">For Professionals</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your training records and certificates in one secure location
                </p>
              </div>
              <div className="text-center">
                <Award className="h-10 w-10 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">For Training Providers</h3>
                <p className="text-sm text-muted-foreground">
                  Issue and manage certificates with complete transparency
                </p>
              </div>
              <div className="text-center">
                <Shield className="h-10 w-10 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">For Employers</h3>
                <p className="text-sm text-muted-foreground">
                  Instantly verify the authenticity of employee certificates
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card p-8 rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4">About OSH</h2>
            <p className="text-muted-foreground mb-4">
              Occupational Safety and Health (OSH) training is essential for maintaining 
              safe workplaces and protecting workers from hazards. CertifyCheck ensures 
              that all OSH certifications in our system meet the standards set by 
              regulatory bodies.
            </p>
            <p className="text-muted-foreground">
              Our platform serves as a bridge between training providers, professionals, 
              and employers, creating a transparent ecosystem where certificate authenticity 
              can be verified instantly.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
