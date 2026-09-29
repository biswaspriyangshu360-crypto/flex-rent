// =====================================================
// FLEX RENT - MAIN JAVASCRIPT
// =====================================================
// Authentication
// Google Login
// Phone OTP
// Profile
// Marketplace
// Image Upload
// Search
// Category Filter
// Voice Search
// Leaflet Map
// GPS Location
// Reverse Geocoding
// Saved Addresses
// Manual Address Geocoding
// Listing Location
// Distance Calculation
// Booking
// Payment Record
// Dashboard
// Forgot Password
// =====================================================


// =====================================================
// STATE
// =====================================================

let currentUser = null;
let currentUserProfile = null;

let listings = [];

let map = null;
let mapMarkers = [];
let selectedLocationMarker = null;

let selectedListingForBooking = null;

let selectedLocation = null;
let selectedListingLocation = null;

let phoneOTPNumber = "";


// =====================================================
// CURRENCY
// =====================================================

function formatINR(amount) {
    const number = Number(amount) || 0;
    return `₹${number.toLocaleString("en-IN")}`;
}


// =====================================================
// DISTANCE CALCULATOR
// =====================================================

function calculateDistance(lat1, lng1, lat2, lng2) {

    if (
        !Number.isFinite(Number(lat1)) ||
        !Number.isFinite(Number(lng1)) ||
        !Number.isFinite(Number(lat2)) ||
        !Number.isFinite(Number(lng2))
    ) {
        return null;
    }

    const R = 6371;

    const dLat =
        (Number(lat2) - Number(lat1)) *
        Math.PI / 180;

    const dLng =
        (Number(lng2) - Number(lng1)) *
        Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(Number(lat1) * Math.PI / 180) *
        Math.cos(Number(lat2) * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;

    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;
}


function formatDistance(distance) {

    if (
        distance === null ||
        !Number.isFinite(distance)
    ) {
        return "";
    }

    if (distance < 1) {
        return `${Math.round(distance * 1000)} m away`;
    }

    if (distance < 10) {
        return `${distance.toFixed(1)} km away`;
    }

    return `${Math.round(distance)} km away`;
}


// =====================================================
// MOCK LISTINGS
// =====================================================

const mockListings = [

    {
        id: "mock-1",
        title: "Caterpillar Mini Excavator",
        category: "Construction",
        description:
            "Heavy-duty compact excavator for digging and trenching.",
        price_per_day: 5000,
        location: "Kolkata, India",
        lat: 22.5726,
        lng: 88.3639,
        image_url:
            "https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&w=600&q=80"
    },

    {
        id: "mock-2",
        title: "John Deere Farm Tractor",
        category: "Agriculture",
        description:
            "75HP tractor with multiple attachment capabilities.",
        price_per_day: 4000,
        location: "Guwahati, India",
        lat: 26.1445,
        lng: 91.7362,
        image_url:
            "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=600&q=80"
    },

    {
        id: "mock-3",
        title: "Bosch Professional Power Drill",
        category: "Everyday",
        description:
            "18V cordless hammer drill with battery kit.",
        price_per_day: 500,
        location: "Guwahati, India",
        lat: 26.1445,
        lng: 91.7362,
        image_url:
            "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80"
    },

    {
        id: "mock-4",
        title: "Electric Lawn Mower",
        category: "Gardening",
        description:
            "Easy-to-use electric lawn mower for home gardens.",
        price_per_day: 800,
        location: "Kolkata, India",
        lat: 22.5726,
        lng: 88.3639,
        image_url:
            "https://images.unsplash.com/photo-1599685315640-3f3a2b9e1c0a?auto=format&fit=crop&w=600&q=80"
    },

    {
        id: "mock-5",
        title: "Heavy Duty Ladder",
        category: "Everyday",
        description:
            "Strong aluminium ladder suitable for home and work.",
        price_per_day: 300,
        location: "Siliguri, India",
        lat: 26.7271,
        lng: 88.3953,
        image_url:
            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80"
    },

    {
        id: "mock-6",
        title: "Industrial Welding Machine",
        category: "Industrial",
        description:
            "Professional welding machine for industrial applications.",
        price_per_day: 1500,
        location: "Durgapur, India",
        lat: 23.5204,
        lng: 87.3119,
        image_url:
            "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80"
    }

];


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    hideLoadingScreen();

    initMap();

    setupVoiceSearch();

    setupEventListeners();

    setupGoogleLoginButton();

    setupPhoneLogin();

    setupForgotPassword();

    setupHeroControls();

    setupQuickCategoryCards();

    setupLocationSystem();

    setupDashboard();

    loadSavedLocation();

    loadListings();

    checkSession();

});


// =====================================================
// LOADING SCREEN
// =====================================================

function hideLoadingScreen() {

    setTimeout(() => {

        const loader =
            document.getElementById("loading-screen");

        if (!loader) return;

        loader.style.opacity = "0";

        setTimeout(() => {
            loader.style.display = "none";
        }, 500);

    }, 700);

}


// =====================================================
// MAP
// =====================================================

function initMap() {

    const mapElement =
        document.getElementById("map");

    if (!mapElement) return;

    try {

        map =
            L.map("map").setView(
                [20.5937, 78.9629],
                5
            );

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution:
                    "© OpenStreetMap contributors"
            }
        ).addTo(map);

    } catch (error) {

        console.warn(
            "Map initialization failed:",
            error
        );

    }

}


// =====================================================
// MAP MARKERS
// =====================================================

function updateMapMarkers(items) {

    if (!map) return;

    mapMarkers.forEach(marker => {

        try {
            map.removeLayer(marker);
        } catch (error) {}

    });

    mapMarkers = [];

    items.forEach(item => {

        const lat =
            Number(item.lat);

        const lng =
            Number(item.lng);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
        ) {
            return;
        }

        const marker =
            L.marker([lat, lng])
                .addTo(map);

        marker.bindPopup(`

            <div style="min-width:180px">

                <strong>
                    ${escapeHTML(item.title)}
                </strong>

                <br>

                <span>
                    ${formatINR(item.price_per_day)}
                    / day
                </span>

                <br>

                <small>
                    ${escapeHTML(item.location || "")}
                </small>

                <br>

                <button
                    onclick="openBookingModal('${escapeAttribute(item.id)}')"
                    style="
                        margin-top:8px;
                        background:#4F46E5;
                        color:#fff;
                        border:none;
                        padding:7px 12px;
                        border-radius:6px;
                        cursor:pointer;
                    "
                >
                    Rent Now
                </button>

            </div>

        `);

        mapMarkers.push(marker);

    });

}


// =====================================================
// NORMALIZE LISTING
// =====================================================

function normalizeListing(item) {

    return {

        id: item.id,

        title:
            item.title ||
            item.name ||
            "Unnamed Item",

        category:
            item.category ||
            "Other",

        description:
            item.description ||
            "",

        price_per_day:
            Number(
                item.price ??
                item.price_per_day ??
                0
            ),

        location:
            item.location ||
            "Location unavailable",

        lat:
            item.latitude ??
            item.lat ??
            null,

        lng:
            item.longitude ??
            item.lng ??
            null,

        image_url:
            item.image_url ||
            "",

        owner_id:
            item.owner_id,

        available:
            item.is_available !== undefined
                ? item.is_available
                : item.available !== undefined
                    ? item.available
                    : true

    };

}


// =====================================================
// LOAD LISTINGS
// =====================================================

async function loadListings() {

    try {

        const dbListings =
            await fetchListings();

        if (
            Array.isArray(dbListings) &&
            dbListings.length > 0
        ) {

            listings =
                dbListings.map(
                    normalizeListing
                );

        } else {

            listings =
                mockListings.map(
                    normalizeListing
                );

        }

    } catch (error) {

        console.warn(
            "Supabase listings unavailable:",
            error
        );

        listings =
            mockListings.map(
                normalizeListing
            );

    }

    renderListings(listings);

    updateMapMarkers(listings);

}


