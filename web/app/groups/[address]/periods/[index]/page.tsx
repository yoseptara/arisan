import { getGroupContract } from '@root/lib/contracts';
import { ethers } from 'ethers';
import { PrimaryLinkBtn } from '@root/components/PrimaryLinkBtn';
import {
  ExternalMemberStructOutput,
  ExternalRoundStructOutput
} from '@root/../bnb-chain/typechain-types/Group';
import { Period } from '@root/models/iPeriod';
import ContributeBtn from './contribute-btn';
import DrawWinnerBtn from './draw-winner-btn';
import ClientDateLocaleString from '@root/components/ClientDateLocaleString';

export const dynamic = 'force-dynamic';

async function getPeriodDetail(
  address: string,
  index: bigint
): Promise<Period> {
  const groupContract = getGroupContract(address);

  return groupContract.getPeriodByIndex(index).then(async (res) => {
    const roundsCount = res.roundsCount.toNumber();
    const dueWinnersCount = res.dueWinnersCount.toNumber();

    const roundsPromises: Promise<ExternalRoundStructOutput>[] = [];
    const dueWinnersPromises: Promise<ExternalMemberStructOutput>[] = [];

    const iterationCount =
      roundsCount > dueWinnersCount ? roundsCount : dueWinnersCount;

    for (let i = 0; i < iterationCount; i++) {
      if (i < roundsCount) {
        roundsPromises.push(
          groupContract.getRoundByIndexAndPeriodIndex(i, index)
        );
      }

      if (i < dueWinnersCount) {
        dueWinnersPromises.push(
          groupContract.getDueWinnerByIndexAndPeriodIndex(i, index)
        );
      }
    }

    const [rounds, dueWinners] = await Promise.all([
      Promise.all(roundsPromises),
      Promise.all(dueWinnersPromises)
    ]);

    return {
      index: index,
      startedAtTimestamp: res.startedAt.toNumber() * 1000,
      endedAtTimestamp: res.endedAt.toNumber() * 1000,
      remainingPeriodBalanceInWei: res.remainingPeriodBalanceInWei.toBigInt(),
      contributionAmountInWei: res.contributionAmountInWei.toBigInt(),
      coordinatorCommissionPercentage:
        res.coordinatorCommissionPercentage.toNumber(),
      prizePercentage: res.prizePercentage.toNumber(),
      // prizeForEachWinnerInWei: res.prizeForEachWinnerInWei.toBigInt(),
      rounds: rounds.map((round) => ({
        drawnAtTimestamp: round.drawnAt.toNumber() * 1000,
        winner: round.winner
          ? {
              walletAddress: round.winner.walletAddress,
              telegramUsername: round.winner.telegramUsername,
              isActiveVoter: round.winner.isActiveVoter,
              latestPeriodParticipation:
                round.winner.latestPeriodParticipation.toNumber()
            }
          : null,
        contributorCount: round.contributorCount.toNumber()
      })),
      dueWinners: dueWinners.map((dueWinner) => ({
        walletAddress: dueWinner.walletAddress,
        telegramUsername: dueWinner.telegramUsername,
        isActiveVoter: dueWinner.isActiveVoter,
        latestPeriodParticipation:
          dueWinner.latestPeriodParticipation.toNumber()
      }))
    };
  });
}

