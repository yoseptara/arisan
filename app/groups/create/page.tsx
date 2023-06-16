'use client';

import { FormEvent, useRef, useState } from 'react';
import { useWeb3Context } from '@root/contexts';
import { useRouter } from 'next/navigation';
import LoadingOverlay from '@root/components/LoadingOverlay';
import { showErrorToast } from '@root/utils/toastUtils';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import {
  EthersError,
  getParsedEthersError
} from '@enzoferey/ethers-error-parser';
import Cookies from 'js-cookie';

export default function CreateGroupPage() {
  const { connectedMainContract: web3Provider } = useWeb3Context();
  const router = useRouter();

  const [title, setTitle] = useState<string>('');
  const [telegramGroupUrl, setTelegramGroupUrl] = useState<string>('');
  const [coordinatorTelegramUsername, seCoordinatorTelegramUsername] =
    useState<string>('');
  const [coordinatorRewardPercentage, setCoordinatorRewardPercentage] =
    useState<number>(0);
  const [contributionAmountInBNB, setContributionAmountInBNB] =
    useState<number>(0);
  const [prizePercentage, setPrizePercentage] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [contributionAmountInputError, setContributionAmountInputError] =
    useState('');
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
      title,
      telegramGroupUrl,
      coordinatorTelegramUsername,
      coordinatorRewardPercentage,
      contributionAmountInBNB,
      prizePercentage
    });

    setIsLoading(true);

    if (title.length < 3 || telegramGroupUrl.length < 5) {
      return showErrorToast(
        'panjang judul atau url grup kurang dari batas minimum'
      );
    }

    try {
      // await new Promise((resolve) => setTimeout(resolve, 5000));

      const tx = await web3Provider.createGroup(
        title,
        telegramGroupUrl,
        coordinatorTelegramUsername,
        coordinatorRewardPercentage,
        ethers.utils.parseEther(contributionAmountInBNB.toString()),
        prizePercentage
      );

      await tx.wait();

      // Clear form values
      // formRef?.current?.reset();

      Cookies.set('showCreateGroupSuccessToast', 'true');
      router.push('/groups');

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
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="title"
          >
            Nama Kelompok
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            type="text"
            placeholder="Masukkan nama kelompok..."
            // value={title}
            minLength={3}
            required={true}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
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
            placeholder="Masukkan url dari grup telegram yang sudah dibuat..."
            // value={telegramGroupUrl}
            minLength={5}
            required={true}
            onChange={(event) => setTelegramGroupUrl(event.target.value)}
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="coordinatorTelegramUsername"
          >
            Username Telegram Koordinator
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="coordinatorTelegramUsername"
            type="text"
            placeholder="Masukkan url dari grup telegram yang sudah dibuat..."
            // value={telegramGroupUrl}
            minLength={3}
            required={true}
            onChange={(event) =>
              seCoordinatorTelegramUsername(event.target.value)
            }
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="coordinatorRewardPercentage"
          >
            Persentase Keuntungan Koordinator
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="coordinatorRewardPercentage"
            type="number"
            max={100}
            min={0}
            required={true}
            placeholder="Masukkan jumlah persentase yang akan didapatkan koordinator pada setiap periode..."
            // value={coordinatorRewardPercentage}
            onChange={(event) =>
              setCoordinatorRewardPercentage(parseInt(event.target.value))
            }
          />
        </div>
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
            placeholder="Masukkan jumlah kontribusi minimal untuk setiap anggota pada periode arisan..."
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
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="prizePercentage"
          >
            Jumlah Persentase Hadiah
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="prizePercentage"
            type="number"
            max={100}
            min={0}
            required={true}
            placeholder="Masukkan jumlah persentase hadiah yang akan diterima setiap pemenang pada periode arisan..."
            // value={prizePercentage}
            onChange={(event) =>
              setPrizePercentage(parseInt(event.target.value))
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Buat kelompok
          </button>
          {/* <a
          className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
          href="#"
        >
          Forgot Password?
        </a> */}
        </div>
      </form>
      {/* <FerrisWheelSpinner loading={isLoading} size={28} /> */}
      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
}
