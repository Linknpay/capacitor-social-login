import { WebPlugin } from "@capacitor/core";
export class SocialLoginWeb extends WebPlugin {
    constructor() {
        super(...arguments);
        this.googleClientId = null;
        this.appleClientId = null;
        this.googleScriptLoaded = false;
        this.appleScriptLoaded = false;
        this.appleScriptUrl = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
        this.facebookAppId = null;
        this.facebookScriptLoaded = false;
    }
    async initialize(options) {
        var _a, _b, _c;
        if ((_a = options.google) === null || _a === void 0 ? void 0 : _a.webClientId) {
            this.googleClientId = options.google.webClientId;
            await this.loadGoogleScript();
        }
        if ((_b = options.apple) === null || _b === void 0 ? void 0 : _b.clientId) {
            this.appleClientId = options.apple.clientId;
            await this.loadAppleScript();
        }
        if ((_c = options.facebook) === null || _c === void 0 ? void 0 : _c.appId) {
            this.facebookAppId = options.facebook.appId;
            await this.loadFacebookScript();
            FB.init({
                appId: this.facebookAppId,
                version: "v17.0",
                xfbml: true,
                cookie: true,
            });
        }
        // Implement initialization for other providers if needed
    }
    async login(options) {
        if (options.provider === "google") {
            return this.loginWithGoogle(options.options);
        }
        else if (options.provider === "apple") {
            return this.loginWithApple(options.options);
        }
        else if (options.provider === "facebook") {
            return this.loginWithFacebook(options.options);
        }
        // Implement login for other providers
        throw new Error(`Login for ${options.provider} is not implemented on web`);
    }
    async logout(options) {
        switch (options.provider) {
            case "google":
                // Google doesn't have a specific logout method for web
                // We can revoke the token if we have it stored
                console.log("Google logout: Token should be revoked on the client side if stored");
                break;
            case "apple":
                // Apple doesn't provide a logout method for web
                console.log("Apple logout: Session should be managed on the client side");
                break;
            case "facebook":
                return new Promise((resolve) => {
                    FB.logout(() => resolve());
                });
            default:
                throw new Error(`Logout for ${options.provider} is not implemented`);
        }
    }
    async isLoggedIn(options) {
        switch (options.provider) {
            case "google":
                // For Google, we can check if there's a valid token
                // eslint-disable-next-line no-case-declarations
                const googleUser = await this.getGoogleUser();
                return { isLoggedIn: !!googleUser };
            case "apple":
                // Apple doesn't provide a method to check login status on web
                console.log("Apple login status should be managed on the client side");
                return { isLoggedIn: false };
            case "facebook":
                return new Promise((resolve) => {
                    FB.getLoginStatus((response) => {
                        resolve({ isLoggedIn: response.status === "connected" });
                    });
                });
            default:
                throw new Error(`isLoggedIn for ${options.provider} is not implemented`);
        }
    }
    async getAuthorizationCode(options) {
        switch (options.provider) {
            case "google":
                // For Google, we can use the id_token as the authorization code
                // eslint-disable-next-line no-case-declarations
                const googleUser = await this.getGoogleUser();
                if (googleUser === null || googleUser === void 0 ? void 0 : googleUser.credential) {
                    return { jwt: googleUser.credential };
                }
                throw new Error("No Google authorization code available");
            case "apple":
                // Apple authorization code should be obtained during login
                console.log("Apple authorization code should be stored during login");
                throw new Error("Apple authorization code not available");
            case "facebook":
                return new Promise((resolve, reject) => {
                    FB.getLoginStatus((response) => {
                        var _a;
                        if (response.status === "connected") {
                            resolve({ jwt: ((_a = response.authResponse) === null || _a === void 0 ? void 0 : _a.accessToken) || "" });
                        }
                        else {
                            reject(new Error("No Facebook authorization code available"));
                        }
                    });
                });
            default:
                throw new Error(`getAuthorizationCode for ${options.provider} is not implemented`);
        }
    }
    async refresh(options) {
        switch (options.provider) {
            case "google":
                // For Google, we can prompt for re-authentication
                await this.loginWithGoogle(options.options);
                break;
            case "apple":
                // Apple doesn't provide a refresh method for web
                console.log("Apple refresh not available on web");
                break;
            case "facebook":
                await this.loginWithFacebook(options.options);
                break;
            default:
                throw new Error(`Refresh for ${options.provider} is not implemented`);
        }
    }
    async loginWithGoogle(options) {
        if (!this.googleClientId) {
            throw new Error("Google Client ID not set. Call initialize() first.");
        }
        const scopes = options.scopes || ["email", "profile"];
        if (scopes.length > 0) {
            // If scopes are provided, directly use the traditional OAuth flow
            return this.fallbackToTraditionalOAuth(scopes);
        }
        return new Promise((resolve, reject) => {
            google.accounts.id.initialize({
                client_id: this.googleClientId,
                callback: (response) => {
                    console.log("google.accounts.id.initialize callback", response);
                    if (response.error) {
                        // we use any because type fail but we need to double check if that works
                        reject(response.error);
                    }
                    else {
                        const payload = this.parseJwt(response.credential);
                        const result = {
                            accessToken: null,
                            idToken: response.credential,
                            profile: {
                                email: payload.email || null,
                                familyName: payload.family_name || null,
                                givenName: payload.given_name || null,
                                id: payload.sub || null,
                                name: payload.name || null,
                                imageUrl: payload.picture || null,
                            },
                        };
                        resolve({ provider: "google", result });
                    }
                },
                auto_select: true,
            });
            google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    console.log("OneTap is not displayed or skipped");
                    // Fallback to traditional OAuth if One Tap is not available
                    this.fallbackToTraditionalOAuth(scopes).then(resolve).catch(reject);
                }
                else {
                    console.log("OneTap is displayed");
                }
            });
        });
    }
    parseJwt(token) {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(atob(base64)
            .split("")
            .map((c) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
            .join(""));
        return JSON.parse(jsonPayload);
    }
    async loadGoogleScript() {
        if (this.googleScriptLoaded)
            return;
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.onload = () => {
                this.googleScriptLoaded = true;
                resolve();
            };
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }
    async loginWithApple(options) {
        if (!this.appleClientId) {
            throw new Error("Apple Client ID not set. Call initialize() first.");
        }
        if (!this.appleScriptLoaded) {
            throw new Error("Apple Sign-In script not loaded.");
        }
        return new Promise((resolve, reject) => {
            var _a;
            AppleID.auth.init({
                clientId: this.appleClientId,
                scope: ((_a = options.scopes) === null || _a === void 0 ? void 0 : _a.join(" ")) || "name email",
                redirectURI: options.redirectUrl || window.location.href,
                state: options.state,
                nonce: options.nonce,
                usePopup: true,
            });
            AppleID.auth
                .signIn()
                .then((res) => {
                var _a, _b, _c, _d, _e, _f, _g;
                const result = {
                    profile: {
                        user: ((_b = (_a = res.user) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.firstName)
                            ? `${res.user.name.firstName} ${res.user.name.lastName}`
                            : "",
                        email: ((_c = res.user) === null || _c === void 0 ? void 0 : _c.email) || null,
                        givenName: ((_e = (_d = res.user) === null || _d === void 0 ? void 0 : _d.name) === null || _e === void 0 ? void 0 : _e.firstName) || null,
                        familyName: ((_g = (_f = res.user) === null || _f === void 0 ? void 0 : _f.name) === null || _g === void 0 ? void 0 : _g.lastName) || null,
                    },
                    accessToken: {
                        token: res.authorization.code, // TODO: to fix and find the correct token
                    },
                    idToken: res.authorization.id_token || null,
                };
                resolve({ provider: "apple", result });
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    async loadAppleScript() {
        if (this.appleScriptLoaded)
            return;
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = this.appleScriptUrl;
            script.async = true;
            script.onload = () => {
                this.appleScriptLoaded = true;
                resolve();
            };
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }
    async getGoogleUser() {
        return new Promise((resolve) => {
            google.accounts.id.initialize({
                client_id: this.googleClientId,
                callback: (response) => {
                    resolve(response);
                },
            });
            google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    resolve(null);
                }
            });
        });
    }
    async loadFacebookScript() {
        if (this.facebookScriptLoaded)
            return;
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://connect.facebook.net/en_US/sdk.js";
            script.async = true;
            script.defer = true;
            script.onload = () => {
                this.facebookScriptLoaded = true;
                resolve();
            };
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }
    async loginWithFacebook(options) {
        if (!this.facebookAppId) {
            throw new Error("Facebook App ID not set. Call initialize() first.");
        }
        return new Promise((resolve, reject) => {
            FB.login((response) => {
                if (response.status === "connected") {
                    FB.api("/me", { fields: "id,name,email,picture" }, (userInfo) => {
                        var _a, _b;
                        const result = {
                            accessToken: {
                                token: response.authResponse.accessToken,
                                userId: response.authResponse.userID,
                            },
                            profile: {
                                userID: userInfo.id,
                                name: userInfo.name,
                                email: userInfo.email || null,
                                imageURL: ((_b = (_a = userInfo.picture) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.url) || null,
                                friendIDs: [],
                                birthday: null,
                                ageRange: null,
                                gender: null,
                                location: null,
                                hometown: null,
                                profileURL: null,
                            },
                            idToken: null,
                        };
                        resolve({ provider: "facebook", result });
                    });
                }
                else {
                    reject(new Error("Facebook login failed"));
                }
            }, { scope: options.permissions.join(",") });
        });
    }
    async fallbackToTraditionalOAuth(scopes) {
        return new Promise((resolve, reject) => {
            const uniqueScopes = [...new Set([...scopes, "openid"])];
            const auth2 = google.accounts.oauth2.initTokenClient({
                client_id: this.googleClientId,
                scope: uniqueScopes.join(" "),
                callback: async (response) => {
                    if (response.error) {
                        reject(response.error);
                    }
                    else {
                        // Get ID token from userinfo endpoint
                        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                            headers: {
                                Authorization: `Bearer ${response.access_token}`,
                            },
                        });
                        const userData = await userInfoResponse.json();
                        const result = {
                            accessToken: {
                                token: response.access_token,
                            },
                            idToken: userData.sub, // Using sub as ID token
                            profile: {
                                email: userData.email || null,
                                familyName: userData.family_name || null,
                                givenName: userData.given_name || null,
                                id: userData.sub || null,
                                name: userData.name || null,
                                imageUrl: userData.picture || null,
                            },
                        };
                        resolve({ provider: "google", result });
                    }
                },
            });
            auth2.requestAccessToken();
        });
    }
}
//# sourceMappingURL=web.js.map