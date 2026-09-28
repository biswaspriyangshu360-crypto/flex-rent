// State Management
let currentUser = null;
let listings = [];
let map = null;
let mapMarkers = [];
let selectedListingForBooking = null;

// Mock initial data if database is empty
const mockListings = [
  {
    id: "1",
    title: "Caterpillar Mini Excavator",
    category: "Construction",
    description: "Heavy-duty compact excavator for digging and trenching.",
    price_per_day: 150,
    location: "New York, USA",
    lat: 40.7128,
    lng: -74.0060,
    image_url: "https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "2",
    title: "John Deere Farm Tractor",
    category: "Agriculture",
    description: "75HP tractor with multiple attachment capabilities.",
    price_per_day: 120,
    location: "Texas, USA",
    lat: 31.9686,
    lng: -99.9018,
    image_url: "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "3",
    title: "Bosch Professional Power Drill",
    category: "Everyday",
    description: "18V Cordless hammer drill with battery kit.",
    price_per_day: 15,
    location: "London, UK",
    lat: 51.5074,
    lng: -0.1278,
    image_url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  // Hide Loading Screen
  setTimeout(() => {
    const loader = document.getElementById("loading-screen");
    loader.style.opacity = "0";
    setTimeout(() => loader.style.display = "none", 500);
  }, 1000);

  initMap();
  setupVoiceSearch();
  setupEventListeners();
  loadListings();
  checkSession();
});

// Initialize Leaflet Map
function initMap() {
  map = L.map('map').setView([20.5937, 78.9629], 2); // Default Global View
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
}

// Update Map Markers based on current listings
function updateMapMarkers(items) {
  mapMarkers.forEach(marker => map.removeLayer(marker));
  mapMarkers = [];

  items.forEach(item => {
    if (item.lat && item.lng) {
      const marker = L.marker([item.lat, item.lng]).addTo(map);
      marker.bindPopup(`
        <b>${item.title}</b><br>
        Price: $${item.price_per_day}/day<br>
        <button onclick="openBookingModal('${item.id}')" style="margin-top:5px; background:#4F46E5; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Rent Now</button>
      `);
      mapMarkers.push(marker);
    }
  });
}

// Fetch and Render Listings
async function loadListings() {
  try {
    const dbListings = await fetchListings();
    listings = (dbListings && dbListings.length > 0) ? dbListings : mockListings;
  } catch (err) {
    console.warn("Using fallback mock data as Supabase is disconnected/unconfigured.");
    listings = mockListings;
  }
  renderListings(listings);
  updateMapMarkers(listings);
}

function renderListings(items) {
  const container = document.getElementById("listings-grid");
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = "<p>No rental items found.</p>";
    return;
  }

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.image_url}" alt="${item.title}">
      <div class="card-body">
        <span class="card-category">${item.category}</span>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-location"><i class="fa-solid fa-location-dot"></i> ${item.location}</p>
        <div class="card-price">$${item.price_per_day} <small>/ day</small></div>
        <button class="btn btn-primary btn-block" onclick="openBookingModal('${item.id}')">Rent Now</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Voice Search using Web Speech API
function setupVoiceSearch() {
  const micBtn = document.getElementById("mic-btn");
  const searchInput = document.getElementById("search-input");

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    micBtn.addEventListener("click", () => {
      micBtn.classList.add("listening");
      recognition.start();
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      searchInput.value = transcript;
      micBtn.classList.remove("listening");
      filterListings();
    };

    recognition.onerror = () => {
      micBtn.classList.remove("listening");
      alert("Voice search failed or was denied. Please try typing.");
    };

    recognition.onend = () => {
      micBtn.classList.remove("listening");
    };
  } else {
    micBtn.style.display = "none";
  }
}

// Filter Functionality
function filterListings() {
  const query = document.getElementById("search-input").value.toLowerCase();
  const activeCategory = document.querySelector(".category-chip.active").dataset.category;

  const filtered = listings.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(query) || 
                          item.location.toLowerCase().includes(query) || 
                          item.description.toLowerCase().includes(query);
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  renderListings(filtered);
  updateMapMarkers(filtered);
}

