import { ethers } from 'ethers';
import { cfg } from '../configuration';
// import Web3 from 'web3';

// const url =
//   'https://rpc.ankr.com/bsc_testnet_chapel/b47fbf2e8861362bacca7032d07e2b8ef35a2f613607b2bd1739ec6dc4627480';

// export function getWeb3(): Web3 {
//   return new Web3(new Web3.providers.HttpProvider(url));
// }

const staticRpcProvider = new ethers.providers.StaticJsonRpcProvider(
  cfg.rpcUrl
);

export default staticRpcProvider;
