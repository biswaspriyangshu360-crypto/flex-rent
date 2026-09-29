// =====================================================
// FLEX RENT - MAIN JAVASCRIPT
// =====================================================
// Features:
// - Email + Password Authentication
// - Google Authentication
// - Phone OTP Authentication
// - User Session
// - Profile Creation
// - Marketplace Listings
// - Image Upload
// - INR Currency
// - Search
// - Category Filter
// - Voice Search
// - Leaflet Map
// - GPS Location
// - Location Selector
// - Saved Addresses
// - Address Management
// - Listing Location
// - Booking
// - Payment Record
// - Dashboard
// - Logout
// - Forgot Password
// =====================================================


// =====================================================
// STATE MANAGEMENT
// =====================================================

let currentUser = null;
let listings = [];
let map = null;
let mapMarkers = [];
let selectedListingForBooking = null;
let currentUserProfile = null;

// Location state
let selectedLocation = null;
let selectedListingLocation = null;
let phoneOTPNumber = "";


// =====================================================
// CURRENCY
// =====================================================

function formatINR(amount) {
// ============================================
// DISTANCE CALCULATOR
// ============================================

function calculateDistance(lat1, lng1, lat2, lng2) {
    if (
        !Number.isFinite(Number(lat1)) ||
        !Number.isFinite(Number(lng1)) ||
        !Number.isFinite(Number(lat2)) ||
        !Number.isFinite(Number(lng2))
    ) {
        return null;
    }

    const R = 6371;

    const dLat =
        (Number(lat2) - Number(lat1)) *
        Math.PI / 180;

    const dLng =
        (Number(lng2) - Number(lng1)) *
        Math.PI / 180;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
        Math.cos(Number(lat1) * Math.PI / 180) *
        Math.cos(Number(lat2) * Math.PI / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;
}

function formatDistance(distance) {
    if (distance === null || !Number.isFinite(distance)) {
        return '';
    }

    if (distance < 1) {
        return `${Math.round(distance * 1000)} m away`;
    }

    if (distance < 10) {
        return `${distance.toFixed(1)} km away`;
    }

    return `${Math.round(distance)} km away`;
}
  const number = Number(amount) || 0;

  return `₹${number.toLocaleString("en-IN")}`;

}


// =====================================================
// MOCK LISTINGS
// =====================================================

const mockListings = [

  {
    id: "mock-1",
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
    id: "mock-2",
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
    id: "mock-3",
    title: "Bosch Professional Power Drill",
    category: "Everyday",
    description:
      "18V cordless hammer drill with battery kit.",
    price_per_day: 500,
    location: "Guwahati, India",
    lat: 26.1445,
    lng: 91.7362,
    image_url:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80"
  },

  {
    id: "mock-4",
    title: "Electric Lawn Mower",
    category: "Gardening",
    description:
      "Easy-to-use electric lawn mower for home gardens.",
    price_per_day: 800,
    location: "Kolkata, India",
    lat: 22.5726,
    lng: 88.3639,
    image_url:
      "https://images.unsplash.com/photo-1599685315640-3f3a2b9e1c0a?auto=format&fit=crop&w=600&q=80"
  },

  {
    id: "mock-5",
    title: "Heavy Duty Ladder",
    category: "Everyday",
    description:
      "Strong aluminium ladder suitable for home and work.",
    price_per_day: 300,
    location: "Siliguri, India",
    lat: 26.7271,
    lng: 88.3953,
    image_url:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80"
  },

  {
    id: "mock-6",
    title: "Industrial Welding Machine",
    category: "Industrial",
    description:
      "Professional welding machine for industrial applications.",
    price_per_day: 1500,
    location: "Durgapur, India",
    lat: 23.5204,
    lng: 87.3119,
    image_url:
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80"
  }

];


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

  hideLoadingScreen();

  initMap();

  setupVoiceSearch();

  setupEventListeners();

  setupGoogleLoginButton();

  setupPhoneLogin();

  setupHeroControls();

  setupQuickCategoryCards();

  setupLocationSystem();

  setupDashboard();

  loadSavedLocation();

  loadListings();

  checkSession();

});


// =====================================================
// LOADING SCREEN
// =====================================================

function hideLoadingScreen() {

  setTimeout(() => {

    const loader =
      document.getElementById("loading-screen");

    if (!loader) return;

    loader.style.opacity = "0";

    setTimeout(() => {

      loader.style.display = "none";

    }, 500);

  }, 1000);

}


// =====================================================
// LEAFLET MAP
// =====================================================

function initMap() {

  const mapElement =
    document.getElementById("map");

  if (!mapElement) return;

  try {

    map = L.map("map").setView(
      [20.5937, 78.9629],
      5
    );

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          "© OpenStreetMap contributors"
      }
    ).addTo(map);

  } catch (error) {

    console.warn(
      "Map initialization failed:",
      error
    );

  }

}


// =====================================================
// MAP MARKERS
// =====================================================

