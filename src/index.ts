import type {Web3WModule, WindowWeb3Provider} from 'web3w';
import {logs} from 'named-logs';
const console = logs('web3w-torus:index');

type Verifier = 'google' | 'facebook' | 'twitch' | 'reddit' | 'discord';
type Config = {
  verifier?: Verifier;
  chainId?: string;
  fallbackUrl?: string;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TorusWrapper = any; // TODO ?

let Torus;

function loadJS(url: string, integrity: string | undefined, crossorigin: string) {
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

export class TorusModule implements Web3WModule {
  public readonly id: string = 'torus';
  private torusWrapper: TorusWrapper;
  private chainId: string | undefined;
  private fallbackUrl: string | undefined;
  private jsURL: string | undefined;
  private jsURLIntegrity: string | undefined;
  private forceFallbackUrl: boolean | undefined;
  private verifier: Verifier | undefined;

  constructor(conf: {
    forceFallbackUrl?: boolean;
    fallbackUrl?: string;
    chainId?: string;
    jsURL?: string;
    jsURLIntegrity?: string;
    verifier?: Verifier;
  }) {
    conf = conf || {};
    const {forceFallbackUrl, fallbackUrl, chainId, jsURL, jsURLIntegrity, verifier} = conf;
    this.id = 'torus';
    this.jsURL = jsURL;
    this.jsURLIntegrity = jsURLIntegrity;
    this.chainId = chainId;
    this.forceFallbackUrl = forceFallbackUrl;
    this.fallbackUrl = fallbackUrl;
    this.verifier = verifier;
  }

  async setup(config?: Config): Promise<{chainId: string; web3Provider: WindowWeb3Provider}> {
    config = config || {};
    let {chainId, fallbackUrl, verifier} = config;
    chainId = chainId || this.chainId;
    fallbackUrl = fallbackUrl || this.fallbackUrl;
    verifier = verifier || this.verifier;

    const url = this.jsURL || 'https://cdn.jsdelivr.net/npm/@toruslabs/torus-embed';
    const integrity = this.jsURLIntegrity;
    await loadJS(url, integrity, 'anonymous');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Torus = (window as any).Torus;

    if (fallbackUrl && !chainId) {
      const response = await fetch(fallbackUrl, {
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
    if (knownNetwork && !this.forceFallbackUrl) {
      network = {
        ...knownNetwork,
        chainId: parseInt(chainId),
      };
    } else {
      network = {
        host: fallbackUrl,
        chainId: parseInt(chainId),
      };
    }

    this.torusWrapper = new Torus();
    await this.torusWrapper.init({network, showTorusButton: false});
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).torusWrapper = this.torusWrapper;
    return {
      web3Provider: this.torusWrapper.provider,
      chainId,
    };
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
