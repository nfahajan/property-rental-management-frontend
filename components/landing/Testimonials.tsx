import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Manager",
    image: "/professional-woman-headshot.png",
    content:
      "Finding my apartment through HomeNest was incredibly easy. The search filters helped me find exactly what I needed, and the team was supportive throughout the entire process.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Software Engineer",
    image: "/professional-man-headshot.png",
    content:
      "The virtual tours saved me so much time. I was able to narrow down my choices before scheduling in-person visits. Highly recommend this platform!",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Graphic Designer",
    image: "/avatar-1.png",
    content:
      "As a first-time renter, I appreciated the transparency and guidance. The application process was straightforward, and I moved into my dream apartment within weeks.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-oswald font-bold text-foreground mb-4 text-balance">
            What Our Clients Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Don't just take our word for it - hear from our satisfied clients
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-secondary text-secondary"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 text-pretty leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
