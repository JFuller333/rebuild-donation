import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Check,
  Camera,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProduct } from "@/hooks/use-shopify-products";
import { useAddToCart } from "@/hooks/use-shopify-cart";
import { getDefaultVariant, getVariantPriceFormatted, getSmallestVariant, getVariantByPrice } from "@/lib/shopify-adapters";
import { supabase } from "@/integrations/supabase/client";
import { getProductImageUrl } from "@/lib/shopify-adapters";
import type { ProductVariant } from "@/integrations/shopify/types";
import DOMPurify from "dompurify";

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
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundPreference, setRefundPreference] = useState<"refund" | "reallocate" | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

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

  // Fetch current user for recording refund preferences
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
    };
    loadUser();
  }, []);
  
  // Fetch project metrics
  const [projectRecord, setProjectRecord] = useState<{
    goal_amount: number | null;
    raised_amount: number | null;
    donor_count: number | null;
    donation_count: number | null;
  } | null>(null);
  
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

  // Fetch project metrics from Supabase
  useEffect(() => {
    if (!productHandle) return;

    const fetchProjectMetrics = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("goal_amount, raised_amount, donor_count, donation_count, shopify_product_handle")
        .eq("shopify_product_handle", productHandle)
        .maybeSingle();

      if (error) {
        console.error("Error fetching project metrics:", error);
        return;
      }

      setProjectRecord(data);
    };

    fetchProjectMetrics();
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
  const normalizeStatus = (status: string): "completed" | "in-progress" | "upcoming" | "other" => {
    const normalized = status?.trim().toLowerCase().replace(/[\s_]+/g, "-");
    if (normalized === "completed" || normalized === "in-progress" || normalized === "upcoming") {
      return normalized;
    }
    return "other";
  };

  const sortedUpdates = [...updates].sort((a, b) => {
    const statusPriority: Record<string, number> = {
      "completed": 0,
      "upcoming": 1,
      "other": 1,
      "in-progress": 2, // show in-progress items last
    };

    const statusDiff = (statusPriority[normalizeStatus(a.status)] ?? 3) - (statusPriority[normalizeStatus(b.status)] ?? 3);
    if (statusDiff !== 0) return statusDiff;

    const dateA = new Date(a.updated_at || a.date).getTime();
    const dateB = new Date(b.updated_at || b.date).getTime();
    return dateA - dateB; // oldest to newest within each status group
  });

  const projectData = product ? {
    id: product.handle,
    title: product.title,
    location: (() => {
      if (projectRecord?.location) return projectRecord.location;
      if (product.handle === "maple-street-housing" || product.vendor === "rebuild-investor-software") {
        return "Greenwood Neighborhood";
      }
      return product.vendor || product.productType || "Shop";
    })(),
    image: getProductImageUrl(product, 0),
    raised: projectRecord?.raised_amount ?? 0,
    goal: projectRecord?.goal_amount ?? parseFloat(product.priceRange?.minVariantPrice?.amount || "0"),
    donors: projectRecord?.donation_count ?? recentDonors.length,
    daysLeft: null, // Can add from metafields later
    story: product.descriptionHtml || product.description || "",
    impact: impactItems.length > 0 ? impactItems : [
      "Preserves history: Restores Tuskegee’s historic Greenwood community and honors its legacy.",
      "Strengthens community: Provides pathways to homeownership and long-term stability for faculty, staff, and local professionals.",
      "Boosts local economy and university: Supports faculty retention, stimulates neighborhood revitalization, and builds generational wealth.",
      ...(product.tags?.slice(0, 1).map(tag => `${tag.replace(/-/g, ' ')}`) || [])
    ],
    progressGallery: progressGallery.length > 0 ? progressGallery : (product.images?.edges?.slice(0, 5).map(({ node: image }) => ({
      image: image.url,
      caption: image.altText || "",
      date: new Date().toLocaleDateString()
    })) || []),
    team: teamMembers.length > 0 ? teamMembers : [],
    updates: sortedUpdates.map(update => ({
      date: new Date(update.updated_at || update.date).toLocaleDateString(),
      title: update.title,
      description: update.description,
      completed: normalizeStatus(update.status) === 'completed',
      status: normalizeStatus(update.status),
    })),
    recentDonors: recentDonors,
    donationTiers: product.variants?.edges?.slice(0, 4).map(({ node: variant }) => ({
      amount: parseFloat(variant.price.amount),
      label: variant.title,
      description: `Variant: ${variant.title}`
    })) || [],
    partners: partners.length > 0 ? partners : []
  } : null;

  const sanitizedStory = useMemo(
    () => (projectData?.story ? DOMPurify.sanitize(projectData.story) : ""),
    [projectData?.story]
  );

  const handleConfirmRefundPreference = async () => {
    if (!refundPreference) {
      toast({
        title: "Choose a refund option",
        description: "Select refund or reallocation before continuing.",
        variant: "destructive",
      });
      return;
    }

    // Persist preference to Supabase (best-effort)
    try {
      await supabase
        .from("refund_preferences")
        .upsert({
          user_id: currentUser?.id ?? null,
          email: currentUser?.email ?? null,
          shopify_product_handle: productHandle,
          preference: refundPreference,
          acknowledged_at: new Date().toISOString(),
        });
    } catch (err) {
      console.error("Failed to save refund preference", err);
      toast({
        title: "Could not save preference",
        description: "We’ll still proceed, but your choice may not be recorded.",
        variant: "destructive",
      });
    }

    setTermsAccepted(true);
    setRefundModalOpen(false);
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (!termsAccepted || !refundPreference) {
      toast({
        title: "Review terms first",
        description: "Please read the terms and choose your refund option.",
        variant: "destructive",
      });
      setRefundModalOpen(true);
      return;
    }

    let variant: ProductVariant | null = null;
    let quantity = 1;
    let isCustomAmountVariant = false;
    let customAmount = 0;

    // Debug logging
    console.log('🛒 handleAddToCart called:', {
      selectedTier,
      donationAmount,
      hasProduct: !!product,
      variantCount: product.variants?.edges?.length || 0,
    });

    // If user selected a tier, use that variant
    if (selectedTier) {
      console.log('📌 Using selected tier:', selectedTier);
      variant = getVariantByPrice(product, selectedTier);
      if (!variant) {
        // Fallback: find closest variant
        console.log('⚠️ Tier variant not found, using default');
        variant = getDefaultVariant(product);
      }
      quantity = 1;
    } 
    // If user entered custom amount, use smallest variant and calculate quantity
    else if (donationAmount && parseFloat(donationAmount) > 0) {
      customAmount = parseFloat(donationAmount);
      console.log('💰 Using custom amount:', customAmount);
      
      // Validate custom amount
      if (customAmount < 0.01) {
        toast({
          title: "Invalid amount",
          description: "Minimum donation amount is $0.01",
          variant: "destructive",
        });
        return;
      }

      // Find the smallest variant (preferably $0.01)
      variant = getSmallestVariant(product);
      
      if (!variant) {
        console.error('❌ No smallest variant found');
        toast({
          title: "Error",
          description: "No available variant found for custom amount",
          variant: "destructive",
        });
        return;
      }

      const variantPrice = parseFloat(variant.price.amount);
      isCustomAmountVariant = Math.abs(variantPrice - 0.01) < 0.001;
      
      console.log('✅ Using variant:', {
        id: variant.id,
        price: variantPrice,
        priceRaw: variant.price.amount,
        title: variant.title,
        availableForSale: variant.availableForSale,
        isCustomAmountVariant,
      });
      
      // Calculate quantity: customAmount / variantPrice
      // Round to nearest integer (Shopify requires whole number quantities)
      quantity = Math.round(customAmount / variantPrice);
      
      // Check if variant has quantity limits
      const maxQuantity = variant.quantityAvailable > 0 ? variant.quantityAvailable : null;
      if (maxQuantity && quantity > maxQuantity) {
        console.warn(`⚠️ Requested quantity ${quantity} exceeds available ${maxQuantity}. Capping to ${maxQuantity}.`);
        quantity = maxQuantity;
      }
      
      // Ensure quantity is at least 1
      if (quantity < 1) {
        quantity = 1;
      }

      const calculatedTotal = quantity * variantPrice;
      console.log('📊 Calculation:', {
        customAmount,
        variantPrice,
        quantity,
        maxQuantityAvailable: variant.quantityAvailable,
        calculatedTotal: calculatedTotal.toFixed(2),
        formula: `${customAmount} / ${variantPrice} = ${(customAmount / variantPrice).toFixed(2)} → rounded to ${quantity}`,
      });

      // Validate the calculated total matches (within 1 cent tolerance)
      const difference = Math.abs(calculatedTotal - customAmount);
      
      if (difference > 0.01) {
        toast({
          title: "Amount adjustment",
          description: `Using closest amount: $${calculatedTotal.toFixed(2)}`,
        });
      }
    } 
    // Default: use first available variant
    else {
      console.log('🔵 Using default variant (no tier or custom amount)');
      variant = getDefaultVariant(product);
      if (!variant) {
        toast({
          title: "Error",
          description: "No available variant found",
          variant: "destructive",
        });
        return;
      }
      quantity = 1;
    }

    if (!variant) {
      toast({
        title: "Error",
        description: "No available variant found",
        variant: "destructive",
      });
      return;
    }

    // Add attributes for custom amount variants to store original donation amount
    const attributes: Array<{ key: string; value: string }> = [];
    if (isCustomAmountVariant) {
      attributes.push({
        key: '_custom_donation_amount',
        value: customAmount.toFixed(2),
      });
      attributes.push({
        key: '_hide_quantity',
        value: 'true',
      });
    }
    attributes.push({
      key: "_refund_preference",
      value: refundPreference!,
    });
    attributes.push({
      key: "_terms_acknowledged_at",
      value: new Date().toISOString(),
    });
    
    const cartInput = {
      merchandiseId: variant.id,
      quantity: quantity,
      attributes: attributes.length > 0 ? attributes : undefined,
    };
    
    console.log('🛒 Sending to cart:', cartInput);
    
    addToCart(
      cartInput,
      {
        onSuccess: (cart) => {
          const totalAmount = (quantity * parseFloat(variant!.price.amount)).toFixed(2);
          console.log('✅ Cart updated:', {
            cartId: cart.id,
            totalQuantity: cart.totalQuantity,
            totalAmount: cart.cost?.totalAmount?.amount,
            lines: cart.lines?.edges?.map(edge => ({
              id: edge.node.id,
              quantity: edge.node.quantity,
              cost: edge.node.cost.totalAmount.amount,
              variant: edge.node.merchandise.id,
            })),
          });
          toast({
            title: "Added to cart!",
            description: `$${totalAmount} donation added to your cart.`,
          });
          setDonationAmount("");
          setSelectedTier(null);
          
          if (cart.checkoutUrl) {
            window.location.href = cart.checkoutUrl;
          }
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
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 text-center">
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
  const progressDisplay = Math.min(Math.round(progress), 100);
  const remainingRaw = projectData.goal - projectData.raised;
  const remaining = Math.max(remainingRaw, 0);
  const goalReached = remainingRaw <= 1;

  const heroSection = (
    <div className="space-y-5">
      <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-xl overflow-hidden">
        <img
          src={projectData.image}
          alt={projectData.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="space-y-4 px-1 sm:px-0">
        <h1 className="px-1 sm:px-0 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
          {projectData.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm sm:text-base px-1 sm:px-0">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="font-medium text-foreground">{projectData.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{projectData.donors} donors</span>
          </div>
        </div>
      </div>
    </div>
  );

  const donationCard = (
    <Card className="rounded-3xl border border-border/60 shadow-xl lg:shadow-lg lg:sticky lg:top-24">
      <CardContent className="pt-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-20 h-20 flex-shrink-0">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(#064e3b ${progressDisplay * 3.6}deg, #e5e7eb 0deg)`,
              }}
            />
            <div className="absolute inset-2 rounded-full bg-white shadow-inner flex items-center justify-center">
              <span className="text-base font-bold text-foreground">{progressDisplay}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-primary leading-tight">
              ${projectData.raised.toLocaleString()}
              <span className="text-base font-semibold text-foreground/80 ml-2">raised</span>
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span className="underline decoration-dotted">
                ${projectData.goal.toLocaleString()} goal
              </span>
              <span>•</span>
              <span>{projectData.donors} donations</span>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <Label className="text-base font-semibold">Choose an amount</Label>
        <div className="w-full overflow-x-auto pb-1">
          <div className="flex w-max gap-2 snap-x snap-mandatory">
            {projectData.donationTiers
              .filter((tier) => tier.amount > 0.01)
              .map((tier) => (
                <button
                  key={tier.amount}
                  onClick={() => {
                    setSelectedTier(tier.amount);
                    setDonationAmount("");
                  }}
                  className={`px-3 py-2 rounded-2xl border transition-all text-left min-w-[100px] snap-start flex-shrink-0 ${
                    selectedTier === tier.amount
                      ? "border-primary bg-primary/5 shadow-inner"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="font-semibold text-sm">${tier.amount}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{tier.label}</div>
                </button>
              ))}
          </div>
          </div>
        </div>

        <div className="space-y-1 -mt-4">
          <Label htmlFor="custom-amount" className="text-base font-semibold">
            Custom donation amount
          </Label>
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
              className="pl-6 rounded-2xl"
              min="1"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 space-y-2">
          <div className="flex items-start gap-3">
            <Checkbox
              id="refund-ack"
              checked={termsAccepted}
              onCheckedChange={(checked) => {
                if (checked) {
                  setRefundModalOpen(true);
                } else {
                  setTermsAccepted(false);
                  setRefundPreference(null);
                }
              }}
              className="mt-1"
            />
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="refund-ack" className="font-semibold text-sm">
                  Refund preference & terms
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-primary"
                  onClick={() => setRefundModalOpen(true)}
                >
                  Review
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Please review our terms and choose how we should handle your donation if a project is postponed.
              </p>
              {termsAccepted && refundPreference && (
                <div className="text-xs font-semibold text-foreground">
                  Selected:{" "}
                  {refundPreference === "refund"
                    ? "Full refund to the original payment method"
                    : "Reallocate my donation to another active project"}
                </div>
              )}
              {!termsAccepted && (
                <div className="text-[11px] text-destructive">
                  Required before donating.
                </div>
              )}
            </div>
          </div>
        </div>

        <Dialog
          open={refundModalOpen}
          onOpenChange={(open) => {
            setRefundModalOpen(open);
            if (!open && !termsAccepted) {
              setTermsAccepted(false);
              setRefundPreference(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Terms & refund preference</DialogTitle>
              <DialogDescription>
                Please confirm how we should handle your donation if a project is postponed.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Your donation supports community projects. In the rare case a project is postponed, choose how you would like us to proceed.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>You will be notified of any schedule changes.</li>
                <li>Refunds return to the original payment method.</li>
                <li>Reallocations move your donation to another active project.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Select your preference</Label>
              <RadioGroup
                value={refundPreference ?? ""}
                onValueChange={(value) => setRefundPreference(value as "refund" | "reallocate")}
                className="gap-3"
              >
                <div className="flex items-start gap-3 rounded-lg border border-border/70 p-3">
                  <RadioGroupItem value="refund" id="refund-option" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="refund-option" className="text-sm font-semibold">
                      Full refund
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      If postponed, return my donation to the original payment method.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border/70 p-3">
                  <RadioGroupItem value="reallocate" id="reallocate-option" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="reallocate-option" className="text-sm font-semibold">
                      Reallocate to another project
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Move my donation to another active project if this one is postponed.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => setRefundModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmRefundPreference}>Save preference</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="space-y-3">
          <Button
            className="w-full rounded-full bg-[rgb(6,78,59)] text-white hover:bg-[rgb(16,87,70)] transition"
            size="lg"
            onClick={handleShare}
          >
            Share
          </Button>
          <Button
            size="lg"
            className="w-full rounded-full bg-[rgb(203,255,144)] text-[rgb(6,78,59)] font-semibold text-base hover:bg-[rgb(188,241,130)]"
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
                Donate now
              </>
            )}
          </Button>
        </div>

        {projectData.recentDonors.length > 0 && (
          <div className="pt-4 border-t border-border/70 space-y-4">
            {projectData.recentDonors.slice(0, 5).map((donor, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{donor.name}</p>
                    <p className="text-xs text-muted-foreground">{donor.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">${donor.amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground pt-2 border-t">
          Your donation is tax-deductible. <br />
          Tax ID: 83-3300246
          <span className="block text-[11px] text-muted-foreground/80 mt-1">
            Last updated Jan 5, 2026
          </span>
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 pb-24 lg:pb-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>

        <div className="grid gap-10 lg:grid-cols-3 lg:items-start">
          {/* Mobile hero + donation card */}
          <div className="flex flex-col gap-6 order-1 lg:hidden">
            {heroSection}
            {donationCard}
          </div>

          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
            {/* Desktop Hero */}
            <div className="hidden lg:block">
              {heroSection}
            </div>

            {/* Project Team */}
                {projectData.team.length > 0 && (
              <div className="flex items-center gap-3 pb-2">
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

            {/* Tabs Content */}
            <Tabs defaultValue="story" className="w-full">
              <TabsList className="flex w-full flex-wrap gap-2 rounded-[999px] bg-[rgb(10,47,39)]/90 p-1 text-sm text-white md:grid md:grid-cols-3 md:gap-0 shadow-[0_12px_35px_rgba(10,47,39,0.35)]">
                <TabsTrigger
                  value="story"
                  className="rounded-full text-white transition-all data-[state=active]:bg-[rgb(16,87,70)] data-[state=active]:text-white data-[state=active]:shadow-[0_10px_25px_rgba(16,87,70,0.4)]"
                >
                  Story
                </TabsTrigger>
                <TabsTrigger
                  value="updates"
                  className="rounded-full text-white transition-all data-[state=active]:bg-[rgb(16,87,70)] data-[state=active]:text-white data-[state=active]:shadow-[0_10px_25px_rgba(16,87,70,0.4)]"
                >
                  Updates
                </TabsTrigger>
                <TabsTrigger
                  value="donors"
                  className="rounded-full text-white transition-all data-[state=active]:bg-[rgb(16,87,70)] data-[state=active]:text-white data-[state=active]:shadow-[0_10px_25px_rgba(16,87,70,0.4)]"
                >
                  Donors
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="story" className="space-y-6 mt-6">
                {sanitizedStory ? (
                  <div
                    className="prose prose-lg max-w-none text-foreground"
                    dangerouslySetInnerHTML={{ __html: sanitizedStory }}
                  />
                ) : (
                  <p className="text-foreground leading-relaxed">
                    No story available for this project.
                  </p>
                )}
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
                              ? 'bg-[rgb(6,78,59)] text-white' 
                              : update.status === 'in-progress'
                              ? 'bg-[#facc15] text-[#854d0e]'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {update.completed ? (
                              <Check className="h-6 w-6" />
                            ) : (
                              <Clock className="h-5 w-5" />
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
                                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[rgb(6,78,59)] text-white shadow-sm">
                                    ✓ COMPLETED
                                  </span>
                                )}
                                {update.status === 'in-progress' && (
                                  <span className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-[#facc15] text-[#854d0e] shadow-sm">
                                    <Clock className="h-3.5 w-3.5" />
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
            <Card className="bg-[rgb(203,255,144)]/50 border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Project Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm sm:text-base">
                  {projectData.impact.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[rgb(6,78,59)] mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">
                        <span className="font-semibold">{item.split(":")[0]}:</span>
                        {item.includes(":") ? item.slice(item.indexOf(":") + 1) : ""}
                      </span>
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
                          <div className="aspect-[4/3] overflow-hidden rounded-lg bg-black">
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

          {/* Sidebar - desktop donation card */}
          <div className="hidden lg:block order-3">
            {donationCard}
                  </div>
                  </div>
                </div>

      {/* Mobile Share / Donate CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border/70 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="max-w-7xl mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-full border-[rgb(6,78,59)] text-[rgb(6,78,59)] font-semibold"
            onClick={handleShare}
          >
            Share
          </Button>
                <Button 
            className="flex-[1.5] rounded-full bg-[rgb(203,255,144)] text-[rgb(6,78,59)] font-semibold hover:bg-[rgb(188,241,130)]"
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
                Donate
                    </>
                  )}
                </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-black bg-black text-white py-12 mt-20">
        <div className="container mx-auto px-4">
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
                <li><a href="/#projects" className="hover:text-white transition-colors">Our Projects</a></li>
                <li><a href="https://www.letsrebuildtuskegee.org/" className="hover:text-white transition-colors">Get Involved</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>build@letsrebuildtuskegee.org</li>
                <li></li>
                <li>Tax ID: 83-3300246</li>
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

export default ProjectDetail;
