import Backdrop from '@/components/Backdrop';
import Chrome from '@/components/Chrome';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Marquee from '@/components/Marquee';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Coverage from '@/components/Coverage';
import Terminal from '@/components/Terminal';
import Feed from '@/components/Feed';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Page() {
  return (
    <>
      <Backdrop />
      <Chrome />
      <Nav />
      <main id="main" tabIndex={-1} className="relative z-10">
        <Hero />
        <About />
        <Marquee />
        <Skills />
        <Projects />
        <Coverage />
        <Terminal />
        <Feed />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
