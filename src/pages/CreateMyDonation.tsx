import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const CreateMyDonation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");
  const [amount, setAmount] = useState("100.00");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      setUser(currentUser);
      setUserId(currentUser.id);
    } else {
      toast({
        title: "Not logged in",
        description: "Please log in first",
        variant: "destructive",
      });
      navigate("/auth");
    }
  };

  const createDonation = async () => {
    if (!userId || !amount) {
      toast({
        title: "Missing information",
        description: "User ID and amount are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First, ensure profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        // Profile doesn't exist, create it
        const { error: createProfileError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            email: user?.email || "",
            full_name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "",
          });

        if (createProfileError) {
          console.error("Profile creation error:", createProfileError);
        }
      }

      // Get project ID
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id")
        .eq("shopify_product_handle", "investment-tier-1")
        .single();

      if (projectError || !project) {
        throw new Error("Project not found for handle: investment-tier-1");
      }

      // Check if donation already exists
      const { data: existing } = await supabase
        .from("donations")
        .select("id")
        .eq("shopify_order_id", "6948564140213")
        .eq("project_id", project.id)
        .single();

      if (existing) {
        toast({
          title: "Donation already exists",
          description: "This order has already been processed",
          variant: "default",
        });
        navigate("/donor-dashboard");
        return;
      }

      // Create donation
      const { data: donation, error: donationError } = await supabase
        .from("donations")
        .insert({
          donor_id: userId, // This MUST match auth.uid()
          project_id: project.id,
          amount: parseFloat(amount),
          shopify_product_handle: "investment-tier-1",
          shopify_order_id: "6948564140213",
          shopify_order_name: "#1001",
          status: "completed",
          payment_method: "shopify",
          transaction_id: "6948564140213",
        })
        .select()
        .single();

      if (donationError) {
        throw donationError;
      }

      toast({
        title: "Success!",
        description: "Donation created. Redirecting to dashboard...",
        variant: "default",
      });

      setTimeout(() => {
        navigate("/donor-dashboard");
      }, 1500);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error creating donation",
        description: error.message || "Failed to create donation. You may need to run SQL directly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create Test Donation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-semibold mb-2">Your Account Info:</p>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-medium">User ID:</span>{" "}
                  <span className="font-mono text-xs">{userId}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Donation Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
              />
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm font-semibold mb-2">Order Details:</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Order ID: 6948564140213</p>
                <p>Order Number: #1001</p>
                <p>Product: investment-tier-1</p>
              </div>
            </div>

            <Button onClick={createDonation} disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Donation"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              This will create a donation record linked to your account. After creation, you'll be
              redirected to your donor dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateMyDonation;

