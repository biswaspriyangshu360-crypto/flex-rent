// ======================================================
// FLEX RENT - COMPLETE SCRIPT.JS
// ======================================================


// ======================================================
// DATA
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


// ======================================================
// RENTAL LOCATIONS
// ======================================================

const rentalLocations = [

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
        lat: 22.5750,
        lng: 88.3700,
        icon: "💻"
    },

    {
        name: "Drilling Machine",
        price: 250,
        lat: 22.5680,
        lng: 88.3600,
        icon: "🛠️"
    },

    {
        name: "Garden Tool Set",
        price: 150,
        lat: 22.5800,
        lng: 88.3550,
        icon: "🌱"
    },

    {
        name: "Power Sprayer",
        price: 300,
        lat: 22.5958,
        lng: 88.2636,
        icon: "🌾"
    }

];


// ======================================================
// SEARCH ITEMS
// ======================================================

function searchItems() {

    const searchInput =
        document.getElementById("searchInput");

    if (!searchInput) {
        return;
    }

    const searchText =
        searchInput.value.toLowerCase().trim();

    const items =
        document.querySelectorAll(".item-card");

    const noResults =
        document.getElementById("noResults");

    let found = false;


    items.forEach(function(item) {

        const nameElement =
            item.querySelector("h3");

        const descriptionElement =
            item.querySelector("p");


        if (!nameElement) {
            return;
        }


        const itemName =
            nameElement.innerText.toLowerCase();

        const itemDescription =
            descriptionElement
                ? descriptionElement.innerText.toLowerCase()
                : "";


        if (
            searchText === "" ||
            itemName.includes(searchText) ||
            itemDescription.includes(searchText)
        ) {

            item.style.display = "block";

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
// SCROLL TO ITEMS
// ======================================================

function scrollToItems() {

    const itemsSection =
        document.getElementById("items");

    if (itemsSection) {

        itemsSection.scrollIntoView({
            behavior: "smooth"
        });

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


    items.forEach(function(item) {

        const itemCategory =
            item.getAttribute("data-category");


        if (
            category === "All" ||
            itemCategory === category
        ) {

            item.style.display = "block";

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
// RENT ITEM
// ======================================================

function rentItem(itemName, price) {

    openBooking(itemName, price);

}


// ======================================================
// LIST FORM
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

    const nameElement =
        document.getElementById("itemName");

    const priceElement =
        document.getElementById("itemPrice");

    const categoryElement =
        document.getElementById("itemCategory");

    const locationElement =
        document.getElementById("itemLocation");

    const descriptionElement =
        document.getElementById("itemDescription");

    const imageElement =
        document.getElementById("itemImage");


    if (
        !nameElement ||
        !priceElement ||
        !categoryElement ||
        !locationElement ||
        !descriptionElement ||
        !imageElement
    ) {

        alert("Item form is missing.");

        return;

    }


    const name =
        nameElement.value.trim();

    const price =
        priceElement.value.trim();

    const category =
        categoryElement.value;

    const location =
        locationElement.value.trim();

    const description =
        descriptionElement.value.trim();

    const imageFile =
        imageElement.files[0];


    if (
        name === "" ||
        price === "" ||
        location === "" ||
        description === "" ||
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

        alert("Please enter a valid price.");

        return;

    }


    const listing = {

        name: name,

        price: Number(price),

        category: category,

        location: location,

        description: description,

        image: URL.createObjectURL(imageFile)

    };


    myListings.push(listing);


    const itemsContainer =
        document.getElementById("itemsContainer");


    if (itemsContainer) {

        const newItem =
            document.createElement("div");

        newItem.className =
            "item-card";

        newItem.setAttribute(
            "data-category",
            category
        );


        const safeName =
            name.replace(/'/g, "\\'");


        newItem.innerHTML = `

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


        itemsContainer.appendChild(newItem);

    }


    updateDashboardStats();


    alert(
        "Item added successfully!\n\n" +
        name +
        " is now available for rent."
    );


    closeListForm();


    nameElement.value = "";
    priceElement.value = "";
    locationElement.value = "";
    descriptionElement.value = "";
    imageElement.value = "";

}


// ======================================================
// LOGIN MODAL
// ======================================================

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


// ======================================================
// SIGNUP MODAL
// ======================================================

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


// ======================================================
// LOGIN USER - SUPABASE
// ======================================================

async function loginUser() {

    const emailElement =
        document.getElementById("loginEmail");

    const passwordElement =
        document.getElementById("loginPassword");


    if (!emailElement || !passwordElement) {

        alert("Login form not found.");

        return;

    }


    const email =
        emailElement.value.trim();

    const password =
        passwordElement.value;


    if (
        email === "" ||
        password === ""
    ) {

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


    const { error } =
        await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

        });


    if (error) {

        alert(error.message);

        return;

    }


    alert("Login successful!");

    closeLogin();

    openDashboard();

}


// ======================================================
// SIGNUP USER - SUPABASE
// ======================================================

async function signupUser() {

    const nameElement =
        document.getElementById("signupName");

    const emailElement =
        document.getElementById("signupEmail");

    const passwordElement =
        document.getElementById("signupPassword");


    if (
        !nameElement ||
        !emailElement ||
        !passwordElement
    ) {

        alert("Signup form not found.");

        return;

    }


    const name =
        nameElement.value.trim();

    const email =
        emailElement.value.trim();

    const password =
        passwordElement.value;


    if (
        !name ||
        !email ||
        !password
    ) {

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


    const { error } =
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

        console.error(error);

        alert(
            "Signup failed!\n\n" +
            error.message
        );

        return;

    }


    alert(
        "Account created!\n\n" +
        "Please check your email for confirmation."
    );


    closeSignup();

    showLogin();

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


    const { error } =
        await supabaseClient.auth.signInWithOAuth({

            provider: "google",

            options: {

                redirectTo:
                    window.location.origin

            }

        });


    if (error) {

        console.error(error);

        alert(
            "Google Login Failed:\n\n" +
            error.message
        );

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


    const result =
        await supabaseClient.auth.getUser();


    const user =
        result.data?.user;

    const error =
        result.error;


    if (error || !user) {

        alert(
            "Please login first."
        );

        return;

    }


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


    const dashboardModal =
        document.getElementById(
            "dashboardModal"
        );


    if (dashboardModal) {

        dashboardModal.style.display =
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


// ======================================================
// DASHBOARD STATS
// ======================================================

function updateDashboardStats() {

    const totalListings =
        document.getElementById(
            "totalListings"
        );

    const totalBookings =
        document.getElementById(
            "totalBookings"
        );


    if (totalListings) {

        totalListings.innerText =
            myListings.length;

    }


    if (totalBookings) {

        totalBookings.innerText =
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
        function(listing, index) {

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
                        🗑️ Delete
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


    if (!listing) {
        return;
    }


    const confirmDelete =
        confirm(
            "Do you want to delete " +
            listing.name +
            "?"
        );


    if (!confirmDelete) {
        return;
    }


    myListings.splice(index, 1);


    displayMyListings();

    updateDashboardStats();


    alert(
        "Listing deleted successfully."
    );

}


// ======================================================
// BOOKING
// ======================================================

function openBooking(itemName, price) {

    selectedItemPrice =
        Number(price);


    const nameElement =
        document.getElementById(
            "bookingItemName"
        );

    const priceElement =
        document.getElementById(
            "bookingItemPrice"
        );

    const daysElement =
        document.getElementById(
            "rentalDays"
        );

    const modal =
        document.getElementById(
            "bookingModal"
        );


    if (!modal) {

        alert(
            "Booking modal not found."
        );

        return;

    }


    if (nameElement) {

        nameElement.innerText =
            itemName;

    }


    if (priceElement) {

        priceElement.innerText =
            "₹" +
            selectedItemPrice +
            "/day";

    }


    if (daysElement) {

        daysElement.value = 1;

    }


    calculateTotal();


    modal.style.display =
        "flex";

}


// ======================================================
// CLOSE BOOKING
// ======================================================

function closeBooking() {

    const modal =
        document.getElementById(
            "bookingModal"
        );


    if (modal) {

        modal.style.display =
            "none";

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

    const totalElement =
        document.getElementById(
            "bookingTotal"
        );


    if (!daysElement || !totalElement) {
        return;
    }


    let days =
        parseInt(
            daysElement.value
        );


    if (
        isNaN(days) ||
        days < 1
    ) {

        days = 1;

        daysElement.value = 1;

    }


    const total =
        selectedItemPrice * days;


    totalElement.innerText =
        "₹" + total;

}


// ======================================================
// PROCEED TO PAYMENT
// ======================================================

function proceedToPayment() {

    const daysElement =
        document.getElementById(
            "rentalDays"
        );

    const itemElement =
        document.getElementById(
            "bookingItemName"
        );


    if (!daysElement || !itemElement) {
        return;
    }


    const days =
        parseInt(
            daysElement.value
        );


    const itemName =
        itemElement.innerText;


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

    const selectedPayment =
        document.getElementById(
            "selectedPayment"
        );


    if (paymentItem) {

        paymentItem.innerText =
            itemName;

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
            "₹" + total;

    }


    selectedPaymentMethod =
        "";


    if (selectedPayment) {

        selectedPayment.innerText =
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


// ======================================================
// SELECT PAYMENT
// ======================================================

function selectPaymentMethod(method) {

    selectedPaymentMethod =
        method;


    const selectedPayment =
        document.getElementById(
            "selectedPayment"
        );


    if (selectedPayment) {

        selectedPayment.innerText =
            "Selected: " + method;

    }

}


// ======================================================
// MAKE PAYMENT
// ======================================================

function makePayment() {

    if (
        selectedPaymentMethod === ""
    ) {

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
            "Confirmed"

    };


    myBookings.push(booking);


    updateDashboardStats();


    alert(
        "Payment Successful!\n\n" +

        "Item: " +
        currentPaymentItem +

        "\nDays: " +
        currentPaymentDays +

        "\nAmount: ₹" +
        currentPaymentAmount +

        "\nMethod: " +
        selectedPaymentMethod
    );


    closePayment();


    alert(
        "Booking Confirmed!\n\n" +
        "Thank you for using Flex Rent."
    );

}


// ======================================================
// CLOSE PAYMENT
// ======================================================

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


    recognition.lang =
        "en-IN";

    recognition.continuous =
        false;

    recognition.interimResults =
        false;


    recognition.onstart =
        function() {

            console.log(
                "Microphone started."
            );

        };


    recognition.onresult =
        function(event) {

            const text =
                event.results[0][0]
                    .transcript;


            const searchInput =
                document.getElementById(
                    "searchInput"
                );


            if (searchInput) {

                searchInput.value =
                    text;

                searchItems();

            }

        };


    recognition.onerror =
        function(event) {

            console.error(
                "Microphone error:",
                event.error
            );


            alert(
                "Microphone error: " +
                event.error
            );

        };


    try {

        recognition.start();

    } catch (error) {

        console.error(error);

    }

}


// ======================================================
// REAL MAP - INITIALIZE
// ======================================================

function initializeRentalMap() {

    const mapElement =
        document.getElementById(
            "rentalMap"
        );


    if (!mapElement) {

        console.error(
            "Map element #rentalMap not found."
        );

        return;

    }


    if (
        typeof L === "undefined"
    ) {

        console.error(
            "Leaflet is not loaded."
        );

        return;

    }


    if (rentalMap) {

        rentalMap.remove();

        rentalMap = null;

    }


    // Kolkata default location

    rentalMap =
        L.map("rentalMap").setView(
            [22.5726, 88.3639],
            13
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


    // Fix map display

    setTimeout(
        function() {

            rentalMap.invalidateSize();

        },
        300
    );

}


// ======================================================
// ADD RENTAL MARKERS
// ======================================================

function addRentalMarkers() {

    if (!rentalMap) {
        return;
    }


    rentalLocations.forEach(
        function(item) {

            const marker =
                L.marker(
                    [item.lat, item.lng]
                )
                .addTo(rentalMap);


            marker.bindPopup(`

                <div style="
                    min-width:180px;
                    text-align:center;
                ">

                    <div style="
                        font-size:32px;
                        margin-bottom:8px;
                    ">
                        ${item.icon}
                    </div>

                    <strong>
                        ${item.name}
                    </strong>

                    <p style="
                        margin:7px 0;
                        color:#16a085;
                        font-weight:bold;
                    ">
                        ₹${item.price}/day
                    </p>

                    <button
                        type="button"
                        onclick="openBooking('${item.name}', ${item.price})"
                        style="
                            background:#16a085;
                            color:white;
                            border:none;
                            padding:9px 14px;
                            border-radius:6px;
                            cursor:pointer;
                        "
                    >
                        Rent Now
                    </button>

                </div>

            `);

        }
    );

}


// ======================================================
// FIND MY LOCATION
// ======================================================

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

        alert(
            "Your browser does not support location."
        );

        return;

    }


    if (!rentalMap) {

        initializeRentalMap();

    }


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


            console.log(
                "User location:",
                lat,
                lng
            );


            if (rentalMap) {

                rentalMap.setView(
                    [lat, lng],
                    15
                );

            }


            // Remove old marker

            if (userMarker) {

                rentalMap.removeLayer(
                    userMarker
                );

            }


            // Create user marker

            userMarker =
                L.marker(
                    [lat, lng]
                )
                .addTo(rentalMap);


            userMarker
                .bindPopup(
                    "<b>📍 You are here</b>"
                )
                .openPopup();


            if (status) {

                status.innerText =
                    "Your location found successfully.";

            }

        },

        function(error) {

            console.error(
                "Location error:",
                error
            );


            let message =
                "Unable to find your location.";


            if (error.code === 1) {

                message =
                    "Location permission was denied. Please allow location permission in your browser.";

            }


            if (error.code === 2) {

                message =
                    "Your location could not be determined.";

            }


            if (error.code === 3) {

                message =
                    "Location request timed out. Please try again.";

            }


            if (status) {

                status.innerText =
                    message;

            }


            alert(message);

        },

        {

            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 0

        }

    );

}


// ======================================================
// OPEN MAP
// ======================================================

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


    setTimeout(
        function() {

            if (!rentalMap) {

                initializeRentalMap();

            }


            if (rentalMap) {

                rentalMap.invalidateSize();

            }

        },
        500
    );

}


// ======================================================
// SEARCH MAP ITEMS
// ======================================================

function searchMapItems() {

    const input =
        document.getElementById(
            "mapSearchInput"
        );


    if (!input || !rentalMap) {
        return;
    }


    const searchText =
        input.value
            .toLowerCase()
            .trim();


    if (searchText === "") {

        rentalMap.setView(
            [22.5726, 88.3639],
            13
        );

        return;

    }


    const item =
        rentalLocations.find(
            function(location) {

                return location.name
                    .toLowerCase()
                    .includes(searchText);

            }
        );


    if (!item) {

        alert(
            "No rental item found."
        );

        return;

    }


    rentalMap.setView(
        [item.lat, item.lng],
        16
    );

}


// ======================================================
// SEARCH THIS AREA
// ======================================================

function searchThisArea() {

    if (!rentalMap) {

        initializeRentalMap();

    }


    alert(
        "Rental items available in this map area are shown with markers."
    );

}


// ======================================================
// OPEN MAP BUTTON
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const openMapBtn =
            document.getElementById(
                "openMapBtn"
            );


        if (openMapBtn) {

            openMapBtn.addEventListener(
                "click",
                openMap
            );

        }

    }
);


// ======================================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// ======================================================

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
// PAGE LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateDashboardStats();

        // Map initialize
        initializeRentalMap();

    }
);


// ======================================================
// FLEX RENT - SCRIPT COMPLETE
// ======================================================
