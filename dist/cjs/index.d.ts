import type { Web3WModule, Web3WModuleLoader } from 'web3w';
declare type Verifier = 'google' | 'facebook' | 'twitch' | 'reddit' | 'discord';
export declare class TorusModuleLoader implements Web3WModuleLoader {
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
export {};
//# sourceMappingURL=index.d.ts.map