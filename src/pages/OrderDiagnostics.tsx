import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrderDiagnostics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    checkOrder();
  }, []);

  const checkOrder = async () => {
    setLoading(true);
    const orderNumber = "#1001";
    const orderId = "6948564140213";
    const email = "info@jazlynfuller.com";
    const productHandle = "investment-tier-1";

    const checks: any = {
      orderNumber,
      orderId,
      email,
      productHandle,
      donation: null,
      user: null,
      project: null,
      issues: [],
      fixes: [],
    };

    try {
      // Check if donation exists
      const { data: donation, error: donationError } = await supabase
        .from("donations")
        .select(`
          *,
          projects (id, title)
        `)
        .or(`shopify_order_id.eq.${orderId},shopify_order_name.eq.${orderNumber}`)
        .single();

      if (donation) {
        checks.donation = donation;
        console.log("✅ Donation found:", donation);
      } else {
        checks.issues.push(`Donation not found for order ${orderNumber} (ID: ${orderId})`);
        checks.fixes.push("The webhook may not have processed this order yet, or the order wasn't paid");
      }

      // Check if user exists
      const { data: userProfile, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single();

      if (userProfile) {
        checks.user = userProfile;
        console.log("✅ User found:", userProfile);
      } else {
        checks.issues.push(`User profile not found for email: ${email}`);
        checks.fixes.push("The webhook should create a user profile when processing the order");
      }

      // Check if project exists with this product handle
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("shopify_product_handle", productHandle)
        .single();

      if (project) {
        checks.project = project;
        console.log("✅ Project found:", project);
      } else {
        checks.issues.push(`Project not found for product handle: ${productHandle}`);
        checks.fixes.push(`Link the product handle "${productHandle}" to a project in the Admin Dashboard`);
      }

      // Check if donation is linked to user
      if (donation && userProfile) {
        if (donation.donor_id !== userProfile.id) {
          checks.issues.push(`Donation donor_id (${donation.donor_id}) doesn't match user ID (${userProfile.id})`);
          checks.fixes.push("The donation was created for a different user. Check email matching in webhook.");
        } else {
          console.log("✅ Donation linked to user correctly");
        }
      }

      // Check if donation is linked to project
      if (donation && project) {
        if (donation.project_id !== project.id) {
          checks.issues.push(`Donation project_id (${donation.project_id}) doesn't match project ID (${project.id})`);
          checks.fixes.push("The donation is linked to a different project. This might be correct if multiple projects exist.");
        } else {
          console.log("✅ Donation linked to project correctly");
        }
      } else if (donation && !project) {
        checks.issues.push(`Donation exists but project not found for handle: ${productHandle}`);
        checks.fixes.push(`Link product handle "${productHandle}" to a project in Admin Dashboard`);
      }

    } catch (error: any) {
      checks.issues.push(`Error checking: ${error.message}`);
    } finally {
      setResults(checks);
      setLoading(false);
    }
  };

  const getStatusIcon = (hasIssue: boolean) => {
    if (hasIssue) {
      return <XCircle className="h-5 w-5 text-destructive" />;
    }
    return <CheckCircle2 className="h-5 w-5 text-success" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking order status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Order Diagnostics</h1>
          <p className="text-muted-foreground">
            Checking order #{results?.orderNumber} (ID: {results?.orderId})
          </p>
        </div>

        {/* Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Status Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Donation Record</span>
                {results?.donation ? (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Found</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="h-5 w-5" />
                    <span>Not Found</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>User Profile</span>
                {results?.user ? (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Found</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="h-5 w-5" />
                    <span>Not Found</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Project Linked</span>
                {results?.project ? (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Found</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="h-5 w-5" />
                    <span>Not Linked</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues */}
        {results?.issues.length > 0 && (
          <Card className="mb-6 border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Issues Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {results.issues.map((issue: string, index: number) => (
                  <li key={index} className="text-sm text-destructive">
                    • {issue}
                  </li>
                ))}
              </ul>
              {results.fixes.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="font-semibold mb-2">How to Fix:</p>
                  <ul className="space-y-2">
                    {results.fixes.map((fix: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {index + 1}. {fix}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Donation Details */}
        {results?.donation && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Donation Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">${Number(results.donation.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-mono">{results.donation.shopify_order_id || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Name:</span>
                  <span className="font-mono">{results.donation.shopify_order_name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product Handle:</span>
                  <span className="font-mono">{results.donation.shopify_product_handle || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project ID:</span>
                  <span className="font-mono">{results.donation.project_id || "NOT LINKED"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project Title:</span>
                  <span className="font-semibold">
                    {results.donation.projects?.title || "NOT LINKED"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Donor ID:</span>
                  <span className="font-mono text-xs">{results.donation.donor_id || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="capitalize">{results.donation.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(results.donation.created_at).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Details */}
        {results?.user && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{results.user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span>{results.user.full_name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="font-mono text-xs">{results.user.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Project Details */}
        {results?.project ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title:</span>
                  <span className="font-semibold">{results.project.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product Handle:</span>
                  <span className="font-mono">{results.project.shopify_product_handle || "NOT SET"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project ID:</span>
                  <span className="font-mono text-xs">{results.project.id}</span>
                </div>
              </div>
              <Button
                className="mt-4"
                onClick={() => navigate(`/products/${results.productHandle}`)}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Project Page
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 border-warning">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertCircle className="h-5 w-5" />
                Project Not Linked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                No project found with product handle: <code className="bg-muted px-2 py-1 rounded">{results?.productHandle}</code>
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                To fix this, link the product handle to a project:
              </p>
              <Button onClick={() => navigate("/admin-dashboard")}>
                Go to Admin Dashboard to Link Project
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={checkOrder} variant="outline">
            Refresh Check
          </Button>
          <Button onClick={() => navigate("/diagnostics")}>
            View All Diagnostics
          </Button>
          <Button onClick={() => navigate("/donor-dashboard")} variant="outline">
            Go to Donor Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDiagnostics;

