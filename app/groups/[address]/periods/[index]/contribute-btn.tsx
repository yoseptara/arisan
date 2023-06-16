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

export default function ContributeBtn({
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

    if (
      window.confirm('Konfirmasi untuk mengirim kontribusi pada putaran ini.')
    ) {
      try {
        setIsLoading(true);
        const contributionAmountInWei =
          await connectedGroupContract.contributionAmountInWei();
        const tx = await connectedGroupContract.contribute({
          value: contributionAmountInWei
        });
        await tx.wait();
        router.refresh();
        showSuccessToast('Kontribusi berhasil dikirim');
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
        text="Kirim kontribusi"
        className="flex justify-center"
      />
      <LoadingOverlay isLoading={isLoading} />
    </>
  );
}
