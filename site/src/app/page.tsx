import { Hero } from "@/components/sections/hero"
import { ServicesGrid } from "@/components/sections/services-grid"
import { HowItWorks } from "@/components/sections/how-it-works"
import { Comparison } from "@/components/sections/comparison"
import { Pricing } from "@/components/sections/pricing"
import { LearnBanner } from "@/components/sections/learn-banner"
import { CTA } from "@/components/sections/cta"

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesGrid />
      <HowItWorks />
      <Comparison />
      <Pricing />
      <LearnBanner />
      <CTA />
    </>
  )
}
