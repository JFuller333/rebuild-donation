// Supabase Edge Function to handle Shopify order webhooks
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.2/+esm";

const SHOPIFY_WEBHOOK_SECRET = Deno.env.get("SHOPIFY_WEBHOOK_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
// Note: SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_API_TOKEN no longer needed
// We use shopify_product_id directly from the database instead

interface ShopifyOrder {
  id: number;
  name: string;
  email: string;
  total_price: string;
  line_items: Array<{
    product_id: number;
    variant_id?: number;
    title: string;
    quantity: number;
    price: string;
    properties?: Array<{ name: string; value: string }>;
  }>;
  customer: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  created_at: string;
  financial_status: string;
}

// Note: Admin API function removed - we now use shopify_product_id directly from database
// This eliminates the need for Admin API access

// Verify Shopify webhook signature
function verifyWebhook(body: string, signature: string): boolean {
  if (!SHOPIFY_WEBHOOK_SECRET) {
    console.warn("SHOPIFY_WEBHOOK_SECRET not set, skipping verification");
    return true; // Allow in development
  }

  // Shopify uses HMAC SHA256
  const crypto = globalThis.crypto;
  const encoder = new TextEncoder();
  const key = encoder.encode(SHOPIFY_WEBHOOK_SECRET);
  const data = encoder.encode(body);

  return crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  ).then((key) => {
    return crypto.subtle.sign("HMAC", key, data);
  }).then((signatureBuffer) => {
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const hashString = hashArray.map((b) => String.fromCharCode(b)).join("");
    const hashBase64 = btoa(hashString);
    return hashBase64 === signature;
  }).catch(() => false);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get webhook signature from headers
    const signature = req.headers.get("x-shopify-hmac-sha256") || "";
    const body = await req.text();

    // Verify webhook signature (optional but recommended)
    // Note: In production, always verify. For now, we'll skip if secret not set
    if (SHOPIFY_WEBHOOK_SECRET) {
      const isValid = await verifyWebhook(body, signature);
      if (!isValid) {
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const order: ShopifyOrder = JSON.parse(body);

    // Only process paid orders
    if (order.financial_status !== "paid") {
      return new Response(JSON.stringify({ message: "Order not paid, skipping" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find or create user profile by email
    let userId: string | null = null;

    // First, check if profile exists in profiles table
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", order.email)
      .single();

    if (existingProfile) {
      userId = existingProfile.id;
      console.log(`Found existing profile for ${order.email}: ${userId}`);
    } else {
      // Check if auth user exists
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const authUser = authUsers?.users.find(u => u.email === order.email);

      if (authUser) {
        userId = authUser.id;
        // Create profile for existing auth user
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: authUser.id,
            email: order.email,
            full_name: `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim() || null,
          });

        if (profileError) {
          console.error("Error creating profile for existing auth user:", profileError);
        } else {
          console.log(`Created profile for existing auth user: ${userId}`);
        }
      } else {
        // Create new user and profile
        const fullName = `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim();
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: order.email,
          email_confirm: true,
          user_metadata: {
            full_name: fullName || undefined,
          },
        });

        if (createError || !newUser.user) {
          console.error("Error creating user:", createError);
          // Continue with anonymous donation if user creation fails
        } else {
          userId = newUser.user.id;
          
          // Create profile (trigger should handle this, but ensure it exists)
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: newUser.user.id,
              email: order.email,
              full_name: fullName || null,
            })
            .select()
            .single();

          if (profileError) {
            console.error("Error creating profile:", profileError);
          } else {
            console.log(`Created new user and profile: ${userId}`);
          }
        }
      }
    }

    if (!userId) {
      console.warn(`Could not find or create user for ${order.email}, skipping donation records`);
      return new Response(
        JSON.stringify({ message: "User not found or created, skipping" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Process each line item as a donation
    for (const item of order.line_items) {
      // Look up project directly by product_id (no Admin API needed)
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id, title, shopify_product_handle")
        .eq("shopify_product_id", item.product_id.toString())
        .single();

      if (projectError || !project) {
        console.warn(`Project not found for product_id ${item.product_id}. Make sure shopify_product_id is set in projects table.`, projectError);
        continue;
      }

      const productHandle = project.shopify_product_handle || null;
      console.log(`Processing donation for product_id ${item.product_id}, handle: ${productHandle}`);

      // Check if donation already exists (prevent duplicates)
      const { data: existingDonation } = await supabase
        .from("donations")
        .select("id")
        .eq("shopify_order_id", order.id.toString())
        .eq("project_id", project.id)
        .single();

      if (existingDonation) {
        console.log(`Donation already exists for order ${order.id}`);
        continue;
      }

      // Create donation record
      const donationAmount = parseFloat(item.price) * item.quantity;

      const { data: donation, error: donationError } = await supabase
        .from("donations")
        .insert({
          donor_id: userId,
          project_id: project.id,
          amount: donationAmount,
          shopify_product_handle: productHandle,
          shopify_order_id: order.id.toString(),
          shopify_order_name: order.name,
          status: "completed",
          payment_method: "shopify",
          transaction_id: order.id.toString(),
        })
        .select()
        .single();

      if (donationError) {
        console.error("Error creating donation:", donationError);
        continue;
      }

      // Generate receipt (call receipt generation function)
      // This will be handled by a separate function or inline
      try {
        const receiptResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/generate-receipt`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              donation_id: donation.id,
              order_id: order.id.toString(),
              order_name: order.name,
              amount: donationAmount,
              donor_email: order.email,
              donor_name: `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim(),
              project_title: project.title || "",
              date: order.created_at,
            }),
          }
        );

        if (receiptResponse.ok) {
          const receiptData = await receiptResponse.json();
          
          // Update donation with receipt URL
          await supabase
            .from("donations")
            .update({
              receipt_url: receiptData.receipt_url,
              receipt_generated_at: new Date().toISOString(),
            })
            .eq("id", donation.id);
        }
      } catch (receiptError) {
        console.error("Error generating receipt:", receiptError);
        // Don't fail the whole process if receipt generation fails
      }
    }

    return new Response(
      JSON.stringify({ message: "Webhook processed successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

