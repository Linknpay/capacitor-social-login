'use strict';

var core = require('@capacitor/core');

const SocialLogin = core.registerPlugin("SocialLogin", {
    web: () => Promise.resolve().then(function () { return web; }).then((m) => new m.SocialLoginWeb()),
});

class SocialLoginWeb extends core.WebPlugin {
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

var web = /*#__PURE__*/Object.freeze({
    __proto__: null,
    SocialLoginWeb: SocialLoginWeb
});

exports.SocialLogin = SocialLogin;
//# sourceMappingURL=plugin.cjs.js.map
