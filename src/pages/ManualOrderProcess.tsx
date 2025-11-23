import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const ManualOrderProcess = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("6948564140213");
  const [orderNumber, setOrderNumber] = useState("#1001");
  const [email, setEmail] = useState("jfuller516@gmail.com");
  const [productHandle, setProductHandle] = useState("investment-tier-1");
  const [amount, setAmount] = useState("100.00");

  const processOrder = async () => {
    if (!orderId || !email || !productHandle || !amount) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Call the Edge Function to process the order
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/manual-order-process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          order_name: orderNumber || `#${orderId}`,
          email: email,
          product_handle: productHandle,
          amount: parseFloat(amount),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process order");
      }

      toast({
        title: "Success!",
        description: `Donation created for ${email}. ${result.user ? "User and profile created automatically." : ""} They can now see it in their donor dashboard.`,
        variant: "default",
      });

      // Reset form
      setOrderId("");
      setOrderNumber("");
      setAmount("");
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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Manually Process Shopify Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use this to manually create a donation record from an existing Shopify order.
              This is useful if the webhook didn't process an order.
            </p>

            <div className="space-y-2">
              <Label htmlFor="orderId">Shopify Order ID *</Label>
              <Input
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g., 6948564140213"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderNumber">Order Number (optional)</Label>
              <Input
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g., #1001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Customer Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., customer@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productHandle">Product Handle *</Label>
              <Input
                id="productHandle"
                value={productHandle}
                onChange={(e) => setProductHandle(e.target.value)}
                placeholder="e.g., investment-tier-1"
              />
              <p className="text-xs text-muted-foreground">
                Must match a project's shopify_product_handle
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Donation Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 100.00"
              />
            </div>

            <Button onClick={processOrder} disabled={loading} className="w-full">
              {loading ? "Processing..." : "Create Donation Record"}
            </Button>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm font-semibold mb-2">Current Projects:</p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• investment-tier-1 → Tuskegee 4-Unit TownHouse Development</li>
                <li>• (other projects not linked to Shopify products)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManualOrderProcess;

