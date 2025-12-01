// Script to regenerate receipt for a donation
// Run with: node regenerate-receipt.js

const SUPABASE_URL = "https://tjoieuiijrtdwdmjkcdo.supabase.co";
const SUPABASE_SERVICE_KEY = "YOUR_SERVICE_ROLE_KEY_HERE"; // Get from Supabase Dashboard → Settings → API

async function regenerateReceipt(donationId) {
  // First, get donation details
  const donationResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/donations?id=eq.${donationId}&select=*,profiles(email,full_name),projects(title)`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  const donations = await donationResponse.json();
  if (donations.length === 0) {
    console.error("Donation not found");
    return;
  }

  const donation = donations[0];

  // Call generate-receipt function
  const receiptResponse = await fetch(`${SUPABASE_URL}/functions/v1/generate-receipt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({
      donation_id: donation.id,
      order_id: donation.shopify_order_id || donation.id,
      order_name: donation.shopify_order_name || `#${donation.id.substring(0, 8)}`,
      amount: donation.amount,
      donor_email: donation.profiles.email,
      donor_name: donation.profiles.full_name || donation.profiles.email,
      project_title: donation.projects.title || "Project",
      date: donation.created_at,
    }),
  });

  if (!receiptResponse.ok) {
    const error = await receiptResponse.text();
    console.error("Error generating receipt:", error);
    return;
  }

  const receiptData = await receiptResponse.json();
  console.log("Receipt generated:", receiptData);

  // Update donation with receipt URL
  const updateResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/donations?id=eq.${donationId}`,
    {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receipt_url: receiptData.receipt_url,
        receipt_generated_at: new Date().toISOString(),
      }),
    }
  );

  if (updateResponse.ok) {
    console.log("✅ Receipt URL updated in donation record");
  } else {
    console.error("Error updating donation:", await updateResponse.text());
  }
}

// Usage: node regenerate-receipt.js <donation-id>
const donationId = process.argv[2];
if (!donationId) {
  console.error("Usage: node regenerate-receipt.js <donation-id>");
  process.exit(1);
}

regenerateReceipt(donationId);

