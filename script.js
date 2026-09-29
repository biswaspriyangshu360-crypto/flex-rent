// =====================================================
// FLEX RENT - MAIN JAVASCRIPT
// =====================================================
// Features:
// - Email + Password Authentication
// - Google Authentication
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
// - Booking
// - Payment Record
// - Dashboard
// - Logout
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


// =====================================================
// CURRENCY
// =====================================================

function formatINR(amount) {
  const number = Number(amount) || 0;

  return `₹${number.toLocaleString("en-IN")}`;
}


// =====================================================
// MOCK LISTINGS
// Used only when database has no listings
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

}


// =====================================================
// MAP MARKERS
// =====================================================

function updateMapMarkers(items) {

  if (!map) return;

  mapMarkers.forEach(marker => {

    map.removeLayer(marker);

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

          <strong>${escapeHTML(item.title)}</strong>

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
            onclick="openBookingModal('${item.id}')"
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
// Supabase uses:
// name, price, latitude, longitude
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

        <p>No rental items found.</p>

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
                onclick="openBookingModal('${item.id}')"
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

        if (!currentUser) {

          alert(
            "Please login first to list an item."
          );

          if (authModal) {

            authModal.classList.remove(
              "hidden"
            );

          }

          return;

        }


        if (listItemModal) {

          listItemModal.classList.remove(
            "hidden"
          );

        }

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

          if (authModal) {

            authModal.classList.add(
              "hidden"
            );

          }


          if (listItemModal) {

            listItemModal.classList.add(
              "hidden"
            );

          }


          if (bookingModal) {

            bookingModal.classList.add(
              "hidden"
            );

          }

        }
      );

    });


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

        // ---------------------------------------------
        // REGISTER
        // ---------------------------------------------

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


          // If email confirmation is disabled
          if (data.session) {

            currentUser =
              data.user;

            await ensureUserProfile();

            updateUIForUser();

            document
              .getElementById("auth-modal")
              .classList.add("hidden");


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


        // ---------------------------------------------
        // LOGIN
        // ---------------------------------------------

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
          .classList.add("hidden");


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


  const form =
    document.getElementById(
      "auth-form"
    );


  if (!form) return;


  // Don't create duplicate button
  if (
    document.getElementById(
      "google-login-btn"
    )
  ) return;


  const googleButton =
    document.createElement("button");


  googleButton.id =
    "google-login-btn";


  googleButton.type =
    "button";


  googleButton.className =
    "btn btn-secondary btn-block";


  googleButton.style.marginTop =
    "10px";


  googleButton.innerHTML =
    `<i class="fa-brands fa-google"></i> Continue with Google`;


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


  form.appendChild(
    googleButton
  );

}
// =====================================================
// PHONE OTP LOGIN
// =====================================================

let phoneOTPNumber = "";

