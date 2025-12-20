import React, { useEffect, useRef } from "react";
import { useTheme } from "./ThemeContext";
import { useToast } from "./Toast";

export default function GoogleSignIn({ onSuccess }) {
  const buttonRef = useRef(null);
  const initializedRef = useRef(false);
  const { colors } = useTheme();
  const toast = useToast();

  useEffect(() => {
    if (!window.google || initializedRef.current) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      width: 240,
    });

    initializedRef.current = true;

    function handleCredentialResponse(response) {
      if (!response?.credential) return;

      fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/google`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: response.credential }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.ok) {
            toast.success("You have successfully logged in!");
            onSuccess?.(data.user);
          } else {
            if (!data.ok && data.message === "Only VIT-AP students can access this platform") {
                toast.error("You can login only through your college email ID!");
                toast.info("No identifiable information is stored in the database!");
            }
          }
        })
        .catch(console.error);
    }
  }, [onSuccess]);

  const handleCustomClick = () => {
    const googleButton = buttonRef.current?.querySelector('[role="button"]');
    if (googleButton) {
      googleButton.click();
    }
  };

  return (
    <div>
      {/* Hidden Google button */}
      <div ref={buttonRef} className="hidden" />
      
      {/* Custom styled button */}
      <button
        onClick={handleCustomClick}
        className={`
          w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl
          ${colors.bg.card} border ${colors.border}
          ${colors.text.primary} font-medium
          hover:scale-[1.02] active:scale-[0.98]
          transition-all duration-300 shadow-lg
          hover:shadow-xl
        `}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>Sign in with Google</span>
      </button>
    </div>
  );
}