import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Heart, Calendar, DollarSign } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Donation = Database["public"]["Tables"]["donations"]["Row"] & {
  projects: Database["public"]["Tables"]["projects"]["Row"] | null;
};

type TaxReceipt = Database["public"]["Tables"]["tax_receipts"]["Row"];

const DonorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [taxReceipts, setTaxReceipts] = useState<TaxReceipt[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [totalDonated, setTotalDonated] = useState(0);

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

      // Fetch tax receipts
      const { data: receiptsData, error: receiptsError } = await supabase
        .from("tax_receipts")
        .select("*")
        .eq("donor_id", userId)
        .order("year", { ascending: false });

      if (receiptsError) throw receiptsError;

      setTaxReceipts(receiptsData || []);
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="donations" className="w-full">
          <TabsList>
            <TabsTrigger value="donations">Donation History</TabsTrigger>
            <TabsTrigger value="receipts">Tax Receipts</TabsTrigger>
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
                          {donation.receipt_url ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Open receipt in new tab
                                window.open(donation.receipt_url, '_blank');
                              }}
                              className="mt-2"
                            >
                              <FileDown className="h-4 w-4 mr-2" />
                              Download Receipt
                            </Button>
                          ) : donation.receipt_generated_at ? (
                            <p className="text-xs text-muted-foreground mt-2">
                              Receipt processing...
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-2">
                              Receipt will be available soon
                            </p>
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

          <TabsContent value="receipts" className="mt-6 space-y-4">
            {taxReceipts.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <FileDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-semibold mb-2">No tax receipts available</p>
                  <p className="text-muted-foreground">
                    Tax receipts are generated annually for all donations
                  </p>
                </CardContent>
              </Card>
            ) : (
              taxReceipts.map((receipt) => (
                <Card key={receipt.id}>
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                          <FileDown className="h-6 w-6 text-success" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{receipt.year} Tax Receipt</h3>
                          <p className="text-sm text-muted-foreground">
                            Receipt #: {receipt.receipt_number}
                          </p>
                          <p className="text-sm font-semibold text-foreground mt-1">
                            Total: ${Number(receipt.total_amount).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button>
                        <FileDown className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
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
