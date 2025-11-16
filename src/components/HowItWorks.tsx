import { Heart, Target, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Heart,
    title: "Choose a Project",
    description: "Browse our curated projects and find a neighborhood initiative that resonates with you.",
  },
  {
    icon: Target,
    title: "Make Your Contribution",
    description: "Every donation is tax-deductible and goes directly to funding local development.",
  },
  {
    icon: TrendingUp,
    title: "Track the Impact",
    description: "Receive updates on your project's progress and see the tangible results of your support.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to empower your community and create lasting change
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center space-y-4 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-4">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
