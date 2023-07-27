import { getGroupContract } from '@root/lib/contracts';
import { PrimaryLinkBtn } from '@root/components/PrimaryLinkBtn';
import staticRpcProvider from '@root/lib/web3';
import { ethers } from 'ethers';
import Link from 'next/link';
import {
  ExternalMemberStructOutput,
  ExternalRoundStructOutput
} from '@root/typechain-types';
import { Period } from '@root/models/iPeriod';
import StartPeriodBtn from './start-period-btn';
import { BigNumber } from 'ethers';
import ClientDateLocaleString from '@root/components/ClientDateLocaleString';

export const dynamic = 'force-dynamic';

async function getPageData(
  address: string
): Promise<[balance: BigNumber, periods: Period[]]> {
  const groupContract = getGroupContract(address);

  return Promise.all([
    staticRpcProvider.getBalance(address),
    groupContract.getPeriodsCount().then(async (periodsCountBigNum) => {
      const periodsCount = periodsCountBigNum.toBigInt();

      const periodPromises: Promise<Period>[] = [];

      for (let i = periodsCount - BigInt(1); i >= BigInt(0); i--) {
        periodPromises.push(
          groupContract.getPeriodByIndex(i).then(async (period) => {
            const roundsCount = period.roundsCount.toNumber();
            const dueWinnersCount = period.dueWinnersCount.toNumber();

            const roundPromises: Promise<ExternalRoundStructOutput>[] = [];
            const dueWinnerPromises: Promise<ExternalMemberStructOutput>[] = [];

            const iterationCount =
              roundsCount > dueWinnersCount ? roundsCount : dueWinnersCount;

            for (
              let innerIndex = 0;
              innerIndex < iterationCount;
              innerIndex++
            ) {
              if (innerIndex < roundsCount) {
                roundPromises.push(
                  groupContract.getRoundByIndexAndPeriodIndex(innerIndex, i)
                );
              }

              if (innerIndex < dueWinnersCount) {
                dueWinnerPromises.push(
                  groupContract.getDueWinnerByIndexAndPeriodIndex(innerIndex, i)
                );
              }
            }

            const [rounds, dueWinners] = await Promise.all([
              Promise.all(roundPromises),
              Promise.all(dueWinnerPromises)
            ]);

            return {
              index: i,
              startedAtTimestamp: period.startedAt.toNumber() * 1000,
              endedAtTimestamp: period.endedAt.toNumber() * 1000,
              remainingPeriodBalanceInWei:
                period.remainingPeriodBalanceInWei.toBigInt(),
              contributionAmountInWei:
                period.contributionAmountInWei.toBigInt(),
              coordinatorCommissionPercentage:
                period.coordinatorCommissionPercentage.toNumber(),
              prizePercentage: period.prizePercentage.toNumber(),
              // prizeForEachWinnerInWei:
              //   period.prizeForEachWinnerInWei.toBigInt(),
              rounds: rounds.map((round) => ({
                drawnAtTimestamp: round.drawnAt.toNumber() * 1000,
                winner: {
                  walletAddress: round.winner.walletAddress,
                  telegramUsername: round.winner.telegramUsername,
                  isActiveVoter: round.winner.isActiveVoter,
                  latestPeriodParticipation:
                    round.winner.latestPeriodParticipation.toNumber()
                },
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
          })
        );
      }

      return await Promise.all(periodPromises);
    })
  ]);
}

export default async function GroupPeriodsPage({
  params: { address }
}: {
  params: { address: string };
}) {
  const [balance, periods] = await getPageData(address);

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div className="flex flex-col">
        <div className="flex">
          <PrimaryLinkBtn text="Beranda" route={`/groups`} className="flex-1" />
          <div className="mx-2"></div>
          <PrimaryLinkBtn
            text="Detail kelompok"
            route={`/groups/${address}`}
            className="flex-1"
          />
        </div>
        <div className="my-2"></div>
        <StartPeriodBtn groupAddress={address} />
      </div>
      <div className="my-8"></div>
      <p className="text-xl md:text-2xl font-semibold text-gray-800">
        Total Saldo Kelompok : {ethers.utils.formatEther(balance)} BNB
      </p>
      <div className="my-4"></div>
      <div className="flex">
        {/* {balance.toBigInt() > BigInt(0) && periods.length > 0 ? ( */}
        {true ? (
          <>
            <p className="text-xl md:text-2xl font-semibold text-gray-800">
              Total Saldo yang Dapat Dikirim :{' '}
              {ethers.utils.formatEther(
                balance.toBigInt() -
                  periods
                    .filter((period) => period.endedAtTimestamp == 0)
                    .reduce(
                      (prev, cur) => prev + cur.remainingPeriodBalanceInWei,
                      BigInt(0)
                    )
              )}{' '}
              BNB
            </p>
            <div className="mx-2" />

            <PrimaryLinkBtn
              text="Usulkan kirim saldo"
              route={`/groups/${address}/periods/transfer`}
            />
          </>
        ) : null}
      </div>

      <div className="my-8"></div>
      <table className="table-auto w-full">
        <thead>
          <tr>
            <th className="border-2 border-gray-500 px-4 py-2">No</th>
            <th className="border-2 border-gray-500 px-4 py-2">
              Rentang Waktu
            </th>
            <th className="border-2 border-gray-500 px-4 py-2">
              Total Dana Sisa
            </th>
            <th className="border-2 border-gray-500 px-4 py-2">
              Syarat Jumlah Kontribusi
            </th>
            {/* <th className="border-2 border-gray-500 px-4 py-2">
              Hadiah Setiap Pemenang
            </th> */}
            <th className="border-2 border-gray-500 px-4 py-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => {
            return (
              <tr key={period.index.toString()}>
                <td className="border-2 border-gray-500 px-4 py-2">
                  {(period.index + BigInt(0)).toString()}
                </td>
                <td className="border-2 border-gray-500 px-4 py-2">
                  <ClientDateLocaleString
                    timestamp={period.startedAtTimestamp}
                  />{' '}
                  -{' '}
                  {period.endedAtTimestamp > 0 ? (
                    <ClientDateLocaleString
                      timestamp={period.endedAtTimestamp}
                    />
                  ) : (
                    `Belum berakhir`
                  )}
                </td>
                <td className="border-2 border-gray-500 px-4 py-2">
                  {ethers.utils.formatEther(period.remainingPeriodBalanceInWei)}{' '}
                  BNB
                </td>
                <td className="border-2 border-gray-500 px-4 py-2">
                  {ethers.utils.formatEther(period.contributionAmountInWei)} BNB
                </td>
                {/* <td className="border-2 border-gray-500 px-4 py-2">
                  {ethers.utils.formatEther(period.prizeForEachWinnerInWei)} BNB
                </td> */}
                <td className="hover:underline border-2 border-gray-500 px-4 py-2">
                  <Link href={`/groups/${address}/periods/${period.index}`}>
                    Lihat Detail
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