function updateMapMarkers(items) {

  if (!map) return;

  mapMarkers.forEach(marker => {

    try {

      map.removeLayer(marker);

    } catch (error) {}

  });

  mapMarkers = [];


  items.forEach(item => {

    const lat = Number(item.lat);
    const lng = Number(item.lng);

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng)
    ) {

      const marker =
        L.marker([lat, lng])
          .addTo(map);


      marker.bindPopup(`

        <div style="min-width:180px">

          <strong>
            ${escapeHTML(item.title)}
          </strong>

          <br>

          <span>
            ${formatINR(item.price_per_day)}
            / day
          </span>

          <br>

          <small>
            ${escapeHTML(item.location || "")}
          </small>

          <br>

          <button
            onclick="openBookingModal('${escapeAttribute(item.id)}')"
            style="
              margin-top:8px;
              background:#4F46E5;
              color:#fff;
              border:none;
              padding:7px 12px;
              border-radius:6px;
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
// DATABASE LISTING → UI FORMAT
// =====================================================

function normalizeListing(item) {

  return {

    id: item.id,

    title:
      item.title ||
      item.name ||
      "Unnamed Item",

    category:
      item.category ||
      "Other",

    description:
      item.description ||
      "",

    price_per_day:
      Number(
        item.price ??
        item.price_per_day ??
        0
      ),

    location:
      item.location ||
      "Location unavailable",

    lat:
      item.latitude ??
      item.lat ??
      null,

    lng:
      item.longitude ??
      item.lng ??
      null,

    image_url:
      item.image_url ||
      "",

    owner_id:
      item.owner_id,

    available:
      item.is_available !== undefined
        ? item.is_available
        : item.available !== undefined
          ? item.available
          : true

  };

}


// =====================================================
// LOAD LISTINGS
// =====================================================

async function loadListings() {

  try {

    const dbListings =
      await fetchListings();

    if (
      dbListings &&
      dbListings.length > 0
    ) {

      listings =
        dbListings.map(normalizeListing);

    } else {

      listings = mockListings;

    }

  } catch (error) {

    console.warn(
      "Supabase listings unavailable:",
      error
    );

    listings = mockListings;

  }

  renderListings(listings);

  updateMapMarkers(listings);

}


// =====================================================
// RENDER LISTINGS
// =====================================================

function renderListings(items) {

  const container =
    document.getElementById(
      "listings-grid"
    );

  if (!container) return;

  container.innerHTML = "";


  if (
    !items ||
    items.length === 0
  ) {

    container.innerHTML = `

      <div class="empty-state">

        <i class="fa-solid fa-box-open"></i>

        <p>
          No rental items found.
        </p>

      </div>

    `;

    return;

  }


  items.forEach(item => {

    const card =
      document.createElement("div");

    card.className = "card";


    const image =
      item.image_url ||
      "https://via.placeholder.com/600x400?text=No+Image";


    const availability =
      item.available !== false;


    card.innerHTML = `

      <img
        src="${escapeAttribute(image)}"
        alt="${escapeAttribute(item.title)}"
      >

      <div class="card-body">

        <span class="card-category">
          ${escapeHTML(item.category)}
        </span>

        <h3 class="card-title">
          ${escapeHTML(item.title)}
        </h3>

        <p class="card-location">

          <i class="fa-solid fa-location-dot"></i>

          ${escapeHTML(item.location)}

        </p>

        <p style="
          color:#94A3B8;
          font-size:0.85rem;
          margin-bottom:10px;
        ">

          ${escapeHTML(
            item.description
              ? item.description.substring(0, 90)
              : "No description available."
          )}

        </p>

        <div class="card-price">

          ${formatINR(item.price_per_day)}

          <small>/ day</small>

        </div>

        ${
          availability
            ? `
              <button
                class="btn btn-primary btn-block"
                onclick="openBookingModal('${escapeAttribute(item.id)}')"
              >
                Rent Now
              </button>
            `
            : `
              <button
                class="btn btn-secondary btn-block"
                disabled
              >
                Currently Unavailable
              </button>
            `
        }

      </div>

    `;


    container.appendChild(card);

  });

}


// =====================================================
// SEARCH
// =====================================================

function filterListings() {

  const searchInput =
    document.getElementById(
      "search-input"
    );

  if (!searchInput) return;


  const query =
    searchInput.value
      .toLowerCase()
      .trim();


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
        (item.title || "")
          .toLowerCase();

      const location =
        (item.location || "")
          .toLowerCase();

      const description =
        (item.description || "")
          .toLowerCase();


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
// VOICE SEARCH
// =====================================================

function setupVoiceSearch() {

  const micBtn =
    document.getElementById("mic-btn");

  const searchInput =
    document.getElementById(
      "search-input"
    );

  if (
    !micBtn ||
    !searchInput
  ) return;


  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!SpeechRecognition) {

    micBtn.style.display = "none";

    return;

  }


  const recognition =
    new SpeechRecognition();


  recognition.continuous = false;

  recognition.lang = "en-IN";


  micBtn.addEventListener(
    "click",
    () => {

      try {

        micBtn.classList.add(
          "listening"
        );

        recognition.start();

      } catch (error) {

        console.warn(
          "Voice recognition already running."
        );

      }

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

    };


  recognition.onend =
    () => {

      micBtn.classList.remove(
        "listening"
      );

    };

}


// =====================================================
// EVENT LISTENERS
// =====================================================

function setupEventListeners() {

  // ---------------------------------------------------
  // SEARCH
  // ---------------------------------------------------

  const searchInput =
    document.getElementById(
      "search-input"
    );


  if (searchInput) {

    searchInput.addEventListener(
      "input",
      filterListings
    );

    searchInput.addEventListener(
      "keydown",
      event => {

        if (event.key === "Enter") {

          event.preventDefault();

          filterListings();

        }

      }
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
            .querySelectorAll(
              ".category-chip"
            )
            .forEach(c => {

              c.classList.remove(
                "active"
              );

            });


          event.currentTarget
            .classList.add("active");


          filterListings();

        }
      );

    });


  // ---------------------------------------------------
  // MODALS
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // LOGIN BUTTON
  // ---------------------------------------------------

  const authNavBtn =
    document.getElementById(
      "auth-nav-btn"
    );


  if (authNavBtn) {

    authNavBtn.addEventListener(
      "click",
      () => {

        if (authModal) {

          authModal.classList.remove(
            "hidden"
          );

        }

      }
    );

  }


  // ---------------------------------------------------
  // LIST ITEM BUTTON
  // ---------------------------------------------------

  const listItemNavBtn =
    document.getElementById(
      "list-item-nav-btn"
    );


  if (listItemNavBtn) {

    listItemNavBtn.addEventListener(
      "click",
      () => {

        openListItemModal();

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

          closeAllModals();

        }
      );

    });


  // ---------------------------------------------------
  // CLICK OUTSIDE MODAL
  // ---------------------------------------------------

  document
    .querySelectorAll(".modal")
    .forEach(modal => {

      modal.addEventListener(
        "click",
        event => {

          if (
            event.target === modal
          ) {

            modal.classList.add(
              "hidden"
            );

          }

        }
      );

    });


  // ---------------------------------------------------
  // ESCAPE KEY
  // ---------------------------------------------------

  document.addEventListener(
    "keydown",
    event => {

      if (event.key === "Escape") {

        closeAllModals();

      }

    }
  );


  // ---------------------------------------------------
  // AUTH FORM
  // ---------------------------------------------------

  setupAuthentication();


  // ---------------------------------------------------
  // LISTING FORM
  // ---------------------------------------------------

  setupListingForm();


  // ---------------------------------------------------
  // BOOKING
  // ---------------------------------------------------

  setupBooking();

}


// =====================================================
// CLOSE ALL MODALS
// =====================================================

function closeAllModals() {

  document
    .querySelectorAll(".modal")
    .forEach(modal => {

      modal.classList.add(
        "hidden"
      );

    });

}


// =====================================================
// AUTHENTICATION
// =====================================================

function setupAuthentication() {

  let isRegistering = false;


  const toggleBtn =
    document.getElementById(
      "auth-toggle-btn"
    );


  const authForm =
    document.getElementById(
      "auth-form"
    );


  if (toggleBtn) {

    toggleBtn.addEventListener(
      "click",
      event => {

        event.preventDefault();

        isRegistering =
          !isRegistering;


        const title =
          document.getElementById(
            "auth-title"
          );


        const submitBtn =
          document.getElementById(
            "auth-submit-btn"
          );


        const nameGroup =
          document.getElementById(
            "name-group"
          );


        const phoneGroup =
          document.getElementById(
            "phone-group"
          );


        if (title) {

          title.innerText =
            isRegistering
              ? "Create Flex Rent Account"
              : "Login to Flex Rent";

        }


        if (submitBtn) {

          submitBtn.innerText =
            isRegistering
              ? "Create Account"
              : "Login";

        }


        if (nameGroup) {

          nameGroup.classList.toggle(
            "hidden",
            !isRegistering
          );

        }


        if (phoneGroup) {

          phoneGroup.classList.toggle(
            "hidden",
            !isRegistering
          );

        }

      }
    );

  }


  if (!authForm) return;


  authForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const email =
        document.getElementById(
          "auth-email"
        ).value.trim();


      const password =
        document.getElementById(
          "auth-password"
        ).value;


      if (!email || !password) {

        alert(
          "Please enter email and password."
        );

        return;

      }


      try {

        // REGISTER

        if (isRegistering) {

          const name =
            document.getElementById(
              "auth-name"
            ).value.trim();


          const phone =
            document.getElementById(
              "auth-phone"
            ).value.trim();


          const data =
            await signUpUser(
              email,
              password,
              name,
              phone
            );


          if (data.session) {

            currentUser =
              data.user;

            await ensureUserProfile();

            updateUIForUser();

            document
              .getElementById("auth-modal")
              ?.classList.add("hidden");


            alert(
              "Account created successfully!"
            );

          } else {

            alert(
              "Account created. Please check your email for verification, then login."
            );

          }


          return;

        }


        // LOGIN

        const data =
          await signInUser(
            email,
            password
          );


        if (
          !data ||
          !data.user
        ) {

          throw new Error(
            "Login failed. Please try again."
          );

        }


        currentUser =
          data.user;


        await ensureUserProfile();

        updateUIForUser();


        document
          .getElementById("auth-modal")
          ?.classList.add("hidden");


        alert(
          "Logged in successfully!"
        );


      } catch (error) {

        console.error(
          "Authentication error:",
          error
        );


        alert(
          error.message ||
          "Authentication failed."
        );

      }

    }
  );

}


// =====================================================
// GOOGLE LOGIN
// =====================================================

function setupGoogleLoginButton() {

  const authModal =
    document.getElementById(
      "auth-modal"
    );


  if (!authModal) return;


  const googleButton =
    document.getElementById(
      "google-login-btn"
    );


  if (!googleButton) return;


  googleButton.addEventListener(
    "click",
    async () => {

      try {

        const redirectUrl =
          window.location.origin +
          window.location.pathname;


        const { error } =
          await supabase.auth
            .signInWithOAuth({

              provider: "google",

              options: {
                redirectTo:
                  redirectUrl
              }

            });


        if (error) {

          throw error;

        }

      } catch (error) {

        console.error(
          "Google login error:",
          error
        );


        alert(
          error.message ||
          "Google login could not be started."
        );

      }

    }
  );

}


// =====================================================
// PHONE OTP LOGIN
// =====================================================

function setupPhoneLogin() {

  const phoneButton =
    document.getElementById(
      "phone-login-btn"
    );

  const otpSection =
    document.getElementById(
      "phone-otp-section"
    );

  const verifyButton =
    document.getElementById(
      "verify-phone-otp-btn"
    );

  const resendButton =
    document.getElementById(
      "resend-phone-otp-btn"
    );

  const phoneInput =
    document.getElementById(
      "auth-phone"
    );


  if (!phoneButton) return;


  // SEND OTP

  phoneButton.addEventListener(
    "click",
    async () => {

      const phone =
        phoneInput
          ? phoneInput.value.trim()
          : "";


      if (!phone) {

        alert(
          "Please enter your phone number first."
        );

        phoneInput?.focus();

        return;

      }


      if (!phone.startsWith("+")) {

        alert(
          "Please enter your phone number with country code.\nExample: +919876543210"
        );

        phoneInput?.focus();

        return;

      }


      try {

        phoneButton.disabled = true;

        phoneButton.innerText =
          "Sending OTP...";


        const { error } =
          await supabase.auth
            .signInWithOtp({

              phone:
                phone

            });


        if (error) {

          throw error;

        }


        phoneOTPNumber =
          phone;


        if (otpSection) {

          otpSection.classList.remove(
            "hidden"
          );

        }


        alert(
          "OTP sent successfully to your phone."
        );


      } catch (error) {

        console.error(
          "Phone OTP error:",
          error
        );


        alert(
          "OTP could not be sent: " +
          error.message
        );


      } finally {

        phoneButton.disabled = false;

        phoneButton.innerHTML =
          `<i class="fa-solid fa-mobile-screen-button"></i>
           Continue with Phone`;

      }

    }
  );


  // VERIFY OTP

  if (verifyButton) {

    verifyButton.addEventListener(
      "click",
      async () => {

        const otpInput =
          document.getElementById(
            "phone-otp"
          );


        const otp =
          otpInput
            ? otpInput.value.trim()
            : "";


        if (!phoneOTPNumber) {

          alert(
            "Please request an OTP first."
          );

          return;

        }


        if (
          !otp ||
          otp.length < 4
        ) {

          alert(
            "Please enter the OTP."
          );

          return;

        }


        try {

          verifyButton.disabled = true;

          verifyButton.innerText =
            "Verifying...";


          const { data, error } =
            await supabase.auth
              .verifyOtp({

                phone:
                  phoneOTPNumber,

                token:
                  otp,

                type:
                  "sms"

              });


          if (error) {

            throw error;

          }


          if (
            !data ||
            !data.user
          ) {

            throw new Error(
              "Phone verification failed."
            );

          }


          currentUser =
            data.user;


          await ensureUserProfile();

          updateUIForUser();


          document
            .getElementById("auth-modal")
            ?.classList.add("hidden");


          alert(
            "Phone login successful!"
          );


        } catch (error) {

          console.error(
            "OTP verification error:",
            error
          );


          alert(
            "OTP verification failed: " +
            error.message
          );


        } finally {

          verifyButton.disabled = false;

          verifyButton.innerText =
            "Verify OTP";

        }

      }
    );

  }


  // RESEND OTP

  if (resendButton) {

    resendButton.addEventListener(
      "click",
      async () => {

        if (!phoneOTPNumber) {

          alert(
            "Please enter your phone number first."
          );

          return;

        }


        try {

          resendButton.disabled = true;

          resendButton.innerText =
            "Sending...";


          const { error } =
            await supabase.auth
              .signInWithOtp({

                phone:
                  phoneOTPNumber

              });


          if (error) {

            throw error;

          }


          alert(
            "New OTP has been sent."
          );


        } catch (error) {

          console.error(
            "Resend OTP error:",
            error
          );


          alert(
            "Could not resend OTP: " +
            error.message
          );


        } finally {

          resendButton.disabled = false;

          resendButton.innerText =
            "Resend OTP";

        }

      }
    );

  }

}


// =====================================================
// ENSURE USER PROFILE
// =====================================================

async function ensureUserProfile() {

  if (!currentUser) return;


  try {

    const profile =
      await fetchUserProfile(
        currentUser.id
      );


    if (profile) {

      currentUserProfile =
        profile;

      return;

    }


    const metadata =
      currentUser.user_metadata ||
      {};


    const fullName =
      metadata.full_name ||
      metadata.name ||
      currentUser.email
        ?.split("@")[0] ||
      "Flex Rent User";


    const phone =
      metadata.phone ||
      "";


    const { data, error } =
      await supabase
        .from("profiles")
        .upsert(
          {
            id: currentUser.id,
            email:
              currentUser.email || "",
            full_name:
              fullName,
            phone:
              phone
          },
          {
            onConflict: "id"
          }
        )
        .select()
        .maybeSingle();


    if (error) {

      console.warn(
        "Could not create profile:",
        error
      );

      return;

    }


    currentUserProfile =
      data;

  } catch (error) {

    console.warn(
      "Profile check failed:",
      error
    );

  }

}


// =====================================================
// SESSION
// =====================================================

async function checkSession() {

  try {

    const { data } =
      await supabase.auth
        .getSession();


    if (
      data &&
      data.session &&
      data.session.user
    ) {

      currentUser =
        data.session.user;


      await ensureUserProfile();

      updateUIForUser();

    } else {

      currentUser = null;

      updateUIForUser();

    }

  } catch (error) {

    console.error(
      "Session check failed:",
      error
    );

  }


  supabase.auth.onAuthStateChange(
    async (event, session) => {

      if (
        session &&
        session.user
      ) {

        currentUser =
          session.user;


        await ensureUserProfile();

        updateUIForUser();

      } else {

        currentUser = null;

        currentUserProfile = null;

        updateUIForUser();

      }

    }
  );

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

    authButton?.classList.add(
      "hidden"
    );

    dashboardButton?.classList.remove(
      "hidden"
    );

  } else {

    authButton?.classList.remove(
      "hidden"
    );

    dashboardButton?.classList.add(
      "hidden"
    );

  }

}


// =====================================================
// DASHBOARD
// =====================================================

function setupDashboard() {

  const dashboardButton =
    document.getElementById(
      "dashboard-nav-btn"
    );


  const dashboardSection =
    document.getElementById(
      "dashboard-section"
    );


  const logoutButton =
    document.getElementById(
      "logout-btn"
    );


  if (
    dashboardButton &&
    dashboardSection
  ) {

    dashboardButton.addEventListener(
      "click",
      async () => {

        if (!currentUser) {

          alert(
            "Please login first."
          );

          return;

        }


        dashboardSection
          .classList
          .remove("hidden");


        const marketplace =
          document.querySelector(
            ".marketplace"
          );


        marketplace?.classList.add(
          "hidden"
        );


        await loadDashboard();


        dashboardSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }
    );

  }


  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      async () => {

        try {

          await signOutUser();


          currentUser = null;

          currentUserProfile = null;


          updateUIForUser();


          dashboardSection?.classList.add(
            "hidden"
          );


          document
            .querySelector(".marketplace")
            ?.classList.remove("hidden");


          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });


          alert(
            "Logged out successfully."
          );


        } catch (error) {

          alert(
            error.message ||
            "Logout failed."
          );

        }

      }
    );

  }


  setupDashboardTabs();

}


// =====================================================
// DASHBOARD TABS
// =====================================================

function setupDashboardTabs() {

  const tabs =
    document.querySelectorAll(
      ".tab-btn"
    );


  tabs.forEach(tab => {

    tab.addEventListener(
      "click",
      async () => {

        tabs.forEach(t =>
          t.classList.remove(
            "active"
          )
        );


        tab.classList.add(
          "active"
        );


        const tabId =
          tab.dataset.tab;


        document
          .querySelectorAll(
            ".tab-content"
          )
          .forEach(content => {

            content.classList.add(
              "hidden"
            );

          });


        const selected =
          document.getElementById(
            tabId
          );


        selected?.classList.remove(
          "hidden"
        );


        if (
          tabId ===
          "tab-listings"
        ) {

          await loadMyListings();

        }


        if (
          tabId ===
          "tab-bookings"
        ) {

          await loadMyBookings();

        }


        if (
          tabId ===
          "tab-profile"
        ) {

          await loadProfile();

        }

      }
    );

  });

}


// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard() {

  await loadMyListings();

  await loadProfile();

}


// =====================================================
// MY LISTINGS
// =====================================================

async function loadMyListings() {

  const container =
    document.getElementById(
      "my-listings-grid"
    );


  if (!container) return;


  container.innerHTML =
    `<p>Loading your listings...</p>`;


  if (!currentUser) {

    container.innerHTML =
      `<p>Please login first.</p>`;

    return;

  }


  try {

    const data =
      await fetchUserListings(
        currentUser.id
      );


    if (
      !data ||
      data.length === 0
    ) {

      container.innerHTML = `

        <div class="empty-state">

          <i class="fa-solid fa-box-open"></i>

          <p>
            You have not listed any items yet.
          </p>

          <button
            class="btn btn-primary"
            onclick="openListItemModal()"
          >
            List Your First Item
          </button>

        </div>

      `;

      return;

    }


    const normalized =
      data.map(normalizeListing);


    container.innerHTML = "";


    normalized.forEach(item => {

      const card =
        document.createElement("div");


      card.className =
        "card";


      card.innerHTML = `

        <img
          src="${escapeAttribute(
            item.image_url ||
            "https://via.placeholder.com/600x400?text=No+Image"
          )}"
          alt="${escapeAttribute(
            item.title
          )}"
        >

        <div class="card-body">

          <span class="card-category">
            ${escapeHTML(item.category)}
          </span>

          <h3 class="card-title">
            ${escapeHTML(item.title)}
          </h3>

          <p class="card-location">

            <i class="fa-solid fa-location-dot"></i>

            ${escapeHTML(item.location)}

          </p>

          <div class="card-price">

            ${formatINR(item.price_per_day)}

            <small>/ day</small>

          </div>

          <span style="
            color:#10B981;
            font-size:0.85rem;
          ">

            <i class="fa-solid fa-circle"></i>

            ${item.available !== false
              ? " Available"
              : " Unavailable"}

          </span>

        </div>

      `;


      container.appendChild(card);

    });

  } catch (error) {

    console.error(
      "My listings error:",
      error
    );


    container.innerHTML = `

      <div class="empty-state">

        <p>
          Could not load your listings.
        </p>

        <small>
          ${escapeHTML(
            error.message || ""
          )}
        </small>

      </div>

    `;

  }

}


// =====================================================
// MY BOOKINGS
// =====================================================

async function loadMyBookings() {

  const container =
    document.getElementById(
      "my-bookings-list"
    );


  if (!container) return;


  container.innerHTML =
    `<p>Loading your bookings...</p>`;


  if (!currentUser) {

    container.innerHTML =
      `<p>Please login first.</p>`;

    return;

  }


  try {

    const bookings =
      await fetchUserBookings(
        currentUser.id
      );


    if (
      !bookings ||
      bookings.length === 0
    ) {

      container.innerHTML = `

        <div class="empty-state">

          <i class="fa-solid fa-calendar-xmark"></i>

          <p>
            You have no bookings yet.
          </p>

        </div>

      `;

      return;

    }


    container.innerHTML = "";


    bookings.forEach(booking => {

      const card =
        document.createElement("div");


      card.className =
        "booking-card";


      card.innerHTML = `

        <h3>
          ${escapeHTML(
            booking.item_name ||
            "Rental Item"
          )}
        </h3>

        <p>
          <strong>Start Date:</strong>
          ${escapeHTML(
            booking.start_date || "-"
          )}
        </p>

        <p>
          <strong>Duration:</strong>
          ${booking.rental_days || 1}
          day(s)
        </p>

        <p>
          <strong>Total:</strong>
          ${formatINR(
            booking.total_amount || 0
          )}
        </p>

        <p>
          <strong>Payment:</strong>
          ${escapeHTML(
            booking.payment_method ||
            "-"
          )}
        </p>

        <p>
          <strong>Status:</strong>
          ${escapeHTML(
            booking.status ||
            "pending"
          )}
        </p>

      `;


      container.appendChild(card);

    });

  } catch (error) {

    console.error(
      "Bookings error:",
      error
    );


    container.innerHTML = `

      <div class="empty-state">

        <p>
          Could not load your bookings.
        </p>

      </div>

    `;

  }

}


// =====================================================
// PROFILE
// =====================================================

async function loadProfile() {

  const container =
    document.getElementById(
      "profile-info"
    );


  if (!container) return;


  if (!currentUser) {

    container.innerHTML =
      `<p>Please login first.</p>`;

    return;

  }


  try {

    if (!currentUserProfile) {

      await ensureUserProfile();

    }


    const profile =
      currentUserProfile;


    container.innerHTML = `

      <h3>

        <i class="fa-solid fa-user"></i>

        Profile Information

      </h3>

      <br>

      <p>

        <strong>Name:</strong>

        ${escapeHTML(
          profile?.full_name ||
          "Not provided"
        )}

      </p>

      <p>

        <strong>Email:</strong>

        ${escapeHTML(
          currentUser.email || ""
        )}

      </p>

      <p>

        <strong>Phone:</strong>

        ${escapeHTML(
          profile?.phone ||
          "Not provided"
        )}

      </p>

      <p>

        <strong>Account ID:</strong>

        ${escapeHTML(
          currentUser.id
        )}

      </p>

    `;

  } catch (error) {

    container.innerHTML = `
      <p>
        Could not load profile.
      </p>
    `;

  }

}


// =====================================================
// OPEN LIST ITEM MODAL
// =====================================================

window.openListItemModal =
  function () {

    const modal =
      document.getElementById(
        "list-item-modal"
      );


    if (!currentUser) {

      alert(
        "Please login first."
      );

      document
        .getElementById("auth-modal")
        ?.classList.remove("hidden");

      return;

    }


    // If user already selected a location,
    // show it in listing form.

    if (selectedLocation) {

      applyListingLocation(
        selectedLocation
      );

    }


    modal?.classList.remove(
      "hidden"
    );

  };


// =====================================================
// LISTING FORM
// =====================================================

function setupListingForm() {

  const listingForm =
    document.getElementById(
      "listing-form"
    );


  if (!listingForm) return;


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

        // Upload image

        alert(
          "Uploading image..."
        );


        const imageUrl =
          await uploadListingImage(
            imageFile
          );


        // Form values

        const title =
          document.getElementById(
            "item-title"
          ).value.trim();


        const category =
          document.getElementById(
            "item-category"
          ).value;


        const price =
          parseFloat(
            document.getElementById(
              "item-price"
            ).value
          );


        const locationInput =
          document.getElementById(
            "item-location"
          );


        let location =
          locationInput
            ? locationInput.value.trim()
            : "";


        const description =
          document.getElementById(
            "item-description"
          ).value.trim();


        if (!title) {

          throw new Error(
            "Please enter item name."
          );

        }


        if (
          !Number.isFinite(price) ||
          price <= 0
        ) {

          throw new Error(
            "Please enter a valid price."
          );

        }


        // If location has been selected,
        // use that address.

        if (
          selectedListingLocation &&
          selectedListingLocation.display
        ) {

          location =
            selectedListingLocation.display;

        }


        if (!location) {

          throw new Error(
            "Please select the item location."
          );

        }


        // GPS

        let coordinates = null;


        if (
          selectedListingLocation &&
          Number.isFinite(
            Number(
              selectedListingLocation.lat
            )
          ) &&
          Number.isFinite(
            Number(
              selectedListingLocation.lng
            )
          )
        ) {

          coordinates = {

            lat:
              Number(
                selectedListingLocation.lat
              ),

            lng:
              Number(
                selectedListingLocation.lng
              )

          };

        } else {

          coordinates =
            await getCurrentLocation();

        }


        // Listing data

        const listingData = {

          owner_id:
            currentUser.id,

          name:
            title,

          category:
            category,

          price:
            price,

          location:
            location,

          latitude:
            coordinates
              ? coordinates.lat
              : null,

          longitude:
            coordinates
              ? coordinates.lng
              : null,

          image_url:
            imageUrl,

          description:
            description,

          is_available:
            true

        };


        // Save

        const created =
          await createListing(
            listingData
          );


        const normalized =
          normalizeListing(
            created
          );


        listings.unshift(
          normalized
        );


        renderListings(
          listings
        );


        updateMapMarkers(
          listings
        );


        document
          .getElementById(
            "list-item-modal"
          )
          ?.classList.add("hidden");


        listingForm.reset();


        selectedListingLocation =
          null;


        const listingText =
          document.getElementById(
            "listing-location-text"
          );


        if (listingText) {

          listingText.innerText =
            "Select where this item is available";

        }


        alert(
          "Item published successfully!"
        );


      } catch (error) {

        console.error(
          "Listing error:",
          error
        );


        alert(
          error.message ||
          "Failed to publish listing."
        );

      }

    }
  );

}


// =====================================================
// GPS LOCATION
// =====================================================

function getCurrentLocation() {

  return new Promise(resolve => {

    if (
      !navigator.geolocation
    ) {

      resolve(null);

      return;

    }


    navigator.geolocation.getCurrentPosition(

      position => {

        resolve({

          lat:
            position.coords.latitude,

          lng:
            position.coords.longitude

        });

      },

      error => {

        console.warn(
          "Location permission not available:",
          error.message
        );

        resolve(null);

      },

      {

        enableHighAccuracy: true,

        timeout: 10000,

        maximumAge: 0

      }

    );

  });

}


// =====================================================
// REVERSE GEOCODING
// Converts GPS coordinates into readable address
// =====================================================

async function reverseGeocode(
  lat,
  lng
) {

  try {

    const response =
      await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`
      );


    if (!response.ok) {

      throw new Error(
        "Unable to find address."
      );

    }


    const data =
      await response.json();


    const address =
      data.address || {};


    const parts = [

      address.house_number,

      address.road,

      address.neighbourhood,

      address.suburb,

      address.city ||
      address.town ||
      address.village,

      address.state,

      address.postcode

    ].filter(Boolean);


    return {

      display:
        parts.length
          ? parts.join(", ")
          : data.display_name ||
            `${lat}, ${lng}`,

      lat:
        Number(lat),

      lng:
        Number(lng),

      raw:
        data

    };

  } catch (error) {

    console.warn(
      "Reverse geocoding failed:",
      error
    );


    return {

      display:
        `Current Location (${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)})`,

      lat:
        Number(lat),

      lng:
        Number(lng)

    };

  }

}


