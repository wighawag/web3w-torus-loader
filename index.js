/*
<script
  src="https://cdn.jsdelivr.net/npm/@toruslabs/torus-embed"
></script>
*/

function loadJS(url, integrity, crossorigin) {
  return new Promise(function (resolve, reject) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    if (integrity) {
      script.integrity = integrity;
    }
    if (crossorigin) {
      script.crossOrigin = crossorigin;
    }
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
  "1": {host: "mainnet", networkName: "Main Ethereum Network"},
  "3": {host: "ropsten", networkName: "Ropsten Test Network"},
  "4": {host: "rinkeby", networkName: "Rinkeby Test Network"},
  "5": {host: "goerli", networkName: "Goerli Test Network"},
  "42": {host: "kovan", networkName: "Kovan Test Network"},
  // "1337": {host: "localhost", networkName: "Ganache Test Network"},
  // "31337": {host: "localhost", networkName: "BuidlerEVM Test Network"},
  // '77': {host: 'sokol',
  // '99': {host: 'core',
  // '100': {host: 'xdai',
};

let Torus;

function TorusModule(conf) {
  conf = conf || {};
  const {forceFallbackUrl, fallbackUrl, chainId, jsURL, jsURLIntegrity} = conf;
  this.id = "torus";
  this.jsURL = jsURL;
  this.jsURLIntegrity = jsURLIntegrity;
  this.chainId = chainId;
  this.forceFallbackUrl = forceFallbackUrl;
  this.fallbackUrl = fallbackUrl;
}

TorusModule.prototype.setup = async function (config) {
  config = config || {};
  let {chainId, fallbackUrl} = config;
  chainId = chainId || this.chainId;
  fallbackUrl = fallbackUrl || this.fallbackUrl;

  const url =
    this.jsURL || "https://cdn.jsdelivr.net/npm/@toruslabs/torus-embed";
  const integrity = this.jsURLIntegrity;
  await loadJS(url, integrity, "anonymous");
  Torus = window.Torus;

  if (fallbackUrl && !chainId) {
    const response = await fetch(fallbackUrl, {
      headers: {
        "content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        id: Math.floor(Math.random() * 1000000),
        jsonrpc: "2.0",
        method: "eth_chainId",
        params: [],
      }),
      method: "POST",
    });
    const json = await response.json();
    chainId = parseInt(json.result.slice(2), 16);
  }

  let chainIdAsNumber;
  if (typeof chainId === "number") {
    chainIdAsNumber = chainId;
  } else {
    if (chainId.slice(0, 2) === "0x") {
      chainIdAsNumber = parseInt(chainId.slice(2), 16);
    } else {
      chainIdAsNumber = parseInt(chainId, 10);
    }
  }

  const knownNetwork = knownChainIds[chainId];

  let network;
  if (knownNetwork && !this.forceFallbackUrl) {
    network = {
      ...knownNetwork,
      chainId: chainIdAsNumber,
    };
  } else {
    network = {
      host: fallbackUrl,
      chainId: chainIdAsNumber,
    };
  }

  this.torusWrapper = new Torus();
  await this.torusWrapper.init({network, showTorusButton: false});
  this.torusWrapper.showTorusButton();
  try {
    const result = await this.torusWrapper.login(); // TODO optional ?
    console.log({torusLoginResult: result});
  } catch (e) {
    this.torusWrapper.hideTorusButton();
    if (
      e.message === "User cancelled login" ||
      e.message === "user closed popup"
    ) {
      throw new Error("USER_CANCELED");
    }
    throw e;
  }

  window.torusWrapper = this.torusWrapper;
  return {
    web3Provider: this.torusWrapper.provider,
    chainId,
  };
};

TorusModule.prototype.logout = async function () {
  this.torusWrapper.hideTorusButton();
  try {
    await this.torusWrapper.logout(); // TODO ? cleanUp();
  } catch (e) {}
};

TorusModule.prototype.isLoggedIn = async function () {
  let userInfo;
  try {
    userInfo = await this.torusWrapper.getUserInfo();
  } catch (e) {
    return false;
  }
  return !!userInfo;
};

TorusModule.prototype.showWallet = function () {
  // TODO for portis and other
  this.torusWrapper.showWallet();
};

TorusModule.prototype.showButton = function () {
  // TODO for portis and other
  this.torusWrapper.showTorusButton();
};

TorusModule.prototype.hideButton = function () {
  // TODO for portis and other
  this.torusWrapper.hideTorusButton();
};

TorusModule.prototype.initiateTopup = async function (provider, params) {
  await torus.initiateTopup(provider, params);
};

module.exports = TorusModule;
