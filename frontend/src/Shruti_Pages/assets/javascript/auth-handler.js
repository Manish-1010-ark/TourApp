// assets/javascript/auth-handler.js

// Paste your actual Supabase credentials here (Keep consistent across files)
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_ANON_KEY = "your-actual-anon-public-key-here";

// Headers wrapper utility required to authenticate with Supabase REST API
const getSupabaseAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
});

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form-element");
    const loginForm = document.getElementById("login-form-element");

    // --- 1. SUPABASE LIVE REGISTRATION ENGINE ---
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = registerForm.querySelector('input[type="text"]').value;
            const email = registerForm.querySelector('input[type="email"]').value;
            const password = registerForm.querySelector('input[type="password"]').value;
            const userStateSelect = document.getElementById("user-state-select");
            const userState = userStateSelect ? userStateSelect.value : "Maharashtra";

            const payload = { name, email, password, location: userState };

            try {
                // First check if the user already exists in Supabase to prevent duplicates
                const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
                    method: 'GET',
                    headers: getSupabaseAuthHeaders()
                });
                
                if (checkRes.ok) {
                    const existingUsers = await checkRes.json();
                    if (existingUsers.length > 0) {
                        alert("An account with this email address already exists in our cloud system!");
                        return;
                    }
                }

                // POST data to insert the registration row into the cloud 'users' table
                const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
                    method: 'POST',
                    headers: {
                        ...getSupabaseAuthHeaders(),
                        'Prefer': 'return=minimal' 
                    },
                    body: JSON.stringify(payload)
                });
                
                if (response.ok) {
                    // Log current client time interval into local storage fallback layers for admin view tracking
                    logCurrentTimeMetric();
                    
                    alert("Account created successfully inside your Supabase Cloud Database!");
                    window.location.href = 'login.html';
                } else {
                    const errorResult = await response.json();
                    alert("Supabase registration error: " + errorResult.message);
                }
            } catch (err) {
                console.warn("Database Server Connection Error. Falling back to localized browser storage sandbox...", err);
                
                // --- LOCAL STORAGE BACKUP FALLBACK MODE ---
                if (localStorage.getItem(`user_account_${email}`)) {
                    alert("An account with this email already exists inside your local browser memory!");
                    return;
                }

                localStorage.setItem(`user_account_${email}`, JSON.stringify(payload));

                let demographics = JSON.parse(localStorage.getItem("user_demographics")) || {};
                demographics[userState] = (demographics[userState] || 0) + 1;
                localStorage.setItem("user_demographics", JSON.stringify(demographics));

                logCurrentTimeMetric();

                alert("Database offline. Local Registration Successful (Profile cached locally in browser memory)!");
                window.location.href = 'login.html';
            }
        });
    }

    // --- 2. SUPABASE LIVE LOGIN ENGINE ---
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            try {
                // Retrieve user matching BOTH the specified email and matching plaintext password parameters
                const response = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}&password=eq.${encodeURIComponent(password)}`, {
                    method: 'GET',
                    headers: getSupabaseAuthHeaders()
                });

                if (!response.ok) throw new Error("Database network communication error");

                const users = await response.json();

                if (users.length > 0) {
                    const loggedInUser = users[0];
                    
                    // Store safe dynamic global context state for profile recognition across main views
                    localStorage.setItem("session_active_user", loggedInUser.name);
                    localStorage.setItem("session_active_location", loggedInUser.location);
                    
                    logCurrentTimeMetric();
                    alert(`Welcome back, ${loggedInUser.name}! (Authenticated via Supabase)`);
                    window.location.href = 'index.html';
                } else {
                    alert("Invalid email or password combination. Please try again.");
                }
            } catch (err) {
                console.warn("Database Server Connection Error. Authenticating with local storage memory values...");

                // --- LOCAL STORAGE CREDENTIALS VALIDATION FALLBACK ---
                const storedAccount = localStorage.getItem(`user_account_${email}`);
                if (!storedAccount) {
                    alert("No account matching that email found in this browser's fallback storage.");
                    return;
                }

                const userData = JSON.parse(storedAccount);
                if (userData.password === password) {
                    localStorage.setItem("session_active_user", userData.name);
                    localStorage.setItem("session_active_location", userData.location);
                    logCurrentTimeMetric();
                    alert(`Welcome back, ${userData.name}! (Offline Sandbox Connection verified)`);
                    window.location.href = 'index.html';
                } else {
                    alert("Incorrect credentials combination choice. Access Denied.");
                }
            }
        });
    }
});

// Helper function to track peak login activity metrics timestamps locally
function logCurrentTimeMetric() {
    const currentHour = new Date().getHours();
    let displayLabel = "12:00 PM";

    if (currentHour >= 0 && currentHour < 9) displayLabel = "06:00 AM";
    else if (currentHour >= 9 && currentHour < 15) displayLabel = "12:00 PM";
    else if (currentHour >= 15 && currentHour < 19) displayLabel = "04:00 PM";
    else if (currentHour >= 19 && currentHour < 22) displayLabel = "08:00 PM";
    else displayLabel = "11:00 PM";

    let hourMetrics = JSON.parse(localStorage.getItem("booking_hours")) || {};
    hourMetrics[displayLabel] = (hourMetrics[displayLabel] || 0) + 1;
    localStorage.setItem("booking_hours", JSON.stringify(hourMetrics));
}