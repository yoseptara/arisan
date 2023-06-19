import { useEffect, useReducer, useCallback } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

import {
  Web3ProviderState,
  Web3Action,
  web3InitialState,
  web3Reducer
} from '../reducers';

import { toast } from 'react-toastify';
import { getConnectedGroupFactoryContract } from '../lib/contracts';
import { cfg } from '../configuration';

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      // infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
      rpc: {
        // 97: 'https://rpc.ankr.com/bsc_testnet_chapel/b47fbf2e8861362bacca7032d07e2b8ef35a2f613607b2bd1739ec6dc4627480'
        97: cfg.rpcUrl
      }
    }
  }
};

let web3Modal: Web3Modal | null;
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    network: 'bsc_testnet_chapel', // optional
    cacheProvider: true,
    providerOptions // required
  });
}

export const useWeb3 = () => {
  // console.log('(Web3Client.ts) useWeb3() is called');
  const [state, dispatch] = useReducer(web3Reducer, web3InitialState);
  const { provider, web3Provider, address, network, connectedMainContract } =
    state;

  const connect = useCallback(async () => {
    console.log('(Web3Client.ts, useWeb3) connect useCallback() is called');
    if (web3Modal) {
      try {
        const provider = await web3Modal.connect();
        const web3Provider = new ethers.providers.Web3Provider(provider);
        // const contractCode = await web3Provider.getCode(
        //   process.env.NEXT_PUBLIC_MAIN_CONTRACT_ADDRESS!
        // );
        // console.log('cek contractCode : ', contractCode);
        const signer = web3Provider.getSigner();
        const address = await signer.getAddress();
        const network = await web3Provider.getNetwork();
        const connectedMainContract = getConnectedGroupFactoryContract(signer);
        // console.log('cek connectedMainContract : ', connectedMainContract);
        toast.success('Connected to Web3');

        dispatch({
          type: 'SET_WEB3_PROVIDER',
          provider,
          web3Provider,
          address,
          network,
          connectedMainContract
        } as Web3Action);
      } catch (e) {
        console.log('connect error', e);
      }
    } else {
      console.error('No Web3Modal');
    }
  }, []);

  const disconnect = useCallback(async () => {
    console.log('(Web3Client.ts, useWeb3) disconnect useCallback() is called');
    if (web3Modal) {
      web3Modal.clearCachedProvider();
      if (provider?.disconnect && typeof provider.disconnect === 'function') {
        await provider.disconnect();
      }
      toast.error('Disconnected from Web3');
      dispatch({
        type: 'RESET_WEB3_PROVIDER'
      } as Web3Action);
    } else {
      console.error('No Web3Modal');
    }
  }, [provider]);

  // Auto connect to the cached provider
  useEffect(() => {
    console.log(
      '(Web3Client.ts, useWeb3) Auto connect to the cached provider useEffect() is called'
    );
    if (web3Modal && web3Modal.cachedProvider) {
      connect();
    }
  }, [connect]);

  // EIP-1193 events
  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        toast.info('Changed Web3 Account');
        dispatch({
          type: 'SET_ADDRESS',
          address: accounts[0]
        } as Web3Action);
      };

      // https://docs.ethers.io/v5/concepts/best-practices/#best-practices--network-changes
      const handleChainChanged = (_hexChainId: string) => {
        if (typeof window !== 'undefined') {
          console.log('switched to chain...', _hexChainId);
          toast.info('Web3 Network Changed');
          window.location.reload();
        } else {
          console.log('window is undefined');
        }
      };

      const handleDisconnect = (error: { code: number; message: string }) => {
        // eslint-disable-next-line no-console
        console.log('disconnect', error);
        disconnect();
      };

      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
      provider.on('disconnect', handleDisconnect);

      // Subscription Cleanup
      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccountsChanged);
          provider.removeListener('chainChanged', handleChainChanged);
          provider.removeListener('disconnect', handleDisconnect);
        }
      };
    }
  }, [provider, disconnect]);

  return {
    provider,
    web3Provider,
    address,
    network,
    connectedMainContract,
    connect,
    disconnect
  } as Web3ProviderState;
};
