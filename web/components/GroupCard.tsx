import Link from 'next/link';
import React from 'react';
import { AncorAlternativeUrl } from './AnchorAlternativeUrl';
import { GroupData, JoinStatus } from '@root/models/iGroupData';

const GroupCard = ({ group }: { group: GroupData }) => {
  console.log('cek group : ', group);
  let joinStatusText = '';
  if (group.joinStatus === JoinStatus.joined) {
    joinStatusText = 'Sudah bergabung';
  } else if (group.joinStatus === JoinStatus.waitingApproval) {
    joinStatusText = 'Menunggu persetujuan bergabung';
  } else if (group.joinStatus === JoinStatus.unknown) {
    joinStatusText = 'Status hanya terlihat saat wallet terhubung';
  } else {
    joinStatusText = 'Belum bergabung';
  }

  let redirectRoute = '';

  if (group.joinStatus == JoinStatus.joined) {
    redirectRoute = `/groups/${group.groupAddress}`;
  } else if (group.joinStatus == JoinStatus.notjoined) {
    redirectRoute = `/groups/${group.groupAddress}/join`;
  }
  return (
    <Link href={redirectRoute}>
      <div className="p-4 h-[150px] bg-white shadow-md rounded-lg overflow-hidden">
        <h3 className="text-xl font-bold mb-2 line-clamp-2">{group.title}</h3>
        <div className="my-2" />
        <AncorAlternativeUrl url={group.telegramGroupUrl} />
        {/* <a
          href={group.telegramGroupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline line-clamp-2"
        >
          {group.telegramGroupUrl}
        </a> */}
        <div className="my-2" />
        <p className="text-gray-600">
          Anggota : {group.membersCount} ({joinStatusText})
        </p>
        <div className="my-2" />
        <p className="text-gray-600"></p>
      </div>
    </Link>
  );
};

export default GroupCard;
