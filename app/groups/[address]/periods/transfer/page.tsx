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

export default function TransferProposalPage({
  params: { address }
}: {
  params: { address: string };
}) {
  const { web3Provider, address: userWalletAddress } = useWeb3Context();
  const router = useRouter();

  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [transferAmountInBNB, setTransferAmountInBNB] = useState<number>(0);
  const [transferAmountInputError, setTransferAmountInputError] = useState('');

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
      recipientAddress
    });

    setIsLoading(true);

    try {
      // await new Promise((resolve) => setTimeout(resolve, 5000));
      const connectedGroupContract = getConnectedGroupContract(
        web3Provider.getSigner(),
        address
      );
      const tx = await connectedGroupContract.proposeTransfer(
        recipientAddress,
        ethers.utils.parseEther(transferAmountInBNB.toString())
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
            htmlFor="recipientAddress"
          >
            Wallet Address yang Dituju
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="recipientAddress"
            type="text"
            placeholder="Masukkan wallet address atau alamat dompet yang dituju..."
            minLength={5}
            required={true}
            onChange={(event) => setRecipientAddress(event.target.value)}
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="transferAmountInBNB"
          >
            Jumlah Saldo yang Dikirim dalam BNB
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="transferAmountInBNB"
            type="text"
            max={100}
            min={0}
            required={true}
            placeholder="Masukkan jumlah saldo yang dikirim dalam BNB"
            pattern="^\d*([.,])?\d{0,18}$"
            onChange={(event) => {
              const value = event.target.value;
              const numberValue = parseFloat(value.replace(',', '.'));

              if (
                /^\d*([.,])?\d{0,18}$/.test(value) &&
                !isNaN(numberValue) &&
                numberValue >= 0
              ) {
                setTransferAmountInBNB(numberValue);
                setTransferAmountInputError(''); // Clear error
              } else {
                setTransferAmountInputError(
                  'Tolong masukkan jumlah yang benar.'
                );
              }
            }}
          />
          {transferAmountInputError && (
            <div className="text-red-500">{transferAmountInputError}</div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Usulkan pengiriman saldo
          </button>
        </div>
      </form>

      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
}
