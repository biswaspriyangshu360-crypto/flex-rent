// ============================================================
// FLEX RENT - COMPLETE SCRIPT
// Supabase + Login + Listings + Booking + Payment Demo + Map
// ============================================================


// ============================================================
// GLOBAL DATA
// ============================================================

let myListings = [];
let myBookings = [];

let selectedItemPrice = 0;
let selectedItemId = null;

let selectedPaymentMethod = "";

let currentPaymentItem = "";
let currentPaymentDays = 1;
let currentPaymentAmount = 0;
let currentPaymentListingId = null;

let rentalMap = null;
let userMarker = null;


// ============================================================
// SUPABASE CHECK
// ============================================================

function isSupabaseReady() {

    return (
        typeof supabaseClient !== "undefined" &&
        supabaseClient
    );
}


// ============================================================
// HTML ESCAPE - SECURITY
// ============================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// SCROLL TO ITEMS
// ============================================================

function scrollToItems() {

    const section =
        document.getElementById("items");

    if (section) {

        section.scrollIntoView({
            behavior: "smooth"
        });

    }
}


// ============================================================
// SEARCH ITEMS
// ============================================================

function searchItems() {

    const input =
        document.getElementById("searchInput");

    if (!input) {
        return;
    }

    const searchText =
        input.value.toLowerCase().trim();

    const items =
        document.querySelectorAll(".item-card");

    const noResults =
        document.getElementById("noResults");

    let found = false;

    items.forEach(function(item) {

        const name =
            item.querySelector("h3")?.innerText
            ?.toLowerCase() || "";

        const description =
            item.querySelector("p")?.innerText
            ?.toLowerCase() || "";

        const category =
            item.getAttribute("data-category")
            ?.toLowerCase() || "";

        if (
            searchText === "" ||
            name.includes(searchText) ||
            description.includes(searchText) ||
            category.includes(searchText)
        ) {

            item.style.display = "";

            found = true;

        } else {

            item.style.display = "none";

        }

    });

    if (noResults) {

        noResults.style.display =
            found ? "none" : "block";

    }
}


// ============================================================
// CATEGORY FILTER
// ============================================================

function filterCategory(category) {

    const items =
        document.querySelectorAll(".item-card");

    const noResults =
        document.getElementById("noResults");

    let found = false;

    items.forEach(function(item) {

        const itemCategory =
            item.getAttribute("data-category");

        if (
            category === "All" ||
            itemCategory === category
        ) {

            item.style.display = "";

            found = true;

        } else {

            item.style.display = "none";

        }

    });

    if (noResults) {

        noResults.style.display =
            found ? "none" : "block";

    }

    scrollToItems();
}


// ============================================================
// LOGIN MODAL
// ============================================================

function showLogin() {

    const modal =
        document.getElementById("loginModal");

    if (modal) {

        modal.style.display = "flex";

    }
}


function closeLogin() {

    const modal =
        document.getElementById("loginModal");

    if (modal) {

        modal.style.display = "none";

    }
}


// ============================================================
// SIGNUP MODAL
// ============================================================

function showSignup() {

    closeLogin();

    const modal =
        document.getElementById("signupModal");

    if (modal) {

        modal.style.display = "flex";

    }
}


function closeSignup() {

    const modal =
        document.getElementById("signupModal");

    if (modal) {

        modal.style.display = "none";

    }
}


// ============================================================
// LOGIN USER
// ============================================================

async function loginUser() {

    const email =
        document.getElementById("loginEmail")
        ?.value
        .trim();

    const password =
        document.getElementById("loginPassword")
        ?.value;


    if (!email || !password) {

        alert(
            "Please enter email and password."
        );

        return;
    }


    if (!isSupabaseReady()) {

        alert(
            "Supabase is not connected."
        );

        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({

                    email: email,
                    password: password

                });


        if (error) {

            alert(error.message);

            return;
        }


        if (!data.user) {

            alert(
                "Login failed."
            );

            return;
        }


        // Make sure profile exists
        await createOrUpdateProfile(
            data.user
        );


        alert(
            "Login successful! Welcome to Flex Rent."
        );


        closeLogin();


        await loadUserData();


        openDashboard();


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        alert(
            "Login error: " +
            error.message
        );

    }
}


// ============================================================
// SIGN UP USER
// ============================================================

