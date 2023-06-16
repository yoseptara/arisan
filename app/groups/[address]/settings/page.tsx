import { getGroupContract } from '@root/lib/contracts';

import { ethers } from 'ethers';
import Link from 'next/link';
import { PrimaryLinkBtn } from '@root/components/PrimaryLinkBtn';
import { GroupSettings } from '@root/models/iGroupSettings';

export const dynamic = 'force-dynamic';

async function getGroupSettings(address: string): Promise<GroupSettings> {
  const groupContract = getGroupContract(address);

  return groupContract.getGroupSettings().then((tuple) => ({
    title: tuple[0],
    telegramGroupUrl: tuple[1],
    coordinator: {
      walletAddress: tuple[2][0],
      telegramUsername: tuple[2][1],
      isActiveVoter: tuple[2][2],
      latestPeriodParticipation: tuple[2][3].toNumber()
    },
    coordinatorRewardPercentage: tuple[3].toNumber(),
    contributionAmountInWei: tuple[4].toNumber(),
    prizePercentage: tuple.prizePercentage.toNumber()
  }));
}

export default async function GroupSettingsPage({
  params: { address }
}: {
  params: { address: string };
}) {
  const groupSettings = await getGroupSettings(address);

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div className="flex">
        <PrimaryLinkBtn text="Beranda" route={`/groups`} className="w-full" />
        <div className="mx-8"></div>
        <PrimaryLinkBtn
          text="Detail kelompok"
          route={`/groups/${address}`}
          className="w-full"
        />
      </div>
      <div className="my-8"></div>
      <p className="text-xl md:text-2xl font-semibold text-gray-800">
        Aturan Kelompok
      </p>
      <div className="my-8"></div>

      <table className="table-auto w-full">
        <thead>
          <tr>
            <th className="border-2 border-gray-500 px-4 py-2">Nama Aturan</th>
            <th className="border-2 border-gray-500 px-4 py-2">Nilai</th>
            <th className="border-2 border-gray-500 px-4 py-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-2 border-gray-500 px-4 py-2">
              Nama kelompok
            </td>
            <td className="border-2 border-gray-500 px-4 py-2">
              {groupSettings.title}
            </td>
            <td className="border-2 border-gray-500 px-4 py-2">
              Usulkan perubahan
            </td>
          </tr>
          <tr>
            <td className="border-2 border-gray-500 px-4 py-2">
              Url grup telegram
            </td>
            <td className="border-2 border-gray-500 px-4 py-2">
              <a
                href={groupSettings.telegramGroupUrl}
                className="text-blue-600 hover:text-blue-800 hover:underline line-clamp-2 cursor-pointer"
              >
                {groupSettings.telegramGroupUrl}
              </a>
            </td>
            <td className="border-2 border-gray-500 px-4 py-2">
              Usulkan perubahan
            </td>
          </tr>
          <tr>
            <td className="border-2 border-gray-500 px-4 py-2">Koordinator</td>
            <td className="border-2 border-gray-500 px-4 py-2">
              {groupSettings.coordinator.walletAddress}
            </td>
            <td className="border-2 border-gray-500 px-4 py-2">
              Usulkan perubahan
            </td>
          </tr>
          <tr>
            <td className="border-2 border-gray-500 px-4 py-2">
              Persentase keuntungan koordinator
            </td>
            <td className="border-2 border-gray-500 px-4 py-2">
              {groupSettings.coordinatorRewardPercentage}
            </td>
            <td className="border-2 border-gray-500 px-4 py-2">
              Usulkan perubahan
            </td>
          </tr>
          <tr>
            <td className="border-2 border-gray-500 px-4 py-2">
              Jumlah kontribusi setiap peserta
            </td>
            <td className="border-2 border-gray-500 px-4 py-2">
              {ethers.utils.formatEther(groupSettings.contributionAmountInWei)}{' '}
              BNB
            </td>
            <td className="border-2 border-gray-500 px-4 py-2">
              Usulkan perubahan
            </td>
          </tr>
          <tr>
            <td className="border-2 border-gray-500 px-4 py-2">
              Persentase hadiah pemenang
            </td>
            <td className="border-2 border-gray-500 px-4 py-2">
              {groupSettings.prizePercentage}
            </td>
            <td className="border-2 border-gray-500 px-4 py-2">
              <Link
                href={groupSettings.telegramGroupUrl}
                className="  hover:underline line-clamp-2 cursor-pointer"
              >
                Usulkan perubahan
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
