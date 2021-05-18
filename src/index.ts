import type {Web3WModule, WindowWeb3Provider, Web3WModuleLoader} from 'web3w';
import {logs} from 'named-logs';
const console = logs('web3w-torus:index');

type Verifier = 'google' | 'facebook' | 'twitch' | 'reddit' | 'discord';
type Config = {
  verifier?: Verifier;
  chainId?: string;
  nodeUrl?: string;
  enableLogging?: boolean;
  buildEnv?: 'production' | 'development' | 'staging' | 'testing';
  forceNodeUrl?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TorusWrapper = any; // TODO ?
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Torus: any;

function loadJS(url: string, integrity: string | undefined, crossorigin: string) {
  return new Promise<void>(function (resolve, reject) {
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
    script.onload = (script as any).onreadystatechange = function () {
      resolve();
    };
    script.onerror = function () {
      reject();
    };
    document.head.appendChild(script);
  });
}

const knownChainIds: {[chainId: string]: {host: string; networkName: string}} = {
  '1': {host: 'mainnet', networkName: 'Main Ethereum Network'},
  '3': {host: 'ropsten', networkName: 'Ropsten Test Network'},
  '4': {host: 'rinkeby', networkName: 'Rinkeby Test Network'},
  '5': {host: 'goerli', networkName: 'Goerli Test Network'},
  '42': {host: 'kovan', networkName: 'Kovan Test Network'},
  // "1337": {host: "localhost", networkName: "Ganache Test Network"},
  // "31337": {host: "localhost", networkName: "BuidlerEVM Test Network"},
  // '77': {host: 'sokol',
  // '99': {host: 'core',
  // '100': {host: 'xdai',
};

class TorusModule implements Web3WModule {
  public readonly id: string;

  private torusWrapper: TorusWrapper;
  private chainId: string | undefined;
  private nodeUrl: string | undefined;
  private forceNodeUrl: boolean | undefined;
  private verifier: Verifier | undefined;
  private config: Config;

  constructor(id: string, conf?: Config) {
    this.id = id;
    conf = conf || {};
    this.config = conf;
    const {forceNodeUrl, nodeUrl, chainId, verifier} = conf;
    this.chainId = chainId;
    this.forceNodeUrl = forceNodeUrl;
    this.nodeUrl = nodeUrl;
    this.verifier = verifier;
  }

  async setup(config?: Config): Promise<{chainId: string; web3Provider: WindowWeb3Provider}> {
    config = Object.assign({}, this.config);
    config = Object.assign(config, config || {});
    let {chainId, nodeUrl, verifier} = config;
    chainId = chainId || this.chainId;
    nodeUrl = nodeUrl || this.nodeUrl;
    verifier = verifier || this.verifier;

    if (nodeUrl && !chainId) {
      const response = await fetch(nodeUrl, {
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
      const json = await response.json();
      chainId = parseInt(json.result.slice(2), 16).toString();
    }

    if (!chainId) {
      throw new Error(`chainId missing`);
    }

    const knownNetwork = knownChainIds[chainId];

    let network;
    if (knownNetwork && !this.forceNodeUrl) {
      network = {
        ...knownNetwork,
        chainId: parseInt(chainId),
      };
    } else {
      network = {
        host: nodeUrl,
        chainId: parseInt(chainId),
      };
    }

    this.torusWrapper = new Torus();
    await this.torusWrapper.init({network, showTorusButton: false, ...config});
    this.torusWrapper.showTorusButton();
    try {
      const result = await this.torusWrapper.login(verifier ? {verifier} : undefined);
      console.log({torusLoginResult: result});
    } catch (e) {
      this.torusWrapper.hideTorusButton();
      if (e.message === 'User cancelled login' || e.message === 'user closed popup') {
        throw new Error('USER_CANCELED');
      }
      throw e;
    }
    this.torusWrapper.hideTorusButton();

    // TODO remove
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).torusWrapper = this.torusWrapper;

    return {
      web3Provider: this.torusWrapper.provider,
      chainId,
    };
  }

  disconnect(): void {
    this.torusWrapper.hideTorusButton();
    this.torusWrapper = undefined;

    // TODO remove
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).torusWrapper = undefined;
  }

  async logout(): Promise<void> {
    this.torusWrapper.hideTorusButton();
    try {
      await this.torusWrapper.logout(); // TODO ? cleanUp();
    } catch (e) {}
  }

  async isLoggedIn(): Promise<boolean> {
    let userInfo;
    try {
      userInfo = await this.torusWrapper.getUserInfo();
    } catch (e) {
      return false;
    }
    return !!userInfo;
  }

  showWallet(): void {
    // TODO for portis and other
    this.torusWrapper.showWallet();
  }

  showButton(): void {
    // TODO for portis and other
    this.torusWrapper.showTorusButton();
  }

  hideButton(): void {
    // TODO for portis and other
    this.torusWrapper.hideTorusButton();
  }

  async initiateTopup(provider: string, params: unknown): Promise<void> {
    await this.torusWrapper.initiateTopup(provider, params);
  }
}

export class TorusModuleLoader implements Web3WModuleLoader {
  public readonly id: string;

  private static _jsURL = 'https://cdn.jsdelivr.net/npm/@toruslabs/torus-embed@1.8.5';
  private static _jsURLIntegrity: string | undefined;
  private static _jsURLUsed = false;

  private moduleConfig: Config | undefined;

  static setJsURL(jsURL: string, jsURLIntegrity?: string): void {
    if (TorusModuleLoader._jsURLUsed) {
      throw new Error(`cannot change js url once used`);
    }
    TorusModuleLoader._jsURL = jsURL;
    TorusModuleLoader._jsURLIntegrity = jsURLIntegrity;
  }

  constructor(config?: Config) {
    const verifier = config && config.verifier;
    if (verifier) {
      this.id = 'torus-' + verifier;
    } else {
      this.id = 'torus';
    }
    this.moduleConfig = config;
  }

  async load(): Promise<Web3WModule> {
    if (!Torus) {
      const url = TorusModuleLoader._jsURL;
      const integrity = TorusModuleLoader._jsURLIntegrity;
      TorusModuleLoader._jsURLUsed = true;
      try {
        await loadJS(url, integrity, 'anonymous');
      } catch (e) {
        TorusModuleLoader._jsURLUsed = false;
        throw e;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Torus = (window as any).Torus;
    }
    return new TorusModule(this.id, this.moduleConfig);
  }
}
