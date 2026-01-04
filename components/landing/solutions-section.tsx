import { Search, Heart, Pill, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function SolutionsSection() {
  const solutions = [
    {
      icon: Search,
      title: "Disease Detection",
      description: "AI-assisted symptom analysis across all biological systems",
    },
    {
      icon: Heart,
      title: "Care Programs",
      description: "Personalized lifestyle and care guidance",
    },
    {
      icon: Pill,
      title: "Medicines Guidance",
      description: "Educational medical compositions and usage awareness",
    },
    {
      icon: FileText,
      title: "AI Prescriptions",
      description: "Doctor-reviewable prescription drafts",
    },
  ]

  return (
    <section id="solutions" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">Our Solutions</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Comprehensive AI-powered tools to transform your healthcare experience
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {solutions.map((solution, index) => {
            const Icon = solution.icon
            return (
              <Card
                key={index}
                className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-8">
                  <div className="inline-flex p-4 bg-primary/10 rounded-full mb-6 transition-transform hover:scale-110 duration-300">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{solution.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{solution.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
