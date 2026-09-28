// Replace these with your project's Supabase URL and Anon Key
const SUPABASE_URL = "https://ztjclizjijlgskxdyvvc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HpN-JfR1xpMxCJqzJHpK4A_mPicSh4m";

// Initialize Supabase Client using the CDN script
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth Helpers
async function signUpUser(email, password, fullName, phone) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (data.user) {
    await supabase.from('profiles').insert([
      { id: data.user.id, email, full_name: fullName, phone }
    ]);
  }
  return data;
}

async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Database Helpers
async function fetchListings() {
  const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function createListing(listingData) {
  const { data, error } = await supabase.from('listings').insert([listingData]).select();
  if (error) throw error;
  return data;
}

async function createBooking(bookingData) {
  const { data, error } = await supabase.from('bookings').insert([bookingData]).select();
  if (error) throw error;
  return data;
}

async function createPayment(paymentData) {
  const { data, error } = await supabase.from('payments').insert([paymentData]).select();
  if (error) throw error;
  return data;
}

async function fetchUserBookings(userId) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, listings(*)')
    .eq('renter_id', userId);
  if (error) throw error;
  return data;
}

async function fetchUserListings(userId) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('owner_id', userId);
  if (error) throw error;
  return data;
}
