import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-community.jpg";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/5 to-accent/10">
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Community members working together on neighborhood development" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-white via-white/80 to-white/40" />
      </div>
      
      <div className="page-shell relative z-10 py-24 md:py-32 lg:py-40">
        <div className="max-w-2xl animate-slide-up">
          <p className="uppercase tracking-[0.4em] text-sm text-primary mb-4">
            Building Trust Block by Block
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6 text-foreground">
            Your support laid the foundation
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground/80 mb-8 leading-relaxed">
            Every donation builds stronger, more resilient communities. Join us in transforming 
            neighborhoods through transparent, impactful development projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="text-base group shadow-lg shadow-primary/20">
              Fund a Project Today
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="ghost" className="text-base bg-white/80 hover:bg-white shadow">
              See Our Impact
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
