import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Features from '@/components/Features';
import WhyStudia from '@/components/WhyStudia';
import Creator from '@/components/Creator';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Features />
      <WhyStudia />
      <Creator />
      <CTA />
      <Footer />
    </main>
  );
}