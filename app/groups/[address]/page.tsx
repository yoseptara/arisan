import { PrimaryBtn } from '@root/components/PrimaryButton';
import Center from '@root/components/Center';
import OutlinedLinkBtn from '@root/components/OutlinedLinkButton';
import { getGroupContract } from '@root/lib/contracts';
import { PrimaryLinkBtn } from '@root/components/PrimaryLinkBtn';
import { GroupData } from '@root/models/iGroupData';
import OnPageInitSuccessToast from './propose-success-toast';

export const dynamic = 'force-dynamic';

async function getGroupDetail(address: string): Promise<GroupData> {
  const groupContract = getGroupContract(address);
  const tuple = await groupContract.getGroupDetail();
  return {
    groupAddress: tuple[0],
    title: tuple[1],
    telegramGroupUrl: tuple[2],
    membersCount: tuple[3].toNumber(),
    joinStatus: tuple.joinStatus
  };
}

export default async function GroupDetailPage({
  params
}: {
  params: { address: string };
}) {
  const groupData = await getGroupDetail(params.address);

  if (!groupData) {
    return (
      <Center>
        <p className="text-gray-600">Failed to get group detail</p>
      </Center>
    );
  }

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      {/* <div className="flex"> */}
      <PrimaryLinkBtn
        route={`/groups`}
        text="Kembali ke Beranda"
        className="flex justify-center"
      />
      {/* </div> */}
      <div className="my-8"></div>
      <p className="text-xl md:text-2xl font-semibold text-gray-800">
        {groupData.title} ({groupData.membersCount})
      </p>
      <div className="my-8"></div>
      <p className="text-xl md:text-2xl font-semibold text-gray-800">
        Contract address :
      </p>
      <p className="text-l md:text-xl text-gray-800">
        {groupData.groupAddress}
      </p>
      <div className="my-8"></div>
      <p className="text-xl md:text-2xl font-semibold text-gray-800">
        Grup Obrolan :
      </p>
      <a
        href={groupData.telegramGroupUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-l md:text-xl text-blue-600 hover:text-blue-800 hover:underline line-clamp-2"
      >
        {groupData.telegramGroupUrl}
      </a>
      <div className="my-8"></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <OutlinedLinkBtn
          text="Daftar Anggota"
          route={`/groups/${groupData.groupAddress}/members`}
        />
        <OutlinedLinkBtn
          text="Dana dan Riwayat Periode"
          route={`/groups/${groupData.groupAddress}/periods`}
        />
        <OutlinedLinkBtn
          text="Aturan Kelompok"
          route={`/groups/${groupData.groupAddress}/settings`}
        />
        <OutlinedLinkBtn
          text="Daftar Voting"
          route={`/groups/${groupData.groupAddress}/votes`}
        />
      </div>

      <OnPageInitSuccessToast />
    </main>
  );
}
