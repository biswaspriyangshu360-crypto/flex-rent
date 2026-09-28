```javascript
// =====================================================
// STATE MANAGEMENT
// =====================================================

let currentUser = null;
let listings = [];
let map = null;
let mapMarkers = [];
let selectedListingForBooking = null;


// =====================================================
// MOCK INITIAL DATA
// =====================================================

const mockListings = [

  {
    id: "1",
    title: "Caterpillar Mini Excavator",
    category: "Construction",
    description:
      "Heavy-duty compact excavator for digging and trenching.",
    price_per_day: 5000,
    location: "Kolkata, India",
    lat: 22.5726,
    lng: 88.3639,
    image_url:
      "https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&w=600&q=80"
  },

  {
    id: "2",
    title: "John Deere Farm Tractor",
    category: "Agriculture",
    description:
      "75HP tractor with multiple attachment capabilities.",
    price_per_day: 4000,
    location: "Guwahati, India",
    lat: 26.1445,
    lng: 91.7362,
    image_url:
      "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=600&q=80"
  },

  {
    id: "3",
    title: "Bosch Professional Power Drill",
    category: "Everyday",
    description:
      "18V Cordless hammer drill with battery kit.",
    price_per_day: 500,
    location: "Mumbai, India",
    lat: 19.0760,
    lng: 72.8777,
    image_url:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80"
  }

];


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    // Hide Loading Screen
    setTimeout(() => {

      const loader =
        document.getElementById(
          "loading-screen"
        );

      if (loader) {

        loader.style.opacity = "0";

        setTimeout(() => {
          loader.style.display = "none";
        }, 500);

      }

    }, 1000);


    initMap();

    setupVoiceSearch();

    setupEventListeners();

    loadListings();

    checkSession();

  }
);


// =====================================================
// MAP
// =====================================================

function initMap() {

  map = L.map("map")
    .setView(
      [20.5937, 78.9629],
      2
    );


  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        "© OpenStreetMap contributors"
    }
  ).addTo(map);

}


// =====================================================
// UPDATE MAP MARKERS
// =====================================================

function updateMapMarkers(items) {

  if (!map) return;


  mapMarkers.forEach(
    marker => map.removeLayer(marker)
  );

  mapMarkers = [];


  items.forEach(item => {

    if (
      item.lat !== null &&
      item.lat !== undefined &&
      item.lng !== null &&
      item.lng !== undefined
    ) {

      const marker =
        L.marker([
          item.lat,
          item.lng
        ]).addTo(map);


      marker.bindPopup(`
        <div style="min-width:180px;">
          <b>${item.title}</b>
          <br>
          <span>
            ${item.location}
          </span>
          <br>
          <strong>
            ₹${Number(item.price_per_day).toLocaleString("en-IN")}/day
          </strong>
          <br>

          <button
            onclick="openBookingModal('${item.id}')"
            style="
              margin-top:8px;
              background:#4F46E5;
              color:#fff;
              border:none;
              padding:6px 10px;
              border-radius:4px;
              cursor:pointer;
            "
          >
            Rent Now
          </button>

        </div>
      `);


      mapMarkers.push(marker);

    }

  });

}


// =====================================================
// LOAD LISTINGS
// =====================================================

async function loadListings() {

  try {

    const dbListings =
      await fetchListings();


    listings =
      (
        dbListings &&
        dbListings.length > 0
      )
        ? dbListings
        : mockListings;


  } catch (err) {

    console.warn(
      "Using fallback mock data:",
      err.message
    );

    listings = mockListings;

  }


  renderListings(listings);

  updateMapMarkers(listings);

}


// =====================================================
// FORMAT INDIAN CURRENCY
// =====================================================

function formatINR(amount) {

  const number =
    Number(amount) || 0;

  return `₹${number.toLocaleString("en-IN")}`;

}


// =====================================================
// RENDER LISTINGS
// =====================================================

function renderListings(items) {

  const container =
    document.getElementById(
      "listings-grid"
    );


  container.innerHTML = "";


  if (items.length === 0) {

    container.innerHTML =
      "<p>No rental items found.</p>";

    return;

  }


  items.forEach(item => {

    const card =
      document.createElement("div");


    card.className = "card";


    card.innerHTML = `

      <img
        src="${item.image_url}"
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
    document.getElementById(
      "mic-btn"
    );

  const searchInput =
    document.getElementById(
      "search-input"
    );


  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (SpeechRecognition) {

    const recognition =
      new SpeechRecognition();


    recognition.continuous = false;

    recognition.lang = "en-IN";


    micBtn.addEventListener(
      "click",
      () => {

        micBtn.classList.add(
          "listening"
        );

        recognition.start();

      }
    );


    recognition.onresult =
      event => {

        const transcript =
          event.results[0][0]
            .transcript;


        searchInput.value =
          transcript;


        micBtn.classList.remove(
          "listening"
        );


        filterListings();

      };


    recognition.onerror =
      () => {

        micBtn.classList.remove(
          "listening"
        );

        alert(
          "Voice search failed or was denied. Please try typing."
        );

      };


    recognition.onend =
      () => {

        micBtn.classList.remove(
          "listening"
        );

      };

  } else {

    micBtn.style.display = "none";

  }

}


