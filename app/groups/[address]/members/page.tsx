import { getGroupContract } from '@root/lib/contracts';
import { PrimaryLinkBtn } from '@root/components/PrimaryLinkBtn';
import { ExternalMemberStructOutput } from '@root/../bnb-chain/typechain-types/Group';
import { Member } from '@root/models/iMember';
import LeaveGroupBtn from './leave-group-btn';

export const dynamic = 'force-dynamic';

async function getMembers(address: string): Promise<Member[]> {
  const groupContract = getGroupContract(address);
  const membersCountBigNum = await groupContract.getMembersCount();

  const memberPromises: Promise<ExternalMemberStructOutput>[] = [];

  for (let i = 0; i < membersCountBigNum.toNumber(); i++) {
    memberPromises.push(groupContract.getMemberByIndex(i));
  }

  const membersResult = await Promise.all(memberPromises);
  return membersResult.map((member) => ({
    walletAddress: member.walletAddress,
    telegramUsername: member.telegramUsername,
    isActiveVoter: member.isActiveVoter,
    latestPeriodParticipation: member.latestPeriodParticipation.toNumber()
  }));
}

export default async function GroupMembersPage({
  params: { address }
}: {
  params: { address: string };
}) {
  const members = await getMembers(address);

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div className="flex">
        <PrimaryLinkBtn text="Beranda" route={`/groups`} className="flex-1" />
        <div className="mx-2"></div>
        <PrimaryLinkBtn
          text="Detail kelompok"
          route={`/groups/${address}`}
          className="flex-1 w-full"
        />
      </div>
      <div className="my-4" />
      <LeaveGroupBtn groupAddress={address} />
      <div className="my-8"></div>
      <p className="text-xl md:text-2xl font-semibold text-gray-800">
        Daftar Anggota ({members.length})
      </p>
      <div className="my-8"></div>
      <table className="table-auto w-full">
        <thead>
          <tr>
            <th className="border-2 border-gray-500 px-4 py-2">
              Wallet Address
            </th>
            <th className="border-2 border-gray-500 px-4 py-2">
              Telegram Username
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            return (
              <tr key={member.walletAddress}>
                <td className="border-2 border-gray-500 px-4 py-2">
                  {member.walletAddress}
                </td>
                <td className="border-2 border-gray-500 px-4 py-2">
                  {member.telegramUsername}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
