import { WebPlugin } from "@capacitor/core";
export class SocialLoginWeb extends WebPlugin {
    getAuthorizationCode() {
        console.log("getCurrentUser");
        return null;
    }
    async echo(options) {
        console.log("ECHO", options);
        return options;
    }
    async initialize(options) {
        console.log("INITIALIZE", options);
    }
    async login(options) {
        console.log("LOGIN", options);
        return null;
    }
    async logout(options) {
        console.log("LOGOUT", options);
    }
    async refresh(options) {
        console.log("REFRESH", options);
    }
    async isLoggedIn(options) {
        console.log("isLoggedIn", options);
        return { isLoggedIn: false };
    }
}
//# sourceMappingURL=web.js.map