async function signupUser() {

    const name =
        document.getElementById("signupName")
        ?.value
        .trim();

    const email =
        document.getElementById("signupEmail")
        ?.value
        .trim();

    const password =
        document.getElementById("signupPassword")
        ?.value;


    if (!name || !email || !password) {

        alert(
            "Please fill all fields."
        );

        return;
    }


    if (password.length < 6) {

        alert(
            "Password must be at least 6 characters."
        );

        return;
    }


    if (!isSupabaseReady()) {

        alert(
            "Supabase is not connected."
        );

        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.signUp({

                email: email,

                password: password,

                options: {

                    data: {
                        name: name
                    }

                }

            });


        if (error) {

            alert(
                "Signup failed:\n\n" +
                error.message
            );

            return;
        }


        // If email confirmation is disabled,
        // Supabase may return an active session.
        if (data.user) {

            await createOrUpdateProfile(
                data.user,
                name
            );

        }


        alert(
            "Account created successfully!\n\n" +
            "If email confirmation is enabled, " +
            "check your email before logging in."
        );


        closeSignup();

        showLogin();


    } catch (error) {

        console.error(
            "Signup error:",
            error
        );

        alert(
            "Signup error:\n\n" +
            error.message
        );

    }
}


// ============================================================
// CREATE / UPDATE PROFILE
// ============================================================

async function createOrUpdateProfile(
    user,
    suppliedName = null
) {

    if (!user || !isSupabaseReady()) {
        return;
    }


    const name =
        suppliedName ||
        user.user_metadata?.name ||
        "Flex Rent User";


    const profile = {

        id: user.id,

        full_name: name,

        email: user.email || "",

        phone: user.user_metadata?.phone || "",

        avatar_url:
            user.user_metadata?.avatar_url || ""

    };


    const {
        error
    } =
        await supabaseClient
            .from("profiles")
            .upsert(
                profile,
                {
                    onConflict: "id"
                }
            );


    if (error) {

        console.error(
            "Profile error:",
            error
        );

    }

}


// ============================================================
// GET CURRENT USER
// ============================================================

async function getCurrentUser() {

    if (!isSupabaseReady()) {

        return null;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getUser();


        if (error) {

            console.error(
                "User error:",
                error
            );

            return null;

        }


        return data?.user || null;


    } catch (error) {

        console.error(
            error
        );

        return null;

    }

}


// ============================================================
// DASHBOARD
// ============================================================

async function openDashboard() {

    if (!isSupabaseReady()) {

        alert(
            "Supabase is not connected."
        );

        return;
    }


    const user =
        await getCurrentUser();


    if (!user) {

        alert(
            "Please login first."
        );

        showLogin();

        return;
    }


    await createOrUpdateProfile(user);

    await loadUserData();


    const emailElement =
        document.getElementById(
            "dashboardUserEmail"
        );

    const nameElement =
        document.getElementById(
            "dashboardUserName"
        );


    if (emailElement) {

        emailElement.innerText =
            user.email || "";

    }


    if (nameElement) {

        nameElement.innerText =
            user.user_metadata?.name ||
            "Flex Rent User";

    }


    updateDashboardStats();


    const modal =
        document.getElementById(
            "dashboardModal"
        );


    if (modal) {

        modal.style.display = "flex";

    }

}


function closeDashboard() {

    const modal =
        document.getElementById(
            "dashboardModal"
        );


    if (modal) {

        modal.style.display = "none";

    }

}


// ============================================================
// LOAD USER DATA
// ============================================================

async function loadUserData() {

    const user =
        await getCurrentUser();


    if (!user) {

        myListings = [];
        myBookings = [];

        updateDashboardStats();

        return;

    }


    await loadMyListings(user.id);

    await loadMyBookings(user.id);

}


// ============================================================
// LOAD MY LISTINGS
// ============================================================

async function loadMyListings(userId) {

    if (!isSupabaseReady()) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("listings")
            .select("*")
            .eq("owner_id", userId)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Listings loading error:",
            error
        );

        myListings = [];

        return;

    }


    myListings = data || [];


    updateDashboardStats();

}


// ============================================================
// LOAD MY BOOKINGS
// ============================================================

async function loadMyBookings(userId) {

    if (!isSupabaseReady()) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("bookings")
            .select("*")
            .eq("renter_id", userId)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Bookings loading error:",
            error
        );

        myBookings = [];

        return;

    }


    myBookings = data || [];


    updateDashboardStats();

}


// ============================================================
// DASHBOARD STATS
// ============================================================

function updateDashboardStats() {

    const listings =
        document.getElementById(
            "totalListings"
        );

    const bookings =
        document.getElementById(
            "totalBookings"
        );


    if (listings) {

        listings.innerText =
            myListings.length;

    }


    if (bookings) {

        bookings.innerText =
            myBookings.length;

    }

}


// ============================================================
// LIST ITEM MODAL
// ============================================================

function openListForm() {

    const modal =
        document.getElementById(
            "listModal"
        );


    if (modal) {

        modal.style.display = "flex";

    }

}


function closeListForm() {

    const modal =
        document.getElementById(
            "listModal"
        );


    if (modal) {

        modal.style.display = "none";

    }

}


// ============================================================
// SUBMIT LISTING TO SUPABASE
// ============================================================