// =====================================================
// LOCATION SYSTEM
// =====================================================

function setupLocationSystem() {

  const selectorButton =
    document.getElementById(
      "location-selector-btn"
    );


  const changeLocationButton =
    document.getElementById(
      "change-location-btn"
    );


  const currentLocationButton =
    document.getElementById(
      "use-current-location-btn"
    );


  const addAddressButton =
    document.getElementById(
      "add-new-address-btn"
    );


  const saveAddressForm =
    document.getElementById(
      "address-form"
    );


  const listingLocationButton =
    document.getElementById(
      "select-listing-location-btn"
    );


  // Open location modal

  selectorButton?.addEventListener(
    "click",
    () => {

      openLocationModal();

    }
  );


  changeLocationButton?.addEventListener(
    "click",
    () => {

      openLocationModal();

    }
  );


  // Current GPS

  currentLocationButton?.addEventListener(
    "click",
    useMyCurrentLocation
  );


  // Add address

  addAddressButton?.addEventListener(
    "click",
    () => {

      openAddressForm();

    }
  );


  // Address form

  saveAddressForm?.addEventListener(
    "submit",
    saveNewAddress
  );


  // Address type

  document
    .querySelectorAll(".address-type-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              ".address-type-btn"
            )
            .forEach(btn => {

              btn.classList.remove(
                "active"
              );

            });


          button.classList.add(
            "active"
          );


          const typeInput =
            document.getElementById(
              "address-type"
            );


          if (typeInput) {

            typeInput.value =
              button.dataset.addressType ||
              "Home";

          }

        }
      );

    });


  // Listing location

  listingLocationButton?.addEventListener(
    "click",
    () => {

      if (!currentUser) {

        alert(
          "Please login first."
        );

        return;

      }


      openLocationModal(
        true
      );

    }
  );


  // Marketplace View All

  document
    .getElementById(
      "marketplace-explore-btn"
    )
    ?.addEventListener(
      "click",
      () => {

        document
          .querySelector(".marketplace")
          ?.scrollIntoView({

            behavior:
              "smooth",

            block:
              "start"

          });

      }
    );

}


