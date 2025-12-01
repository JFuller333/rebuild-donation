import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CheckMyDonations = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [allDonations, setAllDonations] = useState<any[]>([]);

  useEffect(() => {
    checkData();
  }, []);

  const checkData = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        // Get user's email
        const userEmail = currentUser.email;

        // Check profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        console.log("Current user:", {
          id: currentUser.id,
          email: userEmail,
          profile: profile,
        });

        // Get donations for this user
        const { data: userDonations, error: userError } = await supabase
          .from("donations")
          .select(`
            *,
            projects (id, title, shopify_product_handle)
          `)
          .eq("donor_id", currentUser.id)
          .order("created_at", { ascending: false });

        if (userError) {
          console.error("Error fetching user donations:", userError);
        } else {
          setDonations(userDonations || []);
          console.log("User donations:", userDonations);
        }

        // Also check ALL donations to see if any match this email
        const { data: allDonationsData, error: allError } = await supabase
          .from("donations")
          .select(`
            *,
            profiles (email, full_name),
            projects (id, title, shopify_product_handle)
          `)
          .order("created_at", { ascending: false })
          .limit(20);

        if (allError) {
          console.error("Error fetching all donations:", allError);
        } else {
          setAllDonations(allDonationsData || []);
          console.log("All recent donations:", allDonationsData);
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Check My Donations</h1>
            <p className="text-muted-foreground">
              Verify if your donations are linked to your account
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={checkData} variant="outline">
              Refresh
            </Button>
            <Button onClick={() => navigate("/donor-dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </div>

        {/* Current User Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">User ID:</span> {user?.id || "Not logged in"}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {user?.email || "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Your Donations */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              Your Donations ({donations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {donations.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No donations found for your account.
                </p>
                <p className="text-sm text-muted-foreground">
                  Make sure you're logged in with the same email used in your Shopify order.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {donations.map((donation) => (
                  <div key={donation.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">
                          {donation.projects?.title || "Unknown Project"}
                        </h3>
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Amount: </span>
                            <span className="font-medium">${Number(donation.amount).toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Order: </span>
                            <span className="font-medium">{donation.shopify_order_name || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Product Handle: </span>
                            <span className="font-mono text-xs">
                              {donation.shopify_product_handle || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date: </span>
                            <span className="font-medium">
                              {new Date(donation.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Recent Donations (for debugging) */}
        <Card>
          <CardHeader>
            <CardTitle>All Recent Donations (Last 20)</CardTitle>
          </CardHeader>
          <CardContent>
            {allDonations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No donations in database yet.
              </p>
            ) : (
              <div className="space-y-2">
                {allDonations.map((donation) => {
                  const isMine = donation.donor_id === user?.id;
                  return (
                    <div
                      key={donation.id}
                      className={`p-3 border rounded-lg ${
                        isMine ? "bg-primary/5 border-primary" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {isMine && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                                YOURS
                              </span>
                            )}
                            <span className="font-semibold">
                              {donation.profiles?.email || donation.donor_id}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${Number(donation.amount).toFixed(2)} • {donation.shopify_order_name || "N/A"} •{" "}
                            {donation.projects?.title || "No project linked"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckMyDonations;

