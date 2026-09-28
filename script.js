// ============================================================
// FLEX RENT - ADVANCED SCRIPT
// ============================================================

let myListings = [];
let myBookings = [];

let selectedItemPrice = 0;
let selectedItemName = "";

let selectedPaymentMethod = "";

let currentPaymentAmount = 0;
let currentPaymentDays = 1;
let currentPaymentItem = "";

let rentalMap = null;
let userMarker = null;


// ============================================================
// SUPABASE CHECK
// ============================================================

function isSupabaseReady() {
    return (
        typeof supabaseClient !== "undefined" &&
        supabaseClient !== null
    );
}


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    updateDashboardStats();

    initializeMap();

    setupSearchKeyboard();

    setupAnimations();

    setupLocationButton();

    loadSavedListings();

    console.log("Flex Rent loaded successfully.");

});


// ============================================================
// SEARCH
// ============================================================

function searchItems() {

    const input =
        document.getElementById("searchInput");

    if (!input) return;

    const searchText =
        input.value.toLowerCase().trim();

    const items =
        document.querySelectorAll(".item-card");

    const noResults =
        document.getElementById("noResults");

    let found = false;

    items.forEach(function (item) {

        const title =
            item.querySelector("h3");

        const description =
            item.querySelector("p");

        if (!title) return;

        const itemName =
            title.innerText.toLowerCase();

        const itemDescription =
            description
                ? description.innerText.toLowerCase()
                : "";

        const matched =
            searchText === "" ||
            itemName.includes(searchText) ||
            itemDescription.includes(searchText);

        item.style.display =
            matched ? "" : "none";

        if (matched) {
            found = true;
        }

    });

    if (noResults) {

        noResults.style.display =
            found ? "none" : "block";

    }

}


// ============================================================
// SEARCH KEYBOARD SUPPORT
// ============================================================

function setupSearchKeyboard() {

    const searchInput =
        document.getElementById("searchInput");

    if (!searchInput) return;

    searchInput.addEventListener(
        "focus",
        function () {

            if (window.innerWidth <= 768) {

                setTimeout(function () {

                    searchInput.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                }, 300);

            }

        }
    );

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

    items.forEach(function (item) {

        const itemCategory =
            item.getAttribute("data-category");

        const show =
            category === "All" ||
            itemCategory === category;

        item.style.display =
            show ? "" : "none";

        if (show) {
            found = true;
        }

    });

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
// VOICE SEARCH
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

    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.onstart = function () {

        console.log("Voice search started.");

        const mic =
            document.querySelector(".mic-button");

        if (mic) {

            mic.classList.add("mic-listening");

        }

    };

    recognition.onresult = function (event) {

        const text =
            event.results[0][0].transcript;

        const searchInput =
            document.getElementById("searchInput");

        if (searchInput) {

            searchInput.value = text;

            searchItems();

        }

    };

    recognition.onerror = function (event) {

        console.error(
            "Voice search error:",
            event.error
        );

        if (event.error === "not-allowed") {

            alert(
                "Microphone permission is blocked. Please allow microphone access in your browser."
            );

        }

    };

    recognition.onend = function () {

        const mic =
            document.querySelector(".mic-button");

        if (mic) {

            mic.classList.remove("mic-listening");

        }

    };

    try {

        recognition.start();

    } catch (error) {

        console.log(error);

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

    }

}


function closeListForm() {

    const modal =
        document.getElementById("listModal");

    if (modal) {

        modal.style.display = "none";

    }

}


// ============================================================
// ADD LISTING
// ============================================================

function submitItem() {

    const name =
        document.getElementById("itemName")?.value.trim();

    const price =
        document.getElementById("itemPrice")?.value.trim();

    const category =
        document.getElementById("itemCategory")?.value;

    const location =
        document.getElementById("itemLocation")?.value.trim();

    const description =
        document.getElementById("itemDescription")?.value.trim();

    const imageFile =
        document.getElementById("itemImage")?.files[0];

    if (
        !name ||
        !price ||
        !location ||
        !description
    ) {

        alert("Please fill all item details.");

        return;

    }

    if (
        isNaN(price) ||
        Number(price) <= 0
    ) {

        alert("Please enter a valid price.");

        return;

    }

    let image =
        "";

    if (imageFile) {

        image =
            URL.createObjectURL(imageFile);

    }

    const listing = {

        id:
            Date.now(),

        name:
            name,

        price:
            Number(price),

        category:
            category,

        location:
            location,

        description:
            description,

        image:
            image,

        createdAt:
            new Date().toISOString()

    };

    myListings.push(listing);

    saveListings();

    addListingToPage(listing);

    updateDashboardStats();

    alert(
        "Item listed successfully!"
    );

    closeListForm();

    clearListingForm();

}


// ============================================================
// ADD LISTING TO PAGE
// ============================================================

function addListingToPage(listing) {

    const container =
        document.getElementById("itemsContainer");

    if (!container) return;

    const card =
        document.createElement("div");

    card.className =
        "item-card";

    card.setAttribute(
        "data-category",
        listing.category
    );

    const safeName =
        escapeHTML(listing.name);

    const safeDescription =
        escapeHTML(listing.description);

    const safeLocation =
        escapeHTML(listing.location);

    card.innerHTML = `

        <div class="item-image">

            ${
                listing.image
                ?
                `<img
                    src="${listing.image}"
                    alt="${safeName}"
                >`
                :
                `<span>📦</span>`
            }

        </div>

        <div class="item-info">

            <span class="item-category">
                ${escapeHTML(listing.category)}
            </span>

            <h3>
                ${safeName}
            </h3>

            <p>
                ${safeDescription}
                <br>
                📍 ${safeLocation}
            </p>

            <div class="item-bottom">

                <strong>
                    ₹${listing.price}/day
                </strong>

                <button
                    type="button"
                    onclick="openBooking(
                        '${escapeAttribute(listing.name)}',
                        ${listing.price}
                    )"
                >
                    Rent Now
                </button>

            </div>

        </div>

    `;

    container.appendChild(card);

}


// ============================================================
// CLEAR LISTING FORM
// ============================================================

function clearListingForm() {

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
// LOCAL STORAGE
// ============================================================

function saveListings() {

    try {

        localStorage.setItem(
            "flexRentListings",
            JSON.stringify(myListings)
        );

    } catch (error) {

        console.error(error);

    }

}


function loadSavedListings() {

    try {

        const saved =
            localStorage.getItem(
                "flexRentListings"
            );

        if (!saved) return;

        myListings =
            JSON.parse(saved);

        myListings.forEach(function (listing) {

            addListingToPage(listing);

        });

        updateDashboardStats();

    } catch (error) {

        console.error(
            "Could not load listings.",
            error
        );

    }

}


// ============================================================
// BOOKING
// ============================================================

function openBooking(itemName, price) {

    selectedItemName =
        itemName;

    selectedItemPrice =
        Number(price);

    const itemNameElement =
        document.getElementById("bookingItemName");

    const itemPriceElement =
        document.getElementById("bookingItemPrice");

    const daysElement =
        document.getElementById("rentalDays");

    if (itemNameElement) {

        itemNameElement.innerText =
            itemName;

    }

    if (itemPriceElement) {

        itemPriceElement.innerText =
            "₹" + selectedItemPrice + "/day";

    }

    if (daysElement) {

        daysElement.value = 1;

    }

    calculateTotal();

    const modal =
        document.getElementById("bookingModal");

    if (modal) {

        modal.style.display = "flex";

    }

}


function closeBooking() {

    const modal =
        document.getElementById("bookingModal");

    if (modal) {

        modal.style.display = "none";

    }

}


// ============================================================
// CALCULATE RENTAL TOTAL
// ============================================================

function calculateTotal() {

    const daysElement =
        document.getElementById("rentalDays");

    if (!daysElement) return;

    let days =
        parseInt(daysElement.value);

    if (
        isNaN(days) ||
        days < 1
    ) {

        days = 1;

        daysElement.value = 1;

    }

    const total =
        selectedItemPrice * days;

    const totalElement =
        document.getElementById("bookingTotal");

    if (totalElement) {

        totalElement.innerText =
            "₹" + total;

    }

}


// ============================================================
// PAYMENT
// ============================================================

function proceedToPayment() {

    const daysElement =
        document.getElementById("rentalDays");

    const days =
        parseInt(daysElement?.value);

    if (
        isNaN(days) ||
        days < 1
    ) {

        alert("Please select at least 1 day.");

        return;

    }

    currentPaymentItem =
        selectedItemName;

    currentPaymentDays =
        days;

    currentPaymentAmount =
        selectedItemPrice * days;

    const paymentItem =
        document.getElementById("paymentItem");

    const paymentDays =
        document.getElementById("paymentDays");

    const paymentAmount =
        document.getElementById("paymentAmount");

    if (paymentItem) {

        paymentItem.innerText =
            currentPaymentItem;

    }

    if (paymentDays) {

        paymentDays.innerText =
            currentPaymentDays +
            (
                currentPaymentDays === 1
                ? " Day"
                : " Days"
            );

    }

    if (paymentAmount) {

        paymentAmount.innerText =
            "₹" + currentPaymentAmount;

    }

    selectedPaymentMethod = "";

    const selected =
        document.getElementById("selectedPayment");

    if (selected) {

        selected.innerText =
            "Please select a payment method.";

    }

    closeBooking();

    const paymentModal =
        document.getElementById("paymentModal");

    if (paymentModal) {

        paymentModal.style.display =
            "flex";

    }

}


function selectPaymentMethod(method) {

    selectedPaymentMethod =
        method;

    const selected =
        document.getElementById("selectedPayment");

    if (selected) {

        selected.innerText =
            "Selected: " + method;

    }

}


function makePayment() {

    if (!selectedPaymentMethod) {

        alert(
            "Please select a payment method."
        );

        return;

    }

    const booking = {

        id:
            Date.now(),

        item:
            currentPaymentItem,

        days:
            currentPaymentDays,

        amount:
            currentPaymentAmount,

        method:
            selectedPaymentMethod,

        status:
            "Confirmed",

        date:
            new Date().toISOString()

    };

    myBookings.push(booking);

    localStorage.setItem(
        "flexRentBookings",
        JSON.stringify(myBookings)
    );

    updateDashboardStats();

    closePayment();

    alert(
        "Payment Successful!\n\n" +
        "Item: " +
        currentPaymentItem +
        "\nAmount: ₹" +
        currentPaymentAmount
    );

}


function closePayment() {

    const modal =
        document.getElementById("paymentModal");

    if (modal) {

        modal.style.display =
            "none";

    }

}


// ============================================================
// LOGIN
// ============================================================

function showLogin() {

    const modal =
        document.getElementById("loginModal");

    if (modal) {

        modal.style.display =
            "flex";

    }

}


function closeLogin() {

    const modal =
        document.getElementById("loginModal");

    if (modal) {

        modal.style.display =
            "none";

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

        modal.style.display =
            "flex";

    }

}


function closeSignup() {

    const modal =
        document.getElementById("signupModal");

    if (modal) {

        modal.style.display =
            "none";

    }

}


// ============================================================
// SUPABASE LOGIN
// ============================================================

async function loginUser() {

    const email =
        document.getElementById("loginEmail")
        ?.value.trim();

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

    const { error } =
        await supabaseClient.auth.signInWithPassword({

            email:
                email,

            password:
                password

        });

    if (error) {

        alert(
            "Login failed:\n\n" +
            error.message
        );

        return;

    }

    closeLogin();

    alert(
        "Login successful!"
    );

    openDashboard();

}


// ============================================================
// SIGNUP
// ============================================================

async function signupUser() {

    const name =
        document.getElementById("signupName")
        ?.value.trim();

    const email =
        document.getElementById("signupEmail")
        ?.value.trim();

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
            "Password must contain at least 6 characters."
        );

        return;

    }

    if (!isSupabaseReady()) {

        alert(
            "Supabase is not connected."
        );

        return;

    }

    const { error } =
        await supabaseClient.auth.signUp({

            email:
                email,

            password:
                password,

            options: {

                data: {

                    name:
                        name

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

    alert(
        "Account created successfully!\n\n" +
        "If email confirmation is enabled, check your email."
    );

    closeSignup();

    showLogin();

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

    const { data, error } =
        await supabaseClient.auth.getUser();

    if (
        error ||
        !data ||
        !data.user
    ) {

        alert(
            "Please login first."
        );

        showLogin();

        return;

    }

    const user =
        data.user;

    const name =
        user.user_metadata?.name ||
        "Flex Rent User";

    const email =
        user.email ||
        "";

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

        modal.style.display =
            "flex";

    }

}


function closeDashboard() {

    const modal =
        document.getElementById(
            "dashboardModal"
        );

    if (modal) {

        modal.style.display =
            "none";

    }

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

        modal.style.display =
            "flex";

    }

}


function closeMyListings() {

    const modal =
        document.getElementById(
            "myListingsModal"
        );

    if (modal) {

        modal.style.display =
            "none";

    }

}


function displayMyListings() {

    const container =
        document.getElementById(
            "myListingsContainer"
        );

    if (!container) return;

    if (myListings.length === 0) {

        container.innerHTML = `
            <p style="text-align:center;margin-top:30px;">
                No items listed yet.
            </p>
        `;

        return;

    }

    container.innerHTML = "";

    myListings.forEach(function (listing, index) {

        const card =
            document.createElement("div");

        card.className =
            "my-listing-card";

        card.innerHTML = `

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


function deleteListing(index) {

    if (!myListings[index]) return;

    const confirmed =
        confirm(
            "Do you want to delete this listing?"
        );

    if (!confirmed) return;

    myListings.splice(index, 1);

    saveListings();

    displayMyListings();

    updateDashboardStats();

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

    const { error } =
        await supabaseClient.auth.signInWithOAuth({

            provider:
                "google",

            options: {

                redirectTo:
                    window.location.origin

            }

        });

    if (error) {

        alert(
            "Google Login Failed:\n\n" +
            error.message
        );

    }

}


// ============================================================
// WORLD MAP
// ============================================================

function initializeMap() {

    if (typeof L === "undefined") {

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

        console.warn(
            "Map element not found."
        );

        return;

    }

    rentalMap =
        L.map(
            "rentalMap"
        ).setView(
            [20, 0],
            2
        );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {

            maxZoom:
                19,

            attribution:
                "&copy; OpenStreetMap contributors"

        }
    ).addTo(rentalMap);

    addWorldRentalMarkers();

}


// ============================================================
// RENTAL LOCATIONS
// ============================================================

const rentalLocations = [

    {
        name:
            "Engineering Books",

        price:
            50,

        lat:
            22.5726,

        lng:
            88.3639,

        icon:
            "📚"

    },

    {
        name:
            "Laptop",

        price:
            500,

        lat:
            22.5958,

        lng:
            88.2636,

        icon:
            "💻"

    },

    {
        name:
            "Drilling Machine",

        price:
            250,

        lat:
            22.5200,

        lng:
            88.3500,

        icon:
            "🛠️"

    },

    {
        name:
            "Garden Tool Set",

        price:
            150,

        lat:
            22.6100,

        lng:
            88.4000,

        icon:
            "🌱"

    },

    {
        name:
            "Camera",

        price:
            700,

        lat:
            19.0760,

        lng:
            72.8777,

        icon:
            "📷"

    },

    {
        name:
            "Power Tool",

        price:
            400,

        lat:
            28.6139,

        lng:
            77.2090,

        icon:
            "🔧"

    }

];


// ============================================================
// MAP MARKERS
// ============================================================

function addWorldRentalMarkers() {

    if (!rentalMap) return;

    rentalLocations.forEach(function (item) {

        const marker =
            L.marker([
                item.lat,
                item.lng
            ]).addTo(
                rentalMap
            );

        marker.bindPopup(`

            <div style="min-width:180px">

                <div style="font-size:30px">
                    ${item.icon}
                </div>

                <strong>
                    ${escapeHTML(item.name)}
                </strong>

                <p style="
                    color:#16a085;
                    margin:6px 0;
                ">
                    ₹${item.price}/day
                </p>

                <button
                    onclick="openBooking(
                        '${escapeAttribute(item.name)}',
                        ${item.price}
                    )"
                    style="
                        background:#16a085;
                        color:white;
                        border:none;
                        padding:8px 12px;
                        border-radius:6px;
                        cursor:pointer;
                    "
                >
                    Rent Now
                </button>

            </div>

        `);

    });

}


// ============================================================
// USER LOCATION
// ============================================================

function setupLocationButton() {

    const button =
        document.getElementById(
            "openMapBtn"
        );

    if (!button) return;

    button.addEventListener(
        "click",
        findMyLocation
    );

}


function findMyLocation() {

    const status =
        document.getElementById(
            "locationStatus"
        );

    if (!navigator.geolocation) {

        if (status) {

            status.innerText =
                "Location is not supported by this browser.";

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

            if (!rentalMap) {

                initializeMap();

            }

            if (!rentalMap) {

                alert(
                    "Map could not be loaded."
                );

                return;

            }

            rentalMap.setView(
                [lat, lng],
                15
            );

            if (userMarker) {

                rentalMap.removeLayer(
                    userMarker
                );

            }

            userMarker =
                L.marker([
                    lat,
                    lng
                ])
                .addTo(rentalMap)
                .bindPopup(
                    "📍 You are here"
                )
                .openPopup();

            if (status) {

                status.innerText =
                    "Your location found successfully.";

            }

        },

        function (error) {

            console.error(
                "Location error:",
                error
            );

            let message =
                "Location could not be found.";

            if (error.code === 1) {

                message =
                    "Location permission was denied. Please allow location access in your browser.";

            }

            if (error.code === 2) {

                message =
                    "Your location is currently unavailable.";

            }

            if (error.code === 3) {

                message =
                    "Location request timed out.";

            }

            if (status) {

                status.innerText =
                    message;

            }

            alert(message);

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

}


// ============================================================
// MAP SEARCH
// ============================================================

function searchMapItems() {

    const input =
        document.getElementById(
            "mapSearchInput"
        );

    if (!input || !rentalMap) return;

    const text =
        input.value.toLowerCase().trim();

    if (!text) {

        rentalMap.setView(
            [20, 0],
            2
        );

        return;

    }

    const item =
        rentalLocations.find(
            function (location) {

                return location.name
                    .toLowerCase()
                    .includes(text);

            }
        );

    if (!item) {

        alert(
            "Rental item not found."
        );

        return;

    }

    rentalMap.setView(
        [
            item.lat,
            item.lng
        ],
        16
    );

}


// ============================================================
// SEARCH THIS AREA
// ============================================================

function searchThisArea() {

    alert(
        "Rental items available in this map area are shown."
    );

}


// ============================================================
// CONTACT / CALL SELLER
// ============================================================

function callSeller(phoneNumber) {

    if (!phoneNumber) {

        alert(
            "Seller phone number is not available."
        );

        return;

    }

    window.location.href =
        "tel:" + phoneNumber;

}


// ============================================================
// ANIMATIONS
// ============================================================

function setupAnimations() {

    const elements =
        document.querySelectorAll(
            ".item-card, .category-card, .step, .section-heading"
        );

    if (!("IntersectionObserver" in window)) {

        return;

    }

    const observer =
        new IntersectionObserver(

            function (entries) {

                entries.forEach(
                    function (entry) {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "show-on-scroll"
                            );

                        }

                    }
                );

            },

            {
                threshold:
                    0.12
            }

        );

    elements.forEach(
        function (element) {

            observer.observe(element);

        }
    );

}


// ============================================================
// CLOSE MODALS BY CLICKING OUTSIDE
// ============================================================

window.addEventListener(
    "click",
    function (event) {

        const modalIds = [

            "loginModal",
            "signupModal",
            "bookingModal",
            "paymentModal",
            "dashboardModal",
            "myListingsModal",
            "listModal"

        ];

        modalIds.forEach(
            function (id) {

                const modal =
                    document.getElementById(id);

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
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, "&quot;");

}


// ============================================================
// LOAD EXISTING BOOKINGS
// ============================================================

function loadBookings() {

    try {

        const saved =
            localStorage.getItem(
                "flexRentBookings"
            );

        if (saved) {

            myBookings =
                JSON.parse(saved);

        }

    } catch (error) {

        console.error(error);

    }

}

loadBookings();


// ============================================================
// FLEX RENT SCRIPT END
// ============================================================
