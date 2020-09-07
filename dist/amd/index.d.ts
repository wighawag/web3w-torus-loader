declare module "index" {
    import type { Web3WModule, WindowWeb3Provider } from 'web3w';
    type Verifier = 'google' | 'facebook' | 'twitch' | 'reddit' | 'discord';
    type Config = {
        verifier?: Verifier;
        chainId?: string;
        fallbackUrl?: string;
    };
    export class TorusModule implements Web3WModule {
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
}
//# sourceMappingURL=index.d.ts.map