// =====================================================
// OPEN LOCATION MODAL
// =====================================================

function openLocationModal(
  forListing = false
) {

  const modal =
    document.getElementById(
      "location-modal"
    );


  if (!modal) return;


  modal.dataset.forListing =
    forListing
      ? "true"
      : "false";


  renderSavedAddresses();


  modal.classList.remove(
    "hidden"
  );

}


// =====================================================
// OPEN ADDRESS FORM
// =====================================================

function openAddressForm() {

  const locationModal =
    document.getElementById(
      "location-modal"
    );


  const addressModal =
    document.getElementById(
      "address-form-modal"
    );


  if (locationModal) {

    locationModal.classList.add(
      "hidden"
    );

  }


  if (addressModal) {

    addressModal.classList.remove(
      "hidden"
    );

  }

}


// =====================================================
// USE MY CURRENT LOCATION
// =====================================================

async function useMyCurrentLocation() {

  const button =
    document.getElementById(
      "use-current-location-btn"
    );


  if (!button) return;


  try {

    button.disabled = true;


    button.innerHTML = `

      <div class="current-location-icon">

        <i class="fa-solid fa-spinner fa-spin"></i>

      </div>

      <div class="current-location-text">

        <strong>
          Detecting location...
        </strong>

        <span>
          Please allow location access.
        </span>

      </div>

      <i class="fa-solid fa-location-crosshairs"></i>

    `;


    const coordinates =
      await getCurrentLocation();


    if (!coordinates) {

      throw new Error(
        "Current location could not be detected. Please allow location permission or add an address manually."
      );

    }


    const location =
      await reverseGeocode(
        coordinates.lat,
        coordinates.lng
      );


    const locationData = {

      id:
        "current-" +
        Date.now(),

      type:
        "Current Location",

      name:
        "Current Location",

      display:
        location.display,

      lat:
        location.lat,

      lng:
        location.lng,

      isCurrent:
        true

    };


    selectLocation(
      locationData
    );


    const locationModal =
      document.getElementById(
        "location-modal"
      );


    const forListing =
      locationModal?.dataset.forListing ===
      "true";


    if (forListing) {

      applyListingLocation(
        locationData
      );

    }


    locationModal?.classList.add(
      "hidden"
    );


    alert(
      "Your current location has been selected."
    );


  } catch (error) {

    console.error(
      "Current location error:",
      error
    );


    alert(
      error.message ||
      "Could not detect your location."
    );

  } finally {

    button.disabled = false;


    button.innerHTML = `

      <div class="current-location-icon">

        <i class="fa-solid fa-location-crosshairs"></i>

      </div>

      <div class="current-location-text">

        <strong>
          Use My Current Location
        </strong>

        <span>
          Automatically detect your location using GPS
        </span>

      </div>

      <i class="fa-solid fa-chevron-right"></i>

    `;

  }

}


