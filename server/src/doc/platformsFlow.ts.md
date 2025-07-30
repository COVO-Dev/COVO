# Social Media OAuth Authentication Flow README

## Overview

This project integrates OAuth authentication for Facebook, Twitter, Instagram, and YouTube to collect user metric data such as usernames, locations, followers, and engagement statistics from respective social media platforms.

---

## OAuth Flow Summary

The authentication flow enables users to securely connect their social media accounts to your application, granting permissions to access their public and private data as required.

Each platform follows the standard OAuth 2.0 (or OAuth 1.0a for Twitter) flow:

1. **User initiates authentication**  
   A logged-in user triggers the OAuth authorization URL for the specific platform.

2. **Redirect to Social Platform's Login/Consent Page**  
   User logs into the social media platform (if not already logged in) and grants consent.

3. **Platform redirects back to your callback URL**  
   OAuth provider sends an authorization code or token back to your application.

4. **Application exchanges code/token for access token**  
   Your backend processes the callback, retrieves the access token, and stores it securely.

5. **Access token used for API calls**  
   You use the access token to query platform APIs for metrics, usernames, locations, and other relevant data.

---

## Routes

### Facebook

- **GET** `/oauth/authorize/facebook`  
  Redirects the user to Facebook's OAuth login page.  
  *Requires user to be authenticated in your app (`authMiddleware`).*

- **GET** `/oauth/facebook/callback`  
  Handles Facebook OAuth callback and processes the authorization code/token.

---

### Twitter

- **GET** `/oauth/authorize/twitter`  
  Initiates Twitter OAuth login and obtains request token/URL.  
  *Requires user authentication (`authMiddleware`).*

- **GET** `/auth/twitter/callback`  
  Handles Twitter OAuth callback and exchanges tokens.

---

### Instagram

- **GET** `/auth/authorize/instagram`  
  Starts Instagram OAuth login flow.  
  *Requires user authentication (`authMiddleware`).*

- **GET** `/oauth/instagram/callback`  
  Handles Instagram OAuth callback.

---

### YouTube

- **GET** `/oauth/authorize/youtube`  
  Starts YouTube OAuth login.  
  *Requires user authentication (`authMiddleware`).*

- **GET** `/oauth/callback`  
  Handles YouTube OAuth callback.

---

## Notes

- **Auth Middleware**  
  The authorization initiation routes (`/authorize/*`) are protected by your application's authentication middleware to ensure only authenticated users can connect their social accounts.

- **Callback Routes**  
  The callback endpoints are publicly accessible (no `authMiddleware`) since these are called by the social platforms after user authorization.

- **Redirection Routes**  
  Some platforms’ redirection routes might differ depending on your front-end implementation and OAuth configuration. For example, YouTube’s `/oauth/callback` is generic and might be adjusted.
  *Note: The redirection route might be different since there was no redirection page when this was implemented.*

- **Token Storage and Security**  
  Access tokens received after successful OAuth flows should be securely stored and managed to allow authorized API calls without compromising user security.


---

## How to Use

1. User logs into your application.
2. User clicks a button to connect a social media account.
3. Your frontend calls the respective `/oauth/authorize/{platform}` route.
4. User is redirected to the social platform for login and consent.
5. After approval, the social platform redirects back to your `/oauth/{platform}/callback` route.
6. Your backend processes the callback, retrieves access tokens, and stores the credentials.
7. Your app can now use these tokens to fetch influencer data from the respective platforms.

---

If you need assistance with adding more social platforms or handling token refresh, feel free to ask!
