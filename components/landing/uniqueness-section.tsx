import { CheckCircle2 } from "lucide-react"

export function UniquenessSection() {
  const features = [
    "Covers all 9 biological systems",
    "Non-diagnostic and advisory",
    "Privacy-first architecture",
    "Doctor-aligned outputs",
    "Preventive healthcare focus",
  ]

  return (
    <section id="uniqueness" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">Why Medix Is Different</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              A comprehensive approach to medical advisory that prioritizes your health and privacy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 bg-card rounded-lg border-2 hover:border-primary transition-all duration-300"
              >
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-lg text-foreground font-medium">{feature}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 bg-primary/5 rounded-lg border-2 border-primary/20">
            <p className="text-center text-muted-foreground italic leading-relaxed">
              Medix combines cutting-edge AI technology with medical best practices to deliver personalized health
              guidance while maintaining the highest standards of privacy and accuracy
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
