// ======================================================
// FLEX RENT - COMPLETE SCRIPT
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
let userLocation = null;
let userMarker = null;


// ======================================================
// RENTAL LOCATIONS
// ======================================================

const rentalLocations = [

    {
        name: "Engineering Books",
        price: 50,
        category: "Everyday",
        lat: 22.5726,
        lng: 88.3639,
        icon: "📚"
    },

    {
        name: "Laptop",
        price: 500,
        category: "Everyday",
        lat: 22.5750,
        lng: 88.3700,
        icon: "💻"
    },

    {
        name: "Power Sprayer",
        price: 300,
        category: "Agriculture",
        lat: 22.5958,
        lng: 88.2636,
        icon: "🌾"
    },

    {
        name: "Drilling Machine",
        price: 250,
        category: "Construction",
        lat: 22.5680,
        lng: 88.3600,
        icon: "🛠️"
    },

    {
        name: "Industrial Tool Kit",
        price: 400,
        category: "Industrial",
        lat: 22.5650,
        lng: 88.3750,
        icon: "⚙️"
    },

    {
        name: "Garden Tool Set",
        price: 150,
        category: "Gardening",
        lat: 22.5800,
        lng: 88.3550,
        icon: "🌱"
    }

];


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

        const name =
            item.querySelector("h3");

        const description =
            item.querySelector("p");

        if (!name) return;

        const itemName =
            name.innerText.toLowerCase();

        const itemDescription =
            description
                ? description.innerText.toLowerCase()
                : "";

        if (
            searchText === "" ||
            itemName.includes(searchText) ||
            itemDescription.includes(searchText)
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


// ======================================================
// LIST ITEM FORM
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

        alert(
            "Please enter a valid price."
        );

        return;

    }


    const imageURL =
        URL.createObjectURL(imageFile);


    const listing = {

        name: name,

        price: Number(price),

        category: category,

        location: location,

        description: description,

        image: imageURL

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
                    src="${imageURL}"
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
                        ₹${Number(price)}/day
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
// LOGIN USER
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


    const { error } =
        await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

        });


    if (error) {

        alert(
            "Login failed!\n\n" +
            error.message
        );

        return;

    }


    alert(
        "Login successful!"
    );


    closeLogin();

    openDashboard();

}


// ======================================================
// SIGN UP USER
// ======================================================

