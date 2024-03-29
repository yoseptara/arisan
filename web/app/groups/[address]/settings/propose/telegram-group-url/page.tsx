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
import { ProposalCategory } from '@root/models/iGroupProposals';

export default function TelegramGroupUrlProposalPage({
  params: { address }
}: {
  params: { address: string };
}) {
  const { web3Provider, address: userWalletAddress } = useWeb3Context();
  const router = useRouter();

  const [telegramGroupUrl, setTelegramGroupUrl] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const formRef = useRef<HTMLFormElement | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // console.log('cek connectedMainContract : ', connectedMainContract);

    if (!web3Provider || !userWalletAddress) {
      toast.error('Hubungkan wallet anda terlebih dahulu');
      return;
    }

    // Do something with the form values, e.g. send to an API or display them
    console.log({
      telegramGroupUrl
    });

    setIsLoading(true);

    try {
      // await new Promise((resolve) => setTimeout(resolve, 5000));
      const connectedGroupContract = getConnectedGroupContract(
        web3Provider.getSigner(),
        address
      );
      const tx = await connectedGroupContract.proposeNewString(
        telegramGroupUrl,
        ProposalCategory.telegramGroup
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
            htmlFor="telegramGroupUrl"
          >
            Url Grup Telegram
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="telegramGroupUrl"
            type="text"
            placeholder="Masukkan url dari grup telegram baru yang sudah dibuat..."
            minLength={5}
            required={true}
            onChange={(event) => setTelegramGroupUrl(event.target.value)}
          />
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

      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
}
