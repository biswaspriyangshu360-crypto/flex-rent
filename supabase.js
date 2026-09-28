// ======================================================
// FLEX RENT - SUPABASE CONFIGURATION
// ======================================================

// Your Supabase Project URL
const SUPABASE_URL =
    "https://ztjclizjijlgskxdyvvc.supabase.co";

// Your Supabase Publishable Key
const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_HpN-JfR1xpMxCJqzJHpK4A_mPicSh4m";

// Create Supabase client
const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

console.log("Flex Rent Supabase connected successfully.");