async function submitItem() {

    const name =
        document.getElementById(
            "itemName"
        )?.value
        .trim();


    const price =
        document.getElementById(
            "itemPrice"
        )?.value
        .trim();


    const category =
        document.getElementById(
            "itemCategory"
        )?.value;


    const location =
        document.getElementById(
            "itemLocation"
        )?.value
        .trim();


    const description =
        document.getElementById(
            "itemDescription"
        )?.value
        .trim();


    const imageFile =
        document.getElementById(
            "itemImage"
        )?.files?.[0];


    if (
        !name ||
        !price ||
        !category ||
        !location ||
        !description
    ) {

        alert(
            "Please fill all item details."
        );

        return;

    }


    if (
        isNaN(price) ||
        Number(price) <= 0
    ) {

        alert(
            "Please enter a valid price."
        );

        return;

    }


    const user =
        await getCurrentUser();


    if (!user) {

        alert(
            "Please login before listing an item."
        );

        closeListForm();

        showLogin();

        return;

    }


    if (!isSupabaseReady()) {

        alert(
            "Supabase is not connected."
        );

        return;

    }


    let imageURL = "";


    // --------------------------------------------------------
    // IMAGE
    // --------------------------------------------------------

    if (imageFile) {

        // Temporary browser preview.
        // Permanent Supabase Storage will be added separately.
        imageURL =
            URL.createObjectURL(
                imageFile
            );

    }


    // --------------------------------------------------------
    // TRY TO GET LOCATION COORDINATES
    // --------------------------------------------------------

    let latitude = null;
    let longitude = null;


    try {

        const coordinates =
            await geocodeLocation(
                location
            );


        if (coordinates) {

            latitude =
                coordinates.lat;

            longitude =
                coordinates.lng;

        }

    } catch (error) {

        console.log(
            "Location coordinates not found."
        );

    }


    const listing = {

        owner_id: user.id,

        name: name,

        description: description,

        category: category,

        price: Number(price),

        location: location,

        latitude: latitude,

        longitude: longitude,

        image_url: imageURL,

        available: true

    };


    const {
        data,
        error
    } =
        await supabaseClient
            .from("listings")
            .insert(listing)
            .select()
            .single();


    if (error) {

        console.error(
            "Listing insert error:",
            error
        );

        alert(
            "Could not publish listing:\n\n" +
            error.message
        );

        return;

    }


    myListings.unshift(data);


    await loadMarketplaceListings();

    updateDashboardStats();


    alert(
        "Item published successfully!\n\n" +
        name +
        " is now available for rent."
    );


    closeListForm();

    resetListingForm();

}


// ============================================================
// RESET LISTING FORM
// ============================================================

function resetListingForm() {

    const fields = [

        "itemName",
        "itemPrice",
        "itemLocation",
        "itemDescription"

    ];


    fields.forEach(function(id) {

        const element =
            document.getElementById(id);

        if (element) {

            element.value = "";

        }

    });


    const image =
        document.getElementById(
            "itemImage"
        );


    if (image) {

        image.value = "";

    }

}


// ============================================================
// GEOCODE LOCATION
// ============================================================

async function geocodeLocation(location) {

    if (!location) {
        return null;
    }


    try {

        const url =
            "https://nominatim.openstreetmap.org/search" +
            "?format=json" +
            "&limit=1" +
            "&q=" +
            encodeURIComponent(location);


        const response =
            await fetch(url);


        if (!response.ok) {

            return null;

        }


        const data =
            await response.json();


        if (
            !data ||
            data.length === 0
        ) {

            return null;

        }


        return {

            lat:
                Number(data[0].lat),

            lng:
                Number(data[0].lon)

        };


    } catch (error) {

        console.error(
            "Geocoding error:",
            error
        );

        return null;

    }

}


// ============================================================
// DISPLAY MY LISTINGS
// ============================================================

async function openMyListings() {

    closeDashboard();


    await loadUserData();

    displayMyListings();


    const modal =
        document.getElementById(
            "myListingsModal"
        );


    if (modal) {

        modal.style.display = "flex";

    }

}


function closeMyListings() {

    const modal =
        document.getElementById(
            "myListingsModal"
        );


    if (modal) {

        modal.style.display = "none";

    }

}


// ============================================================
// DISPLAY LISTINGS
// ============================================================

