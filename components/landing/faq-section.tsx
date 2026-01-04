import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "Is Medix a replacement for my doctor?",
      answer:
        "No, Medix is an advisory platform that provides educational information and guidance. It is not a diagnostic tool and should not replace professional medical advice. Always consult with healthcare professionals for medical decisions.",
    },
    {
      question: "How does the disease detection feature work?",
      answer:
        "Our AI analyzes your symptoms across all biological systems using advanced algorithms. It provides potential insights and recommendations, which should be reviewed with a qualified healthcare provider.",
    },
    {
      question: "Is my health data secure and private?",
      answer:
        "Absolutely. We follow HIPAA compliance standards and employ privacy-first architecture. Your data is encrypted and never shared without your explicit consent.",
    },
    {
      question: "What biological systems does Medix cover?",
      answer:
        "Medix covers all 9 major biological systems: cardiovascular, respiratory, digestive, nervous, immune, endocrine, musculoskeletal, urinary, and reproductive systems.",
    },
    {
      question: "Can doctors review AI-generated prescriptions?",
      answer:
        "Yes, our AI-generated prescription drafts are designed to be reviewed and approved by licensed physicians before any medical action is taken.",
    },
    {
      question: "How personalized are the care programs?",
      answer:
        "Care programs are tailored based on your health profile, lifestyle factors, and specific health goals. They include nutrition, exercise, and preventive care recommendations.",
    },
    {
      question: "What kind of medicines guidance do you provide?",
      answer:
        "We provide educational information about medication compositions, usage guidelines, potential interactions, and general awareness. This is for educational purposes only.",
    },
    {
      question: "Is Medix suitable for emergency situations?",
      answer:
        "No. Medix is not designed for emergencies. In case of medical emergencies, please call emergency services or visit the nearest emergency room immediately.",
    },
  ]

  return (
    <section id="faq" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">Everything you need to know about Medix</p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-card border-2 rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
