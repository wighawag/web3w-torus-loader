import type { Web3WModule, Web3WModuleLoader } from 'web3w';
declare type Verifier = 'google' | 'facebook' | 'twitch' | 'reddit' | 'discord';
export declare class TorusModuleLoader implements Web3WModuleLoader {
    readonly id: string;
    private static _jsURL;
    private static _jsURLIntegrity;
    private static _jsURLUsed;
    private moduleConfig;
    static setJsURL(jsURL: string, jsURLIntegrity?: string): void;
    constructor(config?: {
        forceFallbackUrl?: boolean;
        fallbackUrl?: string;
        chainId?: string;
        verifier?: Verifier;
    });
    load(): Promise<Web3WModule>;
}
export {};
//# sourceMappingURL=index.d.ts.map