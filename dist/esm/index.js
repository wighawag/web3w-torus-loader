var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { logs } from 'named-logs';
const console = logs('web3w-torus:index');
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
        const { forceNodeUrl, nodeUrl, chainId, verifier } = conf;
        this.chainId = chainId;
        this.forceNodeUrl = forceNodeUrl;
        this.nodeUrl = nodeUrl;
        this.verifier = verifier;
    }
    setup(config) {
        return __awaiter(this, void 0, void 0, function* () {
            config = config || {};
            let { chainId, nodeUrl, verifier } = config;
            chainId = chainId || this.chainId;
            nodeUrl = nodeUrl || this.nodeUrl;
            verifier = verifier || this.verifier;
            if (nodeUrl && !chainId) {
                const response = yield fetch(nodeUrl, {
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
            if (knownNetwork && !this.forceNodeUrl) {
                network = Object.assign(Object.assign({}, knownNetwork), { chainId: parseInt(chainId) });
            }
            else {
                network = {
                    host: nodeUrl,
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
            this.torusWrapper.hideTorusButton();
            // TODO remove
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            window.torusWrapper = this.torusWrapper;
            return {
                web3Provider: this.torusWrapper.provider,
                chainId,
            };
        });
    }
    disconnect() {
        this.torusWrapper.hideTorusButton();
        this.torusWrapper = undefined;
        // TODO remove
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.torusWrapper = undefined;
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
export class TorusModuleLoader {
    constructor(config) {
        const verifier = config && config.verifier;
        if (verifier) {
            this.id = 'torus-' + verifier;
        }
        else {
            this.id = 'torus';
        }
        this.moduleConfig = config;
    }
    static setJsURL(jsURL, jsURLIntegrity) {
        if (TorusModuleLoader._jsURLUsed) {
            throw new Error(`cannot change js url once used`);
        }
        TorusModuleLoader._jsURL = jsURL;
        TorusModuleLoader._jsURLIntegrity = jsURLIntegrity;
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Torus) {
                const url = TorusModuleLoader._jsURL;
                const integrity = TorusModuleLoader._jsURLIntegrity;
                TorusModuleLoader._jsURLUsed = true;
                try {
                    yield loadJS(url, integrity, 'anonymous');
                }
                catch (e) {
                    TorusModuleLoader._jsURLUsed = false;
                    throw e;
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                Torus = window.Torus;
            }
            return new TorusModule(this.id, this.moduleConfig);
        });
    }
}
TorusModuleLoader._jsURL = 'https://cdn.jsdelivr.net/npm/@toruslabs/torus-embed';
TorusModuleLoader._jsURLUsed = false;
//# sourceMappingURL=index.js.map