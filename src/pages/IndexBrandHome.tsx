import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { HowItWorks } from "@/components/HowItWorks";
import { FeaturedProjectsSection } from "@/components/FeaturedProjectsSection";
import { Link } from "react-router-dom";

const IndexBrandHome = () => {
  const handleBrowseProjectsClick = () => {
    const section = document.getElementById("projects");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/#projects";
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Stats />

      <FeaturedProjectsSection />

      <HowItWorks />

      <section className="py-20 bg-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to make an impact?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join hundreds of neighbors investing in the future of our communities.
            Your neighborhood impact is just a scroll away.
          </p>
          <button
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            onClick={handleBrowseProjectsClick}
          >
            Browse All Projects
          </button>
        </div>
      </section>

      <footer className="border-t border-black bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-white/70 mb-6">
            <Link to="/" className="underline hover:text-white">
              View the Donate → Learn → Build homepage
            </Link>
          </p>
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-4">Let's Rebuild Tuskegee</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Empowering communities through transparent, impactful community development projects.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="https://www.letsrebuildtuskegee.org/" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#projects" className="hover:text-white transition-colors">Our Projects</a></li>
                <li><a href="https://www.letsrebuildtuskegee.org/" className="hover:text-white transition-colors">Get Involved</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
                <li>Tax ID: 83-3300246</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>build@letsrebuildtuskegee.org</li>
                <li></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-sm text-white/80">
            <p>© 2026 Let's Rebuild Tuskegee. 501(c)(3) nonprofit organization. All donations are tax-deductible.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IndexBrandHome;