function displayMyListings() {

    const container =
        document.getElementById(
            "myListingsContainer"
        );


    if (!container) {

        return;

    }


    if (myListings.length === 0) {

        container.innerHTML = `

            <p style="
                text-align:center;
                margin-top:30px;
            ">
                No items listed yet.
            </p>

        `;

        return;

    }


    container.innerHTML = "";


    myListings.forEach(
        function(listing) {


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "my-listing-card";


            const image =
                listing.image_url ||
                "";


            card.innerHTML = `

                <div class="my-listing-image">

                    ${
                        image

                        ?

                        `<img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(listing.name)}"
                        >`

                        :

                        `<div style="
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            height:100%;
                            font-size:50px;
                        ">
                            📦
                        </div>`
                    }

                </div>


                <div class="my-listing-info">

                    <span class="item-category">
                        ${escapeHTML(listing.category)}
                    </span>

                    <h3>
                        ${escapeHTML(listing.name)}
                    </h3>

                    <p>
                        ${escapeHTML(listing.description)}
                    </p>

                    <p>
                        📍 ${escapeHTML(listing.location)}
                    </p>

                    <strong>
                        ₹${Number(listing.price).toLocaleString("en-IN")}/day
                    </strong>

                    <br><br>

                    <button
                        class="dashboard-action"
                        onclick="deleteListing(${listing.id})"
                    >
                        🗑️ Delete
                    </button>

                </div>

            `;


            container.appendChild(card);

        }
    );

}


// ============================================================
// DELETE LISTING
// ============================================================

async function deleteListing(listingId) {

    const listing =
        myListings.find(
            function(item) {

                return item.id === listingId;

            }
        );


    if (!listing) {

        return;

    }


    const confirmed =
        confirm(
            "Do you want to delete " +
            listing.name +
            "?"
        );


    if (!confirmed) {

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("listings")
            .delete()
            .eq("id", listingId);


    if (error) {

        console.error(
            error
        );

        alert(
            "Could not delete listing:\n\n" +
            error.message
        );

        return;

    }


    myListings =
        myListings.filter(
            function(item) {

                return item.id !== listingId;

            }
        );


    displayMyListings();

    updateDashboardStats();

    await loadMarketplaceListings();


    alert(
        "Listing deleted successfully."
    );

}


// ============================================================
// LOAD MARKETPLACE LISTINGS
// ============================================================

async function loadMarketplaceListings() {

    if (!isSupabaseReady()) {

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("listings")
            .select("*")
            .eq("available", true)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Marketplace loading error:",
            error
        );

        return;

    }


    if (!data) {

        return;

    }


    renderDatabaseListings(data);

    updateRentalMap(data);

}


// ============================================================
// RENDER DATABASE LISTINGS
// ============================================================

function renderDatabaseListings(listings) {

    const container =
        document.getElementById(
            "itemsContainer"
        );


    if (!container) {

        return;

    }


    // Keep existing HTML sample cards.
    // Add database listings below them.

    const oldDatabaseCards =
        container.querySelectorAll(
            ".database-listing"
        );


    oldDatabaseCards.forEach(
        function(card) {

            card.remove();

        }
    );


    listings.forEach(
        function(listing) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "item-card database-listing";


            card.setAttribute(
                "data-category",
                listing.category || "Everyday"
            );


            let imageHTML = "";


            if (listing.image_url) {

                imageHTML = `

                    <img
                        src="${escapeHTML(listing.image_url)}"
                        alt="${escapeHTML(listing.name)}"
                        style="
                            width:100%;
                            height:100%;
                            object-fit:cover;
                        "
                    >

                `;

            } else {

                imageHTML =
                    `<span style="font-size:60px;">📦</span>`;

            }


            card.innerHTML = `

                <div class="item-image">

                    ${imageHTML}

                </div>


                <div class="item-info">

                    <span class="item-category">

                        ${escapeHTML(
                            listing.category || "Item"
                        )}

                    </span>


                    <h3>

                        ${escapeHTML(
                            listing.name
                        )}

                    </h3>


                    <p>

                        ${escapeHTML(
                            listing.description || ""
                        )}

                        <br>

                        📍 ${escapeHTML(
                            listing.location || "Location unavailable"
                        )}

                    </p>


                    <div class="item-bottom">

                        <strong>

                            ₹${Number(
                                listing.price
                            ).toLocaleString("en-IN")}/day

                        </strong>


                        <button
                            type="button"
                            onclick="openDatabaseBooking(
                                ${listing.id},
                                '${escapeHTML(
                                    listing.name
                                )}',
                                ${Number(listing.price)}
                            )"
                        >

                            Rent Now

                        </button>

                    </div>

                </div>

            `;


            container.appendChild(card);

        }
    );

}


// ============================================================
// RENT ITEM
// ============================================================

function rentItem(
    itemName,
    price
) {

    openBooking(
        itemName,
        price
    );

}


// ============================================================
// OPEN NORMAL BOOKING
// ============================================================

function openBooking(
    itemName,
    price
) {

    selectedItemId = null;

    selectedItemPrice =
        Number(price);


    const name =
        document.getElementById(
            "bookingItemName"
        );


    const priceElement =
        document.getElementById(
            "bookingItemPrice"
        );


    const days =
        document.getElementById(
            "rentalDays"
        );


    if (name) {

        name.innerText =
            itemName;

    }


    if (priceElement) {

        priceElement.innerText =
            "₹" +
            selectedItemPrice +
            "/day";

    }


    if (days) {

        days.value = 1;

    }


    calculateTotal();


    const modal =
        document.getElementById(
            "bookingModal"
        );


    if (modal) {

        modal.style.display = "flex";

    }

}


