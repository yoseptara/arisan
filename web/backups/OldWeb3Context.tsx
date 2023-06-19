// 'use client';

// import { createContext, useContext, useEffect, useState } from 'react';
// // import Web3 from 'web3';

// const url =
//   'https://rpc.ankr.com/bsc_testnet_chapel/b47fbf2e8861362bacca7032d07e2b8ef35a2f613607b2bd1739ec6dc4627480';

// type Web3Instance = Web3 | undefined;

// const Web3Context = createContext<Web3Instance>(
//   // new Web3(window?.ethereum ?? new Web3.providers.HttpProvider(url))
//   undefined
// );

// export function useWeb3(): Web3 {
//   const web3 = useContext(Web3Context);

//   if (!web3) {
//     throw new Error('web3 instance is not initalized');
//   }

//   return web3;
// }

// export async function useReqAccount(): Promise<string> {
//   const web3 = useWeb3();

//   const accounts = await web3.eth.getAccounts();
//   const account = accounts[0];

//   if (account) {
//     return account;
//   }

//   if (window.ethereum) {
//     try {
//       await window.ethereum.request({ method: 'eth_requestAccounts' });
//       const accounts = await web3.eth.getAccounts();
//       const account = accounts[0];

//       if (!account) {
//         throw new Error("Couldn't get account address");
//       }

//       return account;
//     } catch (error) {
//       throw new Error('Failed to connect to MetaMask:' + error);
//     }
//   } else {
//     throw new Error(
//       'MetaMask is not installed. Please install it to continue.'
//     );
//   }
// }

// interface Web3ProviderProps {
//   children: React.ReactNode;
// }

// export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
//   // const web3 = useContext(Web3Context);
//   const [web3, setWeb3] = useState<Web3Instance>(undefined);

//   useEffect(() => {
//     function initWeb3() {
//       console.log('initWeb3() triggered');
//       if (window.ethereum) {
//         try {
//           const web3Instance = new Web3(window.ethereum);
//           setWeb3(web3Instance);
//           console.log('web3Instance has been initialized');
//         } catch (error) {
//           console.error('Failed to connect to MetaMask:', error);
//         }
//       } else {
//         console.warn(
//           'MetaMask is not installed. Please install it to continue.'
//         );
//       }
//     }

//     initWeb3();
//   }, []);

//   return <Web3Context.Provider value={web3}>{children}</Web3Context.Provider>;
// };
