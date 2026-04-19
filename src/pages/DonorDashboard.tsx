import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Heart, Calendar, DollarSign, Loader2, Receipt } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Donation = Database["public"]["Tables"]["donations"]["Row"] & {
  projects: Database["public"]["Tables"]["projects"]["Row"] | null;
  shopify_order_name?: string | null;
  shopify_product_handle?: string | null;
};

const DonorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [totalDonated, setTotalDonated] = useState(0);
  const [receiptGenerating, setReceiptGenerating] = useState(false);
  /** Supabase Auth `user.created_at` — start of receipt period */
  const [authCreatedAt, setAuthCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    // Check session first
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Try getUser as fallback
      const { data: { user }, error } = await supabase.auth.getUser();
    
      if (error || !user) {
      navigate("/auth");
      return;
    }

    await fetchDonorData(user.id);
      return;
    }

    await fetchDonorData(session.user.id);
  };

  const fetchDonorData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      setUserProfile(profile);

      const { data: authData } = await supabase.auth.getUser();
      if (authData.user?.id === userId) {
        setAuthCreatedAt(authData.user.created_at ?? null);
      } else {
        setAuthCreatedAt(null);
      }

      // Fetch donations with project details
      const { data: donationsData, error: donationsError } = await supabase
        .from("donations")
        .select(`
          *,
          projects (id, title)
        `)
        .eq("donor_id", userId)
        .order("created_at", { ascending: false });

      if (donationsError) throw donationsError;

      setDonations(donationsData || []);

      // Calculate total donated
      const total = (donationsData || []).reduce((sum, d) => sum + Number(d.amount), 0);
      setTotalDonated(total);
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /** Receipt period: sign-up → today (fallback to profile.created_at if auth date missing) */
  const signupStartMs = useMemo(() => {
    if (authCreatedAt) return new Date(authCreatedAt).getTime();
    const p = userProfile?.created_at;
    if (p) return new Date(p as string).getTime();
    return 0;
  }, [authCreatedAt, userProfile]);

  const receiptDonations = useMemo(() => {
    const end = Date.now();
    return donations.filter((d) => {
      if (!d.created_at) return false;
      const t = new Date(d.created_at).getTime();
      return t >= signupStartMs && t <= end;
    });
  }, [donations, signupStartMs]);

  const receiptTotal = useMemo(
    () => receiptDonations.reduce((sum, d) => sum + Number(d.amount), 0),
    [receiptDonations]
  );

  const receiptDateRangeLine = useMemo(() => {
    const startSrc = authCreatedAt || (userProfile?.created_at as string | undefined);
    const today = new Date().toISOString();
    if (!startSrc) return "From account creation through today";
    return `${formatDate(startSrc)} – ${formatDate(today)}`;
  }, [authCreatedAt, userProfile]);

  const downloadYtdSummary = async () => {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!baseUrl || !anonKey) {
      toast({
        title: "Configuration error",
        description: "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY.",
        variant: "destructive",
      });
      return;
    }

    setReceiptGenerating(true);
    try {
      let {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        session = refreshed.session ?? null;
      }
      if (!session?.access_token) {
        toast({
          title: "Sign in required",
          description: "Sign in again to download your receipt.",
          variant: "destructive",
        });
        return;
      }

      const url = `${baseUrl}/functions/v1/generate-ytd-receipt`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: anonKey,
        },
      });

      const contentType = res.headers.get("content-type") || "";

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          typeof (err as { error?: string }).error === "string"
            ? (err as { error: string }).error
            : res.statusText || "Request failed"
        );
      }

      if (!contentType.includes("application/pdf")) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          typeof (err as { error?: string }).error === "string"
            ? (err as { error: string }).error
            : "Server did not return a PDF. Is generate-ytd-receipt deployed?"
        );
      }

      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `LRT-contribution-receipt.pdf`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
      toast({
        title: "Receipt ready",
        description: "Your PDF should download automatically.",
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Try again later.";
      toast({
        title: "Could not generate receipt",
        description: message,
        variant: "destructive",
      });
    } finally {
      setReceiptGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="page-shell py-16 text-center">
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="page-shell py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {userProfile?.full_name || "Donor"}!</h1>
            <p className="text-muted-foreground">Your neighborhood impact is just a scroll away.</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Donated</p>
                  <p className="text-2xl font-bold">${totalDonated.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Donations</p>
                  <p className="text-2xl font-bold">{donations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Projects Supported</p>
                  <p className="text-2xl font-bold">
                    {new Set(donations.map(d => d.project_id)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.06] via-background to-background shadow-sm">
          <CardHeader className="space-y-3 border-b border-border/70 bg-card/40 pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/15"
                  aria-hidden
                >
                  <Receipt className="h-5 w-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
                    Your giving receipt
                  </CardTitle>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Download a PDF for your records. It lists every gift on file from when you{" "}
                    <span className="font-medium text-foreground/90">first signed up</span> through{" "}
                    <span className="font-medium text-foreground/90">today</span>.
                  </p>
                </div>
              </div>
              <span className="inline-flex max-w-full flex-col gap-0.5 rounded-xl border border-border/80 bg-muted/40 px-3 py-2 text-left text-xs font-medium text-muted-foreground sm:shrink-0 sm:text-right">
                <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide opacity-80">
                  <Calendar className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  On your receipt
                </span>
                <span className="text-[13px] font-normal leading-snug text-foreground/85">{receiptDateRangeLine}</span>
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">In this receipt</p>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
                    ${receiptTotal.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    total · {receiptDonations.length} gift{receiptDonations.length === 1 ? "" : "s"} in this period
                  </span>
                </div>
              </div>
              <Button
                type="button"
                onClick={downloadYtdSummary}
                disabled={receiptGenerating}
                size="lg"
                className="w-full shrink-0 rounded-full px-6 font-semibold shadow-md shadow-primary/10 sm:w-auto sm:min-w-[220px]"
              >
                {receiptGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />
                    Preparing your PDF…
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4 mr-2" aria-hidden />
                    Download PDF receipt
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground border-t border-border/60 pt-4 max-w-2xl">
              Need help or spot something off? Reach us at{" "}
              <a
                href="mailto:build@letsrebuildtuskegee.org"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                build@letsrebuildtuskegee.org
              </a>
              .
            </p>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="donations" className="w-full">
          <TabsList>
            <TabsTrigger value="donations">Donation History</TabsTrigger>
          </TabsList>

          <TabsContent value="donations" className="mt-6 space-y-4">
            {donations.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-semibold mb-2">No donations yet</p>
                  <p className="text-muted-foreground mb-6">
                    Start making an impact by supporting a project
                  </p>
                  <Button onClick={() => navigate("/")}>Browse Projects</Button>
                </CardContent>
              </Card>
            ) : (
              donations.map((donation) => (
                <Card key={donation.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="py-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Heart className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-1">
                            {donation.projects?.title || (
                              donation.shopify_product_handle ? (
                                <span className="text-muted-foreground">
                                  Project (Product: {donation.shopify_product_handle})
                                </span>
                              ) : (
                                "Project"
                              )
                            )}
                          </h3>
                          {donation.shopify_order_name && (
                            <p className="text-xs text-muted-foreground mb-1">
                              Order: {donation.shopify_order_name}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mb-2">
                            {formatDate(donation.created_at)}
                          </p>
                          <div className="flex items-center gap-4 text-sm mb-3">
                            <span className="text-muted-foreground">
                              Status: <span className="text-foreground capitalize">{donation.status}</span>
                            </span>
                            <span className="text-muted-foreground">
                              Type: <span className="text-foreground capitalize">{donation.donation_type}</span>
                            </span>
                            {!donation.projects && donation.shopify_product_handle && (
                              <span className="text-xs text-warning">
                                ⚠️ Project not linked
                              </span>
                            )}
                          </div>
                          {(donation.projects?.id || donation.shopify_product_handle) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Use shopify_product_handle from donation if available, otherwise use project id
                                const handle = donation.shopify_product_handle || donation.projects?.id;
                                if (handle) {
                                  navigate(`/products/${handle}`);
                                }
                              }}
                              className="mt-2"
                            >
                              View Project →
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          ${Number(donation.amount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DonorDashboard;
