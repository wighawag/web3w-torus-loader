declare module "index" {
    import type { Web3WModule, Web3WModuleLoader } from 'web3w';
    type Verifier = 'google' | 'facebook' | 'twitch' | 'reddit' | 'discord';
    export class TorusModuleLoader implements Web3WModuleLoader {
        readonly id: string;
        private jsURL;
        private jsURLIntegrity;
        private moduleConfig;
        constructor(config?: {
            forceFallbackUrl?: boolean;
            fallbackUrl?: string;
            chainId?: string;
            verifier?: Verifier;
            jsURL?: string;
            jsURLIntegrity?: string;
        });
        load(): Promise<Web3WModule>;
    }
}
//# sourceMappingURL=index.d.ts.map