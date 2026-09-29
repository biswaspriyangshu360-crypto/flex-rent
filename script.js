// =====================================================
// FLEX RENT - MAIN JAVASCRIPT
// Currency: Indian Rupees (₹)
// Image Upload: Supabase Storage
// =====================================================


// =====================================================
// STATE MANAGEMENT
// =====================================================

let currentUser = null;
let listings = [];
let map = null;
let mapMarkers = [];
let selectedListingForBooking = null;


// =====================================================
// CURRENCY FORMATTER
// =====================================================

function formatINR(amount) {
  const number = Number(amount) || 0;

  return `₹${number.toLocaleString("en-IN")}`;
}


// =====================================================
// MOCK INITIAL DATA
// Used when Supabase has no listings / is unavailable
// =====================================================

const mockListings = [
  {
    id: "1",
    title: "Caterpillar Mini Excavator",
    category: "Construction",
    description: "Heavy-duty compact excavator for digging and trenching.",
    price_per_day: 5000,
    location: "New York, USA",
    lat: 40.7128,
    lng: -74.0060,
    image_url:
      "https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&w=600&q=80"
  },

  {
    id: "2",
    title: "John Deere Farm Tractor",
    category: "Agriculture",
    description: "75HP tractor with multiple attachment capabilities.",
    price_per_day: 4000,
    location: "Texas, USA",
    lat: 31.9686,
    lng: -99.9018,
    image_url:
      "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=600&q=80"
  },

  {
    id: "3",
    title: "Bosch Professional Power Drill",
    category: "Everyday",
    description: "18V Cordless hammer drill with battery kit.",
    price_per_day: 500,
    location: "London, UK",
    lat: 51.5074,
    lng: -0.1278,
    image_url:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80"
  }
];


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

  // Hide Loading Screen
  setTimeout(() => {

    const loader = document.getElementById("loading-screen");

    if (loader) {
      loader.style.opacity = "0";

      setTimeout(() => {
        loader.style.display = "none";
      }, 500);
    }

  }, 1000);


  // Initialize website features
  initMap();
  setupVoiceSearch();
  setupEventListeners();
  loadListings();
  checkSession();

});


// =====================================================
// INITIALIZE LEAFLET MAP
// =====================================================

function initMap() {

  const mapElement = document.getElementById("map");

  if (!mapElement) return;

  map = L.map("map").setView(
    [20.5937, 78.9629],
    2
  );

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: "© OpenStreetMap contributors"
    }
  ).addTo(map);
}


// =====================================================
// UPDATE MAP MARKERS
// =====================================================

function updateMapMarkers(items) {

  if (!map) return;

  // Remove old markers
  mapMarkers.forEach(marker => {
    map.removeLayer(marker);
  });

  mapMarkers = [];


  items.forEach(item => {

    if (
      item.lat !== null &&
      item.lng !== null &&
      item.lat !== undefined &&
      item.lng !== undefined
    ) {

      const marker = L.marker([
        item.lat,
        item.lng
      ]).addTo(map);


      marker.bindPopup(`
        <b>${item.title}</b><br>
        Price: ${formatINR(item.price_per_day)}/day<br>

        <button
          onclick="openBookingModal('${item.id}')"
          style="
            margin-top:5px;
            background:#4F46E5;
            color:#fff;
            border:none;
            padding:4px 8px;
            border-radius:4px;
            cursor:pointer;
          "
        >
          Rent Now
        </button>
      `);


      mapMarkers.push(marker);

    }

  });

}


// =====================================================
// LOAD LISTINGS FROM SUPABASE
// =====================================================

async function loadListings() {

  try {

    const dbListings = await fetchListings();

    if (dbListings && dbListings.length > 0) {

      listings = dbListings;

    } else {

      listings = mockListings;

    }

  } catch (err) {

    console.warn(
      "Using fallback mock data because Supabase is unavailable."
    );

    listings = mockListings;

  }


  renderListings(listings);
  updateMapMarkers(listings);

}


// =====================================================
// RENDER LISTING CARDS
// =====================================================

