const SUPABASE_URL =
    "https://ztjclizjijlgskxdyvvc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_HpN-JfR1xpMxCJqzJHpK4A_mPicSh4m";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );
