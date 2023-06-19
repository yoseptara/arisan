'use client';

import {
  EthersError,
  getParsedEthersError
} from '@enzoferey/ethers-error-parser';
import LoadingOverlay from '@root/components/LoadingOverlay';
import { PrimaryBtn } from '@root/components/PrimaryButton';
import { useWeb3Context } from '@root/contexts';
import { getConnectedGroupContract } from '@root/lib/contracts';
import { showSuccessToast } from '@root/utils/toastUtils';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';

export default function StartPeriodBtn({
  groupAddress
}: {
  groupAddress: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { web3Provider, address } = useWeb3Context();
  const [isCoordinator, setIsCoordinator] = useState<boolean>(false);

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

    if (window.confirm('Konfirmasi untuk memulai periode baru.')) {
      try {
        setIsLoading(true);
        const contributionAmountInWei =
          await connectedGroupContract.contributionAmountInWei();
        const tx = await connectedGroupContract.startPeriod({
          value: contributionAmountInWei
        });
        await tx.wait();
        router.refresh();
        showSuccessToast('Periode baru telah dimulai');
        setIsLoading(false);
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
        setIsCoordinator(true);
      }
    };
    isCurrUserCoordinator();
  }, [web3Provider, address]);

  if (!isCoordinator) {
    return <div />;
  }

  return (
    <>
      <PrimaryBtn
        onClick={onClick}
        text="Mulai periode baru"
        className="flex justify-center"
      />
      <LoadingOverlay isLoading={isLoading} />
    </>
  );
}
