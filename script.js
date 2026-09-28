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


// ======================================================
// MAP VARIABLES
// ======================================================

let rentalMap = null;

let userLocationMarker = null;

let rentalMarkers = [];


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
        name: "Power Sprayer",
        price: 300,
        lat: 22.5958,
        lng: 88.2636,
        icon: "🌾"
    },

    {
        name: "Drilling Machine",
        price: 250,
        lat: 22.5200,
        lng: 88.3500,
        icon: "🛠️"
    },

    {
        name: "Garden Tool Set",
        price: 150,
        lat: 22.6100,
        lng: 88.4000,
        icon: "🌱"
    },

    {
        name: "Laptop",
        price: 500,
        lat: 22.5750,
        lng: 88.3700,
        icon: "💻"
    },

    {
        name: "Industrial Tool Kit",
        price: 400,
        lat: 22.5500,
        lng: 88.3900,
        icon: "⚙️"
    }

];


// ======================================================
// SEARCH ITEMS
// ======================================================

function searchItems() {

    const inputElement =
        document.getElementById("searchInput");

    if (!inputElement) {
        return;
    }

    const searchInput =
        inputElement.value.toLowerCase().trim();

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
            searchInput === "" ||
            itemName.includes(searchInput) ||
            itemDescription.includes(searchInput)
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

    const items =
        document.getElementById("items");

    if (items) {

        items.scrollIntoView({
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


    scrollToItems();

}


// ======================================================
// RENT ITEM
// ======================================================

function rentItem(itemName, price) {

    openBooking(itemName, price);

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

        alert("Listing form is incomplete.");

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

        const result =
            await supabaseClient.auth.getUser();


        const user =
            result.data?.user;


        if (
            result.error ||
            !user
        ) {

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

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

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


// ======================================================
// DISPLAY MY LISTINGS
// ======================================================

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

            <p
                style="
                    text-align:center;
                    margin-top:30px;
                "
            >
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


                    <br>
                    <br>


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


    myListings.splice(
        index,
        1
    );


    displayMyListings();

    updateDashboardStats();


    alert(
        "Listing deleted successfully."
    );

}


// ======================================================
// LOGIN MODAL
// ======================================================

function showLogin() {

    const modal =
        document.getElementById(
            "loginModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }

}


function closeLogin() {

    const modal =
        document.getElementById(
            "loginModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


// ======================================================
// SIGNUP MODAL
// ======================================================

function showSignup() {

    closeLogin();


    const modal =
        document.getElementById(
            "signupModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }

}


function closeSignup() {

    const modal =
        document.getElementById(
            "signupModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


// ======================================================
// LOGIN
// ======================================================

async function loginUser() {

    const emailElement =
        document.getElementById(
            "loginEmail"
        );


    const passwordElement =
        document.getElementById(
            "loginPassword"
        );


    if (
        !emailElement ||
        !passwordElement
    ) {

        alert(
            "Login form not found."
        );

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


    try {

        const result =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (result.error) {

            alert(
                result.error.message
            );

            return;

        }


        alert(
            "Login successful!"
        );


        closeLogin();


        openDashboard();


    } catch (error) {

        console.error(error);


        alert(
            "Login failed."
        );

    }

}


// ======================================================
// SIGNUP
// ======================================================

async function signupUser() {

    const nameElement =
        document.getElementById(
            "signupName"
        );


    const emailElement =
        document.getElementById(
            "signupEmail"
        );


    const passwordElement =
        document.getElementById(
            "signupPassword"
        );


    if (
        !nameElement ||
        !emailElement ||
        !passwordElement
    ) {

        alert(
            "Signup form not found."
        );

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


    if (
        password.length < 6
    ) {

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

        const result =
            await supabaseClient.auth.signUp({

                email: email,

                password: password,

                options: {

                    data: {
                        name: name
                    }

                }

            });


        if (result.error) {

            alert(
                "Signup failed!\n\n" +
                result.error.message
            );

            return;

        }


        alert(
            "Account created successfully!"
        );


        closeSignup();

        showLogin();


    } catch (error) {

        console.error(error);


        alert(
            "Signup failed."
        );

    }

}


// ======================================================
// BOOKING
// ======================================================

function openBooking(
    itemName,
    price
) {

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


    const rentalDaysElement =
        document.getElementById(
            "rentalDays"
        );


    const modal =
        document.getElementById(
            "bookingModal"
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


    if (rentalDaysElement) {

        rentalDaysElement.value =
            1;

    }


    calculateTotal();


    if (modal) {

        modal.style.display =
            "flex";

    }

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

    const rentalDaysElement =
        document.getElementById(
            "rentalDays"
        );


    const totalElement =
        document.getElementById(
            "bookingTotal"
        );


    if (
        !rentalDaysElement ||
        !totalElement
    ) {

        return;

    }


    let days =
        parseInt(
            rentalDaysElement.value
        );


    if (
        isNaN(days) ||
        days < 1
    ) {

        days = 1;

        rentalDaysElement.value =
            1;

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

    const rentalDaysElement =
        document.getElementById(
            "rentalDays"
        );


    const itemNameElement =
        document.getElementById(
            "bookingItemName"
        );


    if (
        !rentalDaysElement ||
        !itemNameElement
    ) {

        return;

    }


    const days =
        parseInt(
            rentalDaysElement.value
        );


    const itemName =
        itemNameElement.innerText;


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
            (days === 1
                ? " Day"
                : " Days");

    }


    if (paymentAmount) {

        paymentAmount.innerText =
            "₹" + total;

    }


    selectedPaymentMethod = "";


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
// SELECT PAYMENT METHOD
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


    myBookings.push(
        booking
    );


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

        const result =
            await supabaseClient.auth.signInWithOAuth({

                provider: "google",

                options: {

                    redirectTo:
                        window.location.origin

                }

            });


        if (result.error) {

            alert(
                "Google Login Failed:\n\n" +
                result.error.message
            );

        }

    } catch (error) {

        console.error(error);

        alert(
            "Google Login Failed."
        );

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


    recognition.maxAlternatives =
        1;


    recognition.onstart =
        function() {

            console.log(
                "Voice search started."
            );

        };


    recognition.onresult =
        function(event) {

            const text =
                event.results[0][0].transcript;


            const searchInput =
                document.getElementById(
                    "searchInput"
                );


            if (searchInput) {

                searchInput.value =
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
                event.error ===
                "not-allowed"
            ) {

                alert(
                    "Please allow microphone permission in your browser."
                );

            } else {

                alert(
                    "Voice search error: " +
                    event.error
                );

            }

        };


    recognition.onend =
        function() {

            console.log(
                "Voice search stopped."
            );

        };


    try {

        recognition.start();

    } catch (error) {

        console.error(
            "Voice start error:",
            error
        );

    }

}


// ======================================================
// INITIALIZE REAL WORLD MAP
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

        alert(
            "Map library could not be loaded. Please check your internet connection."
        );

        return;

    }


    if (rentalMap) {

        return;

    }


    // World view
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


    // OpenStreetMap tiles
    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            maxZoom: 19,

            attribution:
                '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'

        }

    ).addTo(
        rentalMap
    );


    // Add rental markers
    addRentalMarkers();


    // Fix map size
    setTimeout(
        function() {

            rentalMap.invalidateSize();

        },
        300
    );


    console.log(
        "Flex Rent world map initialized."
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
                L.marker([
                    item.lat,
                    item.lng
                ]).addTo(
                    rentalMap
                );


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


                    <strong
                        style="
                            font-size:16px;
                        "
                    >
                        ${item.name}
                    </strong>


                    <p
                        style="
                            margin:8px 0;
                            color:#16a085;
                            font-weight:bold;
                        "
                    >
                        ₹${item.price}/day
                    </p>


                    <button
                        type="button"
                        onclick="openBooking('${item.name.replace(/'/g, "\\'")}', ${item.price})"
                        style="
                            background:#16a085;
                            color:white;
                            border:none;
                            padding:9px 15px;
                            border-radius:6px;
                            cursor:pointer;
                        "
                    >
                        Rent Now
                    </button>

                </div>

            `);


            rentalMarkers.push(
                marker
            );

        }
    );

}


// ======================================================
// GET USER LOCATION
// ======================================================

function getMyLocation() {

    if (!rentalMap) {

        alert(
            "Map is still loading. Please wait a moment."
        );

        return;

    }


    if (
        !navigator.geolocation
    ) {

        alert(
            "Geolocation is not supported by your browser."
        );

        return;

    }


    const status =
        document.getElementById(
            "locationStatus"
        );


    if (status) {

        status.innerText =
            "📍 Finding your location...";

    }


    navigator.geolocation.getCurrentPosition(

        function(position) {

            const lat =
                position.coords.latitude;


            const lng =
                position.coords.longitude;


            rentalMap.setView(
                [lat, lng],
                15
            );


            // Remove old user marker
            if (
                userLocationMarker
            ) {

                rentalMap.removeLayer(
                    userLocationMarker
                );

            }


            // Add user marker
            userLocationMarker =
                L.marker(
                    [lat, lng]
                ).addTo(
                    rentalMap
                );


            userLocationMarker
                .bindPopup(
                    "📍 You are here"
                )
                .openPopup();


            if (status) {

                status.innerText =
                    "📍 Your location found.";

            }


            console.log(
                "User location:",
                lat,
                lng
            );

        },


        function(error) {

            console.error(
                "Geolocation error:",
                error
            );


            if (status) {

                status.innerText =
                    "Location permission was not allowed.";

            }


            if (
                error.code === 1
            ) {

                alert(
                    "Location permission was denied.\n\nPlease allow Location permission for this website and try again."
                );

            } else if (
                error.code === 2
            ) {

                alert(
                    "Your location could not be detected. Please check your device location/GPS."
                );

            } else if (
                error.code === 3
            ) {

                alert(
                    "Location request timed out. Please try again."
                );

            } else {

                alert(
                    "Unable to find your location."
                );

            }

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


// ======================================================
// SEARCH THIS AREA
// ======================================================

function searchThisArea() {

    if (!rentalMap) {

        return;

    }


    const center =
        rentalMap.getCenter();


    let nearestItem =
        null;


    let nearestDistance =
        Infinity;


    rentalLocations.forEach(
        function(item) {

            const distance =
                Math.sqrt(

                    Math.pow(
                        item.lat -
                        center.lat,
                        2
                    )

                    +

                    Math.pow(
                        item.lng -
                        center.lng,
                        2
                    )

                );


            if (
                distance <
                nearestDistance
            ) {

                nearestDistance =
                    distance;

                nearestItem =
                    item;

            }

        }
    );


    if (nearestItem) {

        rentalMap.setView(

            [
                nearestItem.lat,
                nearestItem.lng
            ],

            15

        );


        alert(
            "Nearby rental item:\n\n" +
            nearestItem.name +
            "\n₹" +
            nearestItem.price +
            "/day"
        );

    }

}


// ======================================================
// SEARCH MAP ITEMS
// ======================================================

function searchMapItems() {

    const inputElement =
        document.getElementById(
            "mapSearchInput"
        );


    if (!inputElement) {

        return;

    }


    const input =
        inputElement.value
            .toLowerCase()
            .trim();


    if (
        input === ""
    ) {

        rentalMap.setView(
            [20, 0],
            2
        );

        return;

    }


    // First search rental items
    const item =
        rentalLocations.find(
            function(location) {

                return location.name
                    .toLowerCase()
                    .includes(input);

            }
        );


    if (item) {

        rentalMap.setView(

            [
                item.lat,
                item.lng
            ],

            16

        );


        // Find marker and open popup
        const markerIndex =
            rentalLocations.indexOf(
                item
            );


        if (
            rentalMarkers[markerIndex]
        ) {

            rentalMarkers[
                markerIndex
            ].openPopup();

        }


        return;

    }


    // Try location search using OpenStreetMap
    searchWorldLocation(input);

}


// ======================================================
// WORLD LOCATION SEARCH
// ======================================================

async function searchWorldLocation(query) {

    if (!rentalMap) {

        return;

    }


    try {

        const url =
            "https://nominatim.openstreetmap.org/search" +
            "?format=json" +
            "&limit=1" +
            "&q=" +
            encodeURIComponent(query);


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Location search failed."
            );

        }


        const data =
            await response.json();


        if (
            !data ||
            data.length === 0
        ) {

            alert(
                "Location not found."
            );

            return;

        }


        const result =
            data[0];


        const lat =
            parseFloat(
                result.lat
            );


        const lng =
            parseFloat(
                result.lon
            );


        rentalMap.setView(
            [lat, lng],
            12
        );


        L.marker(
            [lat, lng]
        )
        .addTo(rentalMap)
        .bindPopup(
            "<b>" +
            result.display_name +
            "</b>"
        )
        .openPopup();


    } catch (error) {

        console.error(
            "World location search error:",
            error
        );


        alert(
            "Unable to search this location. Please try again."
        );

    }

}


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


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateDashboardStats();

        initializeRentalMap();

    }
);


// ======================================================
// SUPABASE AUTH STATE
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        if (
            typeof supabaseClient === "undefined" ||
            !supabaseClient
        ) {

            console.warn(
                "Supabase client not found."
            );

            return;

        }


        try {

            const result =
                await supabaseClient.auth.getSession();


            const session =
                result.data?.session;


            if (session) {

                console.log(
                    "User is logged in:",
                    session.user.email
                );

            } else {

                console.log(
                    "No active Supabase session."
                );

            }

        } catch (error) {

            console.error(
                "Supabase session error:",
                error
            );

        }

    }
);


// ======================================================
// FLEX RENT SCRIPT COMPLETE
// ======================================================
