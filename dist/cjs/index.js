"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TorusModuleLoader = void 0;
const named_logs_1 = require("named-logs");
const console = named_logs_1.logs('web3w-torus:index');
let Torus;
function loadJS(url, integrity, crossorigin) {
    return new Promise(function (resolve, reject) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        if (integrity) {
            script.integrity = integrity;
        }
        if (crossorigin) {
            script.crossOrigin = crossorigin;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        script.onload = script.onreadystatechange = function () {
            resolve();
        };
        script.onerror = function () {
            reject();
        };
        document.head.appendChild(script);
    });
}
const knownChainIds = {
    '1': { host: 'mainnet', networkName: 'Main Ethereum Network' },
    '3': { host: 'ropsten', networkName: 'Ropsten Test Network' },
    '4': { host: 'rinkeby', networkName: 'Rinkeby Test Network' },
    '5': { host: 'goerli', networkName: 'Goerli Test Network' },
    '42': { host: 'kovan', networkName: 'Kovan Test Network' },
};
class TorusModule {
    constructor(id, conf) {
        this.id = id;
        conf = conf || {};
        const { forceFallbackUrl, fallbackUrl, chainId, verifier } = conf;
        this.chainId = chainId;
        this.forceFallbackUrl = forceFallbackUrl;
        this.fallbackUrl = fallbackUrl;
        this.verifier = verifier;
    }
    setup(config) {
        return __awaiter(this, void 0, void 0, function* () {
            config = config || {};
            let { chainId, fallbackUrl, verifier } = config;
            chainId = chainId || this.chainId;
            fallbackUrl = fallbackUrl || this.fallbackUrl;
            verifier = verifier || this.verifier;
            if (fallbackUrl && !chainId) {
                const response = yield fetch(fallbackUrl, {
                    headers: {
                        'content-type': 'application/json; charset=UTF-8',
                    },
                    body: JSON.stringify({
                        id: Math.floor(Math.random() * 1000000),
                        jsonrpc: '2.0',
                        method: 'eth_chainId',
                        params: [],
                    }),
                    method: 'POST',
                });
                const json = yield response.json();
                chainId = parseInt(json.result.slice(2), 16).toString();
            }
            if (!chainId) {
                throw new Error(`chainId missing`);
            }
            const knownNetwork = knownChainIds[chainId];
            let network;
            if (knownNetwork && !this.forceFallbackUrl) {
                network = Object.assign(Object.assign({}, knownNetwork), { chainId: parseInt(chainId) });
            }
            else {
                network = {
                    host: fallbackUrl,
                    chainId: parseInt(chainId),
                };
            }
            this.torusWrapper = new Torus();
            yield this.torusWrapper.init({ network, showTorusButton: false });
            this.torusWrapper.showTorusButton();
            try {
                const result = yield this.torusWrapper.login(verifier ? { verifier } : undefined);
                console.log({ torusLoginResult: result });
            }
            catch (e) {
                this.torusWrapper.hideTorusButton();
                if (e.message === 'User cancelled login' || e.message === 'user closed popup') {
                    throw new Error('USER_CANCELED');
                }
                throw e;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            window.torusWrapper = this.torusWrapper;
            return {
                web3Provider: this.torusWrapper.provider,
                chainId,
            };
        });
    }
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            this.torusWrapper.hideTorusButton();
            try {
                yield this.torusWrapper.logout(); // TODO ? cleanUp();
            }
            catch (e) { }
        });
    }
    isLoggedIn() {
        return __awaiter(this, void 0, void 0, function* () {
            let userInfo;
            try {
                userInfo = yield this.torusWrapper.getUserInfo();
            }
            catch (e) {
                return false;
            }
            return !!userInfo;
        });
    }
    showWallet() {
        // TODO for portis and other
        this.torusWrapper.showWallet();
    }
    showButton() {
        // TODO for portis and other
        this.torusWrapper.showTorusButton();
    }
    hideButton() {
        // TODO for portis and other
        this.torusWrapper.hideTorusButton();
    }
    initiateTopup(provider, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.torusWrapper.initiateTopup(provider, params);
        });
    }
}
class TorusModuleLoader {
    constructor(config) {
        const verifier = config && config.verifier;
        if (verifier) {
            this.id = 'torus-' + verifier;
        }
        else {
            this.id = 'torus';
        }
        this.jsURL = (config && config.jsURL) || 'https://cdn.jsdelivr.net/npm/@toruslabs/torus-embed';
        this.jsURLIntegrity = config && config.jsURLIntegrity;
        this.moduleConfig = config;
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Torus) {
                const url = this.jsURL;
                const integrity = this.jsURLIntegrity;
                yield loadJS(url, integrity, 'anonymous');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                Torus = window.Torus;
            }
            return new TorusModule(this.id, this.moduleConfig);
        });
    }
}
exports.TorusModuleLoader = TorusModuleLoader;