// ============================================================
// OPEN DATABASE BOOKING
// ============================================================

function openDatabaseBooking(
    listingId,
    itemName,
    price
) {

    selectedItemId =
        listingId;


    selectedItemPrice =
        Number(price);


    const name =
        document.getElementById(
            "bookingItemName"
        );


    const priceElement =
        document.getElementById(
            "bookingItemPrice"
        );


    const days =
        document.getElementById(
            "rentalDays"
        );


    if (name) {

        name.innerText =
            itemName;

    }


    if (priceElement) {

        priceElement.innerText =
            "₹" +
            selectedItemPrice +
            "/day";

    }


    if (days) {

        days.value = 1;

    }


    calculateTotal();


    const modal =
        document.getElementById(
            "bookingModal"
        );


    if (modal) {

        modal.style.display = "flex";

    }

}


// ============================================================
// CLOSE BOOKING
// ============================================================

function closeBooking() {

    const modal =
        document.getElementById(
            "bookingModal"
        );


    if (modal) {

        modal.style.display = "none";

    }

}


// ============================================================
// CALCULATE TOTAL
// ============================================================

function calculateTotal() {

    const input =
        document.getElementById(
            "rentalDays"
        );


    if (!input) {

        return;

    }


    let days =
        parseInt(
            input.value
        );


    if (
        isNaN(days) ||
        days < 1
    ) {

        days = 1;

        input.value = 1;

    }


    const total =
        selectedItemPrice *
        days;


    const totalElement =
        document.getElementById(
            "bookingTotal"
        );


    if (totalElement) {

        totalElement.innerText =
            "₹" +
            total.toLocaleString("en-IN");

    }

}


// ============================================================
// PROCEED TO PAYMENT
// ============================================================

function proceedToPayment() {

    const days =
        parseInt(
            document.getElementById(
                "rentalDays"
            )?.value
        );


    const itemName =
        document.getElementById(
            "bookingItemName"
        )?.innerText;


    if (
        isNaN(days) ||
        days < 1
    ) {

        alert(
            "Please select at least 1 day."
        );

        return;

    }


    const total =
        selectedItemPrice *
        days;


    currentPaymentItem =
        itemName || "Rental Item";


    currentPaymentDays =
        days;


    currentPaymentAmount =
        total;


    currentPaymentListingId =
        selectedItemId;


    const paymentItem =
        document.getElementById(
            "paymentItem"
        );


    const paymentDays =
        document.getElementById(
            "paymentDays"
        );


    const paymentAmount =
        document.getElementById(
            "paymentAmount"
        );


    if (paymentItem) {

        paymentItem.innerText =
            currentPaymentItem;

    }


    if (paymentDays) {

        paymentDays.innerText =
            days +
            (
                days === 1
                    ? " Day"
                    : " Days"
            );

    }


    if (paymentAmount) {

        paymentAmount.innerText =
            "₹" +
            total.toLocaleString("en-IN");

    }


    selectedPaymentMethod = "";


    const selected =
        document.getElementById(
            "selectedPayment"
        );


    if (selected) {

        selected.innerText =
            "Please select a payment method.";

    }


    closeBooking();


    const paymentModal =
        document.getElementById(
            "paymentModal"
        );


    if (paymentModal) {

        paymentModal.style.display =
            "flex";

    }

}


// ============================================================
// SELECT PAYMENT METHOD
// ============================================================

function selectPaymentMethod(
    method
) {

    selectedPaymentMethod =
        method;


    const element =
        document.getElementById(
            "selectedPayment"
        );


    if (element) {

        element.innerText =
            "Selected: " +
            method;

    }


    // Highlight payment button
    document
        .querySelectorAll(
            ".payment-method"
        )
        .forEach(
            function(button) {

                button.classList.remove(
                    "selected"
                );

            }
        );


    const buttons =
        document.querySelectorAll(
            ".payment-method"
        );


    buttons.forEach(
        function(button) {

            if (
                button.innerText
                    .toLowerCase()
                    .includes(
                        method.toLowerCase()
                    )
            ) {

                button.classList.add(
                    "selected"
                );

            }

        }
    );

}


// ============================================================
// MAKE PAYMENT - DEMO
// ============================================================