function renderListings(items) {

  const container =
    document.getElementById("listings-grid");

  if (!container) return;

  container.innerHTML = "";


  if (!items || items.length === 0) {

    container.innerHTML =
      "<p>No rental items found.</p>";

    return;

  }


  items.forEach(item => {

    const card = document.createElement("div");

    card.className = "card";


    card.innerHTML = `
      <img
        src="${item.image_url || "https://via.placeholder.com/600x400?text=No+Image"}"
        alt="${item.title}"
      >

      <div class="card-body">

        <span class="card-category">
          ${item.category}
        </span>

        <h3 class="card-title">
          ${item.title}
        </h3>

        <p class="card-location">
          <i class="fa-solid fa-location-dot"></i>
          ${item.location}
        </p>

        <div class="card-price">
          ${formatINR(item.price_per_day)}
          <small>/ day</small>
        </div>

        <button
          class="btn btn-primary btn-block"
          onclick="openBookingModal('${item.id}')"
        >
          Rent Now
        </button>

      </div>
    `;


    container.appendChild(card);

  });

}


// =====================================================
// VOICE SEARCH
// =====================================================

function setupVoiceSearch() {

  const micBtn =
    document.getElementById("mic-btn");

  const searchInput =
    document.getElementById("search-input");


  if (!micBtn || !searchInput) return;


  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (SpeechRecognition) {

    const recognition =
      new SpeechRecognition();


    recognition.continuous = false;

    recognition.lang = "en-US";


    micBtn.addEventListener(
      "click",
      () => {

        try {

          micBtn.classList.add("listening");

          recognition.start();

        } catch (error) {

          console.warn(
            "Voice recognition already running."
          );

        }

      }
    );


    recognition.onresult = event => {

      const transcript =
        event.results[0][0].transcript;


      searchInput.value = transcript;

      micBtn.classList.remove("listening");

      filterListings();

    };


    recognition.onerror = () => {

      micBtn.classList.remove("listening");

      alert(
        "Voice search failed or was denied. Please try typing."
      );

    };


    recognition.onend = () => {

      micBtn.classList.remove("listening");

    };

  } else {

    micBtn.style.display = "none";

  }

}


// =====================================================
// FILTER LISTINGS
// =====================================================

