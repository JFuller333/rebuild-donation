import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { HowItWorks } from "@/components/HowItWorks";
import { ProjectCard } from "@/components/ProjectCard";
import { useProducts } from "@/hooks/use-shopify-products";
import { shopifyProductToProjectCard } from "@/lib/shopify-adapters";
import { Loader2 } from "lucide-react";

const Index = () => {
  // Fetch products from Shopify
  const { data: productsData, isLoading, error } = useProducts({ first: 6 });

  // Convert Shopify products to ProjectCard format
  const featuredProjects = productsData?.edges.map(({ node: product }) =>
    shopifyProductToProjectCard(product, {
      useVendorAsLocation: true,
    })
  ) || [];

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Stats />
      
      <section id="projects" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Projects</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              This block has a brighter future because of you. Support the projects making real change in our communities.
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-destructive mb-4">Error loading products</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Please check your Shopify configuration"}
              </p>
            </div>
          ) : featuredProjects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No products found. Add products in your Shopify store.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          )}
        </div>
      </section>
      
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
          <button className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            Browse All Projects
          </button>
        </div>
      </section>
      
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-4">Rebuild Together</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Empowering communities through transparent, impactful neighborhood development projects.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Our Projects</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Get Involved</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>hello@rebuilttogether.org</li>
                <li>(555) 123-4567</li>
                <li>Tax ID: 12-3456789</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2024 Rebuild Together. 501(c)(3) nonprofit organization. All donations are tax-deductible.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
