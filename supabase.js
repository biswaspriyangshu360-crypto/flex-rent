// ==========================================
// FLEX RENT - SUPABASE CONFIGURATION
// ==========================================

const SUPABASE_URL = "https://ztjclizjijlgskxdyvvc.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_HpN-JfR1xpMxCJqzJHpK4A_mPicSh4m";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


// ==========================================
// AUTH
// ==========================================

async function signUpUser(email, password, fullName, phone) {

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password
  });

  if (error) {
    throw error;
  }

  // Supabase may require email confirmation.
  // Profile will be created when a valid user exists.
  if (data.user) {

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        phone: phone
      }, {
        onConflict: "id"
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
    }
  }

  return data;
}


async function signInUser(email, password) {

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    throw error;
  }

  return data;
}


async function signOutUser() {

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}


// ==========================================
// PROFILE
// ==========================================

async function fetchUserProfile(userId) {

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}


async function updateUserProfile(userId, profileData) {

  const { data, error } = await supabase
    .from("profiles")
    .update(profileData)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}


// ==========================================
// LISTINGS
// ==========================================

async function fetchListings() {

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {
    throw error;
  }

  return data || [];
}


async function createListing(listingData) {

  const { data, error } = await supabase
    .from("listings")
    .insert([listingData])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}


async function fetchUserListings(userId) {

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", {
      ascending: false
    });

  if (error) {
    throw error;
  }

  return data || [];
}


// ==========================================
// BOOKINGS
// ==========================================

async function createBooking(bookingData) {

  const { data, error } = await supabase
    .from("bookings")
    .insert([bookingData])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}


async function fetchUserBookings(userId) {

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("renter_id", userId)
    .order("created_at", {
      ascending: false
    });

  if (error) {
    throw error;
  }

  return data || [];
}


// ==========================================
// PAYMENTS
// ==========================================

async function createPayment(paymentData) {

  const { data, error } = await supabase
    .from("payments")
    .insert([paymentData])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}


// ==========================================
// IMAGE UPLOAD
// ==========================================

async function uploadListingImage(file) {

  if (!file) {
    throw new Error("Please select an image.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image size must be less than 5 MB.");
  }

  const fileExt = file.name
    .split(".")
    .pop()
    .toLowerCase();

  const fileName =
    `${crypto.randomUUID()}.${fileExt}`;

  const filePath =
    `${Date.now()}-${fileName}`;


  const { error: uploadError } =
    await supabase.storage
      .from("listing-images")
      .upload(
        filePath,
        file,
        {
          cacheControl: "3600",
          upsert: false
        }
      );

  if (uploadError) {
    throw uploadError;
  }


  const { data } =
    supabase.storage
      .from("listing-images")
      .getPublicUrl(filePath);

  return data.publicUrl;
}
// ================================
// LOGIN USER
// ================================

async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    throw error;
  }

  return data;
}
