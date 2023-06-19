export enum JoinStatus {
  joined = 0,
  waitingApproval = 1,
  notjoined = 2,
  unknown = 3
}

export interface GroupData {
  groupAddress: string;
  title: string;
  telegramGroupUrl: string;
  membersCount: number;
  joinStatus: JoinStatus;
}
