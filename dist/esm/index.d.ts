import type { Web3WModule, WindowWeb3Provider } from 'web3w';
declare type Verifier = 'google' | 'facebook' | 'twitch' | 'reddit' | 'discord';
declare type Config = {
    verifier?: Verifier;
    chainId?: string;
    fallbackUrl?: string;
};
export declare class TorusModule implements Web3WModule {
    readonly id: string;
    private torusWrapper;
    private chainId;
    private fallbackUrl;
    private jsURL;
    private jsURLIntegrity;
    private forceFallbackUrl;
    private verifier;
    constructor(conf: {
        forceFallbackUrl?: boolean;
        fallbackUrl?: string;
        chainId?: string;
        jsURL?: string;
        jsURLIntegrity?: string;
        verifier?: Verifier;
    });
    setup(config?: Config): Promise<{
        chainId: string;
        web3Provider: WindowWeb3Provider;
    }>;
    logout(): Promise<void>;
    isLoggedIn(): Promise<boolean>;
    showWallet(): void;
    showButton(): void;
    hideButton(): void;
    initiateTopup(provider: string, params: unknown): Promise<void>;
}
export {};
//# sourceMappingURL=index.d.ts.map