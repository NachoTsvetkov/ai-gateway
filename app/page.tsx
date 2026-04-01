import { AIFeatures } from "components/ai-features";
import { Carousel } from "components/carousel";
import { ThreeItemGrid } from "components/grid/three-items";
import { Hero } from "components/hero";
import Footer from "components/layout/footer";
import { TechStack } from "components/tech-stack";

export const metadata = {
  description:
    "AI-powered headless Shopify storefront with OpenAI product recommendations and real-time chatbot. Built with Next.js 16, Vercel AI SDK, and Tailwind CSS.",
  openGraph: {
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <ThreeItemGrid />
      <Carousel />
      <AIFeatures />
      <TechStack />
      <Footer />
    </>
  );
}
