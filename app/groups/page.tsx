import { Title } from '@tremor/react';
import Search from '../search';
import { PrimaryBtn } from '../../components/PrimaryButton';
import Link from 'next/link';
import OnPageInitSuccessToast from './create-group-success-toast';
import GroupsCardsGrid from '@root/components/GroupsCardsGrid';

export const dynamic = 'force-dynamic';

// async function getGroups(): Promise<GroupData[]> {
//   const tuples = await mainContract.getGroups();

//   return tuples.map((tuple) => {
//     // console.log('cek senderAddress : ', tuple.senderAddress);
//     // console.log('cek senderTgUsername : ', tuple.senderTgUsername);
//     return {
//       groupAddress: tuple[0],
//       title: tuple[1],
//       telegramGroupUrl: tuple[2],
//       membersCount: tuple[3].toNumber(),
//       joinStatus: tuple.joinStatus
//     };
//   });
// }

export default async function GroupsPage() {
  // const groups = await getGroups();

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div className="flex justify-center items-stretch">
        <Search />
        <div className="mx-4"></div>
        <Link href="/groups/create">
          <PrimaryBtn text="Buat kelompok baru" className="h-full" />
        </Link>
      </div>
      <div className="my-8"></div>
      <Title className="text-xl md:text-2xl font-semibold text-gray-800">
        Daftar Kelompok Arisan
      </Title>
      <div className="my-8"></div>
      <GroupsCardsGrid />
      {/* {groups.length === 0 ? (
        <div className="w-full border-2 border-gray-800">
          <Center>
            <p className="text-xl md:text-2xl font-semibold text-gray-400">
              Masih belum ada grup yang dibuat
            </p>
          </Center>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {groups.map((group) => (
            <GroupCard key={group.groupAddress} group={group} />
          ))}
        </div>
      )} */}
      <OnPageInitSuccessToast />
    </main>
  );
}