// =====================================================
// FILTER LISTINGS
// =====================================================

function filterListings() {

  const query =
    document
      .getElementById("search-input")
      .value
      .toLowerCase();


  const activeCategory =
    document
      .querySelector(
        ".category-chip.active"
      )
      .dataset.category;


  const filtered =
    listings.filter(item => {

      const matchesSearch =
        item.title
          .toLowerCase()
          .includes(query) ||

        item.location
          .toLowerCase()
          .includes(query) ||

        (item.description || "")
          .toLowerCase()
          .includes(query);


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

  // Search
  document
    .getElementById("search-input")
    .addEventListener(
      "input",
      filterListings
    );


  // Category filter
  document
    .querySelectorAll(
      ".category-chip"
    )
    .forEach(chip => {

      chip.addEventListener(
        "click",
        e => {

          document
            .querySelectorAll(
              ".category-chip"
            )
            .forEach(c =>
              c.classList.remove(
                "active"
              )
            );


          e.currentTarget.classList.add(
            "active"
          );


          filterListings();

        }
      );

    });


  // Modals
  const authModal =
    document.getElementById(
      "auth-modal"
    );

  const listItemModal =
    document.getElementById(
      "list-item-modal"
    );

  const bookingModal =
    document.getElementById(
      "booking-modal"
    );


  // Login
  document
    .getElementById("auth-nav-btn")
    .addEventListener(
      "click",
      () =>
        authModal.classList.remove(
          "hidden"
        )
    );


  // List Item
  document
    .getElementById(
      "list-item-nav-btn"
    )
    .addEventListener(
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


  // Close modals
  document
    .querySelectorAll(
      ".close-modal"
    )
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          authModal.classList.add(
            "hidden"
          );

          listItemModal.classList.add(
            "hidden"
          );

          bookingModal.classList.add(
            "hidden"
          );

        }
      );

    });


  // =================================================
  // AUTH TOGGLE
  // =================================================

  let isRegistering = false;


  const toggleBtn =
    document.getElementById(
      "auth-toggle-btn"
    );


  toggleBtn.addEventListener(
    "click",
    e => {

      e.preventDefault();

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


  // =================================================
  // AUTH FORM
  // =================================================

  document
    .getElementById("auth-form")
    .addEventListener(
      "submit",
      async e => {

        e.preventDefault();


        const email =
          document
            .getElementById(
              "auth-email"
            )
            .value
            .trim();


        const password =
          document
            .getElementById(
              "auth-password"
            )
            .value;


        try {

          if (isRegistering) {

            const name =
              document
                .getElementById(
                  "auth-name"
                )
                .value
                .trim();


            const phone =
              document
                .getElementById(
                  "auth-phone"
                )
                .value
                .trim();


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
            err.message
          );

        }

      }
    );


  // =================================================
  // NEW LISTING
  // =================================================

  document
    .getElementById("listing-form")
    .addEventListener(
      "submit",
      async e => {

        e.preventDefault();


        if (!currentUser) {

          alert(
            "Please login first to list an item."
          );

          return;

        }


        const imageInput =
          document.getElementById(
            "item-image"
          );


        const imageFile =
          imageInput.files[0];


        if (!imageFile) {

          alert(
            "Please select an image."
          );

          return;

        }


        const submitButton =
          e.target.querySelector(
            "button[type='submit']"
          );


        const originalText =
          submitButton.textContent;


        try {

          submitButton.disabled =
            true;

          submitButton.textContent =
            "Uploading Image...";


          // Upload image
          const imageUrl =
            await uploadListingImage(
              imageFile
            );


          // Create listing
          const newListing = {

            owner_id:
              currentUser.id,

            title:
              document
                .getElementById(
                  "item-title"
                )
                .value
                .trim(),

            category:
              document
                .getElementById(
                  "item-category"
                )
                .value,

            price_per_day:
              parseFloat(
                document
                  .getElementById(
                    "item-price"
                  )
                  .value
              ),

            location:
              document
                .getElementById(
                  "item-location"
                )
                .value
                .trim(),

            image_url:
              imageUrl,

            description:
              document
                .getElementById(
                  "item-description"
                )
                .value
                .trim(),

            // Temporary coordinates
            // Real GPS will be added later
            lat:
              20.5937 +
              (Math.random() - 0.5) * 10,

            lng:
              78.9629 +
              (Math.random() - 0.5) * 10

          };


          submitButton.textContent =
            "Publishing...";


          // Save listing
          const created =
            await createListing(
              newListing
            );


          if (
            created &&
            created.length > 0
          ) {

            listings.unshift(
              created[0]
            );

          } else {

            listings.unshift(
              newListing
            );

          }


          renderListings(
            listings
          );


          updateMapMarkers(
            listings
          );


          // Reset form
          document
            .getElementById(
              "listing-form"
            )
            .reset();


          // Close modal
          listItemModal.classList.add(
            "hidden"
          );


          alert(
            "Item published successfully!"
          );


        } catch (err) {

          console.error(
            "Listing error:",
            err
          );


          alert(
            "Could not publish listing.\n\n" +
            (err.message ||
              "Something went wrong.")
          );


        } finally {

          submitButton.disabled =
            false;

          submitButton.textContent =
            originalText;

        }

      }
    );


  // =================================================
  // BOOKING DAYS
  // =================================================

  document
    .getElementById("booking-days")
    .addEventListener(
      "input",
      updateBookingSummary
    );


  // =================================================
  // PAYMENT OPTIONS
  // =================================================

  document
    .querySelectorAll(
      ".pay-option"
    )
    .forEach(btn => {

      btn.addEventListener(
        "click",
        e => {

          document
            .querySelectorAll(
              ".pay-option"
            )
            .forEach(b =>
              b.classList.remove(
                "active"
              )
            );


          e.currentTarget.classList.add(
            "active"
          );

        }
      );

    });


  // =================================================
  // CONFIRM BOOKING
  // =================================================

  document
    .getElementById(
      "confirm-booking-btn"
    )
    .addEventListener(
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


        if (
          !selectedListingForBooking
        ) {

          alert(
            "Please select an item first."
          );

          return;

        }


        const selectedMethod =
          document
            .querySelector(
              ".pay-option.active"
            )
            .dataset.method;


        const days =
          parseInt(
            document
              .getElementById(
                "booking-days"
              )
              .value
          ) || 1;


        if (days < 1) {

          alert(
            "Rental duration must be at least 1 day."
          );

          return;

        }


        const total =
          days *
          Number(
            selectedListingForBooking
              .price_per_day
          );


        try {

          const bookingData = {

            listing_id:
              selectedListingForBooking.id,

            renter_id:
              currentUser.id,

            start_date:
              document
                .getElementById(
                  "booking-date"
                )
                .value,

            duration_days:
              days,

            total_price:
              total

          };


          const createdBooking =
            await createBooking(
              bookingData
            );


          if (
            createdBooking &&
            createdBooking.length > 0
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


          alert(
            `Booking could not be saved.\n\n${err.message}`
          );

        }

      }
    );

}


// =====================================================
// BOOKING MODAL
// =====================================================

window.openBookingModal =
  function(id) {

    selectedListingForBooking =
      listings.find(
        item =>
          String(item.id) ===
          String(id)
      );


    if (
      !selectedListingForBooking
    ) {

      alert(
        "Listing not found."
      );

      return;

    }


    document.getElementById(
      "modal-item-title"
    ).innerText =
      selectedListingForBooking.title;


    document.getElementById(
      "modal-item-location"
    ).innerText =
      `Location: ${selectedListingForBooking.location}`;


    document.getElementById(
      "modal-item-price"
    ).innerText =
      `Price: ${formatINR(
        selectedListingForBooking.price_per_day
      )} / day`;


    // Set today's date
    const today =
      new Date()
        .toISOString()
        .split("T")[0];


    document.getElementById(
      "booking-date"
    ).value = today;


    // Reset duration
    document.getElementById(
      "booking-days"
    ).value = 1;


    updateBookingSummary();


    document.getElementById(
      "booking-modal"
    ).classList.remove(
      "hidden"
    );

  };


// =====================================================
// BOOKING SUMMARY
// =====================================================

function updateBookingSummary() {

  if (
    !selectedListingForBooking
  ) return;


  const days =
    parseInt(
      document
        .getElementById(
          "booking-days"
        )
        .value
    ) || 1;


  const price =
    Number(
      selectedListingForBooking
        .price_per_day
    );


  const total =
    days * price;


  document.getElementById(
    "summary-rate"
  ).innerText =
    formatINR(price);


  document.getElementById(
    "summary-days"
  ).innerText =
    days;


  document.getElementById(
    "summary-total"
  ).innerText =
    formatINR(total);

}


// =====================================================
// USER SESSION
// =====================================================

async function checkSession() {

  try {

    const {
      data
    } =
      await supabase.auth.getSession();


    if (data.session) {

      currentUser =
        data.session.user;


      updateUIForUser();

    }

  } catch (error) {

    console.warn(
      "Session check failed:",
      error.message
    );

  }

}


// =====================================================
// UPDATE USER UI
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

    authButton.classList.add(
      "hidden"
    );

    dashboardButton.classList.remove(
      "hidden"
    );

  } else {

    authButton.classList.remove(
      "hidden"
    );

    dashboardButton.classList.add(
      "hidden"
    );

  }

}
```
