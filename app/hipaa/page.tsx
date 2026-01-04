import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Eye, FileCheck } from "lucide-react"

export default function HIPAAPage() {
  const features = [
    {
      icon: Shield,
      title: "Data Protection",
      description: "End-to-end encryption for all health information",
    },
    {
      icon: Lock,
      title: "Secure Storage",
      description: "HIPAA-compliant data centers and infrastructure",
    },
    {
      icon: Eye,
      title: "Privacy Controls",
      description: "You control who sees your health data",
    },
    {
      icon: FileCheck,
      title: "Compliance",
      description: "Regular audits and security assessments",
    },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-bold text-foreground text-balance">HIPAA Compliance</h1>
              <p className="text-xl text-muted-foreground text-pretty">
                Your privacy and security are our top priorities
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card key={index} className="border-2">
                    <CardHeader>
                      <div className="inline-flex p-3 bg-primary/10 rounded-lg w-fit mb-2">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Our Commitment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Medix is built with privacy-first architecture and adheres to HIPAA (Health Insurance Portability and
                  Accountability Act) standards to protect your health information.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We implement administrative, physical, and technical safeguards to ensure the confidentiality,
                  integrity, and security of your protected health information (PHI).
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Your health data is never shared with third parties without your explicit consent, and you maintain
                  full control over your information at all times.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
