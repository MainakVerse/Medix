import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Healthcare Professional",
      avatar: "SJ",
      rating: 5,
      content:
        "Medix has transformed how I provide preliminary guidance to my patients. The AI-assisted analysis is remarkably thorough and helps streamline our consultations.",
    },
    {
      name: "Michael Chen",
      role: "Patient",
      avatar: "MC",
      rating: 5,
      content:
        "As someone living in a rural area, Medix has been invaluable. The care program guidance and symptom analysis have helped me understand my health better before doctor visits.",
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Medical Director",
      avatar: "ER",
      rating: 5,
      content:
        "The privacy-first approach and HIPAA compliance give me confidence in recommending Medix to patients. It's a responsible tool for preventive healthcare.",
    },
  ]

  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">What Users Say</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Trusted by healthcare professionals and patients alike
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2 hover:border-primary transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6 italic">&ldquo;{testimonial.content}&rdquo;</p>

                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 bg-primary text-primary-foreground">
                    <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
