import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  Heart, 
  Share2, 
  TrendingUp,
  Clock,
  CheckCircle2,
  Camera,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProduct } from "@/hooks/use-shopify-products";
import { useAddToCart } from "@/hooks/use-shopify-cart";
import { getDefaultVariant, getVariantPriceFormatted } from "@/lib/shopify-adapters";
import { supabase } from "@/integrations/supabase/client";
import { getProductImageUrl } from "@/lib/shopify-adapters";

interface ProjectUpdate {
  id: string;
  shopify_product_handle: string;
  date: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  image_url: string | null;
}

interface RecentDonor {
  name: string;
  amount: number;
  time: string;
}

const ProjectDetail = () => {
  const { id: productHandle } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [donationAmount, setDonationAmount] = useState("");
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  
  // Initial render log
  console.log("🔵 ProjectDetail component rendered", { productHandle });
  
  // Fetch Shopify product
  const { data: productData, isLoading: productLoading, error: productError } = useProduct(productHandle || "");
  // Handle both response structures: { product: ... } or direct product
  const product = (productData as any)?.product || productData;
  
  // Debug logging
  useEffect(() => {
    console.log("🟢 ProjectDetail useEffect triggered", {
      productHandle,
      hasProductData: !!productData,
      productData,
      product,
      productLoading,
      productError: productError?.message
    });
  }, [productHandle, productData, product, productLoading, productError]);
  
  // Fetch Supabase updates
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [updatesLoading, setUpdatesLoading] = useState(true);
  
  // Fetch recent donors
  const [recentDonors, setRecentDonors] = useState<RecentDonor[]>([]);
  const [donorsLoading, setDonorsLoading] = useState(true);

  // Fetch dynamic features
  const [progressGallery, setProgressGallery] = useState<any[]>([]);
  const [impactItems, setImpactItems] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  
  // Add to cart
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();

  // Fetch updates from Supabase
  useEffect(() => {
    if (!productHandle) return;

    const fetchUpdates = async () => {
      setUpdatesLoading(true);
      const { data, error } = await supabase
        .from("project_updates")
        .select("*")
        .eq("shopify_product_handle", productHandle)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching updates:", error);
      } else {
        setUpdates(data || []);
      }
      setUpdatesLoading(false);
    };

    fetchUpdates();
  }, [productHandle]);

  // Fetch recent donors from Supabase
  useEffect(() => {
    if (!productHandle) return;

    const fetchDonors = async () => {
      setDonorsLoading(true);
      const { data, error } = await supabase
        .from("donations")
        .select(`
          *,
          profiles (full_name, email)
        `)
        .eq("shopify_product_handle", productHandle)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching donors:", error);
      } else {
        const formattedDonors: RecentDonor[] = (data || []).map((donation: any) => {
          const timeAgo = getTimeAgo(new Date(donation.created_at));
          return {
            name: donation.profiles?.full_name || donation.profiles?.email?.split('@')[0] || "Anonymous",
            amount: parseFloat(donation.amount),
            time: timeAgo,
          };
        });
        setRecentDonors(formattedDonors);
      }
      setDonorsLoading(false);
    };

    fetchDonors();
  }, [productHandle]);

  // Fetch dynamic features from Supabase
  useEffect(() => {
    if (!productHandle) return;

    const fetchDynamicFeatures = async () => {
      // Fetch progress gallery
      const { data: galleryData } = await supabase
        .from("project_progress_gallery")
        .select("*")
        .eq("shopify_product_handle", productHandle)
        .order("display_order", { ascending: true });

      if (galleryData) {
        setProgressGallery(galleryData.map(item => ({
          image: item.image_url,
          caption: item.caption || `Image ${item.display_order + 1}`,
          date: item.date ? new Date(item.date).toLocaleDateString() : new Date().toLocaleDateString(),
        })));
      }

      // Fetch impact items
      const { data: impactData } = await supabase
        .from("project_impact_items")
        .select("*")
        .eq("shopify_product_handle", productHandle)
        .order("display_order", { ascending: true });

      if (impactData) {
        setImpactItems(impactData.map(item => item.text));
      }

      // Fetch team members
      const { data: teamData } = await supabase
        .from("project_team_members")
        .select("*")
        .eq("shopify_product_handle", productHandle)
        .order("display_order", { ascending: true });

      if (teamData) {
        setTeamMembers(teamData.map(member => ({
          name: member.name,
          role: member.role,
          image: member.image_url || '/placeholder.svg',
        })));
      }

      // Fetch partners
      const { data: partnersData } = await supabase
        .from("project_partners")
        .select("*")
        .eq("shopify_product_handle", productHandle)
        .order("display_order", { ascending: true });

      if (partnersData) {
        setPartners(partnersData.map(partner => ({
          name: partner.name,
          logo: partner.logo_url || '/placeholder.svg',
          website: partner.website_url || '#',
        })));
      }
    };

    fetchDynamicFeatures();
  }, [productHandle]);

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Map Shopify product to project data structure
  const projectData = product ? {
    id: product.handle,
    title: product.title,
    location: product.vendor || product.productType || "Shop",
    image: getProductImageUrl(product, 0),
    raised: 0, // Will calculate from donations
    goal: parseFloat(product.priceRange?.minVariantPrice?.amount || "0"),
    donors: recentDonors.length,
    daysLeft: null, // Can add from metafields later
    story: (product.description || product.descriptionHtml?.replace(/<[^>]*>/g, '') || '').replace(/\n\n+/g, '\n\n'),
    impact: impactItems.length > 0 ? impactItems : [
      // Fallback to product tags if no impact items in Supabase
      ...(product.tags?.slice(0, 4).map(tag => `${tag.replace(/-/g, ' ')}`) || [])
    ],
    progressGallery: progressGallery.length > 0 ? progressGallery : (product.images?.edges?.slice(0, 5).map(({ node: image }, index) => ({
      image: image.url,
      caption: image.altText || `Image ${index + 1}`,
      date: new Date().toLocaleDateString()
    })) || []),
    team: teamMembers.length > 0 ? teamMembers : [],
    updates: updates.map(update => ({
      date: new Date(update.date).toLocaleDateString(),
      title: update.title,
      description: update.description,
      completed: update.status === 'completed',
      status: update.status,
    })),
    recentDonors: recentDonors,
    donationTiers: product.variants?.edges?.slice(0, 4).map(({ node: variant }) => ({
      amount: parseFloat(variant.price.amount),
      label: variant.title,
      description: `Variant: ${variant.title}`
    })) || [],
    partners: partners.length > 0 ? partners : []
  } : null;

  const handleAddToCart = () => {
    if (!product) return;

    const variant = getDefaultVariant(product);
    if (!variant) {
      toast({
        title: "Error",
        description: "No available variant found",
        variant: "destructive",
      });
      return;
    }

    const quantity = selectedTier ? 1 : (parseInt(donationAmount) || 1);
    
    addToCart(
      {
        merchandiseId: variant.id,
        quantity: quantity,
      },
      {
        onSuccess: () => {
          toast({
            title: "Added to cart!",
            description: `${product.title} has been added to your cart.`,
          });
          setDonationAmount("");
          setSelectedTier(null);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.title || "Project",
        text: "Support this community project",
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share this project with your network."
      });
    }
  };

  if (productLoading || updatesLoading || donorsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Debug logging
  if (productError) {
    console.error("Product error:", productError);
  }
  if (!product) {
    console.warn("No product found for handle:", productHandle);
  }
  if (!projectData) {
    console.warn("Project data is null");
  }

  if (productError || !product || !projectData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-destructive mb-4">Project not found</p>
          <p className="text-sm text-muted-foreground mb-4">
            {productError ? `Error: ${productError.message}` : `Product handle: ${productHandle || 'none'}`}
          </p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const progress = projectData.goal > 0 ? (projectData.raised / projectData.goal) * 100 : 0;
  const remaining = projectData.goal - projectData.raised;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="mx-auto px-4 py-8 max-w-[1600px]">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden">
              <img 
                src={projectData.image} 
                alt={projectData.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Project Title and Meta */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight pb-2">
                {projectData.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                {/* Team Members Avatars */}
                {projectData.team.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {projectData.team.slice(0, 5).map((member, index) => (
                        <div
                          key={index}
                          className="relative group"
                          style={{ zIndex: projectData.team.length - index }}
                        >
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-10 h-10 rounded-full border-3 border-background object-cover ring-2 ring-border transition-transform hover:scale-110 hover:z-50"
                            title={`${member.name} - ${member.role}`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="text-sm hidden sm:block">
                      <p className="font-semibold text-foreground">Project Team</p>
                      <p className="text-muted-foreground text-xs">{projectData.team.length} members</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{projectData.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{projectData.donors} donors</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{projectData.daysLeft || 0} days left</span>
                </div>
              </div>
            </div>

            {/* Tabs Content */}
            <Tabs defaultValue="story" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="story">Story</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
                <TabsTrigger value="donors">Donors</TabsTrigger>
              </TabsList>
              
              <TabsContent value="story" className="space-y-6 mt-6">
                <div className="prose prose-lg max-w-none">
                  {projectData.story ? (
                    projectData.story.split('\n\n').filter(p => p.trim()).map((paragraph, index) => (
                      <p key={index} className="text-foreground leading-relaxed mb-4">
                        {paragraph.trim()}
                      </p>
                    ))
                  ) : (
                    <p className="text-foreground leading-relaxed">No story available for this project.</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="updates" className="mt-6">
                {updates.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No updates yet. Check back soon!</p>
                  </div>
                ) : (
                  <div className="relative py-4">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-[23px] top-0 bottom-0 w-1 bg-gradient-to-b from-success via-border to-muted rounded-full" />
                    
                    <div className="space-y-12">
                      {projectData.updates.map((update, index) => (
                        <div 
                          key={index} 
                          className="relative animate-slide-up"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {/* Timeline Dot with Pulse Effect */}
                          <div className="absolute left-0 top-0 flex items-start">
                            <div className={`relative w-12 h-12 rounded-full border-4 border-background flex items-center justify-center shadow-lg z-10 ${
                              update.completed 
                                ? 'bg-success' 
                                : update.status === 'in-progress'
                                ? 'bg-warning'
                                : 'bg-muted'
                            }`}>
                              {update.completed ? (
                                <CheckCircle2 className="h-6 w-6 text-white" />
                              ) : update.status === 'in-progress' ? (
                                <Clock className="h-5 w-5 text-warning-foreground" />
                              ) : (
                                <Clock className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            {update.completed && (
                              <div className="absolute inset-0 w-12 h-12 rounded-full bg-success/20 animate-pulse-gentle" />
                            )}
                            {update.status === 'in-progress' && (
                              <div className="absolute inset-0 w-12 h-12 rounded-full bg-warning/20 animate-pulse-gentle" />
                            )}
                          </div>

                          {/* Connecting Line to Card */}
                          <div className="absolute left-12 top-6 w-8 h-0.5 bg-border" />

                          {/* Content Card */}
                          <div className="ml-20">
                            <Card className={`transition-all hover:shadow-lg ${
                              update.completed 
                                ? 'border-success/30 bg-success/5' 
                                : update.status === 'in-progress'
                                ? 'border-warning/30 bg-warning/5'
                                : 'border-border'
                            }`}>
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>{update.date}</span>
                                  </div>
                                  {update.completed && (
                                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-success text-white shadow-sm">
                                      ✓ COMPLETED
                                    </span>
                                  )}
                                  {update.status === 'in-progress' && (
                                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-warning text-warning-foreground shadow-sm">
                                      IN PROGRESS
                                    </span>
                                  )}
                                </div>
                                <CardTitle className="text-xl">{update.title}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-foreground/80 leading-relaxed">{update.description}</p>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Timeline End Cap */}
                    <div className="absolute left-[15px] bottom-0 w-4 h-4 rounded-full bg-muted border-4 border-background" />
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="donors" className="space-y-3 mt-6">
                {projectData.recentDonors.map((donor, index) => (
                  <Card key={index} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Heart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{donor.name}</p>
                          <p className="text-sm text-muted-foreground">{donor.time}</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-primary">
                        ${donor.amount.toLocaleString()}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>

            {/* Project Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Project Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {projectData.impact.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Progress Gallery Carousel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Project Progress Gallery
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  See the transformation in action through recent photos
                </p>
              </CardHeader>
              <CardContent>
                <Carousel className="w-full">
                  <CarouselContent>
                    {projectData.progressGallery.map((item, index) => (
                      <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2">
                        <div className="relative group">
                          <div className="aspect-[4/3] overflow-hidden rounded-lg">
                            <img
                              src={item.image}
                              alt={item.caption}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
                            <p className="text-white font-semibold text-sm mb-1">
                              {item.caption}
                            </p>
                            <p className="text-white/80 text-xs">{item.date}</p>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Sticky Donation Card */}
            <Card className="sticky top-24">
              <CardContent className="pt-6 space-y-6">
                {/* Progress Section */}
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold text-primary">
                      ${projectData.raised.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      of ${projectData.goal.toLocaleString()}
                    </span>
                  </div>
                  
                  <Progress value={progress} className="h-3" />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {projectData.donors} donations
                    </span>
                    <span className="font-semibold text-foreground">
                      ${remaining.toLocaleString()} to go
                    </span>
                  </div>
                </div>

                {/* Donation Tiers */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Choose an amount</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {projectData.donationTiers.map((tier) => (
                      <button
                        key={tier.amount}
                        onClick={() => {
                          setSelectedTier(tier.amount);
                          setDonationAmount("");
                        }}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          selectedTier === tier.amount
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="font-bold text-lg">${tier.amount}</div>
                        <div className="text-xs text-muted-foreground mt-1">{tier.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div className="space-y-2">
                  <Label htmlFor="custom-amount">Or enter custom amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="custom-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={donationAmount}
                      onChange={(e) => {
                        setDonationAmount(e.target.value);
                        setSelectedTier(null);
                      }}
                      className="pl-6"
                      min="1"
                    />
                  </div>
                </div>

                {/* Donation Button */}
                <Button 
                  size="lg" 
                  className="w-full text-base font-semibold"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !product?.availableForSale}
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 h-5 w-5" />
                      Donate Now
                    </>
                  )}
                </Button>

                {/* Share Button */}
                <Button 
                  size="lg"
                  variant="outline" 
                  className="w-full"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share This Project
                </Button>

                {/* Tax Deductible Note */}
                <p className="text-xs text-center text-muted-foreground pt-4 border-t">
                  Your donation is tax-deductible. <br />
                  Tax ID: 12-3456789
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-12 mt-20">
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

export default ProjectDetail;
