import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function DisclaimerPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-yellow-100 rounded-full mb-4">
                <AlertTriangle className="h-12 w-12 text-yellow-600" />
              </div>
              <h1 className="text-5xl font-bold text-foreground text-balance">Medical Disclaimer</h1>
            </div>

            <Card className="border-2 border-yellow-200 bg-yellow-50">
              <CardContent className="p-8 space-y-6 text-foreground leading-relaxed">
                <p className="text-lg font-semibold">IMPORTANT: Please Read Carefully</p>

                <p>
                  Medix is an educational and informational platform designed to provide general health guidance and
                  advisory services. The content provided through this platform is for educational purposes only and is
                  NOT intended to be a substitute for professional medical advice, diagnosis, or treatment.
                </p>

                <p>
                  <strong>Always seek the advice of your physician</strong> or other qualified healthcare provider with
                  any questions you may have regarding a medical condition. Never disregard professional medical advice
                  or delay in seeking it because of something you have read on Medix.
                </p>

                <p>
                  The AI-generated recommendations, symptom analyses, and prescription drafts provided by Medix are{" "}
                  <strong>advisory in nature</strong> and must be reviewed and approved by licensed healthcare
                  professionals before any medical action is taken.
                </p>

                <p>
                  <strong>In case of a medical emergency,</strong> immediately call your local emergency services or go
                  to the nearest emergency room. Do not rely on Medix for emergency medical situations.
                </p>

                <p>
                  By using Medix, you acknowledge that you have read and understood this disclaimer and agree to use the
                  platform in accordance with these terms.
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
