// Quick test page for receipt generation
// Access at: /test-receipt

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Loader2, CheckCircle2 } from "lucide-react";

const TestReceipt = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [donationCreated, setDonationCreated] = useState(false);
  const [donationId, setDonationId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    order_id: "TEST-" + Date.now(),
    order_name: "TEST-001",
    amount: "100.00",
    project_id: "",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("id, title")
      .limit(10);
    
    if (data) {
      setProjects(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, project_id: data[0].id }));
      }
    }
  };

  const handleTest = async () => {
    setLoading(true);
    setDonationCreated(false);
    setDonationId(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "Please sign in first",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      if (!formData.project_id) {
        toast({
          title: "Error",
          description: "Please select a project",
          variant: "destructive",
        });
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      // Get project details
      const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("id", formData.project_id)
        .single();

      if (!project) {
        throw new Error("Project not found");
      }

      // Create donation record
      const { data: donation, error: donationError } = await supabase
        .from("donations")
        .insert({
          donor_id: session.user.id,
          project_id: formData.project_id,
          amount: parseFloat(formData.amount),
          shopify_order_id: formData.order_id,
          shopify_order_name: formData.order_name,
          status: "completed",
          payment_method: "test",
          transaction_id: formData.order_id,
        })
        .select()
        .single();

      if (donationError) {
        throw new Error(`Failed to create donation: ${donationError.message}`);
      }

      setDonationId(donation.id);

      // Generate receipt
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-receipt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            donation_id: donation.id,
            order_id: formData.order_id,
            order_name: formData.order_name,
            amount: parseFloat(formData.amount),
            donor_email: session.user.email || "",
            donor_name: profile?.full_name || "Test Donor",
            project_title: project.title || "Test Project",
            date: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const result = await response.json();

      // Update donation with receipt URL
      await supabase
        .from("donations")
        .update({
          receipt_url: result.receipt_url,
          receipt_generated_at: new Date().toISOString(),
        })
        .eq("id", donation.id);

      setDonationCreated(true);
      
      toast({
        title: "Success!",
        description: "Donation and receipt created. Check your donor dashboard!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Test Receipt Generation</CardTitle>
          <p className="text-sm text-muted-foreground">
            Creates a test donation and receipt that will appear in your donor dashboard
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label>Project</Label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => setFormData({ ...formData, project_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Order Name</Label>
              <Input
                value={formData.order_name}
                onChange={(e) => setFormData({ ...formData, order_name: e.target.value })}
                placeholder="TEST-001"
              />
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="100.00"
              />
            </div>
          </div>

          <Button onClick={handleTest} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating donation and receipt...
              </>
            ) : (
              "Create Test Donation & Receipt"
            )}
          </Button>

          {donationCreated && (
            <div className="mt-4 p-4 bg-success/10 border border-success rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <p className="text-sm font-semibold">Donation and receipt created!</p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                The donation will appear in your donor dashboard with a receipt download button.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/donor-dashboard")}
                className="w-full"
              >
                Go to Donor Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestReceipt;