function filterListings() {

  const searchInput =
    document.getElementById("search-input");

  if (!searchInput) return;


  const query =
    searchInput.value.toLowerCase();


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
        (item.title || "").toLowerCase();

      const location =
        (item.location || "").toLowerCase();

      const description =
        (item.description || "").toLowerCase();


      const matchesSearch =
        title.includes(query) ||
        location.includes(query) ||
        description.includes(query);


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
// EVENT LISTENERS
// =====================================================

function setupEventListeners() {

  // ---------------------------------------------------
  // SEARCH
  // ---------------------------------------------------

  const searchInput =
    document.getElementById("search-input");

  if (searchInput) {

    searchInput.addEventListener(
      "input",
      filterListings
    );

  }


  // ---------------------------------------------------
  // CATEGORY FILTER
  // ---------------------------------------------------

  document
    .querySelectorAll(".category-chip")
    .forEach(chip => {

      chip.addEventListener(
        "click",
        event => {

          document
            .querySelectorAll(".category-chip")
            .forEach(c =>
              c.classList.remove("active")
            );


          event.currentTarget.classList.add(
            "active"
          );


          filterListings();

        }
      );

    });


  // ---------------------------------------------------
  // MODALS
  // ---------------------------------------------------

  const authModal =
    document.getElementById("auth-modal");

  const listItemModal =
    document.getElementById("list-item-modal");

  const bookingModal =
    document.getElementById("booking-modal");


  // ---------------------------------------------------
  // AUTH BUTTON
  // ---------------------------------------------------

  const authNavBtn =
    document.getElementById("auth-nav-btn");


  if (authNavBtn) {

    authNavBtn.addEventListener(
      "click",
      () => {

        authModal.classList.remove("hidden");

      }
    );

  }


  // ---------------------------------------------------
  // LIST YOUR ITEM BUTTON
  // ---------------------------------------------------

  const listItemNavBtn =
    document.getElementById(
      "list-item-nav-btn"
    );


  if (listItemNavBtn) {

    listItemNavBtn.addEventListener(
      "click",
      () => {

        if (!currentUser) {

          alert(
            "Please login first to list an item."
          );

          authModal.classList.remove(
            "hidden"
          );

          return;

        }


        listItemModal.classList.remove(
          "hidden"
        );

      }
    );

  }


  // ---------------------------------------------------
  // CLOSE MODALS
  // ---------------------------------------------------

  document
    .querySelectorAll(".close-modal")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          if (authModal)
            authModal.classList.add("hidden");

          if (listItemModal)
            listItemModal.classList.add("hidden");

          if (bookingModal)
            bookingModal.classList.add("hidden");

        }
      );

    });


  // ===================================================
  // LOGIN / REGISTER
  // ===================================================

  let isRegistering = false;


  const toggleBtn =
    document.getElementById(
      "auth-toggle-btn"
    );


  if (toggleBtn) {

    toggleBtn.addEventListener(
      "click",
      event => {

        event.preventDefault();

        isRegistering =
          !isRegistering;


        document.getElementById(
          "auth-title"
        ).innerText =
          isRegistering
            ? "Register Account"
            : "Login to Flex Rent";


        document.getElementById(
          "auth-submit-btn"
        ).innerText =
          isRegistering
            ? "Register"
            : "Login";


        document
          .getElementById("name-group")
          .classList.toggle(
            "hidden",
            !isRegistering
          );


        document
          .getElementById("phone-group")
          .classList.toggle(
            "hidden",
            !isRegistering
          );

      }
    );

  }


  // ===================================================
  // AUTH FORM SUBMIT
  // ===================================================

  const authForm =
    document.getElementById("auth-form");


  if (authForm) {

    authForm.addEventListener(
      "submit",
      async event => {

        event.preventDefault();


        const email =
          document.getElementById(
            "auth-email"
          ).value;


        const password =
          document.getElementById(
            "auth-password"
          ).value;


        try {

          if (isRegistering) {

            const name =
              document.getElementById(
                "auth-name"
              ).value;


            const phone =
              document.getElementById(
                "auth-phone"
              ).value;


            await signUpUser(
              email,
              password,
              name,
              phone
            );


            alert(
              "Registration successful! Please log in."
            );

          } else {

            const data =
              await signInUser(
                email,
                password
              );


            currentUser =
              data.user;


            updateUIForUser();


            authModal.classList.add(
              "hidden"
            );


            alert(
              "Logged in successfully!"
            );

          }

        } catch (err) {

          alert(
            err.message ||
            "Authentication failed."
          );

        }

      }
    );

  }


  // ===================================================
  // NEW LISTING SUBMIT
  // ===================================================

  const listingForm =
    document.getElementById(
      "listing-form"
    );


  if (listingForm) {

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


        // Get image file
        const imageInput =
          document.getElementById(
            "item-image"
          );


        const imageFile =
          imageInput &&
          imageInput.files
            ? imageInput.files[0]
            : null;


        if (!imageFile) {

          alert(
            "Please select an image."
          );

          return;

        }


        try {

          // ------------------------------------------------
          // Upload image to Supabase Storage
          // ------------------------------------------------

          alert(
            "Uploading image... Please wait."
          );


          const imageUrl =
            await uploadListingImage(
              imageFile
            );


          // ------------------------------------------------
          // Create listing
          // ------------------------------------------------

          const newListing = {

            owner_id:
              currentUser.id,

            title:
              document.getElementById(
                "item-title"
              ).value,

            category:
              document.getElementById(
                "item-category"
              ).value,

            price_per_day:
              parseFloat(
                document.getElementById(
                  "item-price"
                ).value
              ),

            location:
              document.getElementById(
                "item-location"
              ).value,

            image_url:
              imageUrl,

            description:
              document.getElementById(
                "item-description"
              ).value,

            // Temporary coordinates
            lat:
              20.5937 +
              (Math.random() - 0.5) * 10,

            lng:
              78.9629 +
              (Math.random() - 0.5) * 10

          };


          // Save listing to Supabase
          const createdListing =
            await createListing(
              newListing
            );


          // Use database version if returned
          if (
            createdListing &&
            createdListing[0]
          ) {

            listings.unshift(
              createdListing[0]
            );

          } else {

            listings.unshift(
              newListing
            );

          }


          renderListings(listings);

          updateMapMarkers(listings);


          // Close modal
          listItemModal.classList.add(
            "hidden"
          );


          // Reset form
          listingForm.reset();


          alert(
            "Item published successfully!"
          );


        } catch (err) {

          console.error(
            "Listing upload error:",
            err
          );


          alert(
            err.message ||
            "Failed to publish listing."
          );

        }

      }
    );

  }


  // ===================================================
  // BOOKING DAYS
  // ===================================================

  const bookingDays =
    document.getElementById(
      "booking-days"
    );


  if (bookingDays) {

    bookingDays.addEventListener(
      "input",
      updateBookingSummary
    );

  }


  // ===================================================
  // PAYMENT OPTIONS
  // ===================================================

  document
    .querySelectorAll(".pay-option")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        event => {

          document
            .querySelectorAll(".pay-option")
            .forEach(b =>
              b.classList.remove("active")
            );


          event.currentTarget.classList.add(
            "active"
          );

        }
      );

    });


  // ===================================================
  // CONFIRM BOOKING
  // ===================================================

  const confirmBookingBtn =
    document.getElementById(
      "confirm-booking-btn"
    );


  if (confirmBookingBtn) {

    confirmBookingBtn.addEventListener(
      "click",
      async () => {

        if (!currentUser) {

          alert(
            "Please login to proceed with booking."
          );

          authModal.classList.remove(
            "hidden"
          );

          return;

        }


        if (!selectedListingForBooking) {

          alert(
            "Please select a listing first."
          );

          return;

        }


        const activePayment =
          document.querySelector(
            ".pay-option.active"
          );


        const selectedMethod =
          activePayment
            ? activePayment.dataset.method
            : "UPI";


        const days =
          parseInt(
            document.getElementById(
              "booking-days"
            ).value
          ) || 1;


        const total =
          days *
          Number(
            selectedListingForBooking.price_per_day
          );


        try {

          // ------------------------------------------------
          // Create Booking
          // ------------------------------------------------

          const bookingData = {

            listing_id:
              selectedListingForBooking.id,

            renter_id:
              currentUser.id,

            start_date:
              document.getElementById(
                "booking-date"
              ).value,

            duration_days:
              days,

            total_price:
              total

          };


          const createdBooking =
            await createBooking(
              bookingData
            );


          // ------------------------------------------------
          // Create Payment Record
          // ------------------------------------------------

          if (
            createdBooking &&
            createdBooking[0]
          ) {

            await createPayment({

              booking_id:
                createdBooking[0].id,

              amount:
                total,

              payment_method:
                selectedMethod

            });

          }


          alert(
            `Booking & Payment Confirmed via ${selectedMethod}!\n\nTotal: ${formatINR(total)}`
          );


          bookingModal.classList.add(
            "hidden"
          );


        } catch (err) {

          console.error(
            "Booking error:",
            err
          );


          /*
           IMPORTANT:
           This only means the local UI can continue.
           It does NOT mean a real payment was processed.
          */

          alert(
            `Booking could not be saved to the database.\n\nTotal: ${formatINR(total)}\n\nPlease check your Supabase tables and policies.`
          );

        }

      }
    );

  }

}


