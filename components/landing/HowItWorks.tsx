import { Search, FileCheck, Key, Home } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search Properties",
    description:
      "Browse through our extensive collection of verified properties that match your preferences and budget.",
  },
  {
    icon: FileCheck,
    title: "Schedule Viewing",
    description:
      "Book a convenient time to visit your favorite properties and experience them in person.",
  },
  {
    icon: Key,
    title: "Apply & Sign",
    description:
      "Complete a simple application process and sign your lease agreement digitally.",
  },
  {
    icon: Home,
    title: "Move In",
    description:
      "Get your keys and move into your new home. We make the transition seamless and stress-free.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-oswald font-bold text-foreground mb-4 text-balance">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Finding your perfect rental property is easy with our streamlined
            process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative text-center">
                <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary text-secondary-foreground">
                  <Icon className="h-10 w-10" />
                </div>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 -z-10 hidden lg:block">
                  {index < steps.length - 1 && (
                    <div
                      className="w-48 h-0.5 bg-border"
                      style={{ marginLeft: "2.5rem" }}
                    />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {index + 1}. {step.title}
                </h3>
                <p className="text-muted-foreground text-pretty">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
