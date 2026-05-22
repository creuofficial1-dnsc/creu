// Mobile navigation toggle logic
document.addEventListener('DOMContentLoaded', function () {
        const menuToggle = document.getElementById('menu-toggle');
        const mobileNav = document.getElementById('mobile-nav');
        const closeMobileNav = document.getElementById('close-mobile-nav');
        const overlay = document.getElementById('mobile-nav-overlay');

        function openNav() {
                mobileNav.classList.remove('opacity-0', 'pointer-events-none');
                mobileNav.classList.add('opacity-100');
        }
        function closeNav() {
                mobileNav.classList.add('opacity-0', 'pointer-events-none');
                mobileNav.classList.remove('opacity-100');
        }
        if (menuToggle) menuToggle.addEventListener('click', openNav);
        if (closeMobileNav) closeMobileNav.addEventListener('click', closeNav);
        if (overlay) overlay.addEventListener('click', closeNav);
});

        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "tertiary": "#5b5c59",
                      "on-primary-fixed": "#3a0b00",
                      "on-surface-variant": "#5c4037",
                      "secondary-fixed": "#d5e3fd",
                      "on-background": "#111c2d",
                      "surface-tint": "#ad3300",
                      "outline-variant": "#e6beb2",
                      "on-tertiary-container": "#fdfcf8",
                      "inverse-primary": "#ffb59e",
                      "tertiary-fixed": "#e3e2df",
                      "surface-container-high": "#dee8ff",
                      "on-primary-container": "#fffbff",
                      "outline": "#916f65",
                      "surface": "#f9f9ff",
                      "background": "#f9f9ff",
                      "surface-container": "#e7eeff",
                      "on-secondary": "#ffffff",
                      "on-tertiary-fixed-variant": "#464744",
                      "tertiary-fixed-dim": "#c7c7c3",
                      "on-error-container": "#93000a",
                      "on-tertiary": "#ffffff",
                      "on-primary": "#ffffff",
                      "secondary-container": "#d5e3fd",
                      "surface-dim": "#cfdaf2",
                      "secondary": "#515f74",
                      "inverse-surface": "#263143",
                      "secondary-fixed-dim": "#b9c7e0",
                      "on-secondary-container": "#57657b",
                      "error": "#ba1a1a",
                      "inverse-on-surface": "#ecf1ff",
                      "surface-bright": "#f9f9ff",
                      "surface-variant": "#d8e3fb",
                      "on-secondary-fixed": "#0d1c2f",
                      "on-primary-fixed-variant": "#842500",
                      "surface-container-lowest": "#ffffff",
                      "on-tertiary-fixed": "#1b1c1a",
                      "on-surface": "#111c2d",
                      "tertiary-container": "#747572",
                      "primary-fixed-dim": "#ffb59e",
                      "primary-fixed": "#ffdbd0",
                      "surface-container-low": "#f0f3ff",
                      "on-secondary-fixed-variant": "#3a485c",
                      "on-error": "#ffffff",
                      "error-container": "#ffdad6",
                      "primary-container": "#d34000",
                      "primary": "#a93100",
                      "surface-container-highest": "#d8e3fb"
              },
              "borderRadius": {
                      "DEFAULT": "0.25rem",
                      "lg": "0.5rem",
                      "xl": "0.75rem",
                      "full": "9999px"
              },
              "spacing": {
                      "sm": "16px",
                      "md": "24px",
                      "xs": "8px",
                      "margin-mobile": "20px",
                      "margin-desktop": "80px",
                      "xl": "64px",
                      "lg": "40px",
                      "gutter": "16px",
                      "base": "4px"
              },
              "fontFamily": {
                      "headline-lg-mobile": ["Noto Serif"],
                      "headline-md": ["Noto Serif"],
                      "headline-lg": ["Noto Serif"],
                      "label-sm": ["Plus Jakarta Sans"],
                      "display-lg": ["Noto Serif"],
                      "body-md": ["Plus Jakarta Sans"],
                      "body-lg": ["Plus Jakarta Sans"],
                      "label-lg": ["Plus Jakarta Sans"]
              },
              "fontSize": {
                      "headline-lg-mobile": ["28px", {"lineHeight": "36px", "fontWeight": "600"}],
                      "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "500"}],
                      "headline-lg": ["32px", {"lineHeight": "40px", "fontWeight": "600"}],
                      "label-sm": ["12px", {"lineHeight": "16px", "fontWeight": "500"}],
                      "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                      "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                      "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
                      "label-lg": ["14px", {"lineHeight": "20px", "letterSpacing": "0.05em", "fontWeight": "600"}]
              }
            },
          },
        }
    

        window.addEventListener('scroll', () => {
            const header = document.querySelector('header');
            if (header) {
                if (window.scrollY > 50) {
                    header.classList.add('shadow-md');
                } else {
                    header.classList.remove('shadow-md');
                }
            }
        });