// =====================================================
// OPEN BOOKING MODAL
// =====================================================

window.openBookingModal = function(id) {

  selectedListingForBooking =
    listings.find(
      item => String(item.id) === String(id)
    );


  if (!selectedListingForBooking) {

    alert(
      "Listing not found."
    );

    return;

  }


  const titleElement =
    document.getElementById(
      "modal-item-title"
    );


  const locationElement =
    document.getElementById(
      "modal-item-location"
    );


  const priceElement =
    document.getElementById(
      "modal-item-price"
    );


  if (titleElement) {

    titleElement.innerText =
      selectedListingForBooking.title;

  }


  if (locationElement) {

    locationElement.innerText =
      `Location: ${selectedListingForBooking.location}`;

  }


  if (priceElement) {

    priceElement.innerText =
      `Price: ${formatINR(
        selectedListingForBooking.price_per_day
      )} / day`;

  }


  // Set today's date
  const bookingDate =
    document.getElementById(
      "booking-date"
    );


  if (bookingDate) {

    bookingDate.value =
      new Date()
        .toISOString()
        .split("T")[0];

  }


  // Reset days to 1
  const bookingDays =
    document.getElementById(
      "booking-days"
    );


  if (bookingDays) {

    bookingDays.value = 1;

  }


  updateBookingSummary();


  const bookingModal =
    document.getElementById(
      "booking-modal"
    );


  if (bookingModal) {

    bookingModal.classList.remove(
      "hidden"
    );

  }

};


