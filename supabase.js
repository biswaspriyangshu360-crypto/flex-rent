// ======================================================
// FLEX RENT - SUPABASE CONFIGURATION
// ======================================================

// Supabase Project URL
const SUPABASE_URL =
    "https://ztjclizjijlgskxdyvvc.supabase.co";

// Supabase Publishable Key
const SUPABASE_KEY =
    "sb_publishable_HpN-JfR1xpMxCJqzJHpK4A_mPicSh4m";


// ======================================================
// CREATE SUPABASE CLIENT
// ======================================================

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ======================================================
// CHECK CONNECTION
// ======================================================

console.log("Flex Rent Supabase loaded successfully.");


// ======================================================
// CHECK USER SESSION
// ======================================================

async function checkSupabaseSession() {

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Session error:",
                error.message
            );

            return null;
        }


        const session =
            data.session;


        if (session) {

            console.log(
                "User is logged in:",
                session.user.email
            );

        } else {

            console.log(
                "No user is currently logged in."
            );

        }


        return session;

    } catch (error) {

        console.error(
            "Supabase connection error:",
            error
        );

        return null;
    }
}


// ======================================================
// AUTH STATE LISTENER
// ======================================================

supabaseClient.auth.onAuthStateChange(
    function(event, session) {

        console.log(
            "Auth event:",
            event
        );


        if (session) {

            console.log(
                "Logged in:",
                session.user.email
            );

        } else {

            console.log(
                "User logged out."
            );

        }

    }
);


// ======================================================
// CHECK SESSION WHEN WEBSITE LOADS
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        checkSupabaseSession();

    }
);
