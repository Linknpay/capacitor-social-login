import { WebPlugin } from "@capacitor/core";
import type { SocialLoginPlugin, InitializeOptions, LoginOptions, LoginResult, AuthorizationCode, isLoggedInOptions, AuthorizationCodeOptions } from "./definitions";
export declare class SocialLoginWeb extends WebPlugin implements SocialLoginPlugin {
    private googleClientId;
    private appleClientId;
    private googleScriptLoaded;
    private appleScriptLoaded;
    private appleScriptUrl;
    private facebookAppId;
    private facebookScriptLoaded;
    initialize(options: InitializeOptions): Promise<void>;
    login(options: LoginOptions): Promise<LoginResult>;
    logout(options: {
        provider: "apple" | "google" | "facebook";
    }): Promise<void>;
    isLoggedIn(options: isLoggedInOptions): Promise<{
        isLoggedIn: boolean;
    }>;
    getAuthorizationCode(options: AuthorizationCodeOptions): Promise<AuthorizationCode>;
    refresh(options: LoginOptions): Promise<void>;
    private loginWithGoogle;
    private parseJwt;
    private loadGoogleScript;
    private loginWithApple;
    private loadAppleScript;
    private getGoogleUser;
    private loadFacebookScript;
    private loginWithFacebook;
    private fallbackToTraditionalOAuth;
}
