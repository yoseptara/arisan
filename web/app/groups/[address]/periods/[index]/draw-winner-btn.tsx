'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  EthersError,
  getParsedEthersError
} from '@enzoferey/ethers-error-parser';
import LoadingOverlay from '@root/components/LoadingOverlay';
import { PrimaryBtn } from '@root/components/PrimaryButton';
import { useWeb3Context } from '@root/contexts';
import { getConnectedGroupContract } from '@root/lib/contracts';
import { showSuccessToast } from '@root/utils/toastUtils';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';

function DrawWinnerBtn({ groupAddress }: { groupAddress: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { web3Provider, address } = useWeb3Context();
  const [isCoordinator, setIsCoordinator] = useState<boolean>(false);

  const isEventListenerAttached = useRef(false);

  const onClick = async () => {
    if (!web3Provider) {
      toast.error('Hubungkan wallet anda terlebih dahulu');
      return;
    }

    const signer = web3Provider.getSigner();
    const connectedGroupContract = getConnectedGroupContract(
      signer,
      groupAddress
    );

    if (
      window.confirm('Konfirmasi untuk mengundi pemenang pada putaran ini.')
    ) {
      try {
        setIsLoading(true);
        const tx = await connectedGroupContract.drawWinner();
        await tx.wait();
      } catch (err) {
        setIsLoading(false);
        const parsedEthersError = getParsedEthersError(err as EthersError);
        console.log(parsedEthersError);
        toast.error(parsedEthersError.context ?? 'Error');
        throw err;
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const isCurrUserCoordinator = async () => {
      if (!address || !web3Provider) {
        return;
      }

      const signer = web3Provider.getSigner();
      const connectedGroupContract = getConnectedGroupContract(
        signer,
        groupAddress
      );

      const coordinatorAddress = await connectedGroupContract.coordinator();
      if (
        ethers.utils.getAddress(address) ===
        ethers.utils.getAddress(coordinatorAddress)
      ) {
        if (isMounted) {
          setIsCoordinator(true);
        }

        if (!isEventListenerAttached.current) {
          connectedGroupContract.on('WinnerDrawn', (winner) => {
            if (isMounted) {
              router.refresh();
              showSuccessToast(
                `Undian putaran ini dimenangkan oleh ${winner.telegramUsername} (${winner.walletAddress})`
              );
              setIsLoading(false);
            }
          });

          isEventListenerAttached.current = true;
        }
      }
    };

    isCurrUserCoordinator();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [web3Provider, address]);

  if (!isCoordinator) {
    return <div />;
  }

  return (
    <>
      <PrimaryBtn
        onClick={onClick}
        text="Undi pemenang"
        className="ml-4 w-full"
      />
      <LoadingOverlay isLoading={isLoading} />
    </>
  );
}

export default DrawWinnerBtn;
