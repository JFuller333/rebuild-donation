// Supabase Edge Function to generate PDF receipts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Use esm.sh for better Deno compatibility
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

interface ReceiptRequest {
  donation_id: string;
  order_id: string;
  order_name: string;
  amount: number;
  donor_email: string;
  donor_name: string;
  project_title: string;
  date: string;
}

// Generate PDF receipt using pdf-lib (no external service needed!)
async function generateReceiptPDF(data: ReceiptRequest): Promise<Uint8Array> {
  const receiptNumber = `RT-${new Date().getFullYear()}-${data.donation_id.substring(0, 8).toUpperCase()}`;
  const donationDate = new Date(data.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // US Letter size (8.5 x 11 inches)
  const { width, height } = page.getSize();

  // Load fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let yPosition = height - 50;

  // Header
  page.drawText("Rebuild Together", {
    x: 50,
    y: yPosition,
    size: 24,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

  yPosition -= 25;
  page.drawText("501(c)(3) Nonprofit Organization", {
    x: 50,
    y: yPosition,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= 20;
  page.drawText("Tax-Deductible Donation Receipt", {
    x: 50,
    y: yPosition,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  // Draw line
  yPosition -= 20;
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 2,
    color: rgb(0, 0, 0),
  });

  yPosition -= 40;

  // Receipt Information
  page.drawText("Receipt Information", {
    x: 50,
    y: yPosition,
    size: 14,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

  yPosition -= 20;
  page.drawText(`Receipt Number: ${receiptNumber}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= 15;
  page.drawText(`Date: ${donationDate}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= 15;
  page.drawText(`Order ID: ${data.order_name}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= 40;

  // Donor Information
  page.drawText("Donor Information", {
    x: 50,
    y: yPosition,
    size: 14,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

  yPosition -= 20;
  page.drawText(`Name: ${data.donor_name || "Anonymous"}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= 15;
  page.drawText(`Email: ${data.donor_email}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= 40;

  // Donation Details
  page.drawText("Donation Details", {
    x: 50,
    y: yPosition,
    size: 14,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

  yPosition -= 20;
  page.drawText(`Project: ${data.project_title}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= 15;
  page.drawText(`Donation Date: ${donationDate}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= 50;

  // Donation Amount (highlighted)
  const amountText = `Donation Amount: $${data.amount.toFixed(2)}`;
  const amountWidth = helveticaBold.widthOfTextAtSize(amountText, 20);
  const amountX = (width - amountWidth) / 2;

  // Draw box around amount
  page.drawRectangle({
    x: amountX - 20,
    y: yPosition - 10,
    width: amountWidth + 40,
    height: 40,
    borderColor: rgb(0, 0, 0),
    borderWidth: 2,
  });

  page.drawText(amountText, {
    x: amountX,
    y: yPosition,
    size: 20,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

  yPosition -= 80;

  // Footer
  page.drawText("Tax ID: 12-3456789", {
    x: 50,
    y: yPosition,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

  yPosition -= 30;
  const disclaimer = "This is an official receipt for your tax-deductible donation to Rebuild Together, a 501(c)(3) nonprofit organization. No goods or services were provided in exchange for this contribution. Please retain this receipt for your tax records.";
  
  // Split long text into multiple lines
  const words = disclaimer.split(" ");
  let line = "";
  let lineY = yPosition;
  
  for (const word of words) {
    const testLine = line + word + " ";
    const testWidth = helveticaFont.widthOfTextAtSize(testLine, 9);
    
    if (testWidth > width - 100 && line !== "") {
      page.drawText(line, {
        x: 50,
        y: lineY,
        size: 9,
        font: helveticaFont,
        color: rgb(0.4, 0.4, 0.4),
      });
      line = word + " ";
      lineY -= 15;
    } else {
      line = testLine;
    }
  }
  
  if (line) {
    page.drawText(line, {
      x: 50,
      y: lineY,
      size: 9,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  lineY -= 20;
  page.drawText("For questions, contact: hello@rebuilttogether.org", {
    x: 50,
    y: lineY,
    size: 9,
    font: helveticaFont,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Serialize the PDF
  const pdfBytes = await pdfDoc.save();
  return new Uint8Array(pdfBytes);
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

    const receiptData: ReceiptRequest = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate PDF (simplified - in production use proper PDF library)
    const pdfBytes = await generateReceiptPDF(receiptData);

    // Upload to Supabase Storage
    const fileName = `receipts/${receiptData.donation_id}-${Date.now()}.pdf`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(fileName, pdfBytes, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload receipt: ${uploadError.message}`);
    }

    // Get signed URL (works for private buckets)
    // Signed URLs expire after 1 hour, but we'll store the path and generate fresh URLs when needed
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("receipts")
      .createSignedUrl(fileName, 31536000); // 1 year expiration

    if (signedUrlError) {
      // Fallback to public URL if signed URL fails
      const { data: urlData } = supabase.storage
        .from("receipts")
        .getPublicUrl(fileName);
      
      return new Response(
        JSON.stringify({
          receipt_url: urlData.publicUrl,
          receipt_path: fileName, // Store path for future signed URL generation
          receipt_number: `RT-${new Date().getFullYear()}-${receiptData.donation_id.substring(0, 8).toUpperCase()}`,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        receipt_url: signedUrlData.signedUrl,
        receipt_path: fileName, // Store path for future signed URL generation
        receipt_number: `RT-${new Date().getFullYear()}-${receiptData.donation_id.substring(0, 8).toUpperCase()}`,
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
    console.error("Receipt generation error:", error);
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

