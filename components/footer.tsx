import Link from "next/link"

export function Footer() {
  const links = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "HIPAA Compliance", href: "/hipaa" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Disclaimer", href: "/disclaimer" },
  ]

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-6">
          <div className="text-3xl font-bold text-primary">Medix</div>

          <nav className="flex flex-wrap justify-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Medix. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground max-w-2xl">
              <strong>Medical Disclaimer:</strong> Medix is an educational and advisory platform. It is not a substitute
              for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or
              qualified healthcare provider.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
