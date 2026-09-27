// ======================================================
// FLEX RENT - COMPLETE SCRIPT.JS
// ======================================================


// ======================================================
// DATA
// ======================================================

let myListings = [];
let myBookings = [];


// ======================================================
// SEARCH ITEMS
// ======================================================

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

    items.forEach(function(item) {

        const nameElement =
            item.querySelector("h3");

        const descriptionElement =
            item.querySelector("p");

        if (!nameElement || !descriptionElement) {
            return;
        }

        const name =
            nameElement.innerText.toLowerCase();

        const description =
            descriptionElement.innerText.toLowerCase();

        if (
            searchText === "" ||
            name.includes(searchText) ||
            description.includes(searchText)
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
// ADD NEW ITEM
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


        newItem.innerHTML = `

            <div class="item-image">

                <img
                    src="${listing.image}"
                    alt="${name}"
                    style="
                        width:100%;
                        height:100%;
                        object-fit:cover;
                    "
                >

            </div>

            <div class="item-info">

                <span class="item-category">
                    ${category}
                </span>

                <h3>${name}</h3>

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
                        onclick="openBooking('${name.replace(/'/g, "\\'")}', ${Number(price)})"
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


        if (result.error || !user) {

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


        const modal =
            document.getElementById(
                "dashboardModal"
            );


        if (modal) {

            modal.style.display = "flex";

        }

    }

    catch (error) {

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
                document.createElement(
                    "div"
                );


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
// SIGNUP MODAL
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

    const emailElement =
        document.getElementById(
            "loginEmail"
        );


    const passwordElement =
        document.getElementById(
            "loginPassword"
        );


    if (!emailElement || !passwordElement) {

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
            await supabaseClient.auth
                .signInWithPassword({

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

    }

    catch (error) {

        console.error(error);

        alert(
            "Login failed."
        );

    }

}


// ======================================================
// SIGNUP USER
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
            "Account created!\n\n" +
            "Please check your email for confirmation."
        );


        showLogin();

    }

    catch (error) {

        console.error(error);

        alert(
            "Signup failed."
        );

    }

}


// ======================================================
// BOOKING SYSTEM
// ======================================================

let selectedItemPrice = 0;

let selectedPaymentMethod = "";

let currentPaymentItem = "";

let currentPaymentDays = 1;

let currentPaymentAmount = 0;


// ======================================================
// OPEN BOOKING
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


    const modal =
        document.getElementById(
            "bookingModal"
        );


    if (
        !itemNameElement ||
        !itemPriceElement ||
        !daysElement ||
        !modal
    ) {

        alert(
            "Booking section not found."
        );

        return;

    }


    itemNameElement.innerText =
        itemName;


    itemPriceElement.innerText =
        "₹" +
        selectedItemPrice +
        "/day";


    daysElement.value = 1;


    calculateTotal();


    modal.style.display = "flex";

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


    const totalElement =
        document.getElementById(
            "bookingTotal"
        );


    if (
        !daysElement ||
        !totalElement
    ) {

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


    if (
        !daysElement ||
        !itemElement
    ) {

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


    const element =
        document.getElementById(
            "selectedPayment"
        );


    if (element) {

        element.innerText =
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
            await supabaseClient.auth
                .signInWithOAuth({

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

    }

    catch (error) {

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

    }

    catch (error) {

        console.error(error);

    }

}


// ======================================================
// REAL MAP
// ======================================================

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
    }

];


// ======================================================
// INITIALIZE MAP
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

        console.error(
            "Map element #rentalMap not found."
        );

        return;

    }


    if (rentalMap !== null) {
        return;
    }


    rentalMap =
        L.map("rentalMap")
            .setView(
                [22.5726, 88.3639],
                13
            );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {

            attribution:
                "&copy; OpenStreetMap contributors"

        }
    ).addTo(rentalMap);


    addRentalMarkers();

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
                ]).addTo(rentalMap);


            marker.bindPopup(`

                <div style="
                    min-width:180px;
                    font-family:Arial;
                ">

                    <div style="
                        font-size:30px;
                        margin-bottom:8px;
                    ">
                        ${item.icon}
                    </div>

                    <strong>
                        ${item.name}
                    </strong>

                    <p style="
                        color:#16a085;
                        font-weight:bold;
                        margin:8px 0;
                    ">
                        ₹${item.price}/day
                    </p>

                    <button
                        onclick="openBooking('${item.name}', ${item.price})"
                        style="
                            background:#16a085;
                            color:white;
                            border:none;
                            padding:8px 14px;
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
// GET MY LOCATION
// ======================================================

function getMyLocation() {

    if (
        !navigator.geolocation
    ) {

        alert(
            "Your browser does not support location."
        );

        return;

    }


    if (!rentalMap) {

        alert(
            "Map is still loading. Please try again."
        );

        return;

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


            rentalMap.setView(
                [lat, lng],
                16
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
                ]).addTo(rentalMap);


            userMarker
                .bindPopup(
                    "📍 You are here"
                )
                .openPopup();

        },


        function(error) {

            console.error(
                "Location error:",
                error
            );


            if (error.code === 1) {

                alert(
                    "Location permission denied. Please allow location permission in your browser."
                );

            }

            else if (error.code === 2) {

                alert(
                    "Location could not be found."
                );

            }

            else if (error.code === 3) {

                alert(
                    "Location request timed out. Please try again."
                );

            }

            else {

                alert(
                    "Unable to get your location."
                );

            }

        },


        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }

    );

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


    const text =
        inputElement.value
            .toLowerCase()
            .trim();


    if (!rentalMap) {

        alert(
            "Map is not loaded yet."
        );

        return;

    }


    if (text === "") {

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
        [item.lat, item.lng],
        16
    );

}


// ======================================================
// SEARCH THIS AREA
// ======================================================

function searchThisArea() {

    if (!rentalMap) {

        alert(
            "Map is not loaded yet."
        );

        return;

    }


    alert(
        "Rental items in this map area are shown."
    );

}


// ======================================================
// CLOSE MODALS BY CLICKING OUTSIDE
// ======================================================

window.onclick =
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

    };


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
// FLEX RENT SCRIPT COMPLETE
// ======================================================
