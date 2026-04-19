// Authenticated contribution receipt PDF: from account signup (user.created_at) through today.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

type DonationRow = {
  id: string;
  amount: number;
  created_at: string | null;
  shopify_order_name: string | null;
  projects: { title: string } | null;
};

function wrapWords(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length <= maxChars) line = next;
    else {
      if (line) lines.push(line);
      line = w.length > maxChars ? w.slice(0, maxChars) : w;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing authorization" }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const now = new Date();
  const end = now.toISOString();
  const start = user.created_at
    ? new Date(user.created_at).toISOString()
    : new Date(0).toISOString();

  const rangeLabelShort = `${new Date(start).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} – ${now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  const { data: donations, error: dErr } = await supabase
    .from("donations")
    .select("id, amount, created_at, shopify_order_name, projects (title)")
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: true });

  if (dErr) {
    return new Response(JSON.stringify({ error: dErr.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const rows = (donations || []) as DonationRow[];

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const total = rows.reduce((sum, r) => sum + Number(r.amount), 0);

  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();
  let y = height - 48;

  const drawHeader = () => {
    page.drawText("Let's Rebuild Tuskegee", {
      x: 50,
      y,
      size: 18,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 22;
    page.drawText("501(c)(3) nonprofit · Tax ID: 83-3300246", {
      x: 50,
      y,
      size: 10,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 28;
    page.drawText("Contribution receipt", {
      x: 50,
      y,
      size: 14,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 16;
    page.drawText("From your account sign-up through today", {
      x: 50,
      y,
      size: 9,
      font: helvetica,
      color: rgb(0.35, 0.35, 0.35),
    });
    y -= 14;
    page.drawText(rangeLabelShort, { x: 50, y, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
    y -= 28;
  };

  drawHeader();

  page.drawText("Donor", { x: 50, y, size: 11, font: helveticaBold, color: rgb(0, 0, 0) });
  y -= 16;
  page.drawText(`Name: ${profile?.full_name?.trim() || "—"}`, {
    x: 50,
    y,
    size: 10,
    font: helvetica,
    color: rgb(0, 0, 0),
  });
  y -= 14;
  page.drawText(`Email: ${profile?.email || user.email || "—"}`, {
    x: 50,
    y,
    size: 10,
    font: helvetica,
    color: rgb(0, 0, 0),
  });
  y -= 28;

  if (rows.length === 0) {
    page.drawText("No recorded contributions in this period.", {
      x: 50,
      y,
      size: 11,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
    });
    y -= 28;
  } else {
    page.drawText("Contributions (by date)", {
      x: 50,
      y,
      size: 11,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 18;

    const colDate = 50;
    const colDesc = 130;
    const colOrder = 340;
    const colAmt = 520;
    page.drawText("Date", { x: colDate, y, size: 8, font: helveticaBold, color: rgb(0, 0, 0) });
    page.drawText("Description", { x: colDesc, y, size: 8, font: helveticaBold, color: rgb(0, 0, 0) });
    page.drawText("Order", { x: colOrder, y, size: 8, font: helveticaBold, color: rgb(0, 0, 0) });
    page.drawText("Amount", { x: colAmt, y, size: 8, font: helveticaBold, color: rgb(0, 0, 0) });
    y -= 12;
    page.drawLine({
      start: { x: 48, y: y + 4 },
      end: { x: width - 48, y: y + 4 },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });
    y -= 8;

    const ensureSpace = (linesNeeded: number) => {
      const lineH = 12;
      if (y - linesNeeded * lineH < 72) {
        page = pdfDoc.addPage([612, 792]);
        y = height - 48;
        page.drawText("Contributions (continued)", {
          x: 50,
          y,
          size: 11,
          font: helveticaBold,
          color: rgb(0, 0, 0),
        });
        y -= 24;
      }
    };

    for (const r of rows) {
      const d = r.created_at
        ? new Date(r.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "—";
      const title = r.projects?.title || "Contribution";
      const order = r.shopify_order_name || "—";
      const amt = `$${Number(r.amount).toFixed(2)}`;

      const descLines = wrapWords(title, 28);
      const rowLines = Math.max(descLines.length, 1);
      ensureSpace(rowLines + 1);

      page.drawText(d, { x: colDate, y, size: 9, font: helvetica, color: rgb(0, 0, 0) });
      let dy = y;
      for (const line of descLines) {
        page.drawText(line, { x: colDesc, y: dy, size: 9, font: helvetica, color: rgb(0, 0, 0) });
        dy -= 12;
      }
      page.drawText(order.length > 18 ? `${order.slice(0, 15)}…` : order, {
        x: colOrder,
        y,
        size: 8,
        font: helvetica,
        color: rgb(0, 0, 0),
      });
      page.drawText(amt, { x: colAmt, y, size: 9, font: helvetica, color: rgb(0, 0, 0) });
      y = Math.min(y, dy) - 14;
    }

    y -= 8;
    ensureSpace(3);
    page.drawLine({
      start: { x: 48, y: y + 8 },
      end: { x: width - 48, y: y + 8 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    y -= 8;
    const totalText = `Total for period: $${total.toFixed(2)}`;
    page.drawText(totalText, {
      x: colDate,
      y,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 36;
  }

  const disclaimer =
    "This receipt lists gifts recorded after your account sign-up through the date shown. Let's Rebuild Tuskegee is a 501(c)(3) nonprofit. Questions: build@letsrebuildtuskegee.org";
  const discLines = wrapWords(disclaimer, 85);
  let discY = rows.length === 0 ? y - 24 : y;
  for (const line of discLines) {
    if (discY < 72) {
      page = pdfDoc.addPage([612, 792]);
      discY = 792 - 48;
    }
    page.drawText(line, { x: 50, y: discY, size: 8, font: helvetica, color: rgb(0.45, 0.45, 0.45) });
    discY -= 11;
  }

  const pdfBytes = await pdfDoc.save();
  const filename = `LRT-contribution-receipt.pdf`;

  return new Response(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Access-Control-Allow-Origin": "*",
    },
  });
});
