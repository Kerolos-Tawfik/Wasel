export const getAuthErrorMessage = (error) => {
  if (!error) return "auth.errors.default";

  const message = error.message || error.toString();

  if (message.includes("Invalid login credentials")) {
    return "auth.errors.invalid_login_credentials";
  }
  if (
    message.includes("User already registered") ||
    message.includes("already been registered") ||
    message.includes("already exists")
  ) {
    return "auth.errors.user_already_registered";
  }
  if (message.includes("Email not confirmed")) {
    return "auth.errors.email_not_confirmed";
  }
  if (message.includes("Password should be at least")) {
    return "auth.errors.weak_password";
  }
  if (message.includes("rate limit")) {
    return "auth.errors.over_request_rate_limit";
  }

  return message; // Return original message if no match found, or map to default
};
