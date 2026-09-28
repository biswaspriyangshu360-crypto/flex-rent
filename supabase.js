// ======================================================
// FLEX RENT - SUPABASE CONFIGURATION
// ======================================================

// Supabase Project URL
const SUPABASE_URL =
    "https://ztjclizjijlgskxdyvvc.supabase.co";

// Supabase Publishable Key
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
// CHECK CONNECTION
// ======================================================

console.log("Flex Rent Supabase connected successfully.");

console.log(
    "Supabase URL:",
    SUPABASE_URL
);