// =====================================================
// RENDER LISTINGS
// =====================================================
function renderListings(items) {

    const container = document.getElementById("listings-grid");

    if (!container) return;

    container.innerHTML = "";

    if (!Array.isArray(items) || items.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-box-open"></i>
                <p>No rental items found.</p>
            </div>
        `;

        return;
    }

    const userLocation =
        selectedLocation &&
        Number.isFinite(Number(selectedLocation.lat)) &&
        Number.isFinite(Number(selectedLocation.lng))
            ? selectedLocation
            : null;


    items.forEach(item => {

        const card = document.createElement("article");

        card.className = "advanced-listing-card";


        /* -----------------------------
           BASIC DATA
        ----------------------------- */

        const image =
            item.image_url ||
            "https://via.placeholder.com/600x400?text=No+Image";


        const available =
            item.available !== false &&
            item.is_available !== false;


        const title =
            item.title ||
            "Unnamed Item";


        const category =
            item.category ||
            "Other";


        const location =
            item.location ||
            "Location not specified";


        const description =
            item.description ||
            "No description provided.";


        const price =
            Number(item.price_per_day) || 0;


        /* -----------------------------
           OPTIONAL ADVANCED DATA
           
           These will start showing
           automatically after we add
           the database fields.
        ----------------------------- */

        const condition =
            item.condition ||
            "Not specified";


        const itemAge =
            item.item_age ||
            "Not specified";


        const brand =
            item.brand ||
            "";


        const model =
            item.model ||
            "";


        const rating =
            item.rating !== undefined &&
            item.rating !== null
                ? Number(item.rating).toFixed(1)
                : null;


        const reviewCount =
            Number(item.review_count) || 0;


        const rentalCount =
            Number(item.rental_count) || 0;


        /* -----------------------------
           DISTANCE
        ----------------------------- */

        let distanceText = "";

        if (
            userLocation &&
            Number.isFinite(Number(item.lat)) &&
            Number.isFinite(Number(item.lng))
        ) {

            const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                item.lat,
                item.lng
            );

            distanceText = formatDistance(distance);
        }


        /* -----------------------------
           RATING DISPLAY
        ----------------------------- */

        let ratingHTML = "";

        if (rating !== null) {

            ratingHTML = `
                <div class="listing-rating">
                    <i class="fa-solid fa-star"></i>
                    <strong>${escapeHTML(rating)}</strong>

                    ${
                        reviewCount > 0
                            ? `<span>(${reviewCount})</span>`
                            : ""
                    }
                </div>
            `;

        } else {

            ratingHTML = `
                <div class="listing-rating no-rating">
                    <i class="fa-regular fa-star"></i>
                    <span>New listing</span>
                </div>
            `;
        }


        /* -----------------------------
           RENTAL COUNT
        ----------------------------- */

        const rentalHTML =
            rentalCount > 0
                ? `
                    <span class="listing-rentals">
                        ${rentalCount} rental${rentalCount > 1 ? "s" : ""}
                    </span>
                  `
                : `
                    <span class="listing-rentals">
                        New
                    </span>
                  `;


        /* -----------------------------
           BRAND / MODEL
        ----------------------------- */

        const brandModelHTML =
            brand || model
                ? `
                    <div class="listing-brand-model">
                        ${
                            brand
                                ? `<strong>${escapeHTML(brand)}</strong>`
                                : ""
                        }

                        ${
                            model
                                ? `<span>${escapeHTML(model)}</span>`
                                : ""
                        }
                    </div>
                  `
                : "";


        /* -----------------------------
           DISTANCE
        ----------------------------- */

        const distanceHTML =
            distanceText
                ? `
                    <span class="listing-distance">
                        <i class="fa-solid fa-location-dot"></i>
                        ${escapeHTML(distanceText)}
                    </span>
                  `
                : `
                    <span class="listing-distance">
                        <i class="fa-solid fa-location-dot"></i>
                        ${escapeHTML(location)}
                    </span>
                  `;


        /* -----------------------------
           CARD HTML
        ----------------------------- */

        card.innerHTML = `

            <div class="listing-image-wrapper">

                <img
                    src="${escapeAttribute(image)}"
                    alt="${escapeAttribute(title)}"
                    class="listing-card-image"
                    loading="lazy"
                >

                <span class="listing-category-badge">
                    ${escapeHTML(category)}
                </span>


                <button
                    type="button"
                    class="listing-favorite-btn"
                    title="Add to favorites"
                    aria-label="Add ${escapeAttribute(title)} to favorites"
                >
                    <i class="fa-regular fa-heart"></i>
                </button>


                <span
                    class="listing-availability ${
                        available
                            ? "available"
                            : "unavailable"
                    }"
                >
                    <i class="fa-solid fa-circle"></i>

                    ${
                        available
                            ? "Available"
                            : "Unavailable"
                    }
                </span>

            </div>


            <div class="listing-card-body">


                <div class="listing-title-row">

                    <h3 class="listing-title">
                        ${escapeHTML(title)}
                    </h3>

                </div>


                ${brandModelHTML}


                <div class="listing-meta-row">

                    ${ratingHTML}

                    ${rentalHTML}

                </div>


                <div class="listing-info-grid">

                    <div class="listing-info-item">

                        <span class="listing-info-label">
                            Condition
                        </span>

                        <strong>
                            ${escapeHTML(condition)}
                        </strong>

                    </div>


                    <div class="listing-info-item">

                        <span class="listing-info-label">
                            Item Age
                        </span>

                        <strong>
                            ${escapeHTML(String(itemAge))}
                        </strong>

                    </div>

                </div>


                <p class="listing-description">
                    ${escapeHTML(description)}
                </p>


                <div class="listing-location-row">

                    ${distanceHTML}

                </div>


                <div class="listing-price-row">

                    <div class="listing-price">

                        <strong>
                            ${formatINR(price)}
                        </strong>

                        <span>/ day</span>

                    </div>

                </div>


                <div class="listing-actions">

                    <button
                        type="button"
                        class="btn btn-outline listing-details-btn"
                        data-details-id="${escapeAttribute(item.id)}"
                    >
                        <i class="fa-solid fa-eye"></i>
                        View Details
                    </button>


                    <button
                        type="button"
                        class="btn btn-primary listing-rent-btn"
                        data-booking-id="${escapeAttribute(item.id)}"
                        ${!available ? "disabled" : ""}
                    >
                        <i class="fa-solid fa-calendar-check"></i>

                        ${
                            available
                                ? "Rent Now"
                                : "Unavailable"
                        }

                    </button>

                </div>

            </div>
        `;


        /* -----------------------------
           FAVORITE BUTTON
        ----------------------------- */

        const favoriteButton =
            card.querySelector(".listing-favorite-btn");


        favoriteButton?.addEventListener(
            "click",
            (event) => {

                event.preventDefault();
                event.stopPropagation();

                favoriteButton.classList.toggle("active");

                const icon =
                    favoriteButton.querySelector("i");

                if (
                    favoriteButton.classList.contains("active")
                ) {

                    icon.classList.remove("fa-regular");
                    icon.classList.add("fa-solid");

                } else {

                    icon.classList.remove("fa-solid");
                    icon.classList.add("fa-regular");

                }

            }
        );


        /* -----------------------------
           RENT NOW BUTTON
        ----------------------------- */

        const bookingButton =
            card.querySelector("[data-booking-id]");


        bookingButton?.addEventListener(
            "click",
            () => {

                openBookingModal(item.id);

            }
        );


        /* -----------------------------
           VIEW DETAILS BUTTON
           
           Full details page will be
           connected in STEP 3.
        ----------------------------- */

        const detailsButton =
            card.querySelector(".listing-details-btn");


        detailsButton?.addEventListener(
            "click",
            () => {

                if (
                    typeof window.openListingDetails ===
                    "function"
                ) {

                    window.openListingDetails(item.id);

                } else {

                    console.log(
                        "Listing details page will be connected in Step 3:",
                        item.id
                    );

                }

            }
        );


        container.appendChild(card);

    });

}


// =====================================================
// SEARCH
// =====================================================

function filterListings() {

    const searchInput =
        document.getElementById(
            "search-input"
        );

    if (!searchInput) return;


    const query =
        searchInput.value
            .toLowerCase()
            .trim();


    const activeChip =
        document.querySelector(
            ".category-chip.active"
        );


    const activeCategory =
        activeChip
            ? activeChip.dataset.category
            : "All";


    const filtered =
        listings.filter(item => {

            const title =
                String(item.title || "")
                    .toLowerCase();

            const location =
                String(item.location || "")
                    .toLowerCase();

            const description =
                String(item.description || "")
                    .toLowerCase();

            const category =
                String(item.category || "")
                    .toLowerCase();


            const matchesSearch =
                !query ||
                title.includes(query) ||
                location.includes(query) ||
                description.includes(query) ||
                category.includes(query);


            const matchesCategory =
                activeCategory === "All" ||
                item.category === activeCategory;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    renderListings(filtered);

    updateMapMarkers(filtered);

}


// =====================================================
// VOICE SEARCH
// =====================================================

function setupVoiceSearch() {

    const micBtn =
        document.getElementById("mic-btn");

    const searchInput =
        document.getElementById("search-input");

    if (
        !micBtn ||
        !searchInput
    ) {
        return;
    }


    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        micBtn.style.display = "none";

        return;

    }


    const recognition =
        new SpeechRecognition();

    recognition.continuous = false;
    recognition.lang = "en-IN";


    micBtn.addEventListener(
        "click",
        () => {

            try {

                micBtn.classList.add(
                    "listening"
                );

                recognition.start();

            } catch (error) {

                console.warn(
                    "Voice recognition already running."
                );

            }

        }
    );


    recognition.onresult =
        event => {

            const transcript =
                event.results[0][0]
                    .transcript;

            searchInput.value =
                transcript;

            filterListings();

        };


    recognition.onerror =
        () => {

            micBtn.classList.remove(
                "listening"
            );

        };


    recognition.onend =
        () => {

            micBtn.classList.remove(
                "listening"
            );

        };

}


// =====================================================
// EVENT LISTENERS
// =====================================================

function setupEventListeners() {

    const searchInput =
        document.getElementById(
            "search-input"
        );


    searchInput?.addEventListener(
        "input",
        filterListings
    );


    searchInput?.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                filterListings();

            }

        }
    );


    document
        .querySelectorAll(".category-chip")
        .forEach(chip => {

            chip.addEventListener(
                "click",
                event => {

                    document
                        .querySelectorAll(
                            ".category-chip"
                        )
                        .forEach(c =>
                            c.classList.remove(
                                "active"
                            )
                        );

                    event.currentTarget
                        .classList.add("active");

                    filterListings();

                }
            );

        });


    const authNavBtn =
        document.getElementById(
            "auth-nav-btn"
        );


    authNavBtn?.addEventListener(
        "click",
        () => {

            document
                .getElementById("auth-modal")
                ?.classList.remove("hidden");

        }
    );


    const listItemNavBtn =
        document.getElementById(
            "list-item-nav-btn"
        );


    listItemNavBtn?.addEventListener(
        "click",
        openListItemModal
    );


    document
        .querySelectorAll(".close-modal")
        .forEach(button => {

            button.addEventListener(
                "click",
                closeAllModals
            );

        });


    document
        .querySelectorAll(".modal")
        .forEach(modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {
                        modal.classList.add(
                            "hidden"
                        );
                    }

                }
            );

        });


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {
                closeAllModals();
            }

        }
    );


    setupAuthentication();

    setupListingForm();

    setupBooking();

}


// =====================================================
// CLOSE MODALS
// =====================================================

function closeAllModals() {

    document
        .querySelectorAll(".modal")
        .forEach(modal =>
            modal.classList.add("hidden")
        );

}


// =====================================================
// AUTHENTICATION
// =====================================================

function setupAuthentication() {

    let isRegistering = false;

    const toggleBtn =
        document.getElementById(
            "auth-toggle-btn"
        );

    const authForm =
        document.getElementById(
            "auth-form"
        );


    toggleBtn?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            isRegistering =
                !isRegistering;


            const title =
                document.getElementById(
                    "auth-title"
                );

            const submitBtn =
                document.getElementById(
                    "auth-submit-btn"
                );

            const nameGroup =
                document.getElementById(
                    "name-group"
                );

            const phoneGroup =
                document.getElementById(
                    "phone-group"
                );


            if (title) {

                title.innerText =
                    isRegistering
                        ? "Create Flex Rent Account"
                        : "Login to Flex Rent";

            }


            if (submitBtn) {

                submitBtn.innerText =
                    isRegistering
                        ? "Create Account"
                        : "Login";

            }


            nameGroup?.classList.toggle(
                "hidden",
                !isRegistering
            );

            phoneGroup?.classList.toggle(
                "hidden",
                !isRegistering
            );

        }
    );


    if (!authForm) return;


    authForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const email =
                document
                    .getElementById("auth-email")
                    ?.value
                    .trim();


            const password =
                document
                    .getElementById("auth-password")
                    ?.value;


            if (!email || !password) {

                alert(
                    "Please enter email and password."
                );

                return;

            }


            try {

                if (isRegistering) {

                    const name =
                        document
                            .getElementById("auth-name")
                            ?.value
                            .trim() || "";


                    const phone =
                        document
                            .getElementById("auth-phone")
                            ?.value
                            .trim() || "";


                    const data =
                        await signUpUser(
                            email,
                            password,
                            name,
                            phone
                        );


                    if (data?.session) {

                        currentUser =
                            data.user;

                        await ensureUserProfile();

                        updateUIForUser();

                        document
                            .getElementById(
                                "auth-modal"
                            )
                            ?.classList.add(
                                "hidden"
                            );

                        alert(
                            "Account created successfully!"
                        );

                    } else {

                        alert(
                            "Account created. Please verify your email and then login."
                        );

                    }

                    return;

                }


                const data =
                    await signInUser(
                        email,
                        password
                    );


                if (
                    !data ||
                    !data.user
                ) {

                    throw new Error(
                        "Login failed."
                    );

                }


                currentUser =
                    data.user;

                await ensureUserProfile();

                updateUIForUser();


                document
                    .getElementById("auth-modal")
                    ?.classList.add(
                        "hidden"
                    );


                alert(
                    "Logged in successfully!"
                );


            } catch (error) {

                console.error(
                    "Authentication error:",
                    error
                );

                alert(
                    error.message ||
                    "Authentication failed."
                );

            }

        }
    );

}


// =====================================================
// GOOGLE LOGIN
// =====================================================

function setupGoogleLoginButton() {

    const button =
        document.getElementById(
            "google-login-btn"
        );

    if (!button) return;


    button.addEventListener(
        "click",
        async () => {

            try {

                const redirectUrl =
                    window.location.origin +
                    window.location.pathname;


                const {
                    error
                } =
                    await supabase.auth
                        .signInWithOAuth({
                            provider: "google",
                            options: {
                                redirectTo:
                                    redirectUrl
                            }
                        });


                if (error) {
                    throw error;
                }


            } catch (error) {

                console.error(
                    "Google login error:",
                    error
                );

                alert(
                    error.message ||
                    "Google login could not be started."
                );

            }

        }
    );

}


// =====================================================
// PHONE OTP
// =====================================================

function setupPhoneLogin() {

    const phoneButton =
        document.getElementById(
            "phone-login-btn"
        );

    const otpSection =
        document.getElementById(
            "phone-otp-section"
        );

    const verifyButton =
        document.getElementById(
            "verify-phone-otp-btn"
        );

    const resendButton =
        document.getElementById(
            "resend-phone-otp-btn"
        );

    const phoneInput =
        document.getElementById(
            "auth-phone"
        );


    if (!phoneButton) return;


    phoneButton.addEventListener(
        "click",
        async () => {

            const phone =
                phoneInput?.value.trim() || "";


            if (!phone) {

                alert(
                    "Please enter your phone number first."
                );

                phoneInput?.focus();

                return;

            }


            if (!phone.startsWith("+")) {

                alert(
                    "Please enter your phone number with country code.\nExample: +919876543210"
                );

                return;

            }


            try {

                phoneButton.disabled = true;

                phoneButton.innerText =
                    "Sending OTP...";


                const {
                    error
                } =
                    await supabase.auth
                        .signInWithOtp({
                            phone
                        });


                if (error) {
                    throw error;
                }


                phoneOTPNumber =
                    phone;


                otpSection?.classList.remove(
                    "hidden"
                );


                alert(
                    "OTP sent successfully."
                );


            } catch (error) {

                console.error(
                    "Phone OTP error:",
                    error
                );

                alert(
                    "OTP could not be sent: " +
                    error.message
                );

            } finally {

                phoneButton.disabled = false;

                phoneButton.innerHTML =
                    `<i class="fa-solid fa-mobile-screen-button"></i>
                    Continue with Phone`;

            }

        }
    );


    verifyButton?.addEventListener(
        "click",
        async () => {

            const otp =
                document
                    .getElementById("phone-otp")
                    ?.value
                    .trim() || "";


            if (!phoneOTPNumber) {

                alert(
                    "Please request OTP first."
                );

                return;

            }


            if (!otp) {

                alert(
                    "Please enter OTP."
                );

                return;

            }


            try {

                verifyButton.disabled = true;

                verifyButton.innerText =
                    "Verifying...";


                const {
                    data,
                    error
                } =
                    await supabase.auth
                        .verifyOtp({
                            phone:
                                phoneOTPNumber,
                            token:
                                otp,
                            type:
                                "sms"
                        });


                if (error) {
                    throw error;
                }


                if (!data?.user) {

                    throw new Error(
                        "Phone verification failed."
                    );

                }


                currentUser =
                    data.user;

                await ensureUserProfile();

                updateUIForUser();


                document
                    .getElementById(
                        "auth-modal"
                    )
                    ?.classList.add(
                        "hidden"
                    );


                alert(
                    "Phone login successful!"
                );


            } catch (error) {

                console.error(
                    "OTP verification error:",
                    error
                );

                alert(
                    "OTP verification failed: " +
                    error.message
                );

            } finally {

                verifyButton.disabled = false;

                verifyButton.innerText =
                    "Verify OTP";

            }

        }
    );


    resendButton?.addEventListener(
        "click",
        async () => {

            if (!phoneOTPNumber) {

                alert(
                    "Please enter your phone number first."
                );

                return;

            }


            try {

                resendButton.disabled = true;

                resendButton.innerText =
                    "Sending...";


                const {
                    error
                } =
                    await supabase.auth
                        .signInWithOtp({
                            phone:
                                phoneOTPNumber
                        });


                if (error) {
                    throw error;
                }


                alert(
                    "New OTP has been sent."
                );


            } catch (error) {

                alert(
                    "Could not resend OTP: " +
                    error.message
                );

            } finally {

                resendButton.disabled = false;

                resendButton.innerText =
                    "Resend OTP";

            }

        }
    );

}


// =====================================================
// PROFILE
// =====================================================

async function ensureUserProfile() {

    if (!currentUser) return;


    try {

        const profile =
            await fetchUserProfile(
                currentUser.id
            );


        if (profile) {

            currentUserProfile =
                profile;

            return;

        }


        const metadata =
            currentUser.user_metadata || {};


        const fullName =
            metadata.full_name ||
            metadata.name ||
            currentUser.email
                ?.split("@")[0] ||
            "Flex Rent User";


        const phone =
            metadata.phone || "";


        const {
            data,
            error
        } =
            await supabase
                .from("profiles")
                .upsert(
                    {
                        id:
                            currentUser.id,
                        email:
                            currentUser.email || "",
                        full_name:
                            fullName,
                        phone
                    },
                    {
                        onConflict:
                            "id"
                    }
                )
                .select()
                .maybeSingle();


        if (error) {

            console.warn(
                "Profile creation failed:",
                error
            );

            return;

        }


        currentUserProfile =
            data;

    } catch (error) {

        console.warn(
            "Profile check failed:",
            error
        );

    }

}


// =====================================================
// SESSION
// =====================================================

async function checkSession() {

    try {

        const {
            data
        } =
            await supabase.auth
                .getSession();


        if (
            data?.session?.user
        ) {

            currentUser =
                data.session.user;

            await ensureUserProfile();

            updateUIForUser();

        } else {

            currentUser = null;

            updateUIForUser();

        }

    } catch (error) {

        console.error(
            "Session check failed:",
            error
        );

    }


    supabase.auth.onAuthStateChange(
        async (event, session) => {

            if (session?.user) {

                currentUser =
                    session.user;

                await ensureUserProfile();

                updateUIForUser();

            } else {

                currentUser = null;

                currentUserProfile = null;

                updateUIForUser();

            }

        }
    );

}


// =====================================================
// UPDATE USER UI
// =====================================================

function updateUIForUser() {

    const authButton =
        document.getElementById(
            "auth-nav-btn"
        );

    const dashboardButton =
        document.getElementById(
            "dashboard-nav-btn"
        );


    if (currentUser) {

        authButton?.classList.add(
            "hidden"
        );

        dashboardButton?.classList.remove(
            "hidden"
        );

    } else {

        authButton?.classList.remove(
            "hidden"
        );

        dashboardButton?.classList.add(
            "hidden"
        );

    }

}


// =====================================================
// DASHBOARD
// =====================================================

function setupDashboard() {

    const dashboardButton =
        document.getElementById(
            "dashboard-nav-btn"
        );

    const dashboardSection =
        document.getElementById(
            "dashboard-section"
        );

    const logoutButton =
        document.getElementById(
            "logout-btn"
        );


    dashboardButton?.addEventListener(
        "click",
        async () => {

            if (!currentUser) {

                alert(
                    "Please login first."
                );

                return;

            }


            dashboardSection
                ?.classList.remove(
                    "hidden"
                );


            document
                .querySelector(".marketplace")
                ?.classList.add(
                    "hidden"
                );


            await loadDashboard();


            dashboardSection?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );


    logoutButton?.addEventListener(
        "click",
        async () => {

            try {

                await signOutUser();

                currentUser = null;
                currentUserProfile = null;

                updateUIForUser();


                dashboardSection
                    ?.classList.add(
                        "hidden"
                    );


                document
                    .querySelector(".marketplace")
                    ?.classList.remove(
                        "hidden"
                    );


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });


                alert(
                    "Logged out successfully."
                );


            } catch (error) {

                alert(
                    error.message ||
                    "Logout failed."
                );

            }

        }
    );


    setupDashboardTabs();

}


// =====================================================
// DASHBOARD TABS
// =====================================================

function setupDashboardTabs() {

    document
        .querySelectorAll(".tab-btn")
        .forEach(tab => {

            tab.addEventListener(
                "click",
                async () => {

                    document
                        .querySelectorAll(
                            ".tab-btn"
                        )
                        .forEach(t =>
                            t.classList.remove(
                                "active"
                            )
                        );


                    tab.classList.add(
                        "active"
                    );


                    const tabId =
                        tab.dataset.tab;


                    document
                        .querySelectorAll(
                            ".tab-content"
                        )
                        .forEach(content =>
                            content.classList.add(
                                "hidden"
                            )
                        );


                    document
                        .getElementById(tabId)
                        ?.classList.remove(
                            "hidden"
                        );


                    if (
                        tabId ===
                        "tab-listings"
                    ) {
                        await loadMyListings();
                    }


                    if (
                        tabId ===
                        "tab-bookings"
                    ) {
                        await loadMyBookings();
                    }


                    if (
                        tabId ===
                        "tab-profile"
                    ) {
                        await loadProfile();
                    }

                }
            );

        });

}


// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard() {

    await loadMyListings();

    await loadProfile();

}


// =====================================================
// MY LISTINGS
// =====================================================

async function loadMyListings() {

    const container =
        document.getElementById(
            "my-listings-grid"
        );


    if (!container) return;


    if (!currentUser) {

        container.innerHTML =
            `<p>Please login first.</p>`;

        return;

    }


    container.innerHTML =
        `<p>Loading your listings...</p>`;


    try {

        const data =
            await fetchUserListings(
                currentUser.id
            );


        if (
            !data ||
            data.length === 0
        ) {

            container.innerHTML = `

                <div class="empty-state">

                    <i class="fa-solid fa-box-open"></i>

                    <p>
                        You have not listed any items yet.
                    </p>

                    <button
                        class="btn btn-primary"
                        onclick="openListItemModal()"
                    >
                        List Your First Item
                    </button>

                </div>

            `;

            return;

        }


        container.innerHTML = "";


        data
            .map(normalizeListing)
            .forEach(item => {

                const card =
                    document.createElement("div");

                card.className = "card";


                card.innerHTML = `

                    <img
                        src="${escapeAttribute(
                            item.image_url ||
                            "https://via.placeholder.com/600x400?text=No+Image"
                        )}"
                        alt="${escapeAttribute(item.title)}"
                    >

                    <div class="card-body">

                        <span class="card-category">
                            ${escapeHTML(item.category)}
                        </span>

                        <h3 class="card-title">
                            ${escapeHTML(item.title)}
                        </h3>

                        <p class="card-location">

                            <i class="fa-solid fa-location-dot"></i>

                            ${escapeHTML(item.location)}

                        </p>

                        <div class="card-price">

                            ${formatINR(item.price_per_day)}

                            <small>/ day</small>

                        </div>

                        <p style="
                            color:${item.available !== false ? "#10B981" : "#EF4444"};
                            font-size:.85rem;
                        ">

                            <i class="fa-solid fa-circle"></i>

                            ${
                                item.available !== false
                                    ? " Available"
                                    : " Unavailable"
                            }

                        </p>

                    </div>

                `;


                container.appendChild(card);

            });


    } catch (error) {

        console.error(
            "My listings error:",
            error
        );


        container.innerHTML = `

            <div class="empty-state">

                <p>
                    Could not load your listings.
                </p>

                <small>
                    ${escapeHTML(error.message || "")}
                </small>

            </div>

        `;

    }

}


// =====================================================
// MY BOOKINGS
// =====================================================

async function loadMyBookings() {

    const container =
        document.getElementById(
            "my-bookings-list"
        );


    if (!container) return;


    if (!currentUser) {

        container.innerHTML =
            `<p>Please login first.</p>`;

        return;

    }


    container.innerHTML =
        `<p>Loading your bookings...</p>`;


    try {

        const bookings =
            await fetchUserBookings(
                currentUser.id
            );


        if (
            !bookings ||
            bookings.length === 0
        ) {

            container.innerHTML = `

                <div class="empty-state">

                    <i class="fa-solid fa-calendar-xmark"></i>

                    <p>
                        You have no bookings yet.
                    </p>

                </div>

            `;

            return;

        }


        container.innerHTML = "";


        bookings.forEach(booking => {

            const card =
                document.createElement("div");

            card.className =
                "booking-card";


            card.innerHTML = `

                <h3>
                    ${escapeHTML(
                        booking.item_name ||
                        "Rental Item"
                    )}
                </h3>

                <p>
                    <strong>Start Date:</strong>
                    ${escapeHTML(
                        booking.start_date || "-"
                    )}
                </p>

                <p>
                    <strong>Duration:</strong>
                    ${booking.rental_days || 1}
                    day(s)
                </p>

                <p>
                    <strong>Total:</strong>
                    ${formatINR(
                        booking.total_amount || 0
                    )}
                </p>

                <p>
                    <strong>Payment:</strong>
                    ${escapeHTML(
                        booking.payment_method || "-"
                    )}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${escapeHTML(
                        booking.status || "pending"
                    )}
                </p>

            `;


            container.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Bookings error:",
            error
        );


        container.innerHTML = `

            <div class="empty-state">

                <p>
                    Could not load your bookings.
                </p>

            </div>

        `;

    }

}


// =====================================================
// PROFILE
// =====================================================

async function loadProfile() {

    const container =
        document.getElementById(
            "profile-info"
        );


    if (!container) return;


    if (!currentUser) {

        container.innerHTML =
            `<p>Please login first.</p>`;

        return;

    }


    try {

        if (!currentUserProfile) {
            await ensureUserProfile();
        }


        const profile =
            currentUserProfile;


        container.innerHTML = `

            <h3>

                <i class="fa-solid fa-user"></i>

                Profile Information

            </h3>

            <br>

            <p>
                <strong>Name:</strong>
                ${escapeHTML(
                    profile?.full_name ||
                    "Not provided"
                )}
            </p>

            <p>
                <strong>Email:</strong>
                ${escapeHTML(
                    currentUser.email || ""
                )}
            </p>

            <p>
                <strong>Phone:</strong>
                ${escapeHTML(
                    profile?.phone ||
                    "Not provided"
                )}
            </p>

            <p>
                <strong>Account ID:</strong>
                ${escapeHTML(
                    currentUser.id
                )}
            </p>

        `;

    } catch (error) {

        container.innerHTML =
            `<p>Could not load profile.</p>`;

    }

}


// =====================================================
// OPEN LIST ITEM MODAL
// =====================================================

window.openListItemModal =
    function () {

        if (!currentUser) {

            alert(
                "Please login first."
            );

            document
                .getElementById("auth-modal")
                ?.classList.remove(
                    "hidden"
                );

            return;

        }


        const modal =
            document.getElementById(
                "list-item-modal"
            );


        if (selectedLocation) {

            applyListingLocation(
                selectedLocation
            );

        }


        modal?.classList.remove(
            "hidden"
        );

    };


// =====================================================
// LISTING FORM
// =====================================================

function setupListingForm() {

    const listingForm =
        document.getElementById(
            "listing-form"
        );


    if (!listingForm) return;


    listingForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!currentUser) {

                alert(
                    "Please login first."
                );

                return;

            }


            try {

                const imageInput =
                    document.getElementById(
                        "item-image"
                    );


                const imageFile =
                    imageInput?.files?.[0];


                if (!imageFile) {

                    throw new Error(
                        "Please select an image."
                    );

                }


                const title =
                    document
                        .getElementById("item-title")
                        ?.value
                        .trim();


                const category =
                    document
                        .getElementById("item-category")
                        ?.value;


                const price =
                    parseFloat(
                        document
                            .getElementById("item-price")
                            ?.value
                    );


                const locationInput =
                    document.getElementById(
                        "item-location"
                    );


                let location =
                    locationInput?.value.trim() ||
                    "";


                const description =
                    document
                        .getElementById(
                            "item-description"
                        )
                        ?.value
                        .trim() || "";


                if (!title) {
                    throw new Error(
                        "Please enter item name."
                    );
                }


                if (
                    !Number.isFinite(price) ||
                    price <= 0
                ) {
                    throw new Error(
                        "Please enter a valid price."
                    );
                }


                if (
                    selectedListingLocation
                        ?.display
                ) {

                    location =
                        selectedListingLocation.display;

                }


                if (!location) {

                    throw new Error(
                        "Please select the item location."
                    );

                }


                alert(
                    "Uploading image..."
                );


                const imageUrl =
                    await uploadListingImage(
                        imageFile
                    );


                let coordinates = null;


                if (
                    selectedListingLocation &&
                    Number.isFinite(
                        Number(
                            selectedListingLocation.lat
                        )
                    ) &&
                    Number.isFinite(
                        Number(
                            selectedListingLocation.lng
                        )
                    )
                ) {

                    coordinates = {

                        lat:
                            Number(
                                selectedListingLocation.lat
                            ),

                        lng:
                            Number(
                                selectedListingLocation.lng
                            )

                    };

                } else {

                    coordinates =
                        await getCurrentLocation();

                }


                const listingData = {

                    owner_id:
                        currentUser.id,

                    name:
                        title,

                    category:
                        category,

                    price:
                        price,

                    location:
                        location,

                    latitude:
                        coordinates?.lat ??
                        null,

                    longitude:
                        coordinates?.lng ??
                        null,

                    image_url:
                        imageUrl,

                    description:
                        description,

                    is_available:
                        true

                };


                const created =
                    await createListing(
                        listingData
                    );


                const normalized =
                    normalizeListing(
                        created
                    );


                listings.unshift(
                    normalized
                );


                renderListings(
                    listings
                );

                updateMapMarkers(
                    listings
                );


                document
                    .getElementById(
                        "list-item-modal"
                    )
                    ?.classList.add(
                        "hidden"
                    );


                listingForm.reset();

                selectedListingLocation =
                    null;


                const locationText =
                    document.getElementById(
                        "listing-location-text"
                    );


                if (locationText) {

                    locationText.innerText =
                        "Select where this item is available";

                }


                alert(
                    "Item published successfully!"
                );


            } catch (error) {

                console.error(
                    "Listing error:",
                    error
                );


                alert(
                    error.message ||
                    "Failed to publish listing."
                );

            }

        }
    );

}


// =====================================================
// GPS
// =====================================================

function getCurrentLocation() {

    return new Promise(resolve => {

        if (!navigator.geolocation) {

            resolve(null);

            return;

        }


        navigator.geolocation.getCurrentPosition(

            position => {

                resolve({

                    lat:
                        position.coords.latitude,

                    lng:
                        position.coords.longitude,

                    accuracy:
                        position.coords.accuracy

                });

            },

            error => {

                console.warn(
                    "Location permission error:",
                    error.message
                );

                resolve(null);

            },

            {
                enableHighAccuracy:
                    true,

                timeout:
                    15000,

                maximumAge:
                    0
            }

        );

    });

}


// =====================================================
// REVERSE GEOCODING
// =====================================================

async function reverseGeocode(
    lat,
    lng
) {

    try {

        const response =
            await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`
            );


        if (!response.ok) {
            throw new Error(
                "Unable to find address."
            );
        }


        const data =
            await response.json();


        const address =
            data.address || {};


        const parts = [

            address.house_number,

            address.road,

            address.neighbourhood,

            address.suburb,

            address.city ||
            address.town ||
            address.village,

            address.state,

            address.postcode

        ].filter(Boolean);


        return {

            display:
                parts.length
                    ? parts.join(", ")
                    : data.display_name ||
                      `${lat}, ${lng}`,

            lat:
                Number(lat),

            lng:
                Number(lng),

            raw:
                data

        };

    } catch (error) {

        console.warn(
            "Reverse geocoding failed:",
            error
        );


        return {

            display:
                `Current Location (${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)})`,

            lat:
                Number(lat),

            lng:
                Number(lng)

        };

    }

}


