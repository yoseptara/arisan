'use client';

import React, { createContext, useContext } from 'react';
import { useWeb3 } from '../hooks/Web3Client';
import { Web3ProviderState, web3InitialState } from '../reducers';
import { getConnectedGroupContract, getGroupContract } from '../lib/contracts';
import { Group } from '@root/typechain-types';

const GroupContractContext = createContext<Group | undefined>(undefined);

interface Props {
  children: React.ReactNode;
  groupAddress: string;
}

export const GroupContractContextProvider = ({
  children,
  groupAddress
}: Props) => {
  const { web3Provider } = useWeb3();
  let groupContract: Group;
  if (web3Provider) {
    const signer = web3Provider.getSigner();
    groupContract = getConnectedGroupContract(signer, groupAddress);
  } else {
    groupContract = getGroupContract(groupAddress);
  }

  return (
    <GroupContractContext.Provider value={groupContract}>
      {children}
    </GroupContractContext.Provider>
  );
};

export function useGroupContractContext(): Group {
  const groupContract = useContext(GroupContractContext);
  if (!groupContract) {
    throw new Error('GroupContractContext value is undefined');
  }
  return groupContract;
}
