var __awaiter=this&&this.__awaiter||function(t,e,r,o){return new(r||(r=Promise))(function(i,s){function n(t){try{u(o.next(t))}catch(t){s(t)}}function a(t){try{u(o.throw(t))}catch(t){s(t)}}function u(t){var e;t.done?i(t.value):(e=t.value,e instanceof r?e:new r(function(t){t(e)})).then(n,a)}u((o=o.apply(t,e||[])).next())})};define("index",["require","exports","named-logs"],function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.TorusModuleLoader=void 0;const o=r.logs("web3w-torus:index");let i;const s={1:{host:"mainnet",networkName:"Main Ethereum Network"},3:{host:"ropsten",networkName:"Ropsten Test Network"},4:{host:"rinkeby",networkName:"Rinkeby Test Network"},5:{host:"goerli",networkName:"Goerli Test Network"},42:{host:"kovan",networkName:"Kovan Test Network"}};class n{constructor(t,e){this.id=t,e=e||{};const{forceNodeUrl:r,nodeUrl:o,chainId:i,verifier:s}=e;this.chainId=i,this.forceNodeUrl=r,this.nodeUrl=o,this.verifier=s}setup(t){return __awaiter(this,void 0,void 0,function*(){t=t||{};let{chainId:e,nodeUrl:r,verifier:n}=t;if(e=e||this.chainId,r=r||this.nodeUrl,n=n||this.verifier,r&&!e){const t=yield fetch(r,{headers:{"content-type":"application/json; charset=UTF-8"},body:JSON.stringify({id:Math.floor(1e6*Math.random()),jsonrpc:"2.0",method:"eth_chainId",params:[]}),method:"POST"}),o=yield t.json();e=parseInt(o.result.slice(2),16).toString()}if(!e)throw new Error("chainId missing");const a=s[e];let u;u=a&&!this.forceNodeUrl?Object.assign(Object.assign({},a),{chainId:parseInt(e)}):{host:r,chainId:parseInt(e)},this.torusWrapper=new i,yield this.torusWrapper.init({network:u,showTorusButton:!1}),this.torusWrapper.showTorusButton();try{const t=yield this.torusWrapper.login(n?{verifier:n}:void 0);o.log({torusLoginResult:t})}catch(t){if(this.torusWrapper.hideTorusButton(),"User cancelled login"===t.message||"user closed popup"===t.message)throw new Error("USER_CANCELED");throw t}return this.torusWrapper.hideTorusButton(),window.torusWrapper=this.torusWrapper,{web3Provider:this.torusWrapper.provider,chainId:e}})}disconnect(){this.torusWrapper.hideTorusButton(),this.torusWrapper=void 0,window.torusWrapper=void 0}logout(){return __awaiter(this,void 0,void 0,function*(){this.torusWrapper.hideTorusButton();try{yield this.torusWrapper.logout()}catch(t){}})}isLoggedIn(){return __awaiter(this,void 0,void 0,function*(){let t;try{t=yield this.torusWrapper.getUserInfo()}catch(t){return!1}return!!t})}showWallet(){this.torusWrapper.showWallet()}showButton(){this.torusWrapper.showTorusButton()}hideButton(){this.torusWrapper.hideTorusButton()}initiateTopup(t,e){return __awaiter(this,void 0,void 0,function*(){yield this.torusWrapper.initiateTopup(t,e)})}}class a{constructor(t){const e=t&&t.verifier;this.id=e?"torus-"+e:"torus",this.moduleConfig=t}static setJsURL(t,e){if(a._jsURLUsed)throw new Error("cannot change js url once used");a._jsURL=t,a._jsURLIntegrity=e}load(){return __awaiter(this,void 0,void 0,function*(){if(!i){const t=a._jsURL,e=a._jsURLIntegrity;a._jsURLUsed=!0;try{yield function(t,e,r){return new Promise(function(o,i){const s=document.createElement("script");s.type="text/javascript",s.src=t,e&&(s.integrity=e),r&&(s.crossOrigin=r),s.onload=s.onreadystatechange=function(){o()},s.onerror=function(){i()},document.head.appendChild(s)})}(t,e,"anonymous")}catch(t){throw a._jsURLUsed=!1,t}i=window.Torus}return new n(this.id,this.moduleConfig)})}}e.TorusModuleLoader=a,a._jsURL="https://cdn.jsdelivr.net/npm/@toruslabs/torus-embed",a._jsURLUsed=!1});