// =====================================================
// LOCATION SYSTEM
// =====================================================

function setupLocationSystem() {

    const selectorButton =
        document.getElementById(
            "location-selector-btn"
        );


    const changeLocationButton =
        document.getElementById(
            "change-location-btn"
        );


    const currentLocationButton =
        document.getElementById(
            "use-current-location-btn"
        );


    const addAddressButton =
        document.getElementById(
            "add-new-address-btn"
        );


    const saveAddressForm =
        document.getElementById(
            "address-form"
        );


    const listingLocationButton =
        document.getElementById(
            "select-listing-location-btn"
        );


    selectorButton?.addEventListener(
        "click",
        () => openLocationModal()
    );


    changeLocationButton?.addEventListener(
        "click",
        () => openLocationModal()
    );


    currentLocationButton?.addEventListener(
        "click",
        useMyCurrentLocation
    );


    addAddressButton?.addEventListener(
        "click",
        openAddressForm
    );


    saveAddressForm?.addEventListener(
        "submit",
        saveNewAddress
    );


    document
        .querySelectorAll(
            ".address-type-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".address-type-btn"
                        )
                        .forEach(btn =>
                            btn.classList.remove(
                                "active"
                            )
                        );


                    button.classList.add(
                        "active"
                    );


                    const typeInput =
                        document.getElementById(
                            "address-type"
                        );


                    if (typeInput) {

                        typeInput.value =
                            button.dataset.addressType ||
                            button.dataset.type ||
                            "Home";

                    }

                }
            );

        });


    listingLocationButton?.addEventListener(
        "click",
        () => {

            if (!currentUser) {

                alert(
                    "Please login first."
                );

                return;

            }

            openLocationModal(true);

        }
    );


    document
        .getElementById(
            "marketplace-explore-btn"
        )
        ?.addEventListener(
            "click",
            () => {

                document
                    .querySelector(
                        ".marketplace"
                    )
                    ?.scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "start"
                    });

            }
        );

}


// =====================================================
// OPEN LOCATION MODAL
// =====================================================

function openLocationModal(
    forListing = false
) {

    const modal =
        document.getElementById(
            "location-modal"
        );


    if (!modal) return;


    modal.dataset.forListing =
        forListing
            ? "true"
            : "false";


    renderSavedAddresses();

    modal.classList.remove(
        "hidden"
    );

}


// =====================================================
// ADDRESS FORM
// =====================================================

function openAddressForm() {

    document
        .getElementById(
            "location-modal"
        )
        ?.classList.add(
            "hidden"
        );


    document
        .getElementById(
            "address-form-modal"
        )
        ?.classList.remove(
            "hidden"
        );

}


// =====================================================
// USE CURRENT LOCATION
// =====================================================

async function useMyCurrentLocation() {

    const button =
        document.getElementById(
            "use-current-location-btn"
        );


    if (!button) return;


    try {

        button.disabled = true;


        button.innerHTML = `

            <div class="current-location-icon">

                <i class="fa-solid fa-spinner fa-spin"></i>

            </div>

            <div class="current-location-text">

                <strong>
                    Detecting location...
                </strong>

                <span>
                    Please allow location access.
                </span>

            </div>

        `;


        const coordinates =
            await getCurrentLocation();


        if (!coordinates) {

            throw new Error(
                "Current location could not be detected. Please allow location permission or add an address manually."
            );

        }


        const location =
            await reverseGeocode(
                coordinates.lat,
                coordinates.lng
            );


        const locationData = {

            id:
                "current-" +
                Date.now(),

            type:
                "Current Location",

            name:
                "Current Location",

            display:
                location.display,

            lat:
                location.lat,

            lng:
                location.lng,

            accuracy:
                coordinates.accuracy,

            isCurrent:
                true

        };


        selectLocation(
            locationData
        );


        const locationModal =
            document.getElementById(
                "location-modal"
            );


        const forListing =
            locationModal?.dataset.forListing ===
            "true";


        if (forListing) {

            applyListingLocation(
                locationData
            );

        }


        locationModal?.classList.add(
            "hidden"
        );


        const accuracyText =
            coordinates.accuracy
                ? ` GPS accuracy: approximately ${Math.round(coordinates.accuracy)} m.`
                : "";


        showToast(
            "Current location selected." +
            accuracyText,
            "success"
        );


    } catch (error) {

        console.error(
            "Current location error:",
            error
        );


        showToast(
            error.message ||
            "Could not detect your location.",
            "error"
        );

    } finally {

        button.disabled = false;


        button.innerHTML = `

            <div class="current-location-icon">

                <i class="fa-solid fa-location-crosshairs"></i>

            </div>

            <div class="current-location-text">

                <strong>
                    Use My Current Location
                </strong>

                <span>
                    Automatically detect your location using GPS
                </span>

            </div>

            <i class="fa-solid fa-chevron-right"></i>

        `;

    }

}


