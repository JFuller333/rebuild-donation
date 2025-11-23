// Supabase Edge Function to manually process a Shopify order
// This creates the user, profile, and donation record
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.2/+esm";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

interface ManualOrderRequest {
  order_id: string;
  order_name?: string;
  email: string;
  full_name?: string;
  product_handle: string;
  amount: number;
}

serve(async (req) => {
  // Handle CORS
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
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body: ManualOrderRequest = await req.json();

    if (!body.order_id || !body.email || !body.product_handle || !body.amount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: order_id, email, product_handle, amount" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find or create user profile
    let userId: string | null = null;

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", body.email)
      .single();

    if (existingProfile) {
      userId = existingProfile.id;
      console.log(`Found existing profile for ${body.email}: ${userId}`);
    } else {
      // Check if auth user exists
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const authUser = authUsers?.users.find((u) => u.email === body.email);

      if (authUser) {
        userId = authUser.id;
        // Create profile for existing auth user
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authUser.id,
          email: body.email,
          full_name: body.full_name || body.email.split("@")[0],
        });

        if (profileError) {
          console.error("Error creating profile for existing auth user:", profileError);
        } else {
          console.log(`Created profile for existing auth user: ${userId}`);
        }
      } else {
        // Create new user and profile
        const fullName = body.full_name || body.email.split("@")[0];
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: body.email,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
          },
        });

        if (createError || !newUser.user) {
          console.error("Error creating user:", createError);
          return new Response(
            JSON.stringify({ error: `Failed to create user: ${createError?.message}` }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        userId = newUser.user.id;

        // Create profile
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: newUser.user.id,
            email: body.email,
            full_name: fullName,
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

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Could not find or create user" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Find project by product handle
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, title")
      .eq("shopify_product_handle", body.product_handle)
      .single();

    if (projectError || !project) {
      return new Response(
        JSON.stringify({
          error: `Project not found for product handle: ${body.product_handle}`,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if donation already exists
    const { data: existingDonation } = await supabase
      .from("donations")
      .select("id")
      .eq("shopify_order_id", body.order_id)
      .eq("project_id", project.id)
      .single();

    if (existingDonation) {
      return new Response(
        JSON.stringify({
          message: "Donation already exists",
          donation_id: existingDonation.id,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create donation record
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .insert({
        donor_id: userId,
        project_id: project.id,
        amount: body.amount,
        shopify_product_handle: body.product_handle,
        shopify_order_id: body.order_id,
        shopify_order_name: body.order_name || `#${body.order_id}`,
        status: "completed",
        payment_method: "shopify",
        transaction_id: body.order_id,
      })
      .select()
      .single();

    if (donationError) {
      console.error("Error creating donation:", donationError);
      return new Response(
        JSON.stringify({ error: `Failed to create donation: ${donationError.message}` }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Order processed successfully",
        donation: {
          id: donation.id,
          amount: donation.amount,
          project_title: project.title,
        },
        user: {
          id: userId,
          email: body.email,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
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

