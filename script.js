// ============================================================
// FLEX RENT - PROFESSIONAL SCRIPT
// Rent • Earn • Grow
// ============================================================


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let myListings = [];
let myBookings = [];

let selectedItem = null;
let selectedItemPrice = 0;

let selectedPaymentMethod = "";

let currentUser = null;

let rentalMap = null;
let userMarker = null;

let mapMarkers = [];


// ============================================================
// DEFAULT RENTAL ITEMS
// ============================================================

const rentalLocations = [

    {
        id: 1,
        name: "Engineering Books",
        category: "Everyday",
        price: 50,
        lat: 22.5726,
        lng: 88.3639,
        icon: "📚"
    },

    {
        id: 2,
        name: "Laptop",
        category: "Everyday",
        price: 500,
        lat: 22.5750,
        lng: 88.3700,
        icon: "💻"
    },

    {
        id: 3,
        name: "Drilling Machine",
        category: "Construction",
        price: 250,
        lat: 22.5680,
        lng: 88.3600,
        icon: "🛠️"
    },

    {
        id: 4,
        name: "Power Sprayer",
        category: "Agriculture",
        price: 300,
        lat: 22.5958,
        lng: 88.2636,
        icon: "🌾"
    },

    {
        id: 5,
        name: "Garden Tool Set",
        category: "Gardening",
        price: 150,
        lat: 22.5800,
        lng: 88.3550,
        icon: "🌱"
    },

    {
        id: 6,
        name: "Industrial Tool Kit",
        category: "Industrial",
        price: 400,
        lat: 22.6100,
        lng: 88.4000,
        icon: "⚙️"
    }

];


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Flex Rent loaded successfully.");

    updateDashboardStats();

    initializeProfessionalMap();

    setupSearch();

    setupKeyboardSearch();

    setupDate();

    loadSavedData();

});


// ============================================================
// SEARCH SETUP
// ============================================================

function setupSearch() {

    const searchInput =
        document.getElementById("searchInput");

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener("focus", function () {

        document.body.classList.add("search-active");

    });

    searchInput.addEventListener("blur", function () {

        document.body.classList.remove("search-active");

    });

}


// ============================================================
// KEYBOARD SEARCH
// ============================================================

function setupKeyboardSearch() {

    document.addEventListener("keydown", function (event) {

        // "/" shortcut opens search

        if (
            event.key === "/" &&
            document.activeElement.tagName !== "INPUT" &&
            document.activeElement.tagName !== "TEXTAREA"
        ) {

            event.preventDefault();

            const searchInput =
                document.getElementById("searchInput");

            if (searchInput) {

                searchInput.focus();

                searchInput.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }

        }


        // Escape closes modals

        if (event.key === "Escape") {

            closeAllModals();

        }

    });

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

    const searchValue =
        input.value.toLowerCase().trim();

    const items =
        document.querySelectorAll(".item-card");

    const noResults =
        document.getElementById("noResults");

    let found = false;


    items.forEach(function (item) {

        const text =
            item.innerText.toLowerCase();


        if (
            searchValue === "" ||
            text.includes(searchValue)
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

    let found = false;


    items.forEach(function (item) {

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


    const noResults =
        document.getElementById("noResults");


    if (noResults) {

        noResults.style.display =
            found ? "none" : "block";

    }


    const itemsSection =
        document.getElementById("items");

    if (itemsSection) {

        itemsSection.scrollIntoView({
            behavior: "smooth"
        });

    }

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
// LIST ITEM MODAL
// ============================================================

function openListForm() {

    const modal =
        document.getElementById("listModal");

    if (modal) {

        modal.style.display = "flex";

        document.body.classList.add("modal-open");

    }

}


function closeListForm() {

    const modal =
        document.getElementById("listModal");

    if (modal) {

        modal.style.display = "none";

        document.body.classList.remove("modal-open");

    }

}


// ============================================================
// SUBMIT ITEM
// ============================================================

function submitItem() {

    const name =
        getValue("itemName");

    const price =
        getValue("itemPrice");

    const location =
        getValue("itemLocation");

    const description =
        getValue("itemDescription");

    const category =
        getValue("itemCategory");


    const imageInput =
        document.getElementById("itemImage");


    if (
        !name ||
        !price ||
        !location ||
        !description
    ) {

        showMessage(
            "Please fill all item details.",
            "warning"
        );

        return;

    }


    if (
        isNaN(price) ||
        Number(price) <= 0
    ) {

        showMessage(
            "Please enter a valid price.",
            "warning"
        );

        return;

    }


    let image =
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80";


    if (
        imageInput &&
        imageInput.files &&
        imageInput.files[0]
    ) {

        image =
            URL.createObjectURL(
                imageInput.files[0]
            );

    }


    const listing = {

        id: Date.now(),

        name: name,

        price: Number(price),

        location: location,

        description: description,

        category: category || "Everyday",

        image: image,

        createdAt: new Date().toISOString()

    };


    myListings.push(listing);


    saveData();


    addListingToMarketplace(listing);


    updateDashboardStats();


    closeListForm();


    resetListingForm();


    showMessage(
        "Your item has been listed successfully!",
        "success"
    );

}


// ============================================================
// ADD LISTING TO MARKETPLACE
// ============================================================

function addListingToMarketplace(listing) {

    const container =
        document.getElementById("itemsContainer");

    if (!container) {
        return;
    }


    const card =
        document.createElement("div");


    card.className =
        "item-card";


    card.setAttribute(
        "data-category",
        listing.category
    );


    card.innerHTML = `

        <div class="item-image">

            <img
                src="${escapeHTML(listing.image)}"
                alt="${escapeHTML(listing.name)}"
            >

        </div>


        <div class="item-info">

            <span class="item-category">
                ${escapeHTML(listing.category)}
            </span>


            <h3>
                ${escapeHTML(listing.name)}
            </h3>


            <p>
                ${escapeHTML(listing.description)}
                <br>
                📍 ${escapeHTML(listing.location)}
            </p>


            <div class="item-bottom">

                <strong>
                    ₹${listing.price}/day
                </strong>


                <button
                    type="button"
                    onclick="openBooking('${escapeJS(listing.name)}', ${listing.price})"
                >
                    Rent Now
                </button>

            </div>

        </div>

    `;


    container.appendChild(card);

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


    fields.forEach(function (id) {

        const element =
            document.getElementById(id);

        if (element) {

            element.value = "";

        }

    });


    const image =
        document.getElementById("itemImage");


    if (image) {

        image.value = "";

    }

}


// ============================================================
// LOGIN
// ============================================================

function showLogin() {

    const modal =
        document.getElementById("loginModal");

    if (modal) {

        modal.style.display = "flex";

        document.body.classList.add("modal-open");

    }

}


function closeLogin() {

    const modal =
        document.getElementById("loginModal");

    if (modal) {

        modal.style.display = "none";

        document.body.classList.remove("modal-open");

    }

}


// ============================================================
// SIGNUP
// ============================================================

function showSignup() {

    closeLogin();


    const modal =
        document.getElementById("signupModal");


    if (modal) {

        modal.style.display = "flex";

        document.body.classList.add("modal-open");

    }

}


function closeSignup() {

    const modal =
        document.getElementById("signupModal");


    if (modal) {

        modal.style.display = "none";

        document.body.classList.remove("modal-open");

    }

}


// ============================================================
// LOGIN USER WITH SUPABASE
// ============================================================

async function loginUser() {

    const email =
        getValue("loginEmail");

    const password =
        document.getElementById("loginPassword")?.value || "";


    if (!email || !password) {

        showMessage(
            "Please enter email and password.",
            "warning"
        );

        return;

    }


    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        showMessage(
            "Supabase is not connected.",
            "error"
        );

        return;

    }


    try {

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (error) {

            showMessage(
                error.message,
                "error"
            );

            return;

        }


        currentUser =
            data.user;


        closeLogin();


        showMessage(
            "Login successful!",
            "success"
        );


        setTimeout(function () {

            openDashboard();

        }, 500);


    } catch (error) {

        console.error(error);

        showMessage(
            "Login failed. Please try again.",
            "error"
        );

    }

}


// ============================================================
// SIGNUP USER
// ============================================================

async function signupUser() {

    const name =
        getValue("signupName");

    const email =
        getValue("signupEmail");

    const password =
        document.getElementById("signupPassword")?.value || "";


    if (
        !name ||
        !email ||
        !password
    ) {

        showMessage(
            "Please fill all fields.",
            "warning"
        );

        return;

    }


    if (password.length < 6) {

        showMessage(
            "Password must contain at least 6 characters.",
            "warning"
        );

        return;

    }


    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        showMessage(
            "Supabase is not connected.",
            "error"
        );

        return;

    }


    try {

        const { data, error } =
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

            showMessage(
                error.message,
                "error"
            );

            return;

        }


        console.log(
            "Signup response:",
            data
        );


        closeSignup();

        showLogin();


        showMessage(
            "Account created successfully. Please login.",
            "success"
        );


    } catch (error) {

        console.error(error);

        showMessage(
            "Signup failed.",
            "error"
        );

    }

}


// ============================================================
// GOOGLE LOGIN
// ============================================================

async function googleLogin() {

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        showMessage(
            "Supabase is not connected.",
            "error"
        );

        return;

    }


    try {

        const { error } =
            await supabaseClient.auth.signInWithOAuth({

                provider: "google",

                options: {

                    redirectTo:
                        window.location.origin +
                        window.location.pathname

                }

            });


        if (error) {

            console.error(error);

            showMessage(
                error.message,
                "error"
            );

        }

    } catch (error) {

        console.error(error);

    }

}


// ============================================================
// DASHBOARD
// ============================================================

async function openDashboard() {

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        showMessage(
            "Supabase is not connected.",
            "error"
        );

        return;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getUser();


        if (error || !data.user) {

            showLogin();

            showMessage(
                "Please login first.",
                "warning"
            );

            return;

        }


        currentUser =
            data.user;


        const name =
            currentUser.user_metadata?.name ||
            currentUser.email?.split("@")[0] ||
            "Flex Rent User";


        const email =
            currentUser.email || "";


        const nameElement =
            document.getElementById(
                "dashboardUserName"
            );


        const emailElement =
            document.getElementById(
                "dashboardUserEmail"
            );


        if (nameElement) {

            nameElement.innerText =
                name;

        }


        if (emailElement) {

            emailElement.innerText =
                email;

        }


        updateDashboardStats();


        const modal =
            document.getElementById(
                "dashboardModal"
            );


        if (modal) {

            modal.style.display = "flex";

            document.body.classList.add(
                "modal-open"
            );

        }

    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to open dashboard.",
            "error"
        );

    }

}


// ============================================================
// CLOSE DASHBOARD
// ============================================================

function closeDashboard() {

    const modal =
        document.getElementById(
            "dashboardModal"
        );


    if (modal) {

        modal.style.display = "none";

        document.body.classList.remove(
            "modal-open"
        );

    }

}


// ============================================================
// DASHBOARD STATISTICS
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
// MY LISTINGS
// ============================================================

function openMyListings() {

    closeDashboard();


    displayMyListings();


    const modal =
        document.getElementById(
            "myListingsModal"
        );


    if (modal) {

        modal.style.display = "flex";

        document.body.classList.add(
            "modal-open"
        );

    }

}


function closeMyListings() {

    const modal =
        document.getElementById(
            "myListingsModal"
        );


    if (modal) {

        modal.style.display = "none";

        document.body.classList.remove(
            "modal-open"
        );

    }

}


// ============================================================
// DISPLAY MY LISTINGS
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

            <div class="empty-state">

                <div style="font-size:50px;">
                    📦
                </div>

                <h3>
                    No listings yet
                </h3>

                <p>
                    Start earning by listing your item.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    myListings.forEach(function (
        listing,
        index
    ) {

        const card =
            document.createElement("div");


        card.className =
            "my-listing-card";


        card.innerHTML = `

            <div class="my-listing-image">

                <img
                    src="${escapeHTML(listing.image)}"
                    alt="${escapeHTML(listing.name)}"
                >

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
                    ₹${listing.price}/day
                </strong>


                <br><br>


                <button
                    type="button"
                    class="dashboard-action"
                    onclick="deleteListing(${index})"
                >
                    🗑️ Delete
                </button>

            </div>

        `;


        container.appendChild(card);

    });

}


// ============================================================
// DELETE LISTING
// ============================================================

function deleteListing(index) {

    const listing =
        myListings[index];


    if (!listing) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${listing.name}"?`
        );


    if (!confirmed) {
        return;
    }


    myListings.splice(index, 1);


    saveData();


    displayMyListings();


    updateDashboardStats();


    showMessage(
        "Listing deleted.",
        "success"
    );

}


// ============================================================
// BOOKING
// ============================================================

function openBooking(
    itemName,
    price
) {

    selectedItem = itemName;

    selectedItemPrice =
        Number(price);


    const name =
        document.getElementById(
            "bookingItemName"
        );


    const itemPrice =
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


    if (itemPrice) {

        itemPrice.innerText =
            `₹${selectedItemPrice}/day`;

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

        document.body.classList.add(
            "modal-open"
        );

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

        document.body.classList.remove(
            "modal-open"
        );

    }

}


// ============================================================
// CALCULATE TOTAL
// ============================================================

function calculateTotal() {

    const daysInput =
        document.getElementById(
            "rentalDays"
        );


    if (!daysInput) {
        return;
    }


    let days =
        Number(daysInput.value);


    if (
        !days ||
        days < 1
    ) {

        days = 1;

        daysInput.value = 1;

    }


    const total =
        selectedItemPrice * days;


    const totalElement =
        document.getElementById(
            "bookingTotal"
        );


    if (totalElement) {

        totalElement.innerText =
            `₹${total}`;

    }

}


// ============================================================
// PROCEED TO PAYMENT
// ============================================================

function proceedToPayment() {

    const days =
        Number(
            document.getElementById(
                "rentalDays"
            )?.value
        );


    if (
        !days ||
        days < 1
    ) {

        showMessage(
            "Please select at least 1 day.",
            "warning"
        );

        return;

    }


    const total =
        selectedItemPrice * days;


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
            selectedItem;

    }


    if (paymentDays) {

        paymentDays.innerText =
            days === 1
                ? "1 Day"
                : `${days} Days`;

    }


    if (paymentAmount) {

        paymentAmount.innerText =
            `₹${total}`;

    }


    closeBooking();


    const modal =
        document.getElementById(
            "paymentModal"
        );


    if (modal) {

        modal.style.display = "flex";

        document.body.classList.add(
            "modal-open"
        );

    }

}


// ============================================================
// PAYMENT METHOD
// ============================================================

function selectPaymentMethod(method) {

    selectedPaymentMethod =
        method;


    const selected =
        document.getElementById(
            "selectedPayment"
        );


    if (selected) {

        selected.innerText =
            `Selected: ${method}`;

    }


    document
        .querySelectorAll(".payment-method")
        .forEach(function (button) {

            button.classList.remove(
                "selected"
            );

        });


    if (
        typeof event !== "undefined" &&
        event?.currentTarget
    ) {

        event.currentTarget.classList.add(
            "selected"
        );

    }

}


// ============================================================
// MAKE PAYMENT
// ============================================================

function makePayment() {

    if (!selectedPaymentMethod) {

        showMessage(
            "Please select a payment method.",
            "warning"
        );

        return;

    }


    const days =
        Number(
            document.getElementById(
                "rentalDays"
            )?.value || 1
        );


    const amount =
        selectedItemPrice * days;


    const booking = {

        id: Date.now(),

        item: selectedItem,

        days: days,

        amount: amount,

        method: selectedPaymentMethod,

        status: "Confirmed",

        date: new Date().toISOString()

    };


    myBookings.push(booking);


    saveData();


    updateDashboardStats();


    closePayment();


    showMessage(
        "Payment successful! Booking confirmed.",
        "success"
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

        modal.style.display = "none";

        document.body.classList.remove(
            "modal-open"
        );

    }

}


// ============================================================
// VOICE SEARCH - GOOGLE STYLE
// ============================================================

function startVoiceSearch() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        showMessage(
            "Voice search is not supported in this browser.",
            "warning"
        );

        return;

    }


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (!searchInput) {
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


    recognition.onstart =
        function () {

            searchInput.placeholder =
                "Listening...";


            searchInput.focus();

            document.body.classList.add(
                "voice-listening"
            );

        };


    recognition.onresult =
        function (event) {

            const text =
                event.results[0][0]
                    .transcript;


            searchInput.value =
                text;


            searchItems();

        };


    recognition.onerror =
        function (event) {

            console.error(
                "Voice search error:",
                event.error
            );


            showMessage(
                "Could not hear you. Please try again.",
                "warning"
            );

        };


    recognition.onend =
        function () {

            searchInput.placeholder =
                "Search for tools, books, equipment...";


            document.body.classList.remove(
                "voice-listening"
            );

        };


    try {

        recognition.start();

    } catch (error) {

        console.error(error);

    }

}


// ============================================================
// PROFESSIONAL MAP
// ============================================================

function initializeProfessionalMap() {

    if (
        typeof L === "undefined"
    ) {

        console.warn(
            "Leaflet is not loaded."
        );

        return;

    }


    const mapElement =
        document.getElementById(
            "rentalMap"
        );


    if (!mapElement) {

        console.log(
            "Map container not found."
        );

        return;

    }


    if (rentalMap) {
        return;
    }


    // WORLD VIEW

    rentalMap =
        L.map(
            "rentalMap",
            {
                worldCopyJump: true
            }
        ).setView(
            [20, 0],
            2
        );


    // OpenStreetMap

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {

            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap contributors"

        }
    ).addTo(
        rentalMap
    );


    addRentalMarkers();


    setupMapButtons();


    setTimeout(function () {

        rentalMap.invalidateSize();

    }, 500);

}


// ============================================================
// ADD MAP MARKERS
// ============================================================