export default async function GroupPeriodDetailPage({
  params: { address, index }
}: {
  params: { address: string; index: string };
}) {
  const period = await getPeriodDetail(address, BigInt(index));

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
      <div className="my-2" />
      <div className="flex">
        <ContributeBtn groupAddress={address} />
        <DrawWinnerBtn groupAddress={address} />
      </div>
      <div className="my-8"></div>
      <p className="text-l md:text-xl font-semibold text-gray-800">
        Rentang Waktu :{' '}
        <ClientDateLocaleString timestamp={period.startedAtTimestamp} /> -{' '}
        {period.endedAtTimestamp > 0 ? (
          <ClientDateLocaleString timestamp={period.endedAtTimestamp} />
        ) : (
          `Belum berakhir`
        )}
      </p>
      <div className="my-2"></div>
      <p className="text-l md:text-xl font-semibold text-gray-800">
        Total Dana Sisa :{' '}
        {ethers.utils.formatEther(period.remainingPeriodBalanceInWei)} BNB
      </p>
      <div className="my-2"></div>
      <p className="text-l md:text-xl font-semibold text-gray-800">
        Syarat Jumlah Kontribusi :{' '}
        {ethers.utils.formatEther(period.contributionAmountInWei)} BNB
      </p>
      <div className="my-2"></div>
      <p className="text-l md:text-xl font-semibold text-gray-800">
        Komisi Koordinator :{' '}
        {ethers.utils.formatEther(
          (period.contributionAmountInWei *
            BigInt(period.rounds[0].contributorCount) *
            BigInt(period.coordinatorCommissionPercentage)) /
            BigInt(100)
        )}{' '}
        BNB
      </p>
      <div className="my-2"></div>
      <p className="text-l md:text-xl font-semibold text-gray-800">
        Jumlah Hadiah Setiap Pemenang :{' '}
        {ethers.utils.formatEther(
          (period.contributionAmountInWei *
            BigInt(period.rounds[0].contributorCount) *
            BigInt(period.prizePercentage)) /
            BigInt(100)
        )}{' '}
        BNB
      </p>
      <div className="my-2"></div>
      <p className="text-l md:text-xl font-semibold text-gray-800">
        Putaran : Ke-{period.rounds.length} dari{' '}
        {period.rounds.filter((round) => round.drawnAtTimestamp).length +
          period.dueWinners.length}{' '}
        total putaran (dihitung berdasarkan jumlah kontributor)
      </p>
      <div className="my-4"></div>
      <table className="table-auto w-full">
        <thead>
          <tr>
            <th colSpan={4} className="border-2 border-gray-500 px-4 py-2">
              Daftar Kontributor
            </th>
          </tr>
          <tr>
            <th className="border-2 border-gray-500 px-4 py-2">
              Wallet address
            </th>
            <th className="border-2 border-gray-500 px-4 py-2">
              Telegram username
            </th>
            <th className="border-2 border-gray-500 px-4 py-2">
              Putaran yang dimenangkan
            </th>
            {/* <th className="border-2 border-gray-500 px-4 py-2">Hadiah</th> */}
          </tr>
        </thead>
        <tbody>
          {period.rounds.map((round, index) => {
            if (
              round.winner?.walletAddress &&
              round.winner.telegramUsername &&
              round.drawnAtTimestamp > 0
            ) {
              return (
                <tr key={index}>
                  <td className="border-2 border-gray-500 px-4 py-2">
                    {round.winner.walletAddress}
                  </td>
                  <td className="border-2 border-gray-500 px-4 py-2">
                    {round.winner.telegramUsername}
                  </td>
                  <td className="border-2 border-gray-500 px-4 py-2">
                    Ke-{index + 1} (
                    {
                      <ClientDateLocaleString
                        timestamp={round.drawnAtTimestamp}
                      />
                    }
                    )
                  </td>
                  {/* <td className="border-2 border-gray-500 px-4 py-2">
                    {ethers.utils.formatEther(
                      (period.contributionAmountInWei *
                        BigInt(period.rounds[0].contributorCount) *
                        BigInt(period.prizePercentage)) /
                        BigInt(100)
                    )}{' '}
                    BNB
                  </td> */}
                </tr>
              );
            }
            return null;
          })}
          {period.dueWinners.map((dueWinner, index) => {
            return (
              <tr key={index}>
                <td className="border-2 border-gray-500 px-4 py-2">
                  {dueWinner.walletAddress}
                </td>
                <td className="border-2 border-gray-500 px-4 py-2">
                  {dueWinner.telegramUsername}
                </td>
                <td className="border-2 border-gray-500 px-4 py-2">
                  Belum menang
                </td>
                {/* <td className="border-2 border-gray-500 px-4 py-2">-</td> */}
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
