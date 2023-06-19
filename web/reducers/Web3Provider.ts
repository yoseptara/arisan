import { ethers } from 'ethers';
import { ArisanGroupFactory } from '../../bnb-chain/typechain-types';
import { getConnectedGroupFactoryContract } from '../lib/contracts';
import { cfg } from '../configuration';
import staticRpcProvider from '../lib/web3';

export type Web3ProviderState = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any;
  staticJsonRpcProvider: ethers.providers.StaticJsonRpcProvider;
  web3Provider: ethers.providers.Web3Provider | null | undefined;
  address: string | null | undefined;
  network: ethers.providers.Network | null | undefined;
  connectedMainContract: ArisanGroupFactory | null;
  connect: (() => Promise<void>) | null;
  disconnect: (() => Promise<void>) | null;
};

export const web3InitialState: Web3ProviderState = {
  provider: null,
  staticJsonRpcProvider: staticRpcProvider,
  web3Provider: null,
  address: null,
  network: null,
  connectedMainContract: null,
  connect: null,
  disconnect: null
};

export type Web3Action =
  | {
      type: 'SET_WEB3_PROVIDER';
      provider?: Web3ProviderState['provider'];
      web3Provider?: Web3ProviderState['web3Provider'];
      address?: Web3ProviderState['address'];
      network?: Web3ProviderState['network'];
      connectedMainContract: Web3ProviderState['connectedMainContract'];
    }
  | {
      type: 'SET_ADDRESS';
      address?: Web3ProviderState['address'];
    }
  | {
      type: 'SET_NETWORK';
      network?: Web3ProviderState['network'];
    }
  | {
      type: 'RESET_WEB3_PROVIDER';
    };

export function web3Reducer(
  state: Web3ProviderState,
  action: Web3Action
): Web3ProviderState {
  switch (action.type) {
    case 'SET_WEB3_PROVIDER':
      return {
        ...state,
        provider: action.provider,
        web3Provider: action.web3Provider,
        address: action.address,
        network: action.network,
        connectedMainContract: action.connectedMainContract
      };
    case 'SET_ADDRESS':
      return {
        ...state,
        address: action.address
      };
    case 'SET_NETWORK':
      return {
        ...state,
        network: action.network
      };
    case 'RESET_WEB3_PROVIDER':
      return web3InitialState;
    default:
      throw new Error();
  }
}