async function makePayment() {

    if (!selectedPaymentMethod) {

        alert(
            "Please select a payment method."
        );

        return;

    }


    const user =
        await getCurrentUser();


    if (!user) {

        closePayment();

        alert(
            "Please login before making a booking."
        );

        showLogin();

        return;

    }


    // --------------------------------------------------------
    // REAL PAYMENT GATEWAY NOT CONNECTED YET
    // --------------------------------------------------------
    // This creates a booking record.
    // Actual UPI/Card money transfer requires a payment gateway.


    const booking = {

        renter_id: user.id,

        listing_id:
            currentPaymentListingId,

        item_name:
            currentPaymentItem,

        start_date:
            document.getElementById(
                "startDate"
            )?.value || null,

        rental_days:
            currentPaymentDays,

        total_amount:
            currentPaymentAmount,

        payment_method:
            selectedPaymentMethod,

        status:
            "Confirmed"

    };


    if (!isSupabaseReady()) {

        alert(
            "Supabase is not connected."
        );

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("bookings")
            .insert(booking)
            .select()
            .single();


    if (error) {

        console.error(
            "Booking error:",
            error
        );

        alert(
            "Booking failed:\n\n" +
            error.message
        );

        return;

    }


    // --------------------------------------------------------
    // SAVE PAYMENT RECORD
    // --------------------------------------------------------

    const payment = {

        user_id:
            user.id,

        booking_id:
            data.id,

        amount:
            currentPaymentAmount,

        payment_method:
            selectedPaymentMethod,

        payment_status:
            "Demo Successful"

    };


    const {
        error: paymentError
    } =
        await supabaseClient
            .from("payments")
            .insert(payment);


    if (paymentError) {

        console.error(
            "Payment record error:",
            paymentError
        );

    }


    myBookings.unshift(data);

    updateDashboardStats();


    closePayment();


    alert(
        "Booking Confirmed!\n\n" +

        "Item: " +
        currentPaymentItem +

        "\nDays: " +
        currentPaymentDays +

        "\nAmount: ₹" +
        currentPaymentAmount.toLocaleString(
            "en-IN"
        ) +

        "\nPayment Method: " +
        selectedPaymentMethod
    );

}


// ============================================================
// CLOSE PAYMENT
// ============================================================

function closePayment() {

    const modal =
        document.getElementById(
            "paymentModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


// ============================================================
// GOOGLE LOGIN
// ============================================================

async function googleLogin() {

    if (!isSupabaseReady()) {

        alert(
            "Supabase is not connected."
        );

        return;

    }


    const {
        error
    } =
        await supabaseClient.auth
            .signInWithOAuth({

                provider: "google",

                options: {

                    redirectTo:
                        window.location.origin

                }

            });


    if (error) {

        console.error(
            error
        );

        alert(
            "Google Login Failed:\n\n" +
            error.message
        );

    }

}


// ============================================================
// LOGOUT
// ============================================================

async function logoutUser() {

    if (!isSupabaseReady()) {

        return;

    }


    const {
        error
    } =
        await supabaseClient.auth.signOut();


    if (error) {

        alert(
            "Logout failed:\n\n" +
            error.message
        );

        return;

    }


    myListings = [];

    myBookings = [];

    updateDashboardStats();

    closeDashboard();


    alert(
        "You have been logged out."
    );

}


// ============================================================
// VOICE SEARCH - GOOGLE STYLE
// ============================================================

function startVoiceSearch() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        alert(
            "Voice search is not supported in this browser."
        );

        return;

    }


    const recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-IN";


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    const input =
        document.getElementById(
            "searchInput"
        );


    recognition.onstart =
        function() {

            if (input) {

                input.placeholder =
                    "Listening...";

            }

        };


    recognition.onresult =
        function(event) {

            const text =
                event.results[0][0]
                    .transcript;


            if (input) {

                input.value =
                    text;

            }


            searchItems();

        };


    recognition.onerror =
        function(event) {

            console.error(
                "Voice error:",
                event.error
            );


            if (
                event.error !==
                "no-speech"
            ) {

                alert(
                    "Voice search error: " +
                    event.error
                );

            }

        };


    recognition.onend =
        function() {

            if (input) {

                input.placeholder =
                    "Search for tools, books, equipment...";

            }

        };


    try {

        recognition.start();

    } catch (error) {

        console.error(
            error
        );

    }

}


// ============================================================
// WORLD MAP
// ============================================================

function initializeRentalMap() {

    if (
        typeof L === "undefined"
    ) {

        console.error(
            "Leaflet library is not loaded."
        );

        return;

    }


    const mapElement =
        document.getElementById(
            "rentalMap"
        ) ||
        document.getElementById(
            "map"
        );


    if (!mapElement) {

        console.log(
            "Map container not found."
        );

        return;

    }


    // Prevent duplicate initialization
    if (
        mapElement._leaflet_id
    ) {

        rentalMap =
            mapElement._leaflet_map ||
            rentalMap;

        return;

    }


    // WORLD VIEW
    rentalMap =
        L.map(
            mapElement,
            {
                worldCopyJump: true
            }
        ).setView(
            [20, 0],
            2
        );


    mapElement._leaflet_map =
        rentalMap;


    // OpenStreetMap tiles
    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {

            maxZoom: 19,

            attribution:
                '&copy; OpenStreetMap contributors'

        }
    ).addTo(
        rentalMap
    );


    // Load database locations
    loadMapListings();


    // Default sample locations
    addDefaultWorldMarkers();


    console.log(
        "World map initialized."
    );

}


