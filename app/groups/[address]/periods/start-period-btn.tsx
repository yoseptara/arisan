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
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function StartPeriodBtn({
  groupAddress
}: {
  groupAddress: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { web3Provider } = useWeb3Context();

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
      } catch (err) {
        setIsLoading(false);
        const parsedEthersError = getParsedEthersError(err as EthersError);
        console.log(parsedEthersError);
        toast.error(parsedEthersError.context ?? 'Error');
        throw err;
      }
    }
  };

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
