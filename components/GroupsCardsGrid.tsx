'use client';

import { useEffect, useState } from 'react';
import GroupCard from './GroupCard';
import { useWeb3Context } from '../contexts';
import Center from './Center';
import { GroupData } from '@root/models/iGroupData';
import {
  getConnectedGroupContract,
  getGroupContract,
  mainContract
} from '@root/lib/contracts';
import LoadingOverlay from './LoadingOverlay';
import Loading from './Loading';

export default function GroupsCardsGrid() {
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const { web3Provider } = useWeb3Context();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const groupAddresses = await mainContract.getGroupAddreseses();
        const groups = await Promise.all(
          groupAddresses.map((address) => {
            if (web3Provider) {
              const groupContract = getConnectedGroupContract(
                web3Provider.getSigner(),
                address
              );
              return groupContract.getGroupDetail();
            } else {
              const groupContract = getGroupContract(address);
              return groupContract.getGroupDetail();
            }
          })
        );

        setGroups(
          groups.map((res) => {
            return {
              groupAddress: res.groupAddress,
              title: res.title,
              telegramGroupUrl: res.telegramGroupUrl,
              membersCount: res.membersCount.toNumber(),
              joinStatus: res.joinStatus
            };
          })
        );
      } catch (error) {
        console.error(error);
        setError(new Error('Failed to retrieve groups : ' + error));
      }
      setIsLoading(false);
    }
    fetchData();
  }, [web3Provider]);

  //   if (!web3Provider) {
  //     return (
  //       <div className="w-full border-2 border-gray-800">
  //         <Center>
  //           <p className="text-xl md:text-2xl font-semibold text-gray-400">
  //             Hubungkan wallet anda terlebih dahulu untuk memuat data grup
  //           </p>
  //         </Center>
  //       </div>
  //     );
  //   }

  if (isLoading) {
    return (
      <Center>
        <Loading isLoading={isLoading} />
      </Center>
    );
  }

  if (error) {
    return (
      <div className="w-full border-2 border-gray-800">
        <Center>
          <p className="text-xl md:text-2xl font-semibold text-gray-400">
            Error {error.message}
          </p>
        </Center>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="w-full border-2 border-gray-800">
        <Center>
          <p className="text-xl md:text-2xl font-semibold text-gray-400">
            Masih belum ada grup yang dibuat
          </p>
        </Center>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {groups.map((group) => (
          <GroupCard key={group.groupAddress} group={group} />
        ))}
      </div>
    </>
  );
}
