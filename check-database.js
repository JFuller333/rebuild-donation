// Quick diagnostic script to check database state
// Run with: node check-database.js

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables from .env file
function loadEnv() {
  try {
    const envFile = readFileSync('.env', 'utf8');
    const env = {};
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        env[key] = value;
      }
    });
    return env;
  } catch (e) {
    console.error('Could not read .env file, using process.env');
    return process.env;
  }
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  console.log('🔍 Checking database state...\n');

  // 1. Check donations
  console.log('📊 DONATIONS:');
  const { data: donations, error: donationsError } = await supabase
    .from('donations')
    .select(`
      id,
      donor_id,
      project_id,
      amount,
      shopify_order_id,
      shopify_order_name,
      shopify_product_handle,
      created_at,
      profiles (email, full_name),
      projects (title, shopify_product_handle)
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  if (donationsError) {
    console.error('  ❌ Error:', donationsError.message);
  } else {
    console.log(`  ✅ Found ${donations.length} donation(s)\n`);
    donations.forEach((d, i) => {
      console.log(`  ${i + 1}. Donation ID: ${d.id}`);
      console.log(`     Amount: $${d.amount}`);
      console.log(`     Order: ${d.shopify_order_name || d.shopify_order_id || 'N/A'}`);
      console.log(`     Product Handle: ${d.shopify_product_handle || 'MISSING'}`);
      console.log(`     Donor: ${d.profiles?.email || d.donor_id} (${d.profiles?.full_name || 'No name'})`);
      console.log(`     Project: ${d.projects?.title || 'NOT LINKED'} (Handle: ${d.projects?.shopify_product_handle || 'N/A'})`);
      console.log(`     Date: ${new Date(d.created_at).toLocaleString()}`);
      if (!d.project_id) {
        console.log(`     ⚠️  WARNING: No project_id - product handle "${d.shopify_product_handle}" not linked to a project`);
      }
      console.log('');
    });
  }

  // 2. Check profiles
  console.log('\n👥 PROFILES:');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, full_name, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (profilesError) {
    console.error('  ❌ Error:', profilesError.message);
  } else {
    console.log(`  ✅ Found ${profiles.length} profile(s)\n`);
    profiles.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.email} (${p.full_name || 'No name'})`);
      console.log(`     ID: ${p.id}`);
      console.log(`     Created: ${new Date(p.created_at).toLocaleString()}`);
      console.log('');
    });
  }

  // 3. Check projects
  console.log('\n📁 PROJECTS:');
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, title, shopify_product_handle, created_at')
    .order('created_at', { ascending: false });

  if (projectsError) {
    console.error('  ❌ Error:', projectsError.message);
  } else {
    console.log(`  ✅ Found ${projects.length} project(s)\n`);
    projects.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.title}`);
      console.log(`     ID: ${p.id}`);
      console.log(`     Shopify Handle: ${p.shopify_product_handle || 'NOT LINKED'}`);
      console.log(`     Created: ${new Date(p.created_at).toLocaleString()}`);
      console.log('');
    });
  }

  // 4. Check for mismatches
  console.log('\n🔗 LINKING ANALYSIS:');
  if (donations && donations.length > 0) {
    const unlinkedDonations = donations.filter(d => !d.project_id);
    const mismatchedHandles = donations.filter(d => 
      d.shopify_product_handle && 
      d.projects?.shopify_product_handle && 
      d.shopify_product_handle !== d.projects.shopify_product_handle
    );

    if (unlinkedDonations.length > 0) {
      console.log(`  ⚠️  ${unlinkedDonations.length} donation(s) not linked to projects:`);
      unlinkedDonations.forEach(d => {
        console.log(`     - Order ${d.shopify_order_name}: Product "${d.shopify_product_handle}" has no matching project`);
      });
    }

    if (mismatchedHandles.length > 0) {
      console.log(`  ⚠️  ${mismatchedHandles.length} donation(s) with handle mismatches:`);
      mismatchedHandles.forEach(d => {
        console.log(`     - Donation handle: "${d.shopify_product_handle}" vs Project handle: "${d.projects?.shopify_product_handle}"`);
      });
    }

    if (unlinkedDonations.length === 0 && mismatchedHandles.length === 0) {
      console.log('  ✅ All donations are properly linked to projects!');
    }
  } else {
    console.log('  ℹ️  No donations to analyze');
  }

  console.log('\n✅ Diagnostic complete!\n');
}

checkDatabase().catch(console.error);

