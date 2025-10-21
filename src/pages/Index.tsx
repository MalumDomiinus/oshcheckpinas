import { Header } from "@/components/Header";
import { VerificationForm } from "@/components/VerificationForm";
import { Shield, Lock, Clock, CheckCircle } from "lucide-react";
const Index = () => {
  return <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Shield className="h-12 w-12 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Verify your OSH Certificates Instantly!</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Fast, secure, and reliable certificate verification system. Check the authenticity of any certificate in seconds.
          </p>
        </section>

        <section className="flex justify-center mb-16">
          <VerificationForm />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-accent/10 rounded-full">
                <Lock className="h-6 w-6 text-accent" />
              </div>
            </div>
            <h3 className="font-semibold text-lg">Secure Verification</h3>
            <p className="text-muted-foreground text-sm">
              Advanced security measures protect your data and ensure accurate results
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-accent/10 rounded-full">
                <Clock className="h-6 w-6 text-accent" />
              </div>
            </div>
            <h3 className="font-semibold text-lg">Instant Results</h3>
            <p className="text-muted-foreground text-sm">
              Get verification results in seconds with our efficient system
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-accent/10 rounded-full">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
            </div>
            <h3 className="font-semibold text-lg">Always Accurate</h3>
            <p className="text-muted-foreground text-sm">
              Reliable verification against our comprehensive certificate database
            </p>
          </div>
        </section>
      </main>
    </div>;
};
export default Index;