// =====================================================
// SELECT LOCATION
// =====================================================

function selectLocation(location) {

    if (!location) return;


    selectedLocation =
        location;


    localStorage.setItem(
        "flexRentSelectedLocation",
        JSON.stringify(location)
    );


    updateLocationUI(
        location
    );


    if (
        Number.isFinite(
            Number(location.lat)
        ) &&
        Number.isFinite(
            Number(location.lng)
        )
    ) {

        focusMapOnLocation(
            Number(location.lat),
            Number(location.lng)
        );

    }


    renderListings(
        listings
    );

}


// =====================================================
// LOCATION UI
// =====================================================

function updateLocationUI(location) {

    if (!location) return;


    const shortText =
        getShortLocationName(
            location
        );


    document
        .getElementById(
            "selected-location-text"
        )
        ?.replaceChildren(
            document.createTextNode(
                shortText
            )
        );


    document
        .getElementById(
            "location-summary-text"
        )
        ?.replaceChildren(
            document.createTextNode(
                location.display ||
                shortText
            )
        );


    updateListingLocationText(
        location
    );

}


// =====================================================
// SHORT LOCATION
// =====================================================

function getShortLocationName(location) {

    if (!location) {
        return "Select your location";
    }


    if (
        location.name &&
        location.name !==
            "Current Location"
    ) {
        return location.name;
    }


    const display =
        location.display || "";


    const parts =
        display
            .split(",")
            .map(x => x.trim())
            .filter(Boolean);


    if (parts.length >= 2) {

        return parts
            .slice(-2)
            .join(", ");

    }


    return display ||
        "Selected location";

}