// =====================================================
// UPDATE BOOKING SUMMARY
// =====================================================

function updateBookingSummary() {

  if (!selectedListingForBooking) return;


  const bookingDays =
    document.getElementById(
      "booking-days"
    );


  const days =
    parseInt(
      bookingDays
        ? bookingDays.value
        : 1
    ) || 1;


  const price =
    Number(
      selectedListingForBooking.price_per_day
    ) || 0;


  const total =
    days * price;


  const summaryRate =
    document.getElementById(
      "summary-rate"
    );


  const summaryDays =
    document.getElementById(
      "summary-days"
    );


  const summaryTotal =
    document.getElementById(
      "summary-total"
    );


  if (summaryRate) {

    summaryRate.innerText =
      formatINR(price);

  }


  if (summaryDays) {

    summaryDays.innerText =
      days;

  }


  if (summaryTotal) {

    summaryTotal.innerText =
      formatINR(total);

  }

}


// =====================================================
// USER SESSION
// =====================================================

async function checkSession() {

  try {

    const { data } =
      await supabase.auth.getSession();


    if (data.session) {

      currentUser =
        data.session.user;

      updateUIForUser();

    }

  } catch (error) {

    console.error(
      "Session check failed:",
      error
    );

  }

}


// =====================================================
// UPDATE UI AFTER LOGIN
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

    if (authButton) {

      authButton.classList.add(
        "hidden"
      );

    }


    if (dashboardButton) {

      dashboardButton.classList.remove(
        "hidden"
      );

    }

  } else {

    if (authButton) {

      authButton.classList.remove(
        "hidden"
      );

    }


    if (dashboardButton) {

      dashboardButton.classList.add(
        "hidden"
      );

    }

  }

}


// =====================================================
// OPTIONAL: LOGOUT HELPER
// Can be used by your dashboard/logout button
// =====================================================

async function logoutUser() {

  try {

    await signOutUser();

    currentUser = null;

    updateUIForUser();

    alert(
      "Logged out successfully."
    );

    location.reload();

  } catch (error) {

    alert(
      error.message ||
      "Logout failed."
    );

  }

}


// Make logout available globally
window.logoutUser = logoutUser;
// ================================
// DASHBOARD BASIC CONTROLS
// ================================

document.addEventListener("DOMContentLoaded", () => {

  const dashboardBtn = document.getElementById("dashboard-nav-btn");
  const dashboardSection = document.getElementById("dashboard-section");
  const logoutBtn = document.getElementById("logout-btn");

  // Open Dashboard
  if (dashboardBtn) {
    dashboardBtn.addEventListener("click", () => {

      if (!currentUser) {
        alert("Please login first.");
        return;
      }

      dashboardSection.classList.remove("hidden");

      // Hide marketplace when dashboard opens
      document.querySelector(".marketplace").classList.add("hidden");

      // Scroll to dashboard
      dashboardSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {

      try {
        await signOutUser();

        currentUser = null;

        updateUIForUser();

        dashboardSection.classList.add("hidden");

        document.querySelector(".marketplace").classList.remove("hidden");

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

        alert("Logged out successfully.");

      } catch (error) {
        alert("Logout failed: " + error.message);
      }
    });
  }

});
