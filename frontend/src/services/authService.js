import { supabase } from "../lib/supabase";

export async function signUp(name, email, password) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role: "user", // every new account starts as a normal user
      },
    },
  });
}

export async function signIn(email, password) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getCurrentSession() {
  return await supabase.auth.getSession();
}

export async function getCurrentUser() {
  return await supabase.auth.getUser();
}

// ---- Role helpers (based on Supabase Auth user_metadata, no profiles table needed) ----

// Reads the role off a Supabase user object. Defaults to "user" if missing.
export function getUserRole(user) {
  return user?.user_metadata?.role || "user";
}

export function isDeveloper(user) {
  return getUserRole(user) === "developer";
}

// Given the user object returned by signIn/getSession/getUser, returns the
// path the person should land on after authenticating.
export function getRedirectPathForUser(user) {
  return isDeveloper(user) ? "/developer-dashboard" : "/user-dashboard";
}