// =====================================================
// SELECT LOCATION
// =====================================================

function selectLocation(
  location
) {

  if (!location) return;


  selectedLocation =
    location;


  localStorage.setItem(
    "flexRentSelectedLocation",
    JSON.stringify(location)
  );


  updateLocationUI(
    location
  );


  if (
    Number.isFinite(
      Number(location.lat)
    ) &&
    Number.isFinite(
      Number(location.lng)
    )
  ) {

    focusMapOnLocation(
      Number(location.lat),
      Number(location.lng)
    );

  }

}


// =====================================================
// UPDATE LOCATION UI
// =====================================================

function updateLocationUI(
  location
) {

  if (!location) return;


  const shortText =
    getShortLocationName(
      location
    );


  const selectedText =
    document.getElementById(
      "selected-location-text"
    );


  const summaryText =
    document.getElementById(
      "location-summary-text"
    );


  if (selectedText) {

    selectedText.innerText =
      shortText;

  }


  if (summaryText) {

    summaryText.innerText =
      location.display ||
      shortText;

  }


  updateListingLocationText(
    location
  );

}


// =====================================================
// SHORT LOCATION NAME
// =====================================================

function getShortLocationName(
  location
) {

  if (!location) {

    return "Select your location";

  }


  if (
    location.name &&
    location.name !==
      "Current Location"
  ) {

    return location.name;

  }


  const display =
    location.display ||
    "";


  const parts =
    display
      .split(",")
      .map(
        part =>
          part.trim()
      )
      .filter(Boolean);


  if (parts.length >= 2) {

    return parts
      .slice(
        Math.max(
          0,
          parts.length - 2
        )
      )
      .join(", ");

  }


  return (
    display ||
    "Selected location"
  );

}


