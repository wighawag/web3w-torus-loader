declare module "index" {
    import type { Web3WModule, Web3WModuleLoader } from 'web3w';
    type Verifier = 'google' | 'facebook' | 'twitch' | 'reddit' | 'discord';
    export class TorusModuleLoader implements Web3WModuleLoader {
        readonly id: string;
        private static _jsURL;
        private static _jsURLIntegrity;
        private static _jsURLUsed;
        private moduleConfig;
        static setJsURL(jsURL: string, jsURLIntegrity?: string): void;
        constructor(config?: {
            forceNodeUrl?: boolean;
            nodeUrl?: string;
            chainId?: string;
            verifier?: Verifier;
        });
        load(): Promise<Web3WModule>;
    }
}
//# sourceMappingURL=index.d.ts.map