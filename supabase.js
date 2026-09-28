// ======================================================
// FLEX RENT - SUPABASE CONFIGURATION
// ======================================================

// Your Supabase Project URL
const SUPABASE_URL =
    "https://ztjclizjijlgskxdyvvc.supabase.co";

// Your Supabase Publishable Key
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
// CHECK SUPABASE CONNECTION
// ======================================================

console.log("=================================");
console.log("FLEX RENT SUPABASE");
console.log("=================================");
console.log("Supabase URL:", SUPABASE_URL);
console.log("Supabase client:", supabaseClient);
console.log("Supabase connection initialized.");
console.log("=================================");


// ======================================================
// CHECK CURRENT USER
// ======================================================

async function checkCurrentUser() {

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.getUser();

        if (error) {

            console.log(
                "No active user:",
                error.message
            );

            return null;
        }

        if (data && data.user) {

            console.log(
                "Logged in user:",
                data.user.email
            );

            return data.user;

        }

        console.log("No user currently logged in.");

        return null;

    } catch (error) {

        console.error(
            "User check error:",
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
            "Auth Event:",
            event
        );


        if (session && session.user) {

            console.log(
                "User logged in:",
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
// LOGOUT FUNCTION
// ======================================================

async function logoutUser() {

    try {

        const {
            error
        } = await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                "Logout error:",
                error
            );

            alert(
                "Logout failed: " +
                error.message
            );

            return;
        }


        alert(
            "You have been logged out."
        );


        // Close dashboard if available
        if (typeof closeDashboard === "function") {
            closeDashboard();
        }


        console.log(
            "Logout successful."
        );

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

}


// ======================================================
// EXPORT USER CHECK
// ======================================================

window.checkCurrentUser =
    checkCurrentUser;

window.logoutUser =
    logoutUser;


// ======================================================
// SUPABASE READY
// ======================================================

console.log(
    "Flex Rent Supabase is ready."
);