// ============================================================
// DEFAULT WORLD MARKERS
// ============================================================

function addDefaultWorldMarkers() {

    if (!rentalMap) {

        return;

    }


    const locations = [

        {
            name: "Engineering Books",
            price: 50,
            lat: 22.5726,
            lng: 88.3639,
            icon: "📚"
        },

        {
            name: "Laptop",
            price: 500,
            lat: 19.0760,
            lng: 72.8777,
            icon: "💻"
        },

        {
            name: "Drilling Machine",
            price: 28.6139,
            lng: 77.2090,
            lat: 28.6139,
            icon: "🛠️"
        },

        {
            name: "Garden Tools",
            price: 150,
            lat: 51.5074,
            lng: -0.1278,
            icon: "🌱"
        },

        {
            name: "Laptop Rental",
            price: 700,
            lat: 40.7128,
            lng: -74.0060,
            icon: "💻"
        },

        {
            name: "Camera Equipment",
            price: 900,
            lat: 35.6762,
            lng: 139.6503,
            icon: "📷"
        }

    ];


    locations.forEach(
        function(item) {

            addMapMarker(
                item.lat,
                item.lng,
                item.name,
                item.price,
                item.icon
            );

        }
    );

}


// ============================================================
// ADD MAP MARKER
// ============================================================

function addMapMarker(
    lat,
    lng,
    name,
    price,
    icon = "📦"
) {

    if (
        !rentalMap ||
        !lat ||
        !lng
    ) {

        return;

    }


    const marker =
        L.marker(
            [
                Number(lat),
                Number(lng)
            ]
        )
        .addTo(
            rentalMap
        );


    marker.bindPopup(`

        <div style="
            min-width:190px;
            font-family:Arial,sans-serif;
        ">

            <div style="
                font-size:30px;
                margin-bottom:6px;
            ">
                ${escapeHTML(icon)}
            </div>

            <strong style="
                font-size:16px;
            ">
                ${escapeHTML(name)}
            </strong>

            <p style="
                margin:8px 0;
                color:#16a085;
                font-weight:bold;
            ">
                ₹${Number(price).toLocaleString("en-IN")}/day
            </p>

            <button
                onclick="openBooking(
                    '${escapeHTML(name)}',
                    ${Number(price)}
                )"
                style="
                    background:#111827;
                    color:white;
                    border:none;
                    padding:9px 14px;
                    border-radius:7px;
                    cursor:pointer;
                    width:100%;
                "
            >
                Rent Now
            </button>

        </div>

    `);

}


// ============================================================
// LOAD DATABASE MAP LISTINGS
// ============================================================

