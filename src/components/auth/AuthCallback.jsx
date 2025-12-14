// import { useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { supabase } from "../../lib/supabaseClient";
// import { toast } from "react-toastify";
// import { toastConfig } from "../../lib/toastConfig";
// import { useTranslation } from "react-i18next";
// import { Loader2 } from "lucide-react";

// /**
//  * This component handles Supabase auth callbacks:
//  * - Email verification (signup confirmation)
//  * - Password recovery
//  * When Supabase redirects with ?code=xxx, this exchanges the code for a session
//  * and redirects to the appropriate page
//  */
// const AuthCallback = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const { t } = useTranslation();

//   useEffect(() => {
//     const handleCallback = async () => {
//       const code = searchParams.get("code");
//       const type = searchParams.get("type"); // 'recovery', 'signup', 'magiclink', etc.

//       if (code) {
//         try {
//           console.log("Exchanging code for session, type:", type);

//           // Check if code_verifier exists (PKCE flow)
//           const codeVerifier =
//             sessionStorage.getItem("code_verifier") ||
//             sessionStorage.getItem(
//               `sb-${
//                 import.meta.env.VITE_SUPABASE_URL?.split("//")[1]?.split(".")[0]
//               }-auth-token-code-verifier`
//             );

//           // If no code verifier, the user opened the link in a different browser/tab
//           if (!codeVerifier) {
//             console.log(
//               "No code verifier found - user opened link in different browser/tab"
//             );
//             // Show success message with delay to ensure it's visible
//             setTimeout(() => {
//               toast.success(t("auth.email_verified_login"), toastConfig);
//             }, 100);
//             navigate("/login", { replace: true });
//             return;
//           }

//           const { data, error } = await supabase.auth.exchangeCodeForSession(
//             code
//           );

//           if (error) {
//             console.error("Error exchanging code:", error);
//             // If code verifier error, redirect to login with success message
//             if (error.message?.includes("code verifier")) {
//               toast.success(t("auth.email_verified_login"), toastConfig);
//               navigate("/login", { replace: true });
//               return;
//             }
//             toast.error(t("errors.default"), toastConfig);
//             navigate("/login");
//             return;
//           }

//           if (data.session) {
//             console.log("Session established successfully");

//             // Handle different callback types
//             if (type === "recovery") {
//               // Password recovery - redirect to update password page
//               navigate("/update-password", { replace: true });
//               return;
//             }

//             // Email verification - show success message and auto-login
//             // Check if user has completed onboarding
//             const { data: profile } = await supabase
//               .from("profiles")
//               .select("onboarding_completed")
//               .eq("id", data.session.user.id)
//               .single();

//             // Show success notification
//             toast.success(t("auth.email_verified"), toastConfig);

//             // Redirect based on onboarding status
//             if (profile?.onboarding_completed) {
//               navigate("/listings", { replace: true });
//             } else {
//               navigate("/onboarding", { replace: true });
//             }
//             return;
//           }
//         } catch (err) {
//           console.error("Callback error:", err);
//           toast.error(t("errors.default"), toastConfig);
//           navigate("/login");
//           return;
//         }
//       }

//       // No code found, redirect to home
//       navigate("/");
//     };

//     handleCallback();
//   }, [navigate, searchParams, t]);

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         minHeight: "60vh",
//         gap: "1rem",
//       }}
//     >
//       <Loader2
//         size={40}
//         style={{ animation: "spin 1s linear infinite", color: "#22c55e" }}
//       />
//       <p style={{ color: "#6b7280" }}>Processing...</p>
//       <style>{`
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default AuthCallback;