async function signupUser() {

    const name =
        document.getElementById("signupName").value.trim();

    const email =
        document.getElementById("signupEmail").value.trim();

    const password =
        document.getElementById("signupPassword").value;


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

        alert(
            "Signup failed!\n\n" +
            error.message
        );

        return;

    }


    alert(
        "Account created successfully!"
    );


    closeSignup();

    showLogin();

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


    if (result.error || !user) {

        alert(
            "Please login first."
        );

        showLogin();

        return;

    }


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
            user.user_metadata?.name ||
            "Flex Rent User";

    }


    if (emailElement) {

        emailElement.innerText =
            user.email || "";

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

            <p style="
                text-align:center;
                margin-top:30px;
                color:#777;
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


    if (!listing) return;


    const answer =
        confirm(
            "Do you want to delete " +
            listing.name +
            "?"
        );


    if (!answer) return;


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
// CALCULATE BOOKING TOTAL
// ======================================================

function calculateTotal() {

    const daysElement =
        document.getElementById(
            "rentalDays"
        );


    if (!daysElement) return;


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
        selectedItemPrice *
        days;


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
// PROCEED TO PAYMENT
// ======================================================

function proceedToPayment() {

    const daysElement =
        document.getElementById(
            "rentalDays"
        );


    const nameElement =
        document.getElementById(
            "bookingItemName"
        );


    if (!daysElement || !nameElement) {

        return;

    }


    const days =
        parseInt(
            daysElement.value
        );


    if (
        isNaN(days) ||
        days < 1
    ) {

        alert(
            "Please select at least 1 day."
        );

        return;

    }


    const itemName =
        nameElement.innerText;


    const total =
        selectedItemPrice *
        days;


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


    const modal =
        document.getElementById(
            "paymentModal"
        );


    if (modal) {

        modal.style.display = "flex";

    }

}


// ======================================================
// PAYMENT METHOD
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


    if (event && event.currentTarget) {

        event.currentTarget.classList.add(
            "selected"
        );

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


function closePayment() {

    const modal =
        document.getElementById(
            "paymentModal"
        );


    if (modal) {

        modal.style.display = "none";

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


    const { error } =
        await supabaseClient.auth.signInWithOAuth({

            provider: "google",

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


    const micButton =
        document.querySelector(
            ".mic-button"
        );


    if (micButton) {

        micButton.classList.add(
            "listening"
        );

    }


    recognition.onresult =
        function(event) {

            const text =
                event
                    .results[0][0]
                    .transcript;


            const input =
                document.getElementById(
                    "searchInput"
                );


            if (input) {

                input.value =
                    text;

                searchItems();

            }

        };


    recognition.onerror =
        function(event) {

            console.error(
                "Voice search error:",
                event.error
            );

        };


    recognition.onend =
        function() {

            if (micButton) {

                micButton.classList.remove(
                    "listening"
                );

            }

        };


    try {

        recognition.start();

    } catch (error) {

        console.error(error);

    }

}


// ======================================================
// LOCATION STATUS
// ======================================================

function setLocationStatus(message) {

    const status =
        document.getElementById(
            "locationStatus"
        );


    if (status) {

        status.innerText =
            message;

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

        console.log(
            "Map container not found yet."
        );

        return;

    }


    if (
        typeof L === "undefined"
    ) {

        console.error(
            "Leaflet library not loaded."
        );

        setLocationStatus(
            "Map library is loading. Please refresh the page."
        );

        return;

    }


    if (rentalMap) {

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

            attribution:
                '&copy; OpenStreetMap contributors',

            maxZoom:
                19

        }
    ).addTo(
        rentalMap
    );


    addRentalMarkers();


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

    if (!rentalMap) return;


    rentalLocations.forEach(
        function(item) {

            const marker =
                L.marker(
                    [
                        item.lat,
                        item.lng
                    ]
                )
                .addTo(
                    rentalMap
                );


            marker.bindPopup(`

                <div style="
                    min-width:180px;
                    font-family:Arial,sans-serif;
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

                    <small>
                        ${item.category}
                    </small>

                    <br><br>

                    <button
                        onclick="openBooking('${item.name.replace(/'/g, "\\'")}', ${item.price})"
                        style="
                            background:#16a085;
                            color:white;
                            border:none;
                            padding:9px 14px;
                            border-radius:7px;
                            cursor:pointer;
                            font-weight:bold;
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
// OPEN MAP
// ======================================================

function openMap() {

    const mapElement =
        document.getElementById(
            "rentalMap"
        );


    if (!mapElement) {

        createMapModal();

    }


    const modal =
        document.getElementById(
            "worldMapModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }


    setTimeout(
        function() {

            initializeRentalMap();

            if (rentalMap) {

                rentalMap.invalidateSize();

            }

        },
        200
    );

}


// ======================================================
// CREATE MAP MODAL IF NEEDED
// ======================================================

function createMapModal() {

    if (
        document.getElementById(
            "worldMapModal"
        )
    ) {

        return;

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "worldMapModal";


    modal.className =
        "modal";


    modal.innerHTML = `

        <div style="
            width:94%;
            max-width:1100px;
            height:85vh;
            background:white;
            border-radius:16px;
            padding:15px;
            position:relative;
            box-shadow:0 20px 60px rgba(0,0,0,.25);
        ">

            <button
                onclick="closeMap()"
                style="
                    position:absolute;
                    right:18px;
                    top:12px;
                    z-index:1000;
                    width:38px;
                    height:38px;
                    border:none;
                    border-radius:50%;
                    background:white;
                    font-size:25px;
                    cursor:pointer;
                    box-shadow:0 3px 12px rgba(0,0,0,.2);
                "
            >
                ×
            </button>

            <div
                id="rentalMap"
                style="
                    width:100%;
                    height:100%;
                    border-radius:12px;
                "
            ></div>

            <button
                onclick="findMyLocation()"
                style="
                    position:absolute;
                    left:30px;
                    bottom:30px;
                    z-index:1000;
                    background:white;
                    border:none;
                    padding:12px 16px;
                    border-radius:10px;
                    font-weight:bold;
                    cursor:pointer;
                    box-shadow:0 4px 15px rgba(0,0,0,.2);
                "
            >
                📍 Use My Location
            </button>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    modal.addEventListener(
        "click",
        function(event) {

            if (
                event.target === modal
            ) {

                closeMap();

            }

        }
    );

}


// ======================================================
// CLOSE MAP
// ======================================================

function closeMap() {

    const modal =
        document.getElementById(
            "worldMapModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


// ======================================================
// FIND USER LOCATION
// ======================================================

function findMyLocation() {

    if (
        !navigator.geolocation
    ) {

        setLocationStatus(
            "Your browser does not support location."
        );

        alert(
            "Your browser does not support location."
        );

        return;

    }


    setLocationStatus(
        "Finding your location..."
    );


    navigator.geolocation.getCurrentPosition(

        function(position) {

            const lat =
                position.coords.latitude;

            const lng =
                position.coords.longitude;


            userLocation =
                [lat, lng];


            if (!rentalMap) {

                openMap();

                setTimeout(
                    function() {

                        showUserLocation(
                            lat,
                            lng
                        );

                    },
                    500
                );

                return;

            }


            showUserLocation(
                lat,
                lng
            );

        },


        function(error) {

            let message =
                "Unable to find your location.";


            if (
                error.code ===
                error.PERMISSION_DENIED
            ) {

                message =
                    "Location permission denied. Please allow location access in your browser.";

            }


            if (
                error.code ===
                error.POSITION_UNAVAILABLE
            ) {

                message =
                    "Your location is currently unavailable.";

            }


            if (
                error.code ===
                error.TIMEOUT
            ) {

                message =
                    "Location request timed out. Please try again.";

            }


            setLocationStatus(
                message
            );


            alert(
                message
            );

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
// SHOW USER LOCATION
// ======================================================

function showUserLocation(
    lat,
    lng
) {

    if (!rentalMap) {

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
        L.marker(
            [lat, lng]
        )
        .addTo(
            rentalMap
        );


    userMarker
        .bindPopup(
            "<b>📍 You are here</b>"
        )
        .openPopup();


    setLocationStatus(
        "Your location found successfully."
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


    if (!input) {

        return;

    }


    const text =
        input.value
            .toLowerCase()
            .trim();


    if (!text) {

        return;

    }


    const item =
        rentalLocations.find(
            function(location) {

                return (
                    location.name
                        .toLowerCase()
                        .includes(text)
                );

            }
        );


    if (!item) {

        alert(
            "No rental item found."
        );

        return;

    }


    openMap();


    setTimeout(
        function() {

            if (rentalMap) {

                rentalMap.setView(
                    [
                        item.lat,
                        item.lng
                    ],
                    16
                );

            }

        },
        500
    );

}


// ======================================================
// SEARCH THIS AREA
// ======================================================

function searchThisArea() {

    if (!rentalMap) {

        openMap();

        return;

    }


    const center =
        rentalMap.getCenter();


    const nearby =
        rentalLocations.filter(
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

                return distance < 0.2;

            }
        );


    if (nearby.length === 0) {

        alert(
            "No rental items found in this area."
        );

        return;

    }


    alert(
        nearby.length +
        " rental item(s) found in this area."
    );

}


// ======================================================
// CLOSE MODALS ON OUTSIDE CLICK
// ======================================================

window.addEventListener(
    "click",
    function(event) {

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
// KEYBOARD SEARCH
// ======================================================

document.addEventListener(
    "keydown",
    function(event) {

        const active =
            document.activeElement;


        const typing =
            active &&
            (
                active.tagName === "INPUT" ||
                active.tagName === "TEXTAREA"
            );


        if (
            event.key === "/" &&
            !typing
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

    }
);


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateDashboardStats();


        const mapButton =
            document.getElementById(
                "openMapBtn"
            );


        if (mapButton) {

            mapButton.addEventListener(
                "click",
                function() {

                    openMap();

                }
            );

        }


        const mapSearch =
            document.getElementById(
                "mapSearchInput"
            );


        if (mapSearch) {

            mapSearch.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key === "Enter"
                    ) {

                        searchMapItems();

                    }

                }
            );

        }

    }
);


// ======================================================
// SUPABASE AUTH STATE
// ======================================================

if (
    typeof supabaseClient !== "undefined" &&
    supabaseClient
) {

    supabaseClient.auth.onAuthStateChange(
        function(event, session) {

            console.log(
                "Supabase Auth:",
                event
            );

        }
    );

}


// ======================================================
// FLEX RENT SCRIPT END
// ======================================================
