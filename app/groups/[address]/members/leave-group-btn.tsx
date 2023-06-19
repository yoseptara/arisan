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

export default function LeaveGroupBtn({
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

    if (window.confirm('Konfirmasi untuk keluar kelompok.')) {
      try {
        setIsLoading(true);
        const tx = await connectedGroupContract.leave();
        await tx.wait();
        router.replace(`/groups`);
        showSuccessToast('Anda telah keluar dari kelompok.');
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

  return (
    <>
      <PrimaryBtn
        onClick={onClick}
        text="Keluar dari kelompok"
        className="w-full"
      />
      <LoadingOverlay isLoading={isLoading} />
    </>
  );
}