function addRentalMarkers() {

    if (!rentalMap) {
        return;
    }


    rentalLocations.forEach(function (item) {

        const marker =
            L.marker([
                item.lat,
                item.lng
            ]).addTo(
                rentalMap
            );


        marker.bindPopup(`

            <div style="
                min-width:190px;
                font-family:Arial,sans-serif;
            ">

                <div style="
                    font-size:32px;
                    margin-bottom:6px;
                ">
                    ${item.icon}
                </div>


                <strong style="
                    font-size:16px;
                ">
                    ${item.name}
                </strong>


                <p style="
                    margin:7px 0;
                    color:#0f9d58;
                    font-weight:600;
                ">
                    ₹${item.price}/day
                </p>


                <button
                    onclick="openBooking('${escapeJS(item.name)}', ${item.price})"
                    style="
                        width:100%;
                        border:none;
                        padding:9px;
                        border-radius:8px;
                        background:#111827;
                        color:white;
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


// ============================================================
// USER LOCATION
// ============================================================

function findMyLocation() {

    const status =
        document.getElementById(
            "locationStatus"
        );


    if (!navigator.geolocation) {

        if (status) {

            status.innerText =
                "Location is not supported by your browser.";

        }

        return;

    }


    if (status) {

        status.innerText =
            "Finding your location...";

    }


    navigator.geolocation.getCurrentPosition(

        function (position) {

            const lat =
                position.coords.latitude;


            const lng =
                position.coords.longitude;


            showUserLocation(
                lat,
                lng
            );


            if (status) {

                status.innerText =
                    "📍 Your current location found.";

            }

        },


        function (error) {

            console.error(
                "Location error:",
                error
            );


            let message =
                "Unable to find your location.";


            if (
                error.code ===
                error.PERMISSION_DENIED
            ) {

                message =
                    "Location permission was denied. Please allow location permission in your browser.";

            }


            if (status) {

                status.innerText =
                    message;

            }


            showMessage(
                message,
                "warning"
            );

        },


        {

            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 0

        }

    );

}


// ============================================================
// SHOW USER LOCATION
// ============================================================

function showUserLocation(
    lat,
    lng
) {

    if (!rentalMap) {

        initializeProfessionalMap();

    }


    if (!rentalMap) {
        return;
    }


    if (userMarker) {

        rentalMap.removeLayer(
            userMarker
        );

    }


    userMarker =
        L.marker(
            [lat, lng]
        ).addTo(
            rentalMap
        );


    userMarker
        .bindPopup(
            "<strong>📍 You are here</strong>"
        )
        .openPopup();


    rentalMap.setView(
        [lat, lng],
        14,
        {
            animate: true
        }
    );

}


// ============================================================
// OPEN MAP
// ============================================================

function openMap() {

    const mapSection =
        document.getElementById(
            "location"
        );


    if (mapSection) {

        mapSection.scrollIntoView({
            behavior: "smooth"
        });

    }


    if (rentalMap) {

        setTimeout(function () {

            rentalMap.invalidateSize();

        }, 500);

    }

}


// ============================================================
// MAP SEARCH
// ============================================================

function searchMapItems() {

    const input =
        document.getElementById(
            "mapSearchInput"
        );


    if (!input || !rentalMap) {
        return;
    }


    const query =
        input.value
            .toLowerCase()
            .trim();


    if (!query) {

        rentalMap.setView(
            [20, 0],
            2
        );

        return;

    }


    const item =
        rentalLocations.find(
            function (location) {

                return (

                    location.name
                        .toLowerCase()
                        .includes(query)

                    ||

                    location.category
                        .toLowerCase()
                        .includes(query)

                );

            }
        );


    if (!item) {

        showMessage(
            "No rental item found.",
            "warning"
        );

        return;

    }


    rentalMap.setView(
        [item.lat, item.lng],
        16,
        {
            animate: true
        }
    );

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


    let nearest =
        null;


    let smallestDistance =
        Infinity;


    rentalLocations.forEach(
        function (item) {

            const distance =
                Math.sqrt(

                    Math.pow(
                        center.lat -
                        item.lat,
                        2
                    )

                    +

                    Math.pow(
                        center.lng -
                        item.lng,
                        2
                    )

                );


            if (
                distance <
                smallestDistance
            ) {

                smallestDistance =
                    distance;

                nearest =
                    item;

            }

        }
    );


    if (nearest) {

        showMessage(
            `Nearby item: ${nearest.name} - ₹${nearest.price}/day`,
            "success"
        );

    }

}


// ============================================================
// MAP BUTTON SETUP
// ============================================================

function setupMapButtons() {

    const openMapBtn =
        document.getElementById(
            "openMapBtn"
        );


    if (
        openMapBtn &&
        !openMapBtn.dataset.connected
    ) {

        openMapBtn.addEventListener(
            "click",
            openMap
        );


        openMapBtn.dataset.connected =
            "true";

    }

}


// ============================================================
// CALL SELLER / BUYER
// ============================================================

function callPerson(
    phoneNumber
) {

    if (!phoneNumber) {

        showMessage(
            "Phone number is not available.",
            "warning"
        );

        return;

    }


    window.location.href =
        "tel:" +
        phoneNumber;

}


// ============================================================
// DATE SETUP
// ============================================================

function setupDate() {

    const dateInput =
        document.getElementById(
            "startDate"
        );


    if (!dateInput) {
        return;
    }


    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    dateInput.min =
        `${year}-${month}-${day}`;


    if (!dateInput.value) {

        dateInput.value =
            `${year}-${month}-${day}`;

    }

}


// ============================================================
// CLOSE ALL MODALS
// ============================================================

function closeAllModals() {

    const modalIds = [

        "loginModal",
        "signupModal",
        "dashboardModal",
        "myListingsModal",
        "listModal",
        "bookingModal",
        "paymentModal"

    ];


    modalIds.forEach(
        function (id) {

            const modal =
                document.getElementById(id);


            if (modal) {

                modal.style.display =
                    "none";

            }

        }
    );


    document.body.classList.remove(
        "modal-open"
    );

}


// ============================================================
// OUTSIDE CLICK MODAL CLOSE
// ============================================================

window.addEventListener(
    "click",
    function (event) {

        if (
            event.target.classList &&
            event.target.classList.contains(
                "modal"
            )
        ) {

            event.target.style.display =
                "none";


            document.body.classList.remove(
                "modal-open"
            );

        }

    }
);


// ============================================================
// LOCAL STORAGE
// ============================================================

function saveData() {

    try {

        localStorage.setItem(
            "flexRentListings",
            JSON.stringify(
                myListings
            )
        );


        localStorage.setItem(
            "flexRentBookings",
            JSON.stringify(
                myBookings
            )
        );

    } catch (error) {

        console.error(
            "Unable to save data:",
            error
        );

    }

}


// ============================================================
// LOAD SAVED DATA
// ============================================================

function loadSavedData() {

    try {

        const savedListings =
            localStorage.getItem(
                "flexRentListings"
            );


        const savedBookings =
            localStorage.getItem(
                "flexRentBookings"
            );


        if (savedListings) {

            myListings =
                JSON.parse(
                    savedListings
                );


            myListings.forEach(
                function (listing) {

                    addListingToMarketplace(
                        listing
                    );

                }
            );

        }


        if (savedBookings) {

            myBookings =
                JSON.parse(
                    savedBookings
                );

        }


        updateDashboardStats();

    } catch (error) {

        console.error(
            "Unable to load saved data:",
            error
        );

    }

}


// ============================================================
// MESSAGE SYSTEM
// ============================================================

function showMessage(
    message,
    type = "success"
) {

    let box =
        document.getElementById(
            "flexRentToast"
        );


    if (!box) {

        box =
            document.createElement(
                "div"
            );


        box.id =
            "flexRentToast";


        box.style.position =
            "fixed";


        box.style.bottom =
            "25px";


        box.style.right =
            "25px";


        box.style.zIndex =
            "99999";


        box.style.maxWidth =
            "360px";


        box.style.padding =
            "15px 20px";


        box.style.borderRadius =
            "12px";


        box.style.background =
            "#111827";


        box.style.color =
            "#ffffff";


        box.style.boxShadow =
            "0 10px 30px rgba(0,0,0,.25)";


        box.style.fontFamily =
            "Arial,sans-serif";


        document.body.appendChild(
            box
        );

    }


    box.innerText =
        message;


    box.style.display =
        "block";


    clearTimeout(
        window.flexRentToastTimer
    );


    window.flexRentToastTimer =
        setTimeout(
            function () {

                box.style.display =
                    "none";

            },
            3500
        );

}


// ============================================================
// GET VALUE
// ============================================================

function getValue(id) {

    const element =
        document.getElementById(id);


    if (!element) {
        return "";
    }


    return element.value
        .trim();

}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// JAVASCRIPT ESCAPE
// ============================================================

function escapeJS(value) {

    return String(value)
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            '\\"'
        );

}


// ============================================================
// CONTACT SUPPORT
// ============================================================

function contactSupport() {

    showMessage(
        "Flex Rent support will be available soon.",
        "success"
    );

}


// ============================================================
// LOGOUT
// ============================================================

async function logoutUser() {

    if (
        typeof supabaseClient !== "undefined" &&
        supabaseClient
    ) {

        try {

            await supabaseClient.auth.signOut();

        } catch (error) {

            console.error(error);

        }

    }


    currentUser =
        null;


    closeAllModals();


    showMessage(
        "You have been logged out.",
        "success"
    );

}


// ============================================================
// SUPABASE AUTH STATE
// ============================================================

if (
    typeof supabaseClient !== "undefined" &&
    supabaseClient
) {

    supabaseClient.auth.onAuthStateChange(
        function (
            event,
            session
        ) {

            console.log(
                "Auth event:",
                event
            );


            if (session?.user) {

                currentUser =
                    session.user;

            } else {

                currentUser =
                    null;

            }

        }
    );

}


// ============================================================
// END OF FLEX RENT SCRIPT
// ============================================================

console.log(
    "Flex Rent Professional Script Ready."
);
