import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface DonationCheck {
  id: string;
  shopify_order_id: string | null;
  shopify_order_name: string | null;
  shopify_product_handle: string | null;
  project_id: string | null;
  project_title: string | null;
  amount: number;
  donor_id: string;
  created_at: string;
}

interface ProjectCheck {
  id: string;
  title: string;
  shopify_product_handle: string | null;
}

const Diagnostics = () => {
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<DonationCheck[]>([]);
  const [projects, setProjects] = useState<ProjectCheck[]>([]);
  const [issues, setIssues] = useState<string[]>([]);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    const foundIssues: string[] = [];

    try {
      // Fetch all donations
      const { data: donationsData, error: donationsError } = await supabase
        .from("donations")
        .select(`
          id,
          shopify_order_id,
          shopify_order_name,
          shopify_product_handle,
          project_id,
          amount,
          donor_id,
          created_at,
          projects (id, title)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (donationsError) {
        console.error("Error fetching donations:", donationsError);
        foundIssues.push(`Error fetching donations: ${donationsError.message}`);
      } else {
        const formattedDonations = (donationsData || []).map((d: any) => ({
          id: d.id,
          shopify_order_id: d.shopify_order_id,
          shopify_order_name: d.shopify_order_name,
          shopify_product_handle: d.shopify_product_handle,
          project_id: d.project_id,
          project_title: d.projects?.title || null,
          amount: d.amount,
          donor_id: d.donor_id,
          created_at: d.created_at,
        }));
        setDonations(formattedDonations);

        // Check for issues in donations
        formattedDonations.forEach((donation) => {
          if (!donation.shopify_order_id) {
            foundIssues.push(`Donation ${donation.id} missing shopify_order_id`);
          }
          if (!donation.shopify_product_handle) {
            foundIssues.push(`Donation ${donation.id} missing shopify_product_handle`);
          }
          if (!donation.project_id) {
            foundIssues.push(`Donation ${donation.id} missing project_id (product not linked to project)`);
          }
          if (!donation.project_title) {
            foundIssues.push(`Donation ${donation.id} has project_id but project not found`);
          }
        });
      }

      // Fetch all projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("id, title, shopify_product_handle")
        .order("title", { ascending: true });

      if (projectsError) {
        console.error("Error fetching projects:", projectsError);
        foundIssues.push(`Error fetching projects: ${projectsError.message}`);
      } else {
        setProjects(projectsData || []);

        // Check for projects without product handles
        (projectsData || []).forEach((project) => {
          if (!project.shopify_product_handle) {
            foundIssues.push(`Project "${project.title}" (${project.id}) is not linked to a Shopify product`);
          }
        });
      }
    } catch (error: any) {
      foundIssues.push(`Unexpected error: ${error.message}`);
    } finally {
      setIssues(foundIssues);
      setLoading(false);
    }
  };

  const getStatusIcon = (hasIssue: boolean) => {
    if (hasIssue) {
      return <XCircle className="h-5 w-5 text-destructive" />;
    }
    return <CheckCircle2 className="h-5 w-5 text-success" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">System Diagnostics</h1>
            <p className="text-muted-foreground">
              Check if products are linked to projects and orders are processing correctly
            </p>
          </div>
          <Button onClick={checkStatus} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Summary */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Donations</p>
                    <p className="text-2xl font-bold">{donations.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Projects</p>
                    <p className="text-2xl font-bold">{projects.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Issues Found</p>
                    <p className="text-2xl font-bold text-destructive">{issues.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issues */}
            {issues.length > 0 && (
              <Card className="mb-6 border-destructive">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    Issues Found
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {issues.map((issue, index) => (
                      <li key={index} className="text-sm text-destructive">
                        • {issue}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recent Donations */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
              </CardHeader>
              <CardContent>
                {donations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No donations found. Make a test purchase to see donations here.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {donations.map((donation) => {
                      const hasIssues =
                        !donation.shopify_order_id ||
                        !donation.shopify_product_handle ||
                        !donation.project_id ||
                        !donation.project_title;

                      return (
                        <div
                          key={donation.id}
                          className={`p-4 border rounded-lg ${
                            hasIssues ? "border-destructive bg-destructive/5" : "border-border"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getStatusIcon(hasIssues)}
                                <h3 className="font-semibold">
                                  Order: {donation.shopify_order_name || donation.shopify_order_id || "N/A"}
                                </h3>
                              </div>
                              <div className="grid md:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Amount: </span>
                                  <span className="font-medium">${Number(donation.amount).toFixed(2)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Date: </span>
                                  <span className="font-medium">
                                    {new Date(donation.created_at).toLocaleString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Product Handle: </span>
                                  <span className="font-mono font-medium">
                                    {donation.shopify_product_handle || (
                                      <span className="text-destructive">MISSING</span>
                                    )}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Project: </span>
                                  <span className="font-medium">
                                    {donation.project_title || (
                                      <span className="text-destructive">NOT LINKED</span>
                                    )}
                                  </span>
                                </div>
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

            {/* Projects and Product Links */}
            <Card>
              <CardHeader>
                <CardTitle>Projects and Product Links</CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No projects found.</p>
                ) : (
                  <div className="space-y-2">
                    {projects.map((project) => {
                      const isLinked = !!project.shopify_product_handle;
                      return (
                        <div
                          key={project.id}
                          className={`p-3 border rounded-lg flex items-center justify-between ${
                            isLinked ? "border-border" : "border-warning bg-warning/5"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(!isLinked)}
                            <div>
                              <p className="font-semibold">{project.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {isLinked ? (
                                  <>
                                    Linked to:{" "}
                                    <span className="font-mono">{project.shopify_product_handle}</span>
                                  </>
                                ) : (
                                  <span className="text-warning">Not linked to any Shopify product</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Diagnostics;

