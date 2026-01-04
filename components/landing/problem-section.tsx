import { AlertTriangle, Clock, TrendingDown, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function ProblemSection() {
  const problems = [
    {
      icon: Clock,
      title: "Delayed Diagnosis",
      description: "Long wait times for medical consultations lead to late disease detection and treatment delays",
    },
    {
      icon: TrendingDown,
      title: "Overloaded Healthcare Systems",
      description: "Healthcare professionals overwhelmed with patients, reducing quality of care and attention",
    },
    {
      icon: AlertTriangle,
      title: "Lack of Preventive Guidance",
      description: "Minimal access to proactive health advice and early intervention strategies",
    },
    {
      icon: MapPin,
      title: "Poor Accessibility",
      description: "Limited access to healthcare services in remote areas and underserved communities",
    },
  ]

  return (
    <section id="problem" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">The Problem</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Healthcare faces critical challenges that prevent timely and effective medical care
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {problems.map((problem, index) => {
            const Icon = problem.icon
            return (
              <Card
                key={index}
                className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2">{problem.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
