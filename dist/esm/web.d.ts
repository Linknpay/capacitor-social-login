import { WebPlugin } from "@capacitor/core";
import type { SocialLoginPlugin, InitializeOptions, LoginOptions, LoginResult, AuthorizationCode } from "./definitions";
export declare class SocialLoginWeb extends WebPlugin implements SocialLoginPlugin {
    getAuthorizationCode(): Promise<AuthorizationCode>;
    echo(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
    initialize(options: InitializeOptions): Promise<void>;
    login(options: LoginOptions): Promise<LoginResult>;
    logout(options: any): Promise<void>;
    refresh(options: LoginOptions): Promise<void>;
    isLoggedIn(options: any): Promise<{
        isLoggedIn: boolean;
    }>;
}
