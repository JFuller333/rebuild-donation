import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface GeneratePayload {
  year?: number;
  donor_id?: string;
}

async function fetchDonations(year: number, donorId?: string) {
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;

  let query = supabase
    .from("donations")
    .select(
      `
        id,
        donor_id,
        amount,
        created_at,
        projects(title),
        profiles(email, full_name)
      `
    )
    .gte("created_at", start)
    .lte("created_at", `${year + 1}-01-01`);

  if (donorId) {
    query = query.eq("donor_id", donorId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch donations: ${error.message}`);
  }

  return data || [];
}

async function groupDonationsByDonor(donations: any[]) {
  const grouped = new Map<
    string,
    {
      donor_id: string;
      donor_email: string;
      donor_name: string;
      donations: typeof donations;
      total: number;
    }
  >();

  for (const donation of donations) {
    if (!donation.donor_id) continue;
    if (!grouped.has(donation.donor_id)) {
      grouped.set(donation.donor_id, {
        donor_id: donation.donor_id,
        donor_email: donation.profiles?.email ?? "",
        donor_name: donation.profiles?.full_name ?? donation.profiles?.email ?? "Donor",
        donations: [],
        total: 0,
      });
    }

    const entry = grouped.get(donation.donor_id)!;
    entry.donations.push(donation);
    entry.total += Number(donation.amount);
  }

  return grouped;
}

async function generateAnnualPDF({
  donorName,
  donorEmail,
  year,
  totalAmount,
  donations,
}: {
  donorName: string;
  donorEmail: string;
  year: number;
  totalAmount: number;
  donations: any[];
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const { width } = page.getSize();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 740;

  const drawText = (text: string, opts: { size?: number; font?: any; yOffset?: number } = {}) => {
    const size = opts.size ?? 12;
    const font = opts.font ?? regular;
    page.drawText(text, { x: 60, y, size, font, color: rgb(0, 0, 0) });
    y -= opts.yOffset ?? 20;
  };

  drawText("Rebuild Together", { size: 24, font: bold, yOffset: 30 });
  drawText("Annual Donation Summary", { size: 16, font: bold, yOffset: 24 });
  drawText(`Tax ID: 12-3456789`, { size: 12 });
  drawText(`Year: ${year}`, { size: 12 });

  y -= 10;
  page.drawLine({ start: { x: 60, y }, end: { x: width - 60, y }, thickness: 1.5 });
  y -= 30;

  drawText("Donor Information", { size: 14, font: bold, yOffset: 24 });
  drawText(`Name: ${donorName}`, { size: 12 });
  drawText(`Email: ${donorEmail}`, { size: 12 });
  drawText(`Total Donations: $${totalAmount.toFixed(2)}`, { size: 12, yOffset: 30 });

  drawText("Donation Details", { size: 14, font: bold, yOffset: 24 });

  for (const donation of donations) {
    if (y < 120) {
      page.drawText("Continued on next page...", { x: 60, y: 60, size: 10, font: regular });
      const newPage = pdfDoc.addPage([612, 792]);
      page.drawLine({ start: { x: 60, y: 50 }, end: { x: width - 60, y: 50 }, thickness: 1 });
      y = 740;
    }
    drawText(
      `${new Date(donation.created_at).toLocaleDateString("en-US")}  |  ${donation.projects?.title ?? "Project"}  |  $${Number(donation.amount).toFixed(2)}`,
      { size: 10 }
    );
  }

  y -= 20;
  drawText(
    "This is an official summary of charitable contributions for the stated year. Please retain for tax records.",
    { size: 10 }
  );

  return new Uint8Array(await pdfDoc.save());
}

async function uploadReceipt(year: number, donorId: string, pdfBytes: Uint8Array) {
  const fileName = `annual/${donorId}-${year}.pdf`;

  const { error } = await supabase.storage.from("receipts").upload(fileName, pdfBytes, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = await supabase.storage.from("receipts").createSignedUrl(fileName, 31536000);
  if (!data) throw new Error("Failed to create signed URL");

  return { signedUrl: data.signedUrl, path: fileName };
}

async function upsertTaxReceipt({
  donorId,
  year,
  totalAmount,
  pdfUrl,
}: {
  donorId: string;
  year: number;
  totalAmount: number;
  pdfUrl: string;
}) {
  const receiptNumber = `AN-${year}-${donorId.substring(0, 8)}`;

  const { error } = await supabase.from("tax_receipts").upsert(
    {
      donor_id: donorId,
      year,
      total_amount: totalAmount,
      receipt_number: receiptNumber,
      pdf_url: pdfUrl,
    },
    { onConflict: ["donor_id", "year"] }
  );

  if (error) throw new Error(`Failed to upsert tax receipt: ${error.message}`);

  return receiptNumber;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
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

  const apiKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing service key" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload = (await req.json()) as GeneratePayload;
    const year = payload.year ?? new Date().getFullYear();

    const donations = await fetchDonations(year, payload.donor_id);
    if (donations.length === 0) {
      return new Response(JSON.stringify({ message: "No donations found for year" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const grouped = await groupDonationsByDonor(donations);
    const results: Array<{ donor_id: string; receipt_number: string; pdf_url: string }> = [];

    for (const [, entry] of grouped.entries()) {
      if (entry.total <= 0) continue;

      const pdfBytes = await generateAnnualPDF({
        donorName: entry.donor_name,
        donorEmail: entry.donor_email,
        year,
        totalAmount: entry.total,
        donations: entry.donations,
      });

      const { signedUrl } = await uploadReceipt(year, entry.donor_id, pdfBytes);
      const receiptNumber = await upsertTaxReceipt({
        donorId: entry.donor_id,
        year,
        totalAmount: entry.total,
        pdfUrl: signedUrl,
      });

      results.push({ donor_id: entry.donor_id, receipt_number: receiptNumber, pdf_url: signedUrl });
    }

    return new Response(JSON.stringify({ year, count: results.length, results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("generate-annual-receipts error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