async function loadMapListings() {

    if (
        !rentalMap ||
        !isSupabaseReady()
    ) {

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("listings")
            .select(
                "id,name,price,latitude,longitude,location"
            )
            .eq(
                "available",
                true
            );


    if (error) {

        console.error(
            "Map listings error:",
            error
        );

        return;

    }


    if (!data) {

        return;

    }


    data.forEach(
        function(item) {

            if (
                item.latitude &&
                item.longitude
            ) {

                addMapMarker(

                    item.latitude,

                    item.longitude,

                    item.name,

                    item.price,

                    "📦"

                );

            }

        }
    );

}


// ============================================================
// UPDATE MAP FROM DATABASE
// ============================================================

function updateRentalMap(listings) {

    if (!rentalMap) {

        return;

    }


    if (!listings) {

        return;

    }


    listings.forEach(
        function(item) {

            if (
                item.latitude &&
                item.longitude
            ) {

                addMapMarker(

                    item.latitude,

                    item.longitude,

                    item.name,

                    item.price,

                    "📦"

                );

            }

        }
    );

}


// ============================================================
// FIND MY LOCATION
// ============================================================

function findMyLocation() {

    if (
        !navigator.geolocation
    ) {

        alert(
            "Your browser does not support location."
        );

        return;

    }


    const status =
        document.getElementById(
            "locationStatus"
        );


    if (status) {

        status.innerText =
            "Finding your location...";

    }


    navigator.geolocation.getCurrentPosition(

        function(position) {

            const lat =
                position.coords.latitude;


            const lng =
                position.coords.longitude;


            if (!rentalMap) {

                initializeRentalMap();

            }


            if (!rentalMap) {

                return;

            }


            rentalMap.setView(
                [lat, lng],
                14
            );


            if (userMarker) {

                rentalMap.removeLayer(
                    userMarker
                );

            }


            userMarker =
                L.marker(
                    [lat, lng]
                )
                .addTo(
                    rentalMap
                );


            userMarker.bindPopup(
                "📍 You are here"
            )
            .openPopup();


            if (status) {

                status.innerText =
                    "Your location found successfully.";

            }


            // Scroll to map
            const mapElement =
                document.getElementById(
                    "rentalMap"
                ) ||
                document.getElementById(
                    "map"
                );


            if (mapElement) {

                mapElement.scrollIntoView({
                    behavior: "smooth"
                });

            }

        },


        function(error) {

            console.error(
                error
            );


            if (status) {

                status.innerText =
                    "Location permission was not allowed.";
            }


            alert(
                "Please allow location permission in your browser."
            );

        },

        {

            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0

        }

    );

}


// ============================================================
// OPEN MAP BUTTON
// ============================================================

function openFullMap() {

    if (!rentalMap) {

        initializeRentalMap();

    }


    const mapElement =
        document.getElementById(
            "rentalMap"
        ) ||
        document.getElementById(
            "map"
        );


    if (mapElement) {

        mapElement.scrollIntoView({
            behavior: "smooth"
        });

    }

}


// ============================================================
// MAP SEARCH
// ============================================================

async function searchMapItems() {

    const input =
        document.getElementById(
            "mapSearchInput"
        );


    if (!input) {

        return;

    }


    const searchText =
        input.value.trim();


    if (!searchText) {

        if (rentalMap) {

            rentalMap.setView(
                [20, 0],
                2
            );

        }

        return;

    }


    const coordinates =
        await geocodeLocation(
            searchText
        );


    if (!coordinates) {

        alert(
            "Location not found. Try a city, country or place name."
        );

        return;

    }


    if (!rentalMap) {

        initializeRentalMap();

    }


    if (!rentalMap) {

        return;

    }


    rentalMap.setView(

        [
            coordinates.lat,
            coordinates.lng
        ],

        12

    );


    L.marker(
        [
            coordinates.lat,
            coordinates.lng
        ]
    )
    .addTo(
        rentalMap
    )
    .bindPopup(
        "📍 " +
        escapeHTML(searchText)
    )
    .openPopup();

}


// ============================================================
// SEARCH THIS AREA
// ============================================================

function searchThisArea() {

    if (!rentalMap) {

        return;

    }


    const center =
        rentalMap.getCenter();


    const zoom =
        rentalMap.getZoom();


    console.log(
        "Map search:",
        center,
        zoom
    );


    alert(
        "Rental items in this map area are shown."
    );

}


// ============================================================
// CLOSE MODALS BY OUTSIDE CLICK
// ============================================================

window.addEventListener(
    "click",
    function(event) {

        const modalIds = [

            "listModal",
            "loginModal",
            "signupModal",
            "bookingModal",
            "paymentModal",
            "dashboardModal",
            "myListingsModal"

        ];


        modalIds.forEach(
            function(id) {

                const modal =
                    document.getElementById(
                        id
                    );


                if (
                    modal &&
                    event.target === modal
                ) {

                    modal.style.display =
                        "none";

                }

            }
        );

    }
);


// ============================================================
// AUTH STATE
// ============================================================

async function handleAuthState() {

    if (!isSupabaseReady()) {

        return;

    }


    const {
        data
    } =
        await supabaseClient.auth.getSession();


    const session =
        data?.session;


    if (session?.user) {

        await createOrUpdateProfile(
            session.user
        );

        await loadUserData();

    }

}


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        console.log(
            "Flex Rent website loaded."
        );


        updateDashboardStats();


        // Authentication
        await handleAuthState();


        // Marketplace
        await loadMarketplaceListings();


        // Map
        setTimeout(
            function() {

                initializeRentalMap();

            },
            300
        );


        // Open map button
        const openMapBtn =
            document.getElementById(
                "openMapBtn"
            );


        if (openMapBtn) {

            openMapBtn.addEventListener(
                "click",
                openFullMap
            );

        }


        console.log(
            "Flex Rent initialization complete."
        );

    }
);


// ============================================================
// KEYBOARD SEARCH
// ============================================================

document.addEventListener(
    "keydown",
    function(event) {

        // "/" opens search
        if (
            event.key === "/" &&
            document.activeElement.tagName !== "INPUT" &&
            document.activeElement.tagName !== "TEXTAREA"
        ) {

            event.preventDefault();


            const search =
                document.getElementById(
                    "searchInput"
                );


            if (search) {

                search.focus();

            }

        }


        // Escape closes modals
        if (
            event.key === "Escape"
        ) {

            [
                "loginModal",
                "signupModal",
                "bookingModal",
                "paymentModal",
                "dashboardModal",
                "myListingsModal",
                "listModal"

            ].forEach(
                function(id) {

                    const modal =
                        document.getElementById(
                            id
                        );


                    if (modal) {

                        modal.style.display =
                            "none";

                    }

                }
            );

        }

    }
);


// ============================================================
// FLEX RENT SCRIPT COMPLETE
// ============================================================

console.log(
    "Flex Rent script.js loaded successfully."
);
