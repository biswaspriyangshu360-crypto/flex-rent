// ======================================================
// FLEX RENT - COMPLETE SCRIPT.JS
// ======================================================

// ======================================================
// GLOBAL DATA
// ======================================================

let myListings = [];
let myBookings = [];

let selectedItemPrice = 0;

let selectedPaymentMethod = "";

let currentPaymentItem = "";
let currentPaymentDays = 1;
let currentPaymentAmount = 0;

let rentalMap = null;
let userMarker = null;
let mapMarkers = [];


// ======================================================
// RENTAL ITEMS
// ======================================================

const rentalLocations = [
    {
        name: "Engineering Books",
        category: "Everyday",
        price: 50,
        lat: 22.5726,
        lng: 88.3639,
        icon: "📚"
    },

    {
        name: "Power Sprayer",
        category: "Agriculture",
        price: 300,
        lat: 22.5958,
        lng: 88.2636,
        icon: "🌾"
    },

    {
        name: "Drilling Machine",
        category: "Construction",
        price: 250,
        lat: 22.5200,
        lng: 88.3500,
        icon: "🛠️"
    },

    {
        name: "Industrial Tool Kit",
        category: "Industrial",
        price: 400,
        lat: 22.5600,
        lng: 88.3900,
        icon: "⚙️"
    },

    {
        name: "Garden Tool Set",
        category: "Gardening",
        price: 150,
        lat: 22.6100,
        lng: 88.4000,
        icon: "🌱"
    },

    {
        name: "Laptop",
        category: "Everyday",
        price: 500,
        lat: 22.5750,
        lng: 88.3700,
        icon: "💻"
    }
];


// ======================================================
// PAGE LOADING ANIMATION
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    updateDashboardStats();

    initializeRentalMap();

    setupMapButton();

    setupKeyboardSearch();

    setupDate();

    console.log("Flex Rent loaded successfully.");

});


// ======================================================
// SCROLL TO ITEMS
// ======================================================

function scrollToItems() {

    const section =
        document.getElementById("items");

    if (section) {

        section.scrollIntoView({
            behavior: "smooth"
        });

    }

}


// ======================================================
// SEARCH ITEMS
// ======================================================

function searchItems() {

    const input =
        document.getElementById("searchInput");

    const noResults =
        document.getElementById("noResults");

    if (!input) return;

    const search =
        input.value.toLowerCase().trim();

    const items =
        document.querySelectorAll(".item-card");

    let found = false;

    items.forEach(function (item) {

        const name =
            item.querySelector("h3");

        const description =
            item.querySelector("p");

        if (!name) return;

        const nameText =
            name.innerText.toLowerCase();

        const descriptionText =
            description
                ? description.innerText.toLowerCase()
                : "";

        if (
            search === "" ||
            nameText.includes(search) ||
            descriptionText.includes(search)
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


// ======================================================
// SEARCH KEYBOARD
// ======================================================

function setupKeyboardSearch() {

    const input =
        document.getElementById("searchInput");

    if (!input) return;

    input.addEventListener("focus", function () {

        setTimeout(function () {

            input.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }, 200);

    });

}


// ======================================================
// VOICE SEARCH
// ======================================================

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

    const input =
        document.getElementById("searchInput");

    recognition.onstart = function () {

        if (input) {

            input.placeholder =
                "Listening...";

        }

    };

    recognition.onresult = function (event) {

        const text =
            event.results[0][0].transcript;

        if (input) {

            input.value = text;

            searchItems();

        }

    };

    recognition.onerror = function (event) {

        console.error(
            "Voice search error:",
            event.error
        );

        if (input) {

            input.placeholder =
                "Search for tools, books, equipment...";

        }

        if (event.error === "not-allowed") {

            alert(
                "Microphone permission is blocked. Please allow microphone access in your browser."
            );

        }

    };

    recognition.onend = function () {

        if (input) {

            input.placeholder =
                "Search for tools, books, equipment...";

        }

    };

    try {

        recognition.start();

    } catch (error) {

        console.error(error);

    }

}


// ======================================================
// CATEGORY FILTER
// ======================================================

function filterCategory(category) {

    const items =
        document.querySelectorAll(".item-card");

    const noResults =
        document.getElementById("noResults");

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


// ======================================================
// LIST ITEM MODAL
// ======================================================

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


// ======================================================
// SUBMIT ITEM
// ======================================================

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
        !description ||
        !imageFile
    ) {

        alert(
            "Please fill all details and select an image."
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


    const listing = {

        name: name,

        price: Number(price),

        category: category,

        location: location,

        description: description,

        image:
            URL.createObjectURL(imageFile)

    };


    myListings.push(listing);


    const container =
        document.getElementById("itemsContainer");

    if (container) {

        const card =
            document.createElement("div");

        card.className =
            "item-card";

        card.setAttribute(
            "data-category",
            category
        );


        const safeName =
            name.replace(/'/g, "\\'");


        card.innerHTML = `

            <div class="item-image">

                <img
                    src="${listing.image}"
                    alt="${name}"
                >

            </div>

            <div class="item-info">

                <span class="item-category">
                    ${category}
                </span>

                <h3>
                    ${name}
                </h3>

                <p>
                    ${description}
                    <br>
                    📍 ${location}
                </p>

                <div class="item-bottom">

                    <strong>
                        ₹${price}/day
                    </strong>

                    <button
                        type="button"
                        onclick="openBooking('${safeName}', ${Number(price)})"
                    >
                        Rent Now
                    </button>

                </div>

            </div>

        `;


        container.appendChild(card);

    }


    updateDashboardStats();

    closeListForm();


    alert(
        "Item added successfully!\n\n" +
        name +
        " is now available for rent."
    );


    clearListingForm();

}


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


// ======================================================
// DASHBOARD
// ======================================================

async function openDashboard() {

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

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
            await supabaseClient.auth.getUser();


        if (error || !data.user) {

            alert(
                "Please login first."
            );

            showLogin();

            return;

        }


        const user =
            data.user;


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

    } catch (error) {

        console.error(error);

        alert(
            "Unable to open dashboard."
        );

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


// ======================================================
// DASHBOARD STATS
// ======================================================

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


// ======================================================
// MY LISTINGS
// ======================================================

function openMyListings() {

    closeDashboard();

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


function displayMyListings() {

    const container =
        document.getElementById(
            "myListingsContainer"
        );


    if (!container) return;


    if (myListings.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div style="font-size:50px;">
                    📦
                </div>

                <p>
                    No items listed yet.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    myListings.forEach(
        function (listing, index) {

            const card =
                document.createElement("div");


            card.className =
                "my-listing-card";


            card.innerHTML = `

                <div class="my-listing-image">

                    <img
                        src="${listing.image}"
                        alt="${listing.name}"
                    >

                </div>

                <div class="my-listing-info">

                    <span class="item-category">
                        ${listing.category}
                    </span>

                    <h3>
                        ${listing.name}
                    </h3>

                    <p>
                        ${listing.description}
                    </p>

                    <p>
                        📍 ${listing.location}
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
                        🗑️ Delete Listing
                    </button>

                </div>

            `;


            container.appendChild(card);

        }
    );

}


// ======================================================
// DELETE LISTING
// ======================================================

function deleteListing(index) {

    const listing =
        myListings[index];


    if (!listing) return;


    const confirmDelete =
        confirm(
            "Do you want to delete " +
            listing.name +
            "?"
        );


    if (!confirmDelete) return;


    myListings.splice(index, 1);


    displayMyListings();

    updateDashboardStats();


    alert(
        "Listing deleted successfully."
    );

}


// ======================================================
// LOGIN
// ======================================================

function showLogin() {

    const modal =
        document.getElementById(
            "loginModal"
        );


    if (modal) {

        modal.style.display = "flex";

    }

}


function closeLogin() {

    const modal =
        document.getElementById(
            "loginModal"
        );


    if (modal) {

        modal.style.display = "none";

    }

}


// ======================================================
// SIGNUP
// ======================================================

function showSignup() {

    closeLogin();


    const modal =
        document.getElementById(
            "signupModal"
        );


    if (modal) {

        modal.style.display = "flex";

    }

}


function closeSignup() {

    const modal =
        document.getElementById(
            "signupModal"
        );


    if (modal) {

        modal.style.display = "none";

    }

}


// ======================================================
// LOGIN USER
// ======================================================

async function loginUser() {

    const email =
        document.getElementById(
            "loginEmail"
        )?.value.trim();


    const password =
        document.getElementById(
            "loginPassword"
        )?.value;


    if (!email || !password) {

        alert(
            "Please enter email and password."
        );

        return;

    }


    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        alert(
            "Supabase is not connected."
        );

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (error) {

            alert(
                error.message
            );

            return;

        }


        closeLogin();


        alert(
            "Login successful!"
        );


        openDashboard();


    } catch (error) {

        console.error(error);

        alert(
            "Login failed. Please try again."
        );

    }

}


// ======================================================
// SIGNUP USER
// ======================================================

async function signupUser() {

    const name =
        document.getElementById(
            "signupName"
        )?.value.trim();


    const email =
        document.getElementById(
            "signupEmail"
        )?.value.trim();


    const password =
        document.getElementById(
            "signupPassword"
        )?.value;


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


    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

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
                "Signup failed!\n\n" +
                error.message
            );

            return;

        }


        alert(
            "Account created successfully!\n\n" +
            "Please check your email if email confirmation is enabled."
        );


        closeSignup();

        showLogin();


    } catch (error) {

        console.error(error);

        alert(
            "Signup failed. Please try again."
        );

    }

}


// ======================================================
// BOOKING
// ======================================================

function openBooking(itemName, price) {

    selectedItemPrice =
        Number(price);


    const itemNameElement =
        document.getElementById(
            "bookingItemName"
        );


    const itemPriceElement =
        document.getElementById(
            "bookingItemPrice"
        );


    const daysElement =
        document.getElementById(
            "rentalDays"
        );


    if (itemNameElement) {

        itemNameElement.innerText =
            itemName;

    }


    if (itemPriceElement) {

        itemPriceElement.innerText =
            "₹" +
            selectedItemPrice +
            "/day";

    }


    if (daysElement) {

        daysElement.value = 1;

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


function closeBooking() {

    const modal =
        document.getElementById(
            "bookingModal"
        );


    if (modal) {

        modal.style.display = "none";

    }

}


// ======================================================
// CALCULATE TOTAL
// ======================================================

function calculateTotal() {

    const daysElement =
        document.getElementById(
            "rentalDays"
        );


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
        document.getElementById(
            "bookingTotal"
        );


    if (totalElement) {

        totalElement.innerText =
            "₹" + total;

    }

}


// ======================================================
// PAYMENT
// ======================================================

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
        selectedItemPrice * days;


    currentPaymentItem =
        itemName;

    currentPaymentDays =
        days;

    currentPaymentAmount =
        total;


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
            itemName;

    }


    if (paymentDays) {

        paymentDays.innerText =
            days +
            (days === 1
                ? " Day"
                : " Days");

    }


    if (paymentAmount) {

        paymentAmount.innerText =
            "₹" + total;

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


function selectPaymentMethod(method) {

    selectedPaymentMethod =
        method;


    const selected =
        document.getElementById(
            "selectedPayment"
        );


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
            new Date().toLocaleDateString()

    };


    myBookings.push(booking);


    updateDashboardStats();


    closePayment();


    alert(
        "Payment Successful!\n\n" +
        "Item: " +
        currentPaymentItem +
        "\nDays: " +
        currentPaymentDays +
        "\nAmount: ₹" +
        currentPaymentAmount +
        "\nPayment: " +
        selectedPaymentMethod
    );


    selectedPaymentMethod = "";

}


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


// ======================================================
// GOOGLE LOGIN
// ======================================================

async function googleLogin() {

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        alert(
            "Supabase is not connected."
        );

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient.auth.signInWithOAuth({

                provider: "google",

                options: {

                    redirectTo:
                        window.location.origin +
                        window.location.pathname

                }

            });


        if (error) {

            alert(
                "Google Login Failed:\n\n" +
                error.message
            );

        }

    } catch (error) {

        console.error(error);

        alert(
            "Google Login failed."
        );

    }

}


// ======================================================
// REAL WORLD MAP
// ======================================================

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
        );


    if (!mapElement) {

        console.log(
            "Map element not found."
        );

        return;

    }


    if (rentalMap) {

        rentalMap.remove();

    }


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


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {

            maxZoom: 19,

            attribution:
                '&copy; OpenStreetMap contributors'

        }
    ).addTo(rentalMap);


    addRentalMarkers();


    setTimeout(function () {

        rentalMap.invalidateSize();

    }, 300);

}


// ======================================================
// MAP MARKERS
// ======================================================

function addRentalMarkers() {

    if (!rentalMap) return;


    rentalLocations.forEach(
        function (item) {

            const marker =
                L.marker(
                    [
                        item.lat,
                        item.lng
                    ]
                ).addTo(rentalMap);


            marker.bindPopup(`

                <div
                    style="
                        min-width:180px;
                        text-align:center;
                    "
                >

                    <div
                        style="
                            font-size:35px;
                            margin-bottom:8px;
                        "
                    >
                        ${item.icon}
                    </div>

                    <strong>
                        ${item.name}
                    </strong>

                    <p
                        style="
                            color:#16a085;
                            font-weight:bold;
                            margin:7px 0;
                        "
                    >
                        ₹${item.price}/day
                    </p>

                    <button
                        onclick="openBooking('${item.name}', ${item.price})"
                        style="
                            width:100%;
                            padding:9px;
                            border:none;
                            border-radius:7px;
                            background:#16a085;
                            color:white;
                            cursor:pointer;
                        "
                    >
                        Rent Now
                    </button>

                </div>

            `);

            mapMarkers.push(marker);

        }
    );

}


// ======================================================
// USER LOCATION
// ======================================================

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

                initializeRentalMap();

            }


            if (!rentalMap) {

                alert(
                    "Map could not be loaded."
                );

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
                ).addTo(rentalMap);


            userMarker.bindPopup(
                "<b>📍 You are here</b>"
            ).openPopup();


            if (status) {

                status.innerText =
                    "Your location has been found.";

            }

        },

        function (error) {

            console.error(
                "Location error:",
                error
            );


            let message =
                "Unable to find your location.";


            if (error.code === 1) {

                message =
                    "Location permission was denied. Please allow location access in your browser.";

            }

            if (error.code === 2) {

                message =
                    "Your location could not be determined.";

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

            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0

        }

    );

}


// ======================================================
// OPEN MAP BUTTON
// ======================================================

function setupMapButton() {

    const button =
        document.getElementById(
            "openMapBtn"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        function () {

            const mapSection =
                document.getElementById(
                    "location"
                );


            if (mapSection) {

                mapSection.scrollIntoView({
                    behavior: "smooth"
                });

            }

        }
    );

}


// ======================================================
// MAP SEARCH
// ======================================================

function searchMapItems() {

    const input =
        document.getElementById(
            "mapSearchInput"
        );


    if (!input || !rentalMap) return;


    const text =
        input.value
            .toLowerCase()
            .trim();


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
            "No rental item found."
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


// ======================================================
// DATE
// ======================================================

function setupDate() {

    const date =
        document.getElementById(
            "startDate"
        );


    if (!date) return;


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    date.min = today;


    if (!date.value) {

        date.value = today;

    }

}


// ======================================================
// CLOSE MODALS BY OUTSIDE CLICK
// ======================================================

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


// ======================================================
// ESCAPE KEY
// ======================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Escape") {
            return;
        }


        const modals = [
            "loginModal",
            "signupModal",
            "bookingModal",
            "paymentModal",
            "dashboardModal",
            "myListingsModal",
            "listModal"
        ];


        modals.forEach(
            function (id) {

                const modal =
                    document.getElementById(id);


                if (modal) {

                    modal.style.display =
                        "none";

                }

            }
        );

    }
);


// ======================================================
// SUPABASE SESSION CHECK
// ======================================================

async function checkUserSession() {

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        return;

    }


    try {

        const {
            data
        } =
            await supabaseClient.auth.getSession();


        if (data?.session) {

            console.log(
                "User is logged in:",
                data.session.user.email
            );

        } else {

            console.log(
                "No active user session."
            );

        }

    } catch (error) {

        console.error(
            "Session check failed:",
            error
        );

    }

}


checkUserSession();


// ======================================================
// FLEX RENT SCRIPT END
// ======================================================
