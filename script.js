// ======================================================
// FLEX RENT - COMPLETE JAVASCRIPT
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

    const searchInput =
        document.getElementById("searchInput").value.toLowerCase().trim();

    const items =
        document.querySelectorAll(".item-card");

    const noResults =
        document.getElementById("noResults");

    let found = false;

    items.forEach(function(item) {

        const nameElement = item.querySelector("h3");
        const descriptionElement = item.querySelector("p");

        if (!nameElement || !descriptionElement) {
            return;
        }

        const itemName =
            nameElement.innerText.toLowerCase();

        const itemDescription =
            descriptionElement.innerText.toLowerCase();

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
        noResults.style.display = found ? "none" : "block";
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
        noResults.style.display = found ? "none" : "block";
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

    const name =
        document.getElementById("itemName").value.trim();

    const price =
        document.getElementById("itemPrice").value.trim();

    const category =
        document.getElementById("itemCategory").value;

    const location =
        document.getElementById("itemLocation").value.trim();

    const description =
        document.getElementById("itemDescription").value.trim();

    const imageFile =
        document.getElementById("itemImage").files[0];


    if (
        name === "" ||
        price === "" ||
        location === "" ||
        description === "" ||
        !imageFile
    ) {

        alert("Please fill all the details and select an image.");
        return;
    }


    if (isNaN(price) || Number(price) <= 0) {

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

    const newItem =
        document.createElement("div");

    newItem.className = "item-card";

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

    updateDashboardStats();

    alert(
        "Item added successfully!\n\n" +
        name +
        " is now available for rent."
    );

    closeListForm();


    document.getElementById("itemName").value = "";
    document.getElementById("itemPrice").value = "";
    document.getElementById("itemLocation").value = "";
    document.getElementById("itemDescription").value = "";
    document.getElementById("itemImage").value = "";
}


// ======================================================
// DASHBOARD
// ======================================================

async function openDashboard() {

    // Supabase available hai ya nahi check
    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {
        alert("Supabase is not connected.");
        return;
    }


    const result =
        await supabaseClient.auth.getUser();

    const user =
        result.data?.user;

    const error =
        result.error;


    if (error || !user) {

        alert("Please login first.");
        return;
    }


    const emailElement =
        document.getElementById("dashboardUserEmail");

    const nameElement =
        document.getElementById("dashboardUserName");


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
        document.getElementById("dashboardModal");

    if (dashboardModal) {
        dashboardModal.style.display = "flex";
    }
}


function closeDashboard() {

    const modal =
        document.getElementById("dashboardModal");

    if (modal) {
        modal.style.display = "none";
    }
}


// ======================================================
// DASHBOARD STATISTICS
// ======================================================

function updateDashboardStats() {

    const totalListings =
        document.getElementById("totalListings");

    const totalBookings =
        document.getElementById("totalBookings");


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
        document.getElementById("myListingsModal");

    if (modal) {
        modal.style.display = "flex";
    }
}


function closeMyListings() {

    const modal =
        document.getElementById("myListingsModal");

    if (modal) {
        modal.style.display = "none";
    }
}


// ======================================================
// DISPLAY MY LISTINGS
// ======================================================

function displayMyListings() {

    const container =
        document.getElementById("myListingsContainer");


    if (!container) {
        return;
    }


    if (myListings.length === 0) {

        container.innerHTML = `
            <p style="text-align:center; margin-top:30px;">
                No items listed yet.
            </p>
        `;

        return;
    }


    container.innerHTML = "";


    myListings.forEach(function(listing, index) {

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

    alert("Listing deleted successfully.");
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

    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;


    if (email === "" || password === "") {

        alert("Please enter email and password.");
        return;
    }


    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        alert("Supabase is not connected.");
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

        alert("Please fill all fields.");
        return;
    }


    if (password.length < 6) {

        alert("Password must be at least 6 characters.");
        return;
    }


    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        alert("Supabase is not connected.");
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


    showLogin();
}


// ======================================================
// BOOKING SYSTEM
// ======================================================

let selectedItemPrice = 0;


// ======================================================
// OPEN BOOKING
// ======================================================

function openBooking(itemName, price) {

    selectedItemPrice =
        Number(price);


    document.getElementById("bookingItemName").innerText =
        itemName;


    document.getElementById("bookingItemPrice").innerText =
        "₹" +
        selectedItemPrice +
        "/day";


    document.getElementById("rentalDays").value = 1;


    calculateTotal();


    document.getElementById("bookingModal").style.display =
        "flex";
}


// ======================================================
// CLOSE BOOKING
// ======================================================

function closeBooking() {

    document.getElementById("bookingModal").style.display =
        "none";
}


// ======================================================
// CALCULATE TOTAL
// ======================================================

function calculateTotal() {

    let days =
        parseInt(
            document.getElementById("rentalDays").value
        );


    if (isNaN(days) || days < 1) {

        days = 1;

        document.getElementById("rentalDays").value = 1;
    }


    const total =
        selectedItemPrice * days;


    document.getElementById("bookingTotal").innerText =
        "₹" + total;
}


// ======================================================
// PAYMENT VARIABLES
// ======================================================

let selectedPaymentMethod = "";

let currentPaymentItem = "";

let currentPaymentDays = 1;

let currentPaymentAmount = 0;


// ======================================================
// PROCEED TO PAYMENT
// ======================================================

function proceedToPayment() {

    const days =
        parseInt(
            document.getElementById("rentalDays").value
        );


    const itemName =
        document.getElementById("bookingItemName").innerText;


    if (isNaN(days) || days < 1) {

        alert("Please select at least 1 day.");
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


    document.getElementById("paymentItem").innerText =
        itemName;


    document.getElementById("paymentDays").innerText =
        days +
        (days === 1 ? " Day" : " Days");


    document.getElementById("paymentAmount").innerText =
        "₹" + total;


    selectedPaymentMethod = "";


    document.getElementById("selectedPayment").innerText =
        "Please select a payment method.";


    closeBooking();


    document.getElementById("paymentModal").style.display =
        "flex";
}


// ======================================================
// SELECT PAYMENT METHOD
// ======================================================

function selectPaymentMethod(method) {

    selectedPaymentMethod =
        method;


    document.getElementById("selectedPayment").innerText =
        "Selected: " + method;
}


// ======================================================
// MAKE PAYMENT
// ======================================================

function makePayment() {

    if (selectedPaymentMethod === "") {

        alert("Please select a payment method.");
        return;
    }


    const booking = {

        item: currentPaymentItem,

        days: currentPaymentDays,

        amount: currentPaymentAmount,

        method: selectedPaymentMethod,

        status: "Confirmed"

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

    document.getElementById("paymentModal").style.display =
        "none";
}


// ======================================================
// GOOGLE LOGIN
// ======================================================

async function googleLogin() {

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        alert("Supabase is not connected.");
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


    recognition.onstart = function() {

        console.log("Microphone started.");
    };


    recognition.onresult = function(event) {

        const text =
            event.results[0][0].transcript;


        const searchInput =
            document.getElementById("searchInput");


        searchInput.value = text;


        searchItems();
    };


    recognition.onerror = function(event) {

        console.error(
            "Microphone error:",
            event.error
        );


        alert(
            "Microphone error: " +
            event.error
        );
    };


    recognition.onend = function() {

        console.log("Microphone stopped.");
    };


    try {

        recognition.start();

    } catch (error) {

        console.error(error);

    }
}


// ======================================================
// CLOSE MODALS OUTSIDE CLICK
// ======================================================

window.onclick = function(event) {

    const modals = [

        "listModal",
        "loginModal",
        "signupModal",
        "bookingModal",
        "paymentModal",
        "dashboardModal",
        "myListingsModal"

    ];


    modals.forEach(function(id) {

        const modal =
            document.getElementById(id);


        if (
            modal &&
            event.target === modal
        ) {

            modal.style.display = "none";
        }

    });

};


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateDashboardStats();

    }
);


// ======================================================
// FLEX RENT SCRIPT COMPLETE
// ======================================================