function setupPhoneLogin() {

  const phoneButton =
    document.getElementById("phone-login-btn");

  const otpSection =
    document.getElementById("phone-otp-section");

  const verifyButton =
    document.getElementById("verify-phone-otp-btn");

  const resendButton =
    document.getElementById("resend-phone-otp-btn");

  const phoneInput =
    document.getElementById("auth-phone");

  if (!phoneButton) return;


  // ---------------------------------------------
  // SEND OTP
  // ---------------------------------------------

  phoneButton.addEventListener("click", async () => {

    const phone = phoneInput
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
        await supabase.auth.signInWithOtp({
          phone: phone
        });


      if (error) {
        throw error;
      }


      phoneOTPNumber = phone;


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

  });


  // ---------------------------------------------
  // VERIFY OTP
  // ---------------------------------------------

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


        if (!otp || otp.length < 4) {

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
            await supabase.auth.verifyOtp({

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


          const authModal =
            document.getElementById(
              "auth-modal"
            );


          if (authModal) {

            authModal.classList.add(
              "hidden"
            );

          }


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


  // ---------------------------------------------
  // RESEND OTP
  // ---------------------------------------------

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
            await supabase.auth.signInWithOtp({

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


  // Listen for login/logout changes
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


        if (marketplace) {

          marketplace
            .classList
            .add("hidden");

        }


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


          if (dashboardSection) {

            dashboardSection
              .classList
              .add("hidden");

          }


          const marketplace =
            document.querySelector(
              ".marketplace"
            );


          if (marketplace) {

            marketplace
              .classList
              .remove("hidden");

          }


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


        if (selected) {

          selected.classList.remove(
            "hidden"
          );

        }


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

          <p>You have not listed any items yet.</p>

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

          <p>You have no bookings yet.</p>

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
// OPEN LIST ITEM MODAL FROM DASHBOARD
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

      return;

    }


    if (modal) {

      modal.classList.remove(
        "hidden"
      );

    }

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

        // ---------------------------------------------
        // Upload image
        // ---------------------------------------------

        alert(
          "Uploading image..."
        );


        const imageUrl =
          await uploadListingImage(
            imageFile
          );


        // ---------------------------------------------
        // Get form values
        // ---------------------------------------------

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


        const location =
          document.getElementById(
            "item-location"
          ).value.trim();


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


        if (!location) {

          throw new Error(
            "Please enter location."
          );

        }


        // ---------------------------------------------
        // GPS
        // ---------------------------------------------

        const coordinates =
          await getCurrentLocation();


        // ---------------------------------------------
        // IMPORTANT:
        // These names match your Supabase table.
        // ---------------------------------------------

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


        // ---------------------------------------------
        // Save to Supabase
        // ---------------------------------------------

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


        const modal =
          document.getElementById(
            "list-item-modal"
          );


        if (modal) {

          modal.classList.add(
            "hidden"
          );

        }


        listingForm.reset();


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
// BOOKING
// =====================================================

function setupBooking() {

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


  // Payment buttons

  document
    .querySelectorAll(".pay-option")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        event => {

          document
            .querySelectorAll(
              ".pay-option"
            )
            .forEach(b =>
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

    });


  const confirmButton =
    document.getElementById(
      "confirm-booking-btn"
    );


  if (confirmButton) {

    confirmButton.addEventListener(
      "click",
      confirmBooking
    );

  }

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

      days.value = 1;

    }


    updateBookingSummary();


    const modal =
      document.getElementById(
        "booking-modal"
      );


    if (modal) {

      modal.classList.remove(
        "hidden"
      );

    }

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


  const rate =
    document.getElementById(
      "summary-rate"
    );


  const duration =
    document.getElementById(
      "summary-days"
    );


  const totalElement =
    document.getElementById(
      "summary-total"
    );


  if (rate) {

    rate.innerText =
      formatINR(price);

  }


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

    const authModal =
      document.getElementById(
        "auth-modal"
      );


    if (authModal) {

      authModal.classList.remove(
        "hidden"
      );

    }

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

    // ---------------------------------------------
    // BOOKING DATA
    // Matches your Supabase table.
    // ---------------------------------------------

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


    // ---------------------------------------------
    // PAYMENT RECORD
    // ---------------------------------------------

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

    const modal =
      document.getElementById(
        "booking-modal"
      );


    if (modal) {

      modal.classList.add(
        "hidden"
      );

    }


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
// HTML SECURITY HELPERS
// =====================================================

function escapeHTML(value) {

  return String(value ?? "")
    .replace(
      /[&<>"']/g,
      char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[char]
    );

}


function escapeAttribute(value) {

  return escapeHTML(value);

}


// =====================================================
// DASHBOARD SETUP
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupDashboard();

  }
);


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
// ==========================================
// FORGOT PASSWORD
// ==========================================

const forgotPasswordBtn = document.getElementById("forgot-password-btn");

if (forgotPasswordBtn) {

    forgotPasswordBtn.addEventListener("click", async () => {

        const emailInput = document.getElementById("auth-email");
        const email = emailInput ? emailInput.value.trim() : "";

        if (!email) {
            alert("Please enter your email address first.");
            emailInput?.focus();
            return;
        }

        try {

            forgotPasswordBtn.disabled = true;
            forgotPasswordBtn.textContent = "Sending...";

            const { error } = await supabase.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo: window.location.origin + window.location.pathname
                }
            );

            if (error) {
                throw error;
            }

            alert(
                "Password reset link has been sent to your email. Please check your inbox and Spam folder."
            );

        } catch (error) {

            console.error("Password reset error:", error);

            alert(
                "Password reset failed: " + error.message
            );

        } finally {

            forgotPasswordBtn.disabled = false;
            forgotPasswordBtn.textContent = "Forgot Password?";

        }

    });

}

// =====================================================
// END OF FLEX RENT SCRIPT
// =====================================================
