import { getGroupContract } from '@root/lib/contracts';

import { ethers } from 'ethers';
import { PrimaryLinkBtn } from '@root/components/PrimaryLinkBtn';
import {
  ExternalMemberStructOutput,
  ExternalProposalStructOutput
} from '@root/../bnb-chain/typechain-types/Group';
import ActionTableCell from './action-table-cell';
import { Proposal, ProposalCategory } from '@root/models/iGroupProposals';
import ClientDateLocaleString from '@root/components/ClientDateLocaleString';

export const dynamic = 'force-dynamic';

async function getGroupProposals(address: string): Promise<Proposal[]> {
  const groupContract = getGroupContract(address);

  return groupContract
    .getIncompleteProposalsIndexesCount()
    .then(async (incompleteProposalsIndexesCountBigNum) => {
      const proposalPromises: Promise<Proposal>[] = [];
      const incompleteProposalsIndexesCount =
        incompleteProposalsIndexesCountBigNum.toNumber();
      for (let index = 0; index < incompleteProposalsIndexesCount; index++) {
        proposalPromises.push(
          groupContract
            .getIncompleteProposalByIncompleteProposalsIndexesIndex(index)
            .then(async (proposal) => {
              const approversCount = proposal.approversCount.toNumber();

              const approverPromises: Promise<ExternalMemberStructOutput>[] =
                [];

              for (
                let approverIndex = 0;
                approverIndex < approversCount;
                approverIndex++
              ) {
                approverPromises.push(
                  groupContract.getApproverByIndexAndProposalIndex(
                    approverIndex,
                    proposal.index
                  )
                );
              }

              const approvers = await Promise.all(approverPromises);
              return {
                index: proposal.index.toNumber(),
                category: proposal.category,
                proposedAtTimestamp: proposal.proposedAt.toNumber() * 1000,
                proposer: {
                  walletAddress: proposal.proposer.walletAddress,
                  telegramUsername: proposal.proposer.telegramUsername,
                  isActiveVoter: proposal.proposer.isActiveVoter,
                  latestPeriodParticipation:
                    proposal.proposer.latestPeriodParticipation.toNumber()
                },
                completedAtTimestamp: proposal.completedAt.toNumber() * 1000,
                isApproved: proposal.isApproved,
                approvers: approvers.map((approver) => ({
                  walletAddress: approver.walletAddress,
                  telegramUsername: approver.telegramUsername,
                  isActiveVoter: approver.isActiveVoter,
                  latestPeriodParticipation:
                    approver.latestPeriodParticipation.toNumber()
                })),
                stringProposalValue: proposal.stringProposalValue,
                uintProposalValue: proposal.uintProposalValue.toNumber(),
                coordinatorProposalValue: {
                  walletAddress:
                    proposal.coordinatorProposalValue.walletAddress,
                  telegramUsername:
                    proposal.coordinatorProposalValue.telegramUsername,
                  isActiveVoter:
                    proposal.coordinatorProposalValue.isActiveVoter,
                  latestPeriodParticipation:
                    proposal.coordinatorProposalValue.latestPeriodParticipation.toNumber()
                },
                newMemberProposalValue: {
                  memberAddress: proposal.newMemberProposalValue.memberAddress,
                  telegramUsername:
                    proposal.newMemberProposalValue.telegramUsername
                },
                transferProposalValue: {
                  recipient: proposal.transferProposalValue.recipient,
                  transferAmount:
                    proposal.transferProposalValue.transferAmount.toNumber()
                }
              };
            })
        );
      }

      return await Promise.all(proposalPromises);
    });
}

function categoryToText(category: ProposalCategory): string {
  const categoryText: Record<ProposalCategory, string> = {
    [ProposalCategory.title]: 'Judul kelompok',
    [ProposalCategory.telegramGroup]: 'Url grup telegram',
    [ProposalCategory.coordinatorCommissionPercentage]:
      'Persentase komisi untuk koordinator',
    [ProposalCategory.contributionAmount]: 'Syarat jumlah kontribusi',
    [ProposalCategory.prizePercentage]:
      'Persentase hadiah untuk pemenang undian',
    [ProposalCategory.newMember]: 'Anggota baru ingin bergabung',
    [ProposalCategory.coordinator]: 'Koordinator',
    [ProposalCategory.transfer]: 'Pengiriman saldo kontrak ke alamat lain'
  };

  return categoryText[category] ?? 'Kategori tidak diketahui';
}

