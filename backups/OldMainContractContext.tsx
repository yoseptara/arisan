// 'use client';

// import {
//   ReactNode,
//   createContext,
//   useContext,
//   useEffect,
//   useState
// } from 'react';
// import { ArisanGroupFactory } from '../../bnb-chain/typechain-types';
// // import { getArisanGroupFactory } from '../lib/contracts';
// import { useWeb3 } from './web3.context';

// const MainContractContext = createContext<ArisanGroupFactory | undefined>(
//   undefined
// );

// export function useMainContract(): ArisanGroupFactory {
//   const mainContract = useContext(MainContractContext);

//   if (!mainContract) {
//     throw new Error('mainContract instance has not been initialized yet');
//   }

//   return mainContract;
// }

// interface MainContractProviderProps {
//   children: ReactNode;
// }

// export const MainContractProvider: React.FC<MainContractProviderProps> = ({
//   children
// }) => {
//   const [contract, setContract] = useState<ArisanGroupFactory | undefined>(
//     undefined
//   );
//   const web3 = useWeb3();
//   // const contract: ArisanGroupFactory = getArisanGroupFactory(web3);

//   useEffect(() => {
//     async function initializeContract() {
//       setContract(getArisanGroupFactory(web3));
//     }

//     initializeContract();
//   }, []);

//   return (
//     <MainContractContext.Provider value={contract}>
//       {children}
//     </MainContractContext.Provider>
//   );
// };
