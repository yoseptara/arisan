// import Web3 from 'web3';
// import ArisanGroupFactoryJson from '../../bnb-chain/artifacts/contracts/Arisan.sol/ArisanGroupFactory.json' assert { type: 'json' };
// import GroupJson from '../../bnb-chain/artifacts/contracts/Arisan.sol/Group.json' assert { type: 'json' };
// import {
//   ArisanGroupFactory,
//   Group
// } from '../../bnb-chain/typechain-types/index';0
import { Signer, ethers } from 'ethers';
import {
  ArisanGroupFactory,
  ArisanGroupFactory__factory,
  Group,
  Group__factory
} from '../../bnb-chain/typechain-types';
import { Provider } from '@ethersproject/providers';
import { cfg } from '../configuration';
import staticRpcProvider from './web3';

// export function getGroup(web3: Web3, address: string): Group {
//   return new web3.eth.Contract(GroupJson.abi as any, address) as any;
// }

// export function getArisanGroupFactory(web3: Web3): ArisanGroupFactory {
//   const mainContractAddress = process.env.NEXT_PUBLIC_MAIN_CONTRACT_ADDRESS;

//   if (!mainContractAddress) {
//     throw new Error(
//       'NEXT_PUBLIC_MAIN_CONTRACT_ADDRESS env var is not properly set'
//     );
//   }

//   return new web3.eth.Contract(
//     ArisanGroupFactoryJson.abi as any,
//     mainContractAddress
//   ) as any;
// }

const mainContractAddress = process.env.NEXT_PUBLIC_MAIN_CONTRACT_ADDRESS;

function getStaticArisanGroupFactory() {
  if (!mainContractAddress) {
    throw new Error(
      'NEXT_PUBLIC_MAIN_CONTRACT_ADDRESS env var is not properly set'
    );
  }

  return ArisanGroupFactory__factory.connect(
    mainContractAddress,
    staticRpcProvider
  );
}

const mainContract = getStaticArisanGroupFactory();

export { mainContract };

export function getConnectedGroupFactoryContract(
  signer: Signer
): ArisanGroupFactory {
  if (!mainContractAddress) {
    throw new Error(
      'NEXT_PUBLIC_MAIN_CONTRACT_ADDRESS env var is not properly set'
    );
  }
  return ArisanGroupFactory__factory.connect(mainContractAddress, signer);
}

export function getGroupContract(address: string): Group {
  return Group__factory.connect(address, staticRpcProvider);
}

export function getConnectedGroupContract(
  signer: Signer,
  address: string
): Group {
  return Group__factory.connect(address, signer);
}
