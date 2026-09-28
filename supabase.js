// ======================================================
// FLEX RENT - SUPABASE CONFIGURATION
// ======================================================

const SUPABASE_URL =
    "https://ztjclizjijlgskxdyvvc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_HpN-JfR1xpMxCJqzJHpK4A_mPicSh4m";


// ======================================================
// CREATE SUPABASE CLIENT
// ======================================================

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ======================================================
// CONNECTION CHECK
// ======================================================

console.log("Flex Rent Supabase connected.");
console.log("Supabase URL:", SUPABASE_URL);
