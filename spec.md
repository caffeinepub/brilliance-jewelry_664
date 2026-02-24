# Specification

## Summary
**Goal:** Replace the site logo assets with the new LOBODA Jewelry brand identity (gold swan emblem + wordmark) and update the Header and Footer components to display the new logos.

**Planned changes:**
- Save the new full vertical LOBODA Jewelry logo (gold swan emblem above "LOBODA JEWELRY" wordmark, transparent background) as `loboda-logo.png` under `frontend/public/assets/generated/`
- Save a compact version of the logo (smaller stacked swan + wordmark, transparent background) as `loboda-logo-icon.png` under `frontend/public/assets/generated/`
- Update the Header component to display the new full vertical logo, switching to the compact icon variant on mobile/small screens
- Update the Footer component to display the new full vertical logo

**User-visible outcome:** The site header and footer show the updated LOBODA Jewelry gold swan logo on all screen sizes, with no transparency artifacts on any background.