// =====================================================
// LISTING LOCATION UI
// =====================================================

function updateListingLocationText(location) {

    const text =
        document.getElementById(
            "listing-location-text"
        );


    if (!text) return;


    text.innerText =
        location?.display ||
        "Select where this item is available";

}


// =====================================================
// APPLY LISTING LOCATION
// =====================================================

function applyListingLocation(location) {

    if (!location) return;


    selectedListingLocation =
        location;


    const input =
        document.getElementById(
            "item-location"
        );


    if (input) {

        input.value =
            location.display || "";

    }


    updateListingLocationText(
        location
    );

}


// =====================================================
// MAP LOCATION
// =====================================================

function focusMapOnLocation(
    lat,
    lng
) {

    if (!map) return;


    try {

        map.setView(
            [lat, lng],
            13,
            {
                animate: true
            }
        );


        if (selectedLocationMarker) {

            try {
                map.removeLayer(
                    selectedLocationMarker
                );
            } catch (error) {}

        }


        selectedLocationMarker =
            L.circleMarker(
                [lat, lng],
                {
                    radius: 9
                }
            )
                .addTo(map)
                .bindPopup(
                    "Your selected location"
                );

    } catch (error) {

        console.warn(
            "Map location error:",
            error
        );

    }

}


// =====================================================
// SAVED ADDRESSES
// =====================================================

function getSavedAddresses() {

    try {

        const saved =
            localStorage.getItem(
                "flexRentSavedAddresses"
            );


        if (!saved) return [];


        const parsed =
            JSON.parse(saved);


        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.warn(
            "Saved address read error:",
            error
        );

        return [];

    }

}


function saveAddresses(addresses) {

    try {

        localStorage.setItem(
            "flexRentSavedAddresses",
            JSON.stringify(addresses)
        );

    } catch (error) {

        console.warn(
            "Saved address write error:",
            error
        );

    }

}


// =====================================================
// MIGRATE OLD ADDRESS KEY
// =====================================================

function migrateOldAddresses() {

    try {

        const correctKey =
            "flexRentSavedAddresses";

        const oldKey =
            "flexRentAddresses";


        const existing =
            localStorage.getItem(
                correctKey
            );


        if (existing) return;


        const old =
            localStorage.getItem(
                oldKey
            );


        if (old) {

            localStorage.setItem(
                correctKey,
                old
            );

        }

    } catch (error) {

        console.warn(
            "Address migration failed:",
            error
        );

    }

}


// =====================================================
// RENDER SAVED ADDRESSES
// =====================================================