function getNewValueBasedOnCategory(proposal: Proposal): string {
  const {
    stringProposalValue,
    uintProposalValue,
    coordinatorProposalValue,
    newMemberProposalValue,
    transferProposalValue
  } = proposal;
  const categoryToNewValueMap: Record<ProposalCategory, string> = {
    [ProposalCategory.title]: stringProposalValue,
    [ProposalCategory.telegramGroup]: stringProposalValue,
    [ProposalCategory.coordinatorCommissionPercentage]: uintProposalValue
      ? `${uintProposalValue.toString()} persen`
      : '',
    [ProposalCategory.contributionAmount]: uintProposalValue
      ? `${ethers.utils.formatEther(uintProposalValue)} BNB`
      : '',
    [ProposalCategory.prizePercentage]: uintProposalValue
      ? `${uintProposalValue.toString()} persen`
      : '',
    [ProposalCategory.newMember]:
      newMemberProposalValue.memberAddress &&
      `${newMemberProposalValue.memberAddress}\nTelegram username: ${newMemberProposalValue.telegramUsername}`,
    [ProposalCategory.coordinator]:
      coordinatorProposalValue.walletAddress &&
      `${coordinatorProposalValue.walletAddress}\nTelegram username: ${coordinatorProposalValue.telegramUsername}`,
    [ProposalCategory.transfer]:
      transferProposalValue.recipient &&
      `${transferProposalValue.recipient} (${ethers.utils.formatEther(
        transferProposalValue.transferAmount
      )} BNB)`
  };

  return (
    categoryToNewValueMap[proposal.category] ?? 'Nilai baru tidak diketahui'
  );
}

export default async function GroupVotingPage({
  params: { address }
}: {
  params: { address: string };
}) {
  const groupProposals = await getGroupProposals(address);

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div className="flex">
        <PrimaryLinkBtn text="Beranda" route={`/groups`} className="w-full" />
        <div className="mx-2"></div>
        <PrimaryLinkBtn
          text="Detail kelompok"
          route={`/groups/${address}`}
          className="w-full"
        />
      </div>
      <div className="my-8"></div>
      <p className="text-xl md:text-2xl font-semibold text-gray-800">
        Daftar Usulan Perubahan
      </p>
      <div className="my-8"></div>

      <table className="table-auto w-full">
        <thead>
          <tr>
            <th
              // rowSpan={2}
              className="border-2 border-gray-500 px-4 py-2"
            >
              Tanggal Pengusulan
            </th>
            <th
              // colSpan={2}
              className="border-2 border-gray-500 px-4 py-2"
            >
              Pengusul
            </th>
            <th
              // rowSpan={2}
              className="border-2 border-gray-500 px-4 py-2"
            >
              Kategori Usulan
            </th>
            <th
              // rowSpan={2}
              className="border-2 border-gray-500 px-4 py-2"
            >
              Nilai
            </th>
            <th
              colSpan={2}
              // rowSpan={2}
              className="border-2 border-gray-500 px-4 py-2"
            >
              Aksi
            </th>
          </tr>
          {/* <tr>
            <th className="border-2 border-gray-500 px-4 py-2">
              Wallet Address
            </th>
            <th className="border-2 border-gray-500 px-4 py-2">
              Telegram Username
            </th>
          </tr> */}
        </thead>
        <tbody>
          {groupProposals.map((proposal) => {
            const {
              category,
              proposedAtTimestamp,
              proposer,
              newMemberProposalValue
            } = proposal;

            if (!getNewValueBasedOnCategory(proposal)) {
              return null;
            }

            return (
              <tr key={proposal.index}>
                <td className="border-2 border-gray-500 px-4 py-2">
                  <ClientDateLocaleString timestamp={proposedAtTimestamp} />
                </td>
                <td className="border-2 border-gray-500 px-4 py-2">
                  {`${proposer.walletAddress}\nTelegram username: ${
                    category === ProposalCategory.newMember &&
                    proposer.walletAddress ===
                      newMemberProposalValue.memberAddress
                      ? newMemberProposalValue.telegramUsername
                      : proposer.telegramUsername
                  }
                  `}
                </td>
                {/* <td className="border-2 border-gray-500 px-4 py-2">
                  {category === ProposalCategory.newMember &&
                  proposer.walletAddress ===
                    newMemberProposalValue.memberAddress
                    ? newMemberProposalValue.telegramUsername
                    : proposer.telegramUsername}
                </td> */}
                <td className="border-2 border-gray-500 px-4 py-2">
                  {categoryToText(category)}
                </td>
                <td className="border-2 border-gray-500 px-4 py-2">
                  {getNewValueBasedOnCategory(proposal)}
                </td>
                <ActionTableCell
                  groupAddress={address}
                  proposalIndex={proposal.index}
                  proposal={proposal}
                />
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
