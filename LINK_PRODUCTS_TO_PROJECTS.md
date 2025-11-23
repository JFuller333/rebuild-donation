# Link Shopify Products to Projects

## ⚠️ Critical Step: Link Products to Projects

For the webhook to work, each Shopify product must be linked to a project in your database.

## How to Link Products

### Option 1: Using Admin Dashboard (Easiest)

1. **Log into your app as Admin**
   - Go to your app
   - Sign in with admin account
   - Click "Admin" button in header

2. **Go to Projects Section**
   - In Admin Dashboard, scroll to "All Projects" section
   - Find the project you want to link

3. **Edit the Project**
   - Click the edit button (pencil icon) on the project
   - Find the field: **"Shopify Product Handle"**
   - Enter the Shopify product handle (see below for how to find it)

4. **Save**

### Option 2: Directly in Supabase Database

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/tupesyzjyvjzpibbxyyh
   - Go to **Database** → **Table Editor** → **projects**

2. **Edit Each Project**
   - Find the project row
   - Click to edit
   - In the `shopify_product_handle` column, enter the product handle
   - Save

---

## How to Find Shopify Product Handle

### Method 1: From Product URL

1. Go to your Shopify store
2. Click on a product
3. Look at the URL - the handle is the last part:
   - Example: `https://your-store.myshopify.com/products/maple-street-housing`
   - Handle = `maple-street-housing`

### Method 2: From Shopify Admin

1. Go to Shopify Admin → **Products**
2. Click on a product
3. Scroll down to **Search engine listing preview**
4. The handle is shown in the URL preview
   - Example: `your-store.myshopify.com/products/maple-street-housing`
   - Handle = `maple-street-housing`

### Method 3: From Your App

1. Go to your app's homepage
2. Products are displayed from Shopify
3. The URL when you click a product shows the handle:
   - Example: `/products/maple-street-housing`
   - Handle = `maple-street-housing`

---

## Example

If you have a Shopify product:
- **Product Title**: "Maple Street Housing Project"
- **Product Handle**: `maple-street-housing`
- **Product URL**: `https://your-store.myshopify.com/products/maple-street-housing`

Then in your `projects` table:
- **title**: "Maple Street Housing Project" (or any name)
- **shopify_product_handle**: `maple-street-housing` ← **This must match exactly!**

---

## Verify It's Working

After linking:

1. **Make a test purchase** of that product
2. **Wait 1-2 minutes** for webhook to process
3. **Check Supabase** → **Database** → **donations** table
4. **Verify**:
   - ✅ `shopify_product_handle` matches your product handle
   - ✅ `project_id` matches your project ID
   - ✅ `donor_id` is populated

---

## Quick Checklist

- [ ] I know the Shopify product handle for each product
- [ ] I've linked each product to a project in the database
- [ ] The `shopify_product_handle` in projects table matches the Shopify product handle exactly
- [ ] I've tested with a purchase to verify it works

---

## Troubleshooting

**"Project not found for product handle" error in webhook logs**

→ The `shopify_product_handle` in your projects table doesn't match the Shopify product handle
→ Check for typos, extra spaces, or case sensitivity issues
→ Product handles are usually lowercase with hyphens

**Donation created but project_id is null**

→ The product handle wasn't found in projects table
→ Make sure you've linked the product to a project