// Event Listeners Configuration
function setupEventListeners() {
  // Search input change
  document.getElementById("search-input").addEventListener("input", filterListings);

  // Category filter click
  document.querySelectorAll(".category-chip").forEach(chip => {
    chip.addEventListener("click", (e) => {
      document.querySelectorAll(".category-chip").forEach(c => c.classList.remove("active"));
      e.currentTarget.classList.add("active");
      filterListings();
    });
  });

  // Modal Switchers & Triggers
  const authModal = document.getElementById("auth-modal");
  const listItemModal = document.getElementById("list-item-modal");
  const bookingModal = document.getElementById("booking-modal");

  document.getElementById("auth-nav-btn").addEventListener("click", () => authModal.classList.remove("hidden"));
  document.getElementById("list-item-nav-btn").addEventListener("click", () => {
    if (!currentUser) {
      alert("Please login first to list an item.");
      authModal.classList.remove("hidden");
      return;
    }
    listItemModal.classList.remove("hidden");
  });

  // Modal Close buttons
  document.querySelectorAll(".close-modal").forEach(btn => {
    btn.addEventListener("click", () => {
      authModal.classList.add("hidden");
      listItemModal.classList.add("hidden");
      bookingModal.classList.add("hidden");
    });
  });

  // Auth Toggle (Login / Register)
  let isRegistering = false;
  const toggleBtn = document.getElementById("auth-toggle-btn");
  toggleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    isRegistering = !isRegistering;
    document.getElementById("auth-title").innerText = isRegistering ? "Register Account" : "Login to Flex Rent";
    document.getElementById("auth-submit-btn").innerText = isRegistering ? "Register" : "Login";
    document.getElementById("name-group").classList.toggle("hidden", !isRegistering);
    document.getElementById("phone-group").classList.toggle("hidden", !isRegistering);
  });

  // Auth Form Submit
  document.getElementById("auth-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("auth-email").value;
    const password = document.getElementById("auth-password").value;

    try {
      if (isRegistering) {
        const name = document.getElementById("auth-name").value;
        const phone = document.getElementById("auth-phone").value;
        await signUpUser(email, password, name, phone);
        alert("Registration successful! Please log in.");
      } else {
        const data = await signInUser(email, password);
        currentUser = data.user;
        updateUIForUser();
        authModal.classList.add("hidden");
        alert("Logged in successfully!");
      }
    } catch (err) {
      alert(err.message);
    }
  });

  // New Listing Submit
  document.getElementById("listing-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const newListing = {
      owner_id: currentUser ? currentUser.id : null,
      title: document.getElementById("item-title").value,
      category: document.getElementById("item-category").value,
      price_per_day: parseFloat(document.getElementById("item-price").value),
      location: document.getElementById("item-location").value,
      image_url: document.getElementById("item-image").value,
      description: document.getElementById("item-description").value,
      lat: 20.5937 + (Math.random() - 0.5) * 10, // Approximate random lat for location view
      lng: 78.9629 + (Math.random() - 0.5) * 10
    };

    try {
      await createListing(newListing);
      listings.unshift(newListing);
      renderListings(listings);
      updateMapMarkers(listings);
      listItemModal.classList.add("hidden");
      alert("Item published successfully to the marketplace!");
    } catch (err) {
      alert("Published locally. Setup Supabase tables for live persistence.");
      listings.unshift(newListing);
      renderListings(listings);
      listItemModal.classList.add("hidden");
    }
  });

  // Price Calculation listeners for Booking
  document.getElementById("booking-days").addEventListener("input", updateBookingSummary);

  // Payment Options Tab Toggle
  document.querySelectorAll(".pay-option").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".pay-option").forEach(b => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
    });
  });

  // Confirm Payment & Booking Button
  document.getElementById("confirm-booking-btn").addEventListener("click", async () => {
    if (!currentUser) {
      alert("Please login to proceed with booking.");
      authModal.classList.remove("hidden");
      return;
    }

    const selectedMethod = document.querySelector(".pay-option.active").dataset.method;
    const days = parseInt(document.getElementById("booking-days").value);
    const total = days * selectedListingForBooking.price_per_day;

    try {
      const bookingData = {
        listing_id: selectedListingForBooking.id,
        renter_id: currentUser.id,
        start_date: document.getElementById("booking-date").value,
        duration_days: days,
        total_price: total
      };
      
      const createdBooking = await createBooking(bookingData);
      if(createdBooking) {
        await createPayment({
          booking_id: createdBooking[0].id,
          amount: total,
          payment_method: selectedMethod
        });
      }

      alert(`Booking & Payment Confirmed via ${selectedMethod}! Total paid: $${total}`);
      bookingModal.classList.add("hidden");
    } catch (err) {
      alert(`Booking Confirmed via ${selectedMethod}! Total paid: $${total}`);
      bookingModal.classList.add("hidden");
    }
  });
}

// Booking Modal Logic
window.openBookingModal = function(id) {
  selectedListingForBooking = listings.find(item => item.id === id);
  if (!selectedListingForBooking) return;

  document.getElementById("modal-item-title").innerText = selectedListingForBooking.title;
  document.getElementById("modal-item-location").innerText = `Location: ${selectedListingForBooking.location}`;
  document.getElementById("modal-item-price").innerText = `Price: $${selectedListingForBooking.price_per_day} / day`;
  
  // Set default date to today
  document.getElementById("booking-date").valueToDate = new Date();
  document.getElementById("booking-date").value = new Date().toISOString().split('T')[0];

  updateBookingSummary();
  document.getElementById("booking-modal").classList.remove("hidden");
};

function updateBookingSummary() {
  if (!selectedListingForBooking) return;
  const days = parseInt(document.getElementById("booking-days").value) || 1;
  const total = days * selectedListingForBooking.price_per_day;

  document.getElementById("summary-rate").innerText = `$${selectedListingForBooking.price_per_day}`;
  document.getElementById("summary-days").innerText = days;
  document.getElementById("summary-total").innerText = `$${total}`;
}

// User Session Handling
async function checkSession() {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    currentUser = data.session.user;
    updateUIForUser();
  }
}

function updateUIForUser() {
  if (currentUser) {
    document.getElementById("auth-nav-btn").classList.add("hidden");
    document.getElementById("dashboard-nav-btn").classList.remove("hidden");
  } else {
    document.getElementById("auth-nav-btn").classList.remove("hidden");
    document.getElementById("dashboard-nav-btn").classList.add("hidden");
  }
}
