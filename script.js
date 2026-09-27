// ======================================================
// FLEX RENT - COMPLETE JAVASCRIPT
// ======================================================


// ======================================================
// DATA
// ======================================================

// Items added by the current user
let myListings = [];

// Bookings made by the current user
let myBookings = [];


// ======================================================
// SEARCH ITEMS
// ======================================================

function searchItems() {

    let searchInput =
        document.getElementById("searchInput").value.toLowerCase();

    let items =
        document.querySelectorAll(".item-card");

    let found = false;

    items.forEach(function(item) {

        let itemName =
            item.querySelector("h3").innerText.toLowerCase();

        let itemDescription =
            item.querySelector("p").innerText.toLowerCase();

        if (
            itemName.includes(searchInput) ||
            itemDescription.includes(searchInput)
        ) {

            item.style.display = "block";
            found = true;

        } else {

            item.style.display = "none";

        }

    });

    let noResults =
        document.getElementById("noResults");

    if (found) {

        noResults.style.display = "none";

    } else {

        noResults.style.display = "block";

    }

}


// ======================================================
// CATEGORY FILTER
// ======================================================

function filterCategory(category) {

    let items =
        document.querySelectorAll(".item-card");

    let found = false;

    items.forEach(function(item) {

        let itemCategory =
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

    let noResults =
        document.getElementById("noResults");

    if (found) {

        noResults.style.display = "none";

    } else {

        noResults.style.display = "block";

    }

}


// ======================================================
// RENT ITEM
// ======================================================

function rentItem(itemName, price) {

    openBooking(itemName, price);

}


// ======================================================
// LIST YOUR ITEM MODAL
// ======================================================

function openListForm() {

    document.getElementById("listModal").style.display =
        "flex";

}


function closeListForm() {

    document.getElementById("listModal").style.display =
        "none";

}


// ======================================================
// ADD NEW ITEM
// ======================================================

function submitItem() {

    let name =
        document.getElementById("itemName").value.trim();

    let price =
        document.getElementById("itemPrice").value.trim();

    let category =
        document.getElementById("itemCategory").value;

    let location =
        document.getElementById("itemLocation").value.trim();

    let description =
        document.getElementById("itemDescription").value.trim();

    let imageFile =
        document.getElementById("itemImage").files[0];


    // Check all details

    if (
        name === "" ||
        price === "" ||
        location === "" ||
        description === "" ||
        !imageFile
    ) {

        alert(
            "Please fill all the details and select an image."
        );

        return;

    }


    // Check price

    if (
        isNaN(price) ||
        Number(price) <= 0
    ) {

        alert(
            "Please enter a valid price."
        );

        return;

    }


    // Create listing object

    let listing = {

        name: name,

        price: Number(price),

        category: category,

        location: location,

        description: description,

        image: URL.createObjectURL(imageFile)

    };


    // Save listing

    myListings.push(listing);


    // Add listing to marketplace

    let itemsContainer =
        document.getElementById("itemsContainer");


    let newItem =
        document.createElement("div");

    newItem.className = "item-card";

    newItem.setAttribute(
        "data-category",
        category
    );


    // Create item card

    newItem.innerHTML = `

        <div class="item-image">

            <img
                src="${listing.image}"
                alt="${name}"
                style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                "
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
                    onclick="openBooking('${name}', ${Number(price)})"
                >
                    Rent Now
                </button>

            </div>

        </div>

    `;


    // Add item to marketplace

    itemsContainer.appendChild(newItem);


    // Update dashboard

    updateDashboardStats();


    // Success message

    alert(
        "Item added successfully!\n\n" +
        name +
        " is now available for rent."
    );


    // Close modal

    closeListForm();


    // Clear form

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

    const { data: { user }, error } =
        await supabaseClient.auth.getUser();

    if (error || !user) {
        alert("Please login first.");
        return;
    }

    // Email show karo
    const emailElement =
        document.querySelector(".dashboard-profile p");

    if (emailElement) {
        emailElement.innerText = user.email;
    }

    // Name show karo
    const nameElement =
        document.querySelector(".dashboard-profile h3");

    if (nameElement) {
        nameElement.innerText =
            user.user_metadata?.name || "Flex Rent User";
    }

    // Dashboard stats
    updateDashboardStats();

    // Dashboard open
    document.getElementById("dashboardModal").style.display =
        "flex";
}


function closeDashboard() {

    document.getElementById("dashboardModal").style.display =
        "none";

}


// ======================================================
// DASHBOARD STATISTICS
// ======================================================

function updateDashboardStats() {

    let totalListings =
        document.getElementById("totalListings");

    let totalBookings =
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

    document.getElementById("myListingsModal").style.display =
        "flex";

}


function closeMyListings() {

    document.getElementById("myListingsModal").style.display =
        "none";

}


// ======================================================
// DISPLAY MY LISTINGS
// ======================================================

function displayMyListings() {

    let container =
        document.getElementById("myListingsContainer");


    if (!container) {

        return;

    }


    // No listings

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


    // Clear old content

    container.innerHTML = "";


    // Display every listing

    myListings.forEach(function(listing, index) {

        let card =
            document.createElement("div");

        card.className = "my-listing-card";


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

    let listing =
        myListings[index];


    let confirmDelete =
        confirm(
            "Do you want to delete " +
            listing.name +
            "?"
        );


    if (!confirmDelete) {

        return;

    }


    // Remove listing

    myListings.splice(index, 1);


    // Refresh My Listings

    displayMyListings();


    // Update dashboard number

    updateDashboardStats();


    alert(
        "Listing deleted successfully."
    );

}


// ======================================================
// LOGIN
// ======================================================

function showLogin() {

    document.getElementById("loginModal").style.display =
        "flex";

}


function closeLogin() {

    document.getElementById("loginModal").style.display =
        "none";

}


// ======================================================
// SIGN UP
// ======================================================

function showSignup() {

    closeLogin();

    document.getElementById("signupModal").style.display =
        "flex";

}


function closeSignup() {

    document.getElementById("signupModal").style.display =
        "none";

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

    const { data, error } =
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

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    if (!name || !email || !password) {
        alert("Please fill all fields.");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                name: name
            }
        }
    });

 if (error) {
    console.error("SUPABASE LOGIN ERROR:", error);
    alert(
        "Login failed!\n\n" +
        "Error: " + error.message
    );
    return;
}

    alert("Account created! Please check your email for confirmation.");

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


    document.getElementById("rentalDays").value =
        1;


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


    if (
        isNaN(days) ||
        days < 1
    ) {

        days = 1;

        document.getElementById("rentalDays").value =
            1;

    }


    let total =
        selectedItemPrice * days;


    document.getElementById("bookingTotal").innerText =
        "₹" +
        total;

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

    let days =
        parseInt(
            document.getElementById("rentalDays").value
        );


    let itemName =
        document.getElementById("bookingItemName").innerText;


    let total =
        selectedItemPrice * days;


    // Check days

    if (
        isNaN(days) ||
        days < 1
    ) {

        alert(
            "Please select at least 1 day."
        );

        return;

    }


    // Save payment details

    currentPaymentItem =
        itemName;

    currentPaymentDays =
        days;

    currentPaymentAmount =
        total;


    // Show details in payment modal

    document.getElementById("paymentItem").innerText =
        itemName;


    document.getElementById("paymentDays").innerText =
        days +
        (
            days === 1
                ? " Day"
                : " Days"
        );


    document.getElementById("paymentAmount").innerText =
        "₹" +
        total;


    // Reset payment method

    selectedPaymentMethod = "";


    document.getElementById("selectedPayment").innerText =
        "Please select a payment method.";


    // Close booking modal

    closeBooking();


    // Open payment modal

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
        "Selected: " +
        method;

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


    // Save booking

    let booking = {

        item: currentPaymentItem,

        days: currentPaymentDays,

        amount: currentPaymentAmount,

        method: selectedPaymentMethod,

        status: "Confirmed"

    };


    myBookings.push(booking);


    // Update dashboard

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
// CLOSE MODALS WHEN CLICKING OUTSIDE
// ======================================================

window.onclick = function(event) {

    let listModal =
        document.getElementById("listModal");

    let loginModal =
        document.getElementById("loginModal");

    let signupModal =
        document.getElementById("signupModal");

    let bookingModal =
        document.getElementById("bookingModal");

    let paymentModal =
        document.getElementById("paymentModal");

    let dashboardModal =
        document.getElementById("dashboardModal");

    let myListingsModal =
        document.getElementById("myListingsModal");


    if (event.target === listModal) {

        closeListForm();

    }


    if (event.target === loginModal) {

        closeLogin();

    }


    if (event.target === signupModal) {

        closeSignup();

    }


    if (event.target === bookingModal) {

        closeBooking();

    }


    if (event.target === paymentModal) {

        closePayment();

    }


    if (event.target === dashboardModal) {

        closeDashboard();

    }


    if (event.target === myListingsModal) {

        closeMyListings();

    }

};


// ======================================================
// FLEX RENT SCRIPT COMPLETE
// ======================================================
async function googleLogin() {

    const { data, error } =
        await supabaseClient.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.origin
            }
        });

    if (error) {
        alert("Google Login Failed: " + error.message);
        console.error(error);
    }
}
function startVoiceSearch() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Voice search is not supported in this browser.");
        return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.start();

    recognition.onresult = function(event) {

        const text =
            event.results[0][0].transcript;

        document.getElementById("searchInput").value = text;

        searchItems();
    };

    recognition.onerror = function(event) {

        alert("Microphone error: " + event.error);

    };
}
.mic-button {
    width: 48px;
    ...
}

.mic-button:hover {
    color: #16a085;
}
