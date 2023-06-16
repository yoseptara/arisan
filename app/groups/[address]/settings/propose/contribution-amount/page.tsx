'use client';

import { FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import {
  EthersError,
  getParsedEthersError
} from '@enzoferey/ethers-error-parser';
import { getConnectedGroupContract } from '@root/lib/contracts';
import { useWeb3Context } from '@root/contexts';
import LoadingOverlay from '@root/components/LoadingOverlay';
import Cookies from 'js-cookie';

export default function ContributionAmountProposalPage({
  params: { address }
}: {
  params: { address: string };
}) {
  const { web3Provider } = useWeb3Context();
  const router = useRouter();

  const [contributionAmountInBNB, setContributionAmountInBNB] =
    useState<number>(0);
  const [contributionAmountInputError, setContributionAmountInputError] =
    useState('');

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const formRef = useRef<HTMLFormElement | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // console.log('cek connectedMainContract : ', connectedMainContract);

    if (!web3Provider) {
      toast.error('Hubungkan wallet anda terlebih dahulu');
      return;
    }

    // Do something with the form values, e.g. send to an API or display them
    console.log({
      contributionAmountInBNB
    });

    setIsLoading(true);

    try {
      // await new Promise((resolve) => setTimeout(resolve, 5000));
      const connectedGroupContract = getConnectedGroupContract(
        web3Provider.getSigner(),
        address
      );
      const tx = await connectedGroupContract.proposeNewContributionAmountInWei(
        ethers.utils.parseEther(contributionAmountInBNB.toString())
      );

      await tx.wait();

      Cookies.set('showProposeSuccessToast', 'true');
      router.push(`/groups/${address}`);

      // setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      const parsedEthersError = getParsedEthersError(err as EthersError);
      console.log(parsedEthersError);
      toast.error(parsedEthersError.context ?? 'Error');
      throw err;
    }
  };

  return (
    <div className="relative">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contributionAmountInBNB"
          >
            Jumlah Kontribusi Setiap Periode dalam BNB
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="contributionAmountInBNB"
            type="text"
            max={100}
            min={0}
            required={true}
            placeholder="Masukkan jumlah kontribusi yang baru"
            pattern="^\d*([.,])?\d{0,18}$"
            onChange={(event) => {
              const value = event.target.value;
              const numberValue = parseFloat(value.replace(',', '.'));

              if (
                /^\d*([.,])?\d{0,18}$/.test(value) &&
                !isNaN(numberValue) &&
                numberValue >= 0
              ) {
                setContributionAmountInBNB(numberValue);
                setContributionAmountInputError(''); // Clear error
              } else {
                setContributionAmountInputError(
                  'Tolong masukkan jumlah yang benar.'
                );
              }
            }}
          />
          {contributionAmountInputError && (
            <div className="text-red-500">{contributionAmountInputError}</div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Usulkan perubahan
          </button>
        </div>
      </form>
      {/* <FerrisWheelSpinner loading={isLoading} size={28} /> */}
      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
}
