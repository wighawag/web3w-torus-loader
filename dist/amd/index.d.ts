declare module "index" {
    import type { Web3WModule, Web3WModuleLoader } from 'web3w';
    type Verifier = 'google' | 'facebook' | 'twitch' | 'reddit' | 'discord';
    type Config = {
        verifier?: Verifier;
        chainId?: string;
        nodeUrl?: string;
        enableLogging?: boolean;
        buildEnv?: 'production' | 'development' | 'staging' | 'testing';
        forceNodeUrl?: boolean;
    };
    export class TorusModuleLoader implements Web3WModuleLoader {
        readonly id: string;
        private static _jsURL;
        private static _jsURLIntegrity;
        private static _jsURLUsed;
        private moduleConfig;
        static setJsURL(jsURL: string, jsURLIntegrity?: string): void;
        constructor(config?: Config);
        load(): Promise<Web3WModule>;
    }
}
//# sourceMappingURL=index.d.ts.map