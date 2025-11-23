// Quick script to manually process an order
// Run with: node process-order.js

const SUPABASE_URL = "https://tjoieuiijrtdwdmjkcdo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqb2lldWlpanJ0ZHdkbWprY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTA2NDIsImV4cCI6MjA3ODk4NjY0Mn0.ljyScMvNgZVaS3q1rSUwHEQuYAWLXyweb_e6kNPvdhg";

const orderData = {
  order_id: "6948564140213",
  order_name: "#1001",
  email: "jfuller516@gmail.com",
  product_handle: "investment-tier-1",
  amount: 100.00, // Update this with the actual amount
};

async function processOrder() {
  console.log("🔄 Processing order...\n");
  console.log("Order details:", orderData);
  console.log("");

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/manual-order-process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ Error:", result.error || "Unknown error");
      process.exit(1);
    }

    console.log("✅ Success!");
    console.log("");
    console.log("Result:", JSON.stringify(result, null, 2));
    console.log("");
    console.log("📝 Next steps:");
    console.log("1. The user profile has been created for", orderData.email);
    console.log("2. The donation record has been created");
    console.log("3. User can now log in at /auth and see their donation at /donor-dashboard");
  } catch (error) {
    console.error("❌ Failed to process order:", error.message);
    console.log("");
    console.log("💡 Make sure the Edge Function is deployed:");
    console.log("   supabase functions deploy manual-order-process --no-verify-jwt");
    process.exit(1);
  }
}

processOrder();