function renderSavedAddresses() {

    migrateOldAddresses();


    const container =
        document.getElementById(
            "saved-addresses-list"
        );


    const count =
        document.getElementById(
            "saved-address-count"
        );


    if (!container) return;


    const addresses =
        getSavedAddresses();


    if (count) {

        count.innerText =
            `${addresses.length} saved`;

    }


    if (addresses.length === 0) {

        container.innerHTML = `

            <div class="no-saved-address">

                <i class="fa-regular fa-address-book"></i>

                <p>
                    No saved addresses yet
                </p>

                <small>
                    Add an address to quickly select it later.
                </small>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    addresses.forEach(address => {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "saved-address-card";


        const icon =
            address.type === "College"
                ? "fa-solid fa-graduation-cap"
                : address.type === "Other"
                    ? "fa-solid fa-location-dot"
                    : "fa-solid fa-house";


        card.innerHTML = `

            <div class="saved-address-icon">

                <i class="${icon}"></i>

            </div>

            <div class="saved-address-info">

                <strong>
                    ${escapeHTML(
                        address.name ||
                        address.type ||
                        "Address"
                    )}
                </strong>

                <span class="saved-address-badge">

                    ${escapeHTML(
                        address.type ||
                        "Other"
                    )}

                </span>

                <p>
                    ${escapeHTML(
                        address.display || ""
                    )}
                </p>

            </div>

            <div>

                <button
                    type="button"
                    class="btn btn-primary"
                >
                    Select
                </button>

            </div>

        `;


        card
            .querySelector("button")
            ?.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    selectLocation(
                        address
                    );


                    const modal =
                        document.getElementById(
                            "location-modal"
                        );


                    const forListing =
                        modal?.dataset.forListing ===
                        "true";


                    if (forListing) {

                        applyListingLocation(
                            address
                        );

                    }


                    modal?.classList.add(
                        "hidden"
                    );


                    showToast(
                        "Location selected successfully.",
                        "success"
                    );

                }
            );


        container.appendChild(
            card
        );

    });

}


// =====================================================
// SAVE NEW ADDRESS
// =====================================================

async function saveNewAddress(event) {

    if (event) {
        event.preventDefault();
    }


    const type =
        document
            .getElementById("address-type")
            ?.value ||
        "Home";


    const fullName =
        document
            .getElementById("address-full-name")
            ?.value
            .trim();


    const phone =
        document
            .getElementById("address-phone")
            ?.value
            .trim();


    const pincode =
        document
            .getElementById("address-pincode")
            ?.value
            .trim();


    const house =
        document
            .getElementById("address-house")
            ?.value
            .trim();


    const area =
        document
            .getElementById("address-area")
            ?.value
            .trim();


    const city =
        document
            .getElementById("address-city")
            ?.value
            .trim();


    const state =
        document
            .getElementById("address-state")
            ?.value
            .trim();


    const landmark =
        document
            .getElementById("address-landmark")
            ?.value
            .trim();


    if (
        !fullName ||
        !phone ||
        !pincode ||
        !house ||
        !area ||
        !city ||
        !state
    ) {

        showToast(
            "Please fill all required address fields.",
            "error"
        );

        return;

    }


    if (
        !/^\d{6}$/.test(
            pincode
        )
    ) {

        showToast(
            "Please enter a valid 6-digit PIN code.",
            "error"
        );

        return;

    }


    const saveButton =
        document.getElementById(
            "save-address-btn"
        );


    try {

        if (saveButton) {

            saveButton.disabled = true;

            saveButton.innerHTML =
                `<i class="fas fa-spinner fa-spin"></i>
                 Finding location...`;

        }


        const addressQuery = [

            house,
            area,
            landmark,
            city,
            state,
            pincode,
            "India"

        ]
            .filter(Boolean)
            .join(", ");


        const response =
            await fetch(
                `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(addressQuery)}`
            );


        if (!response.ok) {

            throw new Error(
                "Location service is currently unavailable."
            );

        }


        const results =
            await response.json();


        if (
            !Array.isArray(results) ||
            results.length === 0
        ) {

            throw new Error(
                "Location not found. Please check your address, city, state or PIN code."
            );

        }


        const result =
            results[0];


        const latitude =
            parseFloat(result.lat);


        const longitude =
            parseFloat(result.lon);


        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {

            throw new Error(
                "Invalid coordinates received."
            );

        }


        const address = {

            id:
                Date.now().toString(),

            type,

            name:
                type,

            fullName,

            phone,

            pincode,

            house,

            area,

            city,

            state,

            landmark,

            display: [

                house,
                area,
                city,
                state,
                pincode

            ]
                .filter(Boolean)
                .join(", "),

            lat:
                latitude,

            lng:
                longitude,

            formattedAddress:
                result.display_name ||
                addressQuery,

            createdAt:
                new Date().toISOString()

        };


        const savedAddresses =
            getSavedAddresses();


        savedAddresses.push(
            address
        );


        saveAddresses(
            savedAddresses
        );


        selectLocation(
            address
        );


        const locationModal =
            document.getElementById(
                "location-modal"
            );


        const forListing =
            locationModal?.dataset.forListing ===
            "true";


        if (forListing) {

            applyListingLocation(
                address
            );

        }


        document
            .getElementById(
                "address-form-modal"
            )
            ?.classList.add(
                "hidden"
            );


        locationModal?.classList.add(
            "hidden"
        );


        document
            .getElementById(
                "address-form"
            )
            ?.reset();


        const typeInput =
            document.getElementById(
                "address-type"
            );


        if (typeInput) {
            typeInput.value = "Home";
        }


        document
            .querySelectorAll(
                ".address-type-btn"
            )
            .forEach(button =>
                button.classList.remove(
                    "active"
                )
            );


        const homeButton =
            document.querySelector(
                '.address-type-btn[data-address-type="Home"], .address-type-btn[data-type="Home"]'
            );


        homeButton?.classList.add(
            "active"
        );


        renderSavedAddresses();


        focusMapOnLocation(
            latitude,
            longitude
        );


        showToast(
            "Address saved with accurate location!",
            "success"
        );


    } catch (error) {

        console.error(
            "Address geocoding error:",
            error
        );


        showToast(
            error.message ||
            "Could not find this location.",
            "error"
        );


    } finally {

        if (saveButton) {

            saveButton.disabled = false;

            saveButton.innerHTML =
                "Save Address";

        }

    }

}


// =====================================================
// LOAD SAVED LOCATION
// =====================================================

function loadSavedLocation() {

    try {

        migrateOldAddresses();


        const saved =
            localStorage.getItem(
                "flexRentSelectedLocation"
            );


        if (!saved) return;


        const location =
            JSON.parse(saved);


        if (!location) return;


        selectedLocation =
            location;


        updateLocationUI(
            location
        );


        if (
            Number.isFinite(
                Number(location.lat)
            ) &&
            Number.isFinite(
                Number(location.lng)
            )
        ) {

            setTimeout(
                () => {

                    focusMapOnLocation(
                        Number(location.lat),
                        Number(location.lng)
                    );

                    renderListings(
                        listings
                    );

                },
                500
            );

        }

    } catch (error) {

        console.warn(
            "Could not load saved location:",
            error
        );

    }

}


// =====================================================
// HERO CONTROLS
// =====================================================

function setupHeroControls() {

    const heroInput =
        document.getElementById(
            "hero-search-input"
        );


    const heroButton =
        document.getElementById(
            "hero-search-btn"
        );


    function performHeroSearch() {

        if (!heroInput) return;


        const query =
            heroInput.value.trim();


        const mainSearch =
            document.getElementById(
                "search-input"
            );


        if (mainSearch) {

            mainSearch.value =
                query;

        }


        filterListings();


        document
            .querySelector(".marketplace")
            ?.scrollIntoView({
                behavior:
                    "smooth",
                block:
                    "start"
            });

    }


    heroButton?.addEventListener(
        "click",
        performHeroSearch
    );


    heroInput?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                performHeroSearch();

            }

        }
    );


    document
        .getElementById(
            "hero-explore-btn"
        )
        ?.addEventListener(
            "click",
            () => {

                document
                    .querySelector(
                        ".marketplace"
                    )
                    ?.scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "start"
                    });

            }
        );


    document
        .getElementById(
            "hero-list-item-btn"
        )
        ?.addEventListener(
            "click",
            openListItemModal
        );

}


// =====================================================
// QUICK CATEGORY
// =====================================================

function setupQuickCategoryCards() {

    document
        .querySelectorAll(
            ".category-showcase-card"
        )
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const category =
                        card.dataset.category;


                    if (!category) return;


                    document
                        .querySelectorAll(
                            ".category-chip"
                        )
                        .forEach(chip => {

                            chip.classList.remove(
                                "active"
                            );


                            if (
                                String(
                                    chip.dataset.category
                                )
                                    .toLowerCase() ===
                                String(category)
                                    .toLowerCase()
                            ) {

                                chip.classList.add(
                                    "active"
                                );

                            }

                        });


                    filterListings();


                    document
                        .querySelector(
                            ".marketplace"
                        )
                        ?.scrollIntoView({
                            behavior:
                                "smooth",
                            block:
                                "start"
                        });

                }
            );

        });

}


// =====================================================
// BOOKING
// =====================================================

function setupBooking() {

    document
        .getElementById(
            "booking-days"
        )
        ?.addEventListener(
            "input",
            updateBookingSummary
        );


    document
        .querySelectorAll(
            ".pay-option"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    document
                        .querySelectorAll(
                            ".pay-option"
                        )
                        .forEach(
                            b =>
                                b.classList.remove(
                                    "active"
                                )
                        );


                    event.currentTarget
                        .classList.add(
                            "active"
                        );

                }
            );

        });


    document
        .getElementById(
            "confirm-booking-btn"
        )
        ?.addEventListener(
            "click",
            confirmBooking
        );

}


// =====================================================
// OPEN BOOKING MODAL
// =====================================================

window.openBookingModal =
    function (id) {

        selectedListingForBooking =
            listings.find(
                item =>
                    String(item.id) ===
                    String(id)
            );


        if (!selectedListingForBooking) {

            alert(
                "Listing not found."
            );

            return;

        }


        document
            .getElementById(
                "modal-item-title"
            )
            ?.replaceChildren(
                document.createTextNode(
                    selectedListingForBooking.title
                )
            );


        const locationElement =
            document.getElementById(
                "modal-item-location"
            );


        if (locationElement) {

            locationElement.innerText =
                `Location: ${selectedListingForBooking.location}`;

        }


        const priceElement =
            document.getElementById(
                "modal-item-price"
            );


        if (priceElement) {

            priceElement.innerText =
                `Price: ${formatINR(
                    selectedListingForBooking.price_per_day
                )} / day`;

        }


        const date =
            document.getElementById(
                "booking-date"
            );


        if (date) {

            date.value =
                new Date()
                    .toISOString()
                    .split("T")[0];

            date.min =
                date.value;

        }


        const days =
            document.getElementById(
                "booking-days"
            );


        if (days) {

            days.value = 1;

        }


        updateBookingSummary();


        document
            .getElementById(
                "booking-modal"
            )
            ?.classList.remove(
                "hidden"
            );

    };


// =====================================================
// BOOKING SUMMARY
// =====================================================

function updateBookingSummary() {

    if (
        !selectedListingForBooking
    ) return;


    const days =
        Math.max(
            1,
            parseInt(
                document
                    .getElementById(
                        "booking-days"
                    )
                    ?.value
            ) || 1
        );


    const price =
        Number(
            selectedListingForBooking
                .price_per_day
        ) || 0;


    const total =
        days * price;


    document
        .getElementById(
            "summary-rate"
        )
        ?.replaceChildren(
            document.createTextNode(
                formatINR(price)
            )
        );


    document
        .getElementById(
            "summary-days"
        )
        ?.replaceChildren(
            document.createTextNode(
                String(days)
            )
        );


    document
        .getElementById(
            "summary-total"
        )
        ?.replaceChildren(
            document.createTextNode(
                formatINR(total)
            )
        );

}


// =====================================================
// CONFIRM BOOKING
// =====================================================

async function confirmBooking() {

    if (!currentUser) {

        alert(
            "Please login to book an item."
        );

        document
            .getElementById(
                "auth-modal"
            )
            ?.classList.remove(
                "hidden"
            );

        return;

    }


    if (
        !selectedListingForBooking
    ) {

        alert(
            "Please select an item first."
        );

        return;

    }


    const paymentOption =
        document.querySelector(
            ".pay-option.active"
        );


    const paymentMethod =
        paymentOption?.dataset.method ||
        "UPI";


    const days =
        Math.max(
            1,
            parseInt(
                document
                    .getElementById(
                        "booking-days"
                    )
                    ?.value
            ) || 1
        );


    const total =
        days *
        Number(
            selectedListingForBooking
                .price_per_day
        );


    const startDate =
        document
            .getElementById(
                "booking-date"
            )
            ?.value;


    if (!startDate) {

        alert(
            "Please select rental start date."
        );

        return;

    }


    try {

        const bookingData = {

            listing_id:
                selectedListingForBooking.id,

            renter_id:
                currentUser.id,

            item_name:
                selectedListingForBooking.title,

            start_date:
                startDate,

            rental_days:
                days,

            total_amount:
                total,

            payment_method:
                paymentMethod,

            status:
                "pending"

        };


        const booking =
            await createBooking(
                bookingData
            );


        if (booking) {

            try {

                await createPayment({

                    user_id:
                        currentUser.id,

                    booking_id:
                        booking.id,

                    amount:
                        total,

                    payment_method:
                        paymentMethod,

                    payment_status:
                        "pending"

                });

            } catch (paymentError) {

                console.warn(
                    "Payment record error:",
                    paymentError
                );

            }

        }


        alert(
            `Booking created successfully!\n\n` +
            `Item: ${selectedListingForBooking.title}\n` +
            `Duration: ${days} day(s)\n` +
            `Total: ${formatINR(total)}\n` +
            `Payment Method: ${paymentMethod}`
        );


        document
            .getElementById(
                "booking-modal"
            )
            ?.classList.add(
                "hidden"
            );


    } catch (error) {

        console.error(
            "Booking error:",
            error
        );


        alert(
            error.message ||
            "Booking could not be saved."
        );

    }

}


// =====================================================
// FORGOT PASSWORD
// =====================================================

function setupForgotPassword() {

    const button =
        document.getElementById(
            "forgot-password-btn"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        async () => {

            const emailInput =
                document.getElementById(
                    "auth-email"
                );


            const email =
                emailInput?.value.trim() ||
                "";


            if (!email) {

                alert(
                    "Please enter your email address first."
                );

                emailInput?.focus();

                return;

            }


            try {

                button.disabled = true;

                button.textContent =
                    "Sending...";


                const {
                    error
                } =
                    await supabase.auth
                        .resetPasswordForEmail(
                            email,
                            {
                                redirectTo:
                                    window.location.origin +
                                    window.location.pathname
                            }
                        );


                if (error) {
                    throw error;
                }


                alert(
                    "Password reset link has been sent. Please check your inbox and Spam folder."
                );


            } catch (error) {

                console.error(
                    "Password reset error:",
                    error
                );


                alert(
                    "Password reset failed: " +
                    error.message
                );


            } finally {

                button.disabled = false;

                button.textContent =
                    "Forgot Password?";

            }

        }
    );

}


// =====================================================
// TOAST
// =====================================================

function showToast(
    message,
    type = "success"
) {

    let toast =
        document.getElementById(
            "flex-rent-toast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id =
            "flex-rent-toast";


        toast.style.position =
            "fixed";

        toast.style.bottom =
            "24px";

        toast.style.right =
            "24px";

        toast.style.zIndex =
            "99999";

        toast.style.maxWidth =
            "360px";

        toast.style.padding =
            "14px 18px";

        toast.style.borderRadius =
            "12px";

        toast.style.color =
            "#fff";

        toast.style.fontSize =
            "14px";

        toast.style.boxShadow =
            "0 10px 30px rgba(0,0,0,.2)";


        document.body.appendChild(
            toast
        );

    }


    toast.style.background =
        type === "error"
            ? "#DC2626"
            : "#059669";


    toast.textContent =
        message;


    toast.style.display =
        "block";


    clearTimeout(
        toast._timer
    );


    toast._timer =
        setTimeout(
            () => {
                toast.style.display =
                    "none";
            },
            3500
        );

}


// =====================================================
// SECURITY HELPERS
// =====================================================

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /[&<>"']/g,
            char => ({

                "&":
                    "&amp;",

                "<":
                    "&lt;",

                ">":
                    "&gt;",

                '"':
                    "&quot;",

                "'":
                    "&#039;"

            })[char]
        );

}


function escapeAttribute(value) {

    return escapeHTML(value);

}


// =====================================================
// OAUTH RETURN
// =====================================================

window.addEventListener(
    "load",
    async () => {

        try {

            const {
                data
            } =
                await supabase.auth
                    .getSession();


            if (
                data?.session?.user
            ) {

                currentUser =
                    data.session.user;

                await ensureUserProfile();

                updateUIForUser();

            }

        } catch (error) {

            console.warn(
                "OAuth session check:",
                error
            );

        }

    }
);


// =====================================================
// LISTING LOCATION HELPER
// =====================================================

window.selectLocationForListing =
    function () {

        openLocationModal(
            true
        );

    };


// =====================================================
// END
// =====================================================
