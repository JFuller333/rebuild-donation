import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type Action = "create" | "update" | "delete" | "list";

interface UpdatePayload {
  id?: string;
  shopify_product_handle?: string;
  date?: string;
  title?: string;
  description?: string;
  status?: "completed" | "in-progress" | "upcoming";
  image_url?: string | null;
}

async function verifyAdmin(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing Authorization header", status: 401 };
  }

  const token = authHeader.replace("Bearer ", "").trim();

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return { error: "Invalid or expired session", status: 401 };
  }

  const { data: role } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!role) {
    return { error: "Forbidden", status: 403 };
  }

  return { user };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const authCheck = await verifyAdmin(req.headers.get("Authorization"));
    if ("error" in authCheck) {
      return new Response(JSON.stringify({ error: authCheck.error }), {
        status: authCheck.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { action, payload }: { action: Action; payload?: UpdatePayload } = await req.json();

    if (!action) {
      return new Response(JSON.stringify({ error: "Action is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    switch (action) {
      case "create": {
        if (
          !payload?.shopify_product_handle ||
          !payload.date ||
          !payload.title ||
          !payload.description ||
          !payload.status
        ) {
          return new Response(JSON.stringify({ error: "Missing required fields" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { data, error } = await supabaseAdmin
          .from("project_updates")
          .insert({
            shopify_product_handle: payload.shopify_product_handle,
            date: payload.date,
            title: payload.title,
            description: payload.description,
            status: payload.status,
            image_url: payload.image_url ?? null,
          })
          .select("*")
          .single();

        if (error) {
          console.error("Create update error:", error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ data }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      case "update": {
        if (!payload?.id) {
          return new Response(JSON.stringify({ error: "Update id is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const updateFields: Record<string, unknown> = {};

        if (payload.shopify_product_handle) updateFields.shopify_product_handle = payload.shopify_product_handle;
        if (payload.date) updateFields.date = payload.date;
        if (payload.title) updateFields.title = payload.title;
        if (payload.description) updateFields.description = payload.description;
        if (payload.status) updateFields.status = payload.status;
        if (payload.image_url !== undefined) updateFields.image_url = payload.image_url;

        if (Object.keys(updateFields).length === 0) {
          return new Response(JSON.stringify({ error: "No fields to update" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { data, error } = await supabaseAdmin
          .from("project_updates")
          .update(updateFields)
          .eq("id", payload.id)
          .select("*")
          .single();

        if (error) {
          console.error("Update error:", error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ data }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      case "delete": {
        if (!payload?.id) {
          return new Response(JSON.stringify({ error: "Update id is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { error } = await supabaseAdmin
          .from("project_updates")
          .delete()
          .eq("id", payload.id);

        if (error) {
          console.error("Delete error:", error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      case "list": {
        const query = supabaseAdmin.from("project_updates").select("*").order("date", { ascending: false });
        if (payload?.shopify_product_handle) {
          query.eq("shopify_product_handle", payload.shopify_product_handle);
        }
        const { data, error } = await query;

        if (error) {
          console.error("List error:", error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ data }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      default:
        return new Response(JSON.stringify({ error: "Unsupported action" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("admin-project-updates error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

