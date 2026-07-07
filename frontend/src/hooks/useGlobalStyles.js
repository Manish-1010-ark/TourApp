// hooks/useGlobalStyles.js
import { useEffect } from "react";

export function useGlobalStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');

      :root {
        --color-bg: #F8FBFF;
        --color-bg-secondary: #EEF7FF;
        --color-card: #FFFFFF;
        --color-primary: #0EA5E9;
        --color-secondary: #14B8A6;
        --color-cta: #F59E0B;
        --color-success: #22C55E;
        --color-headings: #0F172A;
        --color-body: #475569;
        --color-warning: #F97316;
      }

      * {
        box-sizing: border-box;
      }

      body {
        background-color: var(--color-bg);
        color: var(--color-body);
        font-family: 'Plus Jakarta Sans', sans-serif;
        margin: 0;
        padding: 0;
      }

      h1, h2, h3, h4, h5, h6 {
        font-family: 'Playfair Display', serif;
        color: var(--color-headings);
      }

      .font-display {
        font-family: 'Playfair Display', serif;
      }

      .font-body {
        font-family: 'Plus Jakarta Sans', sans-serif;
      }

      .font-mono-tag {
        font-family: 'Plus Jakarta Sans', sans-serif;
        letter-spacing: 0.05em;
      }

      /* Smooth scrolling */
      html {
        scroll-behavior: smooth;
      }

      /* Custom scrollbar (light) */
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: var(--color-primary);
        border-radius: 9999px;
      }

      /* Elevation helpers */
      .card-elevation {
        background: var(--color-card);
        border-radius: 24px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.02);
        border: 1px solid rgba(0,0,0,0.03);
        transition: box-shadow 0.2s ease, transform 0.15s ease;
      }
      .card-elevation:hover {
        box-shadow: 0 16px 48px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.02);
        transform: translateY(-2px);
      }

      .btn-primary {
        background: var(--color-cta);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 9999px;
        font-weight: 700;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
        cursor: pointer;
      }
      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(245, 158, 11, 0.35);
      }
      .btn-primary:active {
        transform: translateY(0);
      }
      .btn-primary:disabled {
        background: #CBD5E1;
        color: #94A3B8;
        box-shadow: none;
        cursor: not-allowed;
        transform: none;
      }

      .btn-secondary {
        background: transparent;
        color: var(--color-primary);
        border: 2px solid var(--color-primary);
        padding: 0.75rem 1.5rem;
        border-radius: 9999px;
        font-weight: 700;
        transition: all 0.2s ease;
        cursor: pointer;
      }
      .btn-secondary:hover {
        background: var(--color-primary);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(14, 165, 233, 0.25);
      }

      /* ==========================================================
         ADDITIONS BELOW — new utilities for the TripPreparation
         redesign only. Nothing above this line was changed.
         ========================================================== */

      /* Visible keyboard focus everywhere (a11y quality floor) */
      a:focus-visible,
      button:focus-visible,
      input:focus-visible,
      [tabindex]:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
        border-radius: 8px;
      }

      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in-up {
        animation: fadeInUp 0.45s ease both;
      }

      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .skeleton-shimmer {
        background: linear-gradient(90deg, var(--color-bg-secondary) 25%, #ffffff 50%, var(--color-bg-secondary) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 12px;
      }

      @keyframes dashFlow {
        to { stroke-dashoffset: -24; }
      }
      .route-path {
        stroke-dasharray: 5 7;
        animation: dashFlow 1.4s linear infinite;
      }

      @keyframes swapSpin {
        from { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(180deg) scale(1.15); }
        to { transform: rotate(180deg) scale(1); }
      }
      .swap-button-active {
        animation: swapSpin 0.4s ease;
      }

      @keyframes popIn {
        from { opacity: 0; transform: scale(0.92); }
        to { opacity: 1; transform: scale(1); }
      }
      .animate-pop-in {
        animation: popIn 0.25s ease both;
      }

      @media (prefers-reduced-motion: reduce) {
        .animate-fade-in-up,
        .skeleton-shimmer,
        .route-path,
        .swap-button-active,
        .animate-pop-in {
          animation: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
}