// =====================================================
// UPDATE LISTING LOCATION TEXT
// =====================================================

function updateListingLocationText(
  location
) {

  const text =
    document.getElementById(
      "listing-location-text"
    );


  if (!text) return;


  if (location) {

    text.innerText =
      location.display ||
      "Selected location";

  } else {

    text.innerText =
      "Select where this item is available";

  }

}


// =====================================================
// APPLY LISTING LOCATION
// =====================================================

function applyListingLocation(
  location
) {

  if (!location) return;


  selectedListingLocation =
    location;


  const input =
    document.getElementById(
      "item-location"
    );


  if (input) {

    input.value =
      location.display ||
      "";

  }


  updateListingLocationText(
    location
  );

}


// =====================================================
// FOCUS MAP ON LOCATION
// =====================================================

function focusMapOnLocation(
  lat,
  lng
) {

  if (!map) return;


  try {

    map.setView(
      [lat, lng],
      13,
      {
        animate: true
      }
    );


    L.circleMarker(
      [lat, lng],
      {
        radius: 9
      }
    )
      .addTo(map)
      .bindPopup(
        "Your selected location"
      )
      .openPopup();

  } catch (error) {

    console.warn(
      "Could not focus map:",
      error
    );

  }

}


// =====================================================
// SAVED ADDRESSES
// =====================================================

function getSavedAddresses() {

  try {

    const saved =
      localStorage.getItem(
        "flexRentSavedAddresses"
      );


    if (!saved) return [];


    const parsed =
      JSON.parse(saved);


    return Array.isArray(parsed)
      ? parsed
      : [];

  } catch (error) {

    console.warn(
      "Saved address read error:",
      error
    );

    return [];

  }

}


// =====================================================
// SAVE ADDRESSES
// =====================================================

function saveAddresses(
  addresses
) {

  try {

    localStorage.setItem(
      "flexRentSavedAddresses",
      JSON.stringify(
        addresses
      )
    );

  } catch (error) {

    console.warn(
      "Saved address write error:",
      error
    );

  }

}


// =====================================================
// RENDER SAVED ADDRESSES
// =====================================================

function renderSavedAddresses() {

  const container =
    document.getElementById(
      "saved-addresses-list"
    );


  const count =
    document.getElementById(
      "saved-address-count"
    );


  if (!container) return;


  const addresses =
    getSavedAddresses();


  if (count) {

    count.innerText =
      `${addresses.length} saved`;

  }


  if (addresses.length === 0) {

    container.innerHTML = `

      <div class="no-saved-address">

        <i class="fa-regular fa-address-book"></i>

        <p>
          No saved addresses yet
        </p>

        <small>
          Add an address to quickly select it later.
        </small>

      </div>

    `;

    return;

  }


  container.innerHTML = "";


  addresses.forEach(address => {

    const card =
      document.createElement(
        "div"
      );


    card.className =
      "saved-address-card";


    card.innerHTML = `

      <div class="saved-address-icon">

        <i class="${
          address.type === "College"
            ? "fa-solid fa-graduation-cap"
            : address.type === "Other"
              ? "fa-solid fa-location-dot"
              : "fa-solid fa-house"
        }"></i>

      </div>

      <div class="saved-address-info">

        <strong>
          ${escapeHTML(
            address.name ||
            address.type ||
            "Address"
          )}
        </strong>

        <span class="saved-address-badge">

          ${escapeHTML(
            address.type ||
            "Other"
          )}

        </span>

        <p>

          ${escapeHTML(
            address.display ||
            ""
          )}

        </p>

      </div>

      <div>

        <button
          type="button"
          class="btn btn-primary"
          data-address-id="${escapeAttribute(address.id)}"
        >
          Select
        </button>

      </div>

    `;


    const selectButton =
      card.querySelector(
        "button[data-address-id]"
      );


    selectButton?.addEventListener(
      "click",
      event => {

        event.stopPropagation();


        const selected =
          addresses.find(
            item =>
              String(item.id) ===
              String(
                address.id
              )
          );


        if (!selected) return;


        selectLocation(
          selected
        );


        const locationModal =
          document.getElementById(
            "location-modal"
          );


        const forListing =
          locationModal?.dataset.forListing ===
          "true";


        if (forListing) {

          applyListingLocation(
            selected
          );

        }


        locationModal?.classList.add(
          "hidden"
        );


        alert(
          "Location selected successfully."
        );

      }
    );


    container.appendChild(
      card
    );

  });

}


// =====================================================
// SAVE NEW ADDRESS
// =====================================================

async function saveNewAddress() {
    const type = document.getElementById('address-type')?.value || 'Home';
    const fullName = document.getElementById('address-full-name')?.value.trim();
    const phone = document.getElementById('address-phone')?.value.trim();
    const pincode = document.getElementById('address-pincode')?.value.trim();
    const house = document.getElementById('address-house')?.value.trim();
    const area = document.getElementById('address-area')?.value.trim();
    const city = document.getElementById('address-city')?.value.trim();
    const state = document.getElementById('address-state')?.value.trim();
    const landmark = document.getElementById('address-landmark')?.value.trim();

    // Basic validation
    if (!fullName || !phone || !pincode || !house || !area || !city || !state) {
        showToast('Please fill all required address fields.', 'error');
        return;
    }

    if (!/^\d{6}$/.test(pincode)) {
        showToast('Please enter a valid 6-digit PIN code.', 'error');
        return;
    }

    const saveButton = document.getElementById('save-address-btn');

    try {
        if (saveButton) {
            saveButton.disabled = true;
            saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finding location...';
        }

        // Create a complete address for geocoding
        const addressQuery = [
            house,
            area,
            landmark,
            city,
            state,
            pincode,
            'India'
        ]
            .filter(Boolean)
            .join(', ');

        console.log('Geocoding address:', addressQuery);

        // Convert address into latitude/longitude
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(addressQuery)}`
        );

        if (!response.ok) {
            throw new Error('Location service is currently unavailable.');
        }

        const results = await response.json();

        if (!results || results.length === 0) {
            showToast(
                'Location not found. Please check your address, city, state or PIN code.',
                'error'
            );
            return;
        }

        const result = results[0];

        const latitude = parseFloat(result.lat);
        const longitude = parseFloat(result.lon);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            throw new Error('Invalid coordinates received.');
        }

        // Create address object
        const address = {
            id: Date.now().toString(),
            type,
            fullName,
            phone,
            pincode,
            house,
            area,
            city,
            state,
            landmark,
            display: [
                house,
                area,
                city,
                state,
                pincode
            ]
                .filter(Boolean)
                .join(', '),

            // Exact coordinates
            lat: latitude,
            lng: longitude,

            // Extra information
            formattedAddress: result.display_name || addressQuery,
            createdAt: new Date().toISOString()
        };

        console.log('Geocoded address:', address);

        // Get existing saved addresses
        const savedAddresses = JSON.parse(
            localStorage.getItem('flexRentAddresses') || '[]'
        );

        // Save new address
        savedAddresses.push(address);

        localStorage.setItem(
            'flexRentAddresses',
            JSON.stringify(savedAddresses)
        );

        // Select this address as the active location
        selectLocation(address);

        // Close address form
        const addressFormModal = document.getElementById('address-form-modal');

        if (addressFormModal) {
            addressFormModal.classList.add('hidden');
        }

        // Close location modal if open
        const locationModal = document.getElementById('location-modal');

        if (locationModal) {
            locationModal.classList.add('hidden');
        }

        // Reset form
        const form = document.getElementById('address-form');

        if (form) {
            form.reset();
        }

        // Reset address type
        const addressTypeInput = document.getElementById('address-type');

        if (addressTypeInput) {
            addressTypeInput.value = 'Home';
        }

        // Reset active address type button
        document
            .querySelectorAll('.address-type-btn')
            .forEach(button => button.classList.remove('active'));

        const homeButton = document.querySelector(
            '.address-type-btn[data-type="Home"]'
        );

        if (homeButton) {
            homeButton.classList.add('active');
        }

        // Update saved address UI
        if (typeof renderSavedAddresses === 'function') {
            renderSavedAddresses();
        }

        showToast('Address saved with accurate location!', 'success');

        // Focus map on new location
        if (
            typeof focusMapOnLocation === 'function' &&
            Number.isFinite(latitude) &&
            Number.isFinite(longitude)
        ) {
            focusMapOnLocation(latitude, longitude);
        }

    } catch (error) {
        console.error('Address geocoding error:', error);

        showToast(
            error.message || 'Could not find this location. Please try again.',
            'error'
        );

    } finally {
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.innerHTML = 'Save Address';
        }
    }
}

// =====================================================
// LOAD SAVED LOCATION
// =====================================================

function loadSavedLocation() {

  try {

    const saved =
      localStorage.getItem(
        "flexRentSelectedLocation"
      );


    if (!saved) return;


    const location =
      JSON.parse(saved);


    if (!location) return;


    selectedLocation =
      location;


    updateLocationUI(
      location
    );


    if (
      Number.isFinite(
        Number(location.lat)
      ) &&
      Number.isFinite(
        Number(location.lng)
      )
    ) {

      setTimeout(
        () => {

          focusMapOnLocation(
            Number(location.lat),
            Number(location.lng)
          );

        },
        500
      );

    }

  } catch (error) {

    console.warn(
      "Could not load saved location:",
      error
    );

  }

}


// =====================================================
// HERO CONTROLS
// =====================================================

function setupHeroControls() {

  const heroSearchInput =
    document.getElementById(
      "hero-search-input"
    );


  const heroSearchBtn =
    document.getElementById(
      "hero-search-btn"
    );


  function performHeroSearch() {

    if (!heroSearchInput) return;


    const query =
      heroSearchInput.value.trim();


    const mainSearch =
      document.getElementById(
        "search-input"
      );


    if (mainSearch) {

      mainSearch.value =
        query;

    }


    filterListings();


    document
      .querySelector(".marketplace")
      ?.scrollIntoView({

        behavior:
          "smooth",

        block:
          "start"

      });

  }


  heroSearchBtn?.addEventListener(
    "click",
    performHeroSearch
  );


  heroSearchInput?.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Enter"
      ) {

        event.preventDefault();

        performHeroSearch();

      }

    }
  );


  const heroExploreBtn =
    document.getElementById(
      "hero-explore-btn"
    );


  heroExploreBtn?.addEventListener(
    "click",
    () => {

      document
        .querySelector(".marketplace")
        ?.scrollIntoView({

          behavior:
            "smooth",

          block:
            "start"

        });

    }
  );


  const heroListItemBtn =
    document.getElementById(
      "hero-list-item-btn"
    );


  heroListItemBtn?.addEventListener(
    "click",
    () => {

      openListItemModal();

    }
  );

}


// =====================================================
// QUICK CATEGORY FILTER
// =====================================================

function setupQuickCategoryCards() {

  const categoryCards =
    document.querySelectorAll(
      ".category-showcase-card"
    );


  categoryCards.forEach(
    card => {

      card.addEventListener(
        "click",
        () => {

          const category =
            card.dataset.category;


          if (!category) return;


          const categoryChips =
            document.querySelectorAll(
              ".category-chip"
            );


          categoryChips.forEach(
            chip => {

              chip.classList.remove(
                "active"
              );


              if (
                chip.dataset.category &&
                chip.dataset.category
                  .toLowerCase() ===
                category.toLowerCase()
              ) {

                chip.classList.add(
                  "active"
                );

              }

            }
          );


          filterListings();


          document
            .querySelector(".marketplace")
            ?.scrollIntoView({

              behavior:
                "smooth",

              block:
                "start"

            });

        }
      );

    }
  );

}


// =====================================================
// BOOKING
// =====================================================

function setupBooking() {

  const bookingDays =
    document.getElementById(
      "booking-days"
    );


  bookingDays?.addEventListener(
    "input",
    updateBookingSummary
  );


  document
    .querySelectorAll(
      ".pay-option"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          event => {

            document
              .querySelectorAll(
                ".pay-option"
              )
              .forEach(
                b =>
                  b.classList.remove(
                    "active"
                  )
              );


            event.currentTarget
              .classList.add(
                "active"
              );

          }
        );

      }
    );


  const confirmButton =
    document.getElementById(
      "confirm-booking-btn"
    );


  confirmButton?.addEventListener(
    "click",
    confirmBooking
  );

}


// =====================================================
// OPEN BOOKING MODAL
// =====================================================

window.openBookingModal =
  function (id) {

    selectedListingForBooking =
      listings.find(
        item =>
          String(item.id) ===
          String(id)
      );


    if (!selectedListingForBooking) {

      alert(
        "Listing not found."
      );

      return;

    }


    const title =
      document.getElementById(
        "modal-item-title"
      );


    const location =
      document.getElementById(
        "modal-item-location"
      );


    const price =
      document.getElementById(
        "modal-item-price"
      );


    if (title) {

      title.innerText =
        selectedListingForBooking.title;

    }


    if (location) {

      location.innerText =
        `Location: ${selectedListingForBooking.location}`;

    }


    if (price) {

      price.innerText =
        `Price: ${formatINR(
          selectedListingForBooking.price_per_day
        )} / day`;

    }


    const date =
      document.getElementById(
        "booking-date"
      );


    if (date) {

      date.value =
        new Date()
          .toISOString()
          .split("T")[0];

    }


    const days =
      document.getElementById(
        "booking-days"
      );


    if (days) {

      days.value =
        1;

    }


    updateBookingSummary();


    document
      .getElementById(
        "booking-modal"
      )
      ?.classList.remove(
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


  const daysInput =
    document.getElementById(
      "booking-days"
    );


  const days =
    parseInt(
      daysInput
        ? daysInput.value
        : 1
    ) || 1;


  const price =
    Number(
      selectedListingForBooking
        .price_per_day
    ) || 0;


  const total =
    days * price;


  document
    .getElementById(
      "summary-rate"
    )
    ?.replaceChildren(
      document.createTextNode(
        formatINR(price)
      )
    );


  const duration =
    document.getElementById(
      "summary-days"
    );


  const totalElement =
    document.getElementById(
      "summary-total"
    );


  if (duration) {

    duration.innerText =
      days;

  }


  if (totalElement) {

    totalElement.innerText =
      formatINR(total);

  }

}


// =====================================================
// CONFIRM BOOKING
// =====================================================

async function confirmBooking() {

  if (!currentUser) {

    alert(
      "Please login to book an item."
    );


    document
      .getElementById(
        "auth-modal"
      )
      ?.classList.remove(
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


  const paymentOption =
    document.querySelector(
      ".pay-option.active"
    );


  const paymentMethod =
    paymentOption
      ? paymentOption.dataset.method
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
      selectedListingForBooking
        .price_per_day
    );


  const startDate =
    document.getElementById(
      "booking-date"
    ).value;


  if (!startDate) {

    alert(
      "Please select rental start date."
    );

    return;

  }


  try {

    const bookingData = {

      listing_id:
        selectedListingForBooking.id,

      renter_id:
        currentUser.id,

      item_name:
        selectedListingForBooking.title,

      start_date:
        startDate,

      rental_days:
        days,

      total_amount:
        total,

      payment_method:
        paymentMethod,

      status:
        "pending"

    };


    const booking =
      await createBooking(
        bookingData
      );


    if (booking) {

      try {

        await createPayment({

          user_id:
            currentUser.id,

          booking_id:
            booking.id,

          amount:
            total,

          payment_method:
            paymentMethod,

          payment_status:
            "pending"

        });

      } catch (paymentError) {

        console.warn(
          "Payment record error:",
          paymentError
        );

      }

    }


    alert(`

Booking created successfully!

Item: ${selectedListingForBooking.title}

Duration: ${days} day(s)

Total: ${formatINR(total)}

Payment Method: ${paymentMethod}

`);


    document
      .getElementById(
        "booking-modal"
      )
      ?.classList.add(
        "hidden"
      );


  } catch (error) {

    console.error(
      "Booking error:",
      error
    );


    alert(
      error.message ||
      "Booking could not be saved."
    );

  }

}


// =====================================================
// FORGOT PASSWORD
// =====================================================

function setupForgotPassword() {

  const button =
    document.getElementById(
      "forgot-password-btn"
    );


  if (!button) return;


  button.addEventListener(
    "click",
    async () => {

      const emailInput =
        document.getElementById(
          "auth-email"
        );


      const email =
        emailInput
          ? emailInput.value.trim()
          : "";


      if (!email) {

        alert(
          "Please enter your email address first."
        );

        emailInput?.focus();

        return;

      }


      try {

        button.disabled = true;

        button.textContent =
          "Sending...";


        const { error } =
          await supabase.auth
            .resetPasswordForEmail(
              email,
              {

                redirectTo:
                  window.location.origin +
                  window.location.pathname

              }
            );


        if (error) {

          throw error;

        }


        alert(
          "Password reset link has been sent to your email. Please check your inbox and Spam folder."
        );


      } catch (error) {

        console.error(
          "Password reset error:",
          error
        );


        alert(
          "Password reset failed: " +
          error.message
        );


      } finally {

        button.disabled = false;

        button.textContent =
          "Forgot Password?";

      }

    }
  );

}


// =====================================================
// HTML SECURITY HELPERS
// =====================================================

function escapeHTML(value) {

  return String(value ?? "")
    .replace(
      /[&<>"']/g,
      char => ({

        "&":
          "&amp;",

        "<":
          "&lt;",

        ">":
          "&gt;",

        '"':
          "&quot;",

        "'":
          "&#039;"

      })[char]
    );

}


function escapeAttribute(value) {

  return escapeHTML(value);

}


// =====================================================
// GOOGLE OAUTH RETURN
// =====================================================

window.addEventListener(
  "load",
  async () => {

    try {

      const {
        data
      } =
        await supabase.auth
          .getSession();


      if (
        data &&
        data.session &&
        data.session.user
      ) {

        currentUser =
          data.session.user;


        await ensureUserProfile();

        updateUIForUser();

      }

    } catch (error) {

      console.warn(
        "OAuth session check:",
        error
      );

    }

  }
);


// =====================================================
// FORWARD SELECTED LOCATION TO LISTING
// =====================================================

window.selectLocationForListing =
  function () {

    openLocationModal(
      true
    );

  };


// =====================================================
// END OF FLEX RENT SCRIPT
// =====================================================
