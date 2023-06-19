// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.5 <0.9.0;

// import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
// import "@openzeppelin/contracts/utils/Counters.sol";

// contract ArisanGroupFactory {
//     address[] public groupAddreseses;

//     function createGroup(
//         string calldata title,
//         string calldata telegramGroupUrl,
//         string calldata coordinatorTelegramUsername,
//         uint coordinatorRewardPercentage,
//         uint contributionAmountInWei,
//         uint prizePercentage
//     ) external {
//         Group newGroup = new Group(
//             title,
//             telegramGroupUrl,
//             msg.sender,
//             coordinatorTelegramUsername,
//             coordinatorRewardPercentage,
//             contributionAmountInWei,
//             prizePercentage
//         );
//         groupAddreseses.push(address(newGroup));
//     }

//     function getGroupAddreseses() external view returns (address[] memory) {
//         return groupAddreseses;
//     }

//     // function getGroups() external view returns (Group.GroupData[] memory) {
//     //     Group.GroupData[] memory groups = new Group.GroupData[](
//     //         groupAddreseses.length
//     //     );

//     //     for (uint i = 0; i < groupAddreseses.length; i++) {
//     //         Group group = Group(groupAddreseses[i]);

//     //         groups[i] = Group.GroupData({
//     //             groupAddress: groupAddreseses[i],
//     //             title: group.title(),
//     //             telegramGroupUrl: group.telegramGroupUrl(),
//     //             membersCount: group.getMembersCount(),
//     //             isJoined: bytes(group.getMember(msg.sender).telegramUsername)
//     //                 .length != 0
//     //         });
//     //     }

//     //     return groups;
//     // }
// }

// // contract Group {
// //     using Counters for Counters.Counter;
// //     using EnumerableMap for EnumerableMap.AddressToUintMap;

// //     string public title;
// //     string public telegramGroupUrl;
// //     address public coordinator;
// //     uint public coordinatorRewardPercentage;
// //     uint public contributionAmountInWei;
// //     uint public prizePercentage;

// //     // uint public membersCount;
// //     address[] public memberAddresses;
// //     // mapping from address to index in the address list (add 1 to all values so that 0 represents absence)
// //     mapping(address => uint256) public memberIndices;
// //     mapping(address => Member) public members;

// //     uint public activeVotersCount;

// //     Period[] public periods;
// //     mapping(uint => EnumerableMap.AddressToUintMap) periodToParticipantToContributionCountMaps;

// //     Counters.Counter public incompleteProposalsCounter;
// //     Proposal[] proposals;
// //     mapping(uint => mapping(address => ApprovalStatus)) proposalsApprovals;

// //     mapping(uint => string) public stringProposalValues;
// //     mapping(uint => uint) public uintProposalValues;
// //     mapping(uint => address) public coordinatorProposalValues;
// //     mapping(uint => NewMemberVal) public newMemberProposalValues;
// //     mapping(uint => TransferVal) public transferProposalValues;

// //     constructor(
// //         string memory _title,
// //         string memory _telegramGroupUrl,
// //         address _coordinator,
// //         string memory coordinatorTelegramUsername,
// //         uint _coordinatorRewardPercentage,
// //         uint _contributionAmountInWei,
// //         uint _prizePercentage
// //     ) {
// //         title = _title;
// //         telegramGroupUrl = _telegramGroupUrl;
// //         coordinator = _coordinator;
// //         coordinatorRewardPercentage = _coordinatorRewardPercentage;
// //         contributionAmountInWei = _contributionAmountInWei;
// //         prizePercentage = _prizePercentage;

// //         memberAddresses.push(_coordinator);
// //         memberIndices[_coordinator] = memberAddresses.length;
// //         members[_coordinator] = Member({
// //             telegramUsername: coordinatorTelegramUsername,
// //             isActiveVoter: false,
// //             latestPeriodParticipation: 0
// //         });
// //     }

// //     modifier coordinatorOnly() {
// //         require(msg.sender == coordinator);
// //         _;
// //     }

// //     modifier memberOnly() {
// //         require(
// //             _isStringEmpty(members[msg.sender].telegramUsername) == false,
// //             "Anda bukan anggota"
// //         );
// //         _;
// //     }

// //     modifier activeVoterOnly() {
// //         require(
// //             periods.length >= 1 && members[msg.sender].isActiveVoter,
// //             "Anda tidak memiliki hak pilih"
// //         );
// //         _;
// //     }

// //     modifier onlyDuringOngoingPeriod() {
// //         require(
// //             periods.length > 0 && periods[periods.length - 1].endedAt == 0,
// //             "Tidak ada periode yang sedang berlangsung"
// //         );
// //         _;
// //     }

// //     modifier votableProposalOnly(uint index) {
// //         require(
// //             proposals[index].completedAt == 0,
// //             "Proposal ini sudah berakhir"
// //         );
// //         require(
// //             proposalsApprovals[index][msg.sender] == ApprovalStatus.unset,
// //             "Kamu sudah memberi suara pada proposal ini"
// //         );
// //         _;
// //     }

// //     modifier onlyWhenPeriodShouldBeOver() {
// //         Period storage lastPeriod = _getLastPeriod();
// //         require(
// //             periods.length > 0 &&
// //                 lastPeriod.endedAt == 0 &&
// //                 lastPeriod.dueWinners.length == 0 &&
// //                 lastPeriod.totalContributionInWei > 0,
// //             "Tidak ada periode berlangsung yang bisa diakhiri"
// //         );
// //         _;
// //     }

// //     function getMembersCount() external view returns (uint) {
// //         return memberAddresses.length;
// //     }

// //     function getAllMembers()
// //         external
// //         view
// //         memberOnly
// //         returns (Member[] memory)
// //     {
// //         Member[] memory memberList = new Member[](memberAddresses.length);

// //         for (uint256 i = 0; i < memberAddresses.length; i++) {
// //             memberList[i] = members[memberAddresses[i]];
// //         }

// //         return memberList;
// //     }

// //     function getMember(
// //         address memberAddress
// //     ) external view returns (Member memory) {
// //         return members[memberAddress];
// //     }

// //     function _isStringEmpty(string storage value) private view returns (bool) {
// //         return bytes(value).length == 0;
// //     }

// //     function _getLastPeriod() private view returns (Period storage) {
// //         return periods[periods.length - 1];
// //     }

// //     function getGroupInfo()
// //         external
// //         view
// //         returns (string memory, string memory, uint)
// //     {
// //         return (title, telegramGroupUrl, memberAddresses.length);
// //     }

// //     function _getLastRound(
// //         uint periodIndex
// //     ) private view returns (Round storage) {
// //         return
// //             periods[periodIndex].rounds[periods[periodIndex].rounds.length - 1];
// //     }

// //     function _generateRandomIndex(uint256 max) private view returns (uint256) {
// //         return
// //             uint256(
// //                 keccak256(abi.encodePacked(block.timestamp, block.prevrandao))
// //             ) % max;
// //     }

// //     function leave() external memberOnly {
// //         require(
// //             periods.length == 0 ||
// //                 periodToParticipantToContributionCountMaps[periods.length - 1]
// //                     .get(msg.sender) ==
// //                 0,
// //             "Anda masih berpartisipasi pada sebuah periode arisan"
// //         );

// //         uint256 index = memberIndices[msg.sender] - 1;
// //         address lastAddress = memberAddresses[memberAddresses.length - 1];
// //         memberAddresses[index] = lastAddress;
// //         memberIndices[lastAddress] = index + 1;

// //         memberAddresses.pop();
// //         memberIndices[msg.sender] = 0;
// //         delete members[msg.sender];
// //     }

// //     function contribute() public payable memberOnly onlyDuringOngoingPeriod {
// //         Period storage lastPeriod = _getLastPeriod();
// //         uint lastContributionDifference = lastPeriod.rounds.length -
// //             (
// //                 periodToParticipantToContributionCountMaps[periods.length - 1]
// //                     .get(msg.sender)
// //             );

// //         require(
// //             lastContributionDifference == 1,
// //             "Kamu sudah berkontribusi / tidak berpartisipasi pada ronde sebelumnya"
// //         );

// //         uint finalContributionAmountInWei = (lastPeriod
// //             .contributionAmountInWei * lastContributionDifference);

// //         require(
// //             msg.value == finalContributionAmountInWei,
// //             "Jumlah kontribusi salah"
// //         );

// //         if (
// //             periodToParticipantToContributionCountMaps[periods.length - 1].get(
// //                 msg.sender
// //             ) == 0
// //         ) {
// //             lastPeriod.dueWinners.push(msg.sender);
// //         }

// //         periodToParticipantToContributionCountMaps[periods.length - 1].set(
// //             msg.sender,
// //             lastPeriod.rounds.length
// //         );

// //         _getLastRound(periods.length - 1).contributorCount++;
// //         lastPeriod.totalContributionInWei += finalContributionAmountInWei;
// //         lastPeriod.prizeForEachWinnerInWei =
// //             ((lastPeriod.contributionAmountInWei *
// //                 lastPeriod.rounds[0].contributorCount) * prizePercentage) /
// //             100;

// //         Member storage sender = members[msg.sender];
// //         if (sender.isActiveVoter == false) {
// //             sender.isActiveVoter = true;
// //             activeVotersCount++;
// //         }
// //         sender.latestPeriodParticipation = periods.length - 1;
// //     }

// //     function startPeriod() external payable coordinatorOnly {
// //         require(
// //             periods.length == 0 || periods[periods.length - 1].endedAt > 0,
// //             "Periode terakhir belum berakhir"
// //         );
// //         require(
// //             incompleteProposalsCounter.current() == 0,
// //             "Tidak boleh ada proposal yang belum selesai"
// //         );

// //         periods.push();

// //         Period storage newPeriod = _getLastPeriod();

// //         newPeriod.startedAt = block.timestamp;
// //         newPeriod.contributionAmountInWei = contributionAmountInWei;
// //         newPeriod.rounds.push();

// //         contribute();
// //     }

// //     function drawWinner() private coordinatorOnly onlyDuringOngoingPeriod {
// //         Period storage lastPeriod = _getLastPeriod();
// //         address[] storage dueWinners = lastPeriod.dueWinners;

// //         require(
// //             dueWinners.length > 0,
// //             "Semua partisipan sudah mendapatkan giliran sebagai pemenang"
// //         );

// //         Round storage lastRound = _getLastRound(periods.length - 1);

// //         require(
// //             lastRound.contributorCount ==
// //                 periodToParticipantToContributionCountMaps[periods.length - 1]
// //                     .length(),
// //             "Jumlah partisipan belum terpenuhi"
// //         );

// //         uint winnerIndex = _generateRandomIndex(dueWinners.length - 1);

// //         lastRound.drawnAt = block.timestamp;
// //         lastRound.winner = dueWinners[winnerIndex];

// //         dueWinners[winnerIndex] = dueWinners[dueWinners.length - 1];
// //         dueWinners.pop();

// //         if (dueWinners.length > 0) {
// //             lastPeriod.rounds.push(Round(0, address(0), 0));
// //         }
// //     }

// //     function endPeriod() external coordinatorOnly onlyWhenPeriodShouldBeOver {
// //         _getLastPeriod().endedAt = block.timestamp;
// //         removeActiveVoterByCheckIndex(periods.length - 2);
// //     }

// //     function removeActiveVoterByCheckIndex(uint checkIndex) private {
// //         if (checkIndex >= 0) {
// //             EnumerableMap.AddressToUintMap
// //                 storage participantToContributionCount = periodToParticipantToContributionCountMaps[
// //                     checkIndex
// //                 ];
// //             for (
// //                 uint256 i = 0;
// //                 i < participantToContributionCount.length();
// //                 i++
// //             ) {
// //                 (address key, ) = participantToContributionCount.at(i);
// //                 Member storage member = members[key];
// //                 if (
// //                     member.latestPeriodParticipation <= checkIndex &&
// //                     member.isActiveVoter
// //                 ) {
// //                     member.isActiveVoter = false;
// //                     activeVotersCount--;
// //                 }
// //             }
// //         }
// //     }

// //     function _propose(ProposalCategory category) private {
// //         proposals.push(
// //             Proposal({
// //                 category: category,
// //                 proposedAt: block.timestamp,
// //                 proposer: msg.sender,
// //                 completedAt: 0,
// //                 isApproved: false,
// //                 approvalsCount: 0
// //             })
// //         );

// //         incompleteProposalsCounter.increment();
// //     }

// //     function _approveProposal(
// //         uint index
// //     ) private activeVoterOnly votableProposalOnly(index) returns (bool) {
// //         Proposal storage proposal = proposals[index];
// //         proposalsApprovals[index][msg.sender] = ApprovalStatus.approved;
// //         proposal.approvalsCount++;

// //         if (proposal.approvalsCount == activeVotersCount) {
// //             proposal.completedAt = block.timestamp;
// //             proposal.isApproved = true;
// //             return true;
// //         }

// //         return false;
// //     }

// //     function rejectProposal(
// //         uint index
// //     ) external activeVoterOnly votableProposalOnly(index) {
// //         Proposal storage proposal = proposals[index];
// //         proposalsApprovals[index][msg.sender] = ApprovalStatus.rejected;
// //         proposal.completedAt = block.timestamp;
// //     }

// //     function proposeNewString(
// //         string calldata newValue,
// //         ProposalCategory category
// //     ) external memberOnly {
// //         _propose(category);

// //         stringProposalValues[proposals.length - 1] = newValue;
// //     }

// //     function proposeNewContributionAmountInWei(
// //         uint newContributionAmountInWei
// //     ) external memberOnly {
// //         require(
// //             newContributionAmountInWei > 0,
// //             "Jumlah kontribusi tidak boleh 0"
// //         );
// //         _propose(ProposalCategory.contributionAmount);

// //         uintProposalValues[proposals.length - 1] = newContributionAmountInWei;
// //     }

// //     function approveNewTitleProposal(uint index) external activeVoterOnly {
// //         Proposal storage proposal = proposals[index];
// //         require(
// //             proposal.category == ProposalCategory.title,
// //             "Proposal ini bukan untuk judul"
// //         );

// //         if (_approveProposal(index)) {
// //             title = stringProposalValues[index];
// //         }
// //     }

// //     function approveNewTelegramGroupProposal(
// //         uint index
// //     ) external activeVoterOnly {
// //         Proposal storage proposal = proposals[index];
// //         require(
// //             proposal.category == ProposalCategory.telegramGroup,
// //             "Proposal ini bukan untuk grup telegram"
// //         );

// //         if (_approveProposal(index)) {
// //             telegramGroupUrl = stringProposalValues[index];
// //         }
// //     }

// //     function proposeNewMember(
// //         address memberAddress,
// //         string calldata telegramUsername
// //     ) external memberOnly {
// //         _propose(ProposalCategory.newMember);

// //         newMemberProposalValues[proposals.length - 1] = NewMemberVal({
// //             memberAddress: memberAddress,
// //             telegramUsername: telegramUsername
// //         });
// //     }

// //     function approveNewMemberProposal(uint index) external activeVoterOnly {
// //         Proposal storage proposal = proposals[index];
// //         require(
// //             proposal.category == ProposalCategory.newMember,
// //             "Proposal ini bukan untuk anggota baru"
// //         );

// //         if (_approveProposal(index)) {
// //             memberAddresses.push(newMemberProposalValues[index].memberAddress);
// //             memberIndices[msg.sender] = memberAddresses.length;
// //             members[newMemberProposalValues[index].memberAddress] = Member({
// //                 telegramUsername: newMemberProposalValues[index]
// //                     .telegramUsername,
// //                 isActiveVoter: false,
// //                 latestPeriodParticipation: 0
// //             });
// //         }
// //     }

// //     function approveContributionAmountProposal(
// //         uint index
// //     ) external activeVoterOnly {
// //         Proposal storage proposal = proposals[index];
// //         require(
// //             proposal.category == ProposalCategory.contributionAmount,
// //             "Proposal ini bukan untuk jumlah kontribusi"
// //         );

// //         if (_approveProposal(index)) {
// //             contributionAmountInWei = uintProposalValues[index];
// //         }
// //     }

// //     function proposeNewPrizePercentage(
// //         uint newPrizePercentage
// //     ) external memberOnly {
// //         uint limit = 100 - coordinatorRewardPercentage;
// //         require(
// //             newPrizePercentage <= limit && newPrizePercentage >= 0,
// //             "Angka persentase hadiah yang diajukan melebihi batas"
// //         );
// //         _propose(ProposalCategory.prizePercentage);
// //         uintProposalValues[proposals.length - 1] = newPrizePercentage;
// //     }

// //     function approvePrizePercentageProposal(
// //         uint index
// //     ) external activeVoterOnly {
// //         Proposal storage proposal = proposals[index];
// //         require(
// //             proposal.category == ProposalCategory.prizePercentage,
// //             "Proposal ini bukan untuk persentase hadiah"
// //         );

// //         if (_approveProposal(index)) {
// //             prizePercentage = uintProposalValues[index];
// //         }
// //     }

// //     function proposeNewCoordinatorRewardPercentage(
// //         uint newCoordinatorRewardPercentage
// //     ) external memberOnly {
// //         uint limit = 100 - prizePercentage;
// //         require(
// //             newCoordinatorRewardPercentage <= limit &&
// //                 newCoordinatorRewardPercentage >= 0,
// //             "Angka persentase keuntungan koordinator yang diajukan melebihi batas"
// //         );
// //         _propose(ProposalCategory.coordinatorRewardPercentage);
// //         uintProposalValues[
// //             proposals.length - 1
// //         ] = newCoordinatorRewardPercentage;
// //     }

// //     function approveCoordinatorRewardPercentageProposal(
// //         uint index
// //     ) external activeVoterOnly {
// //         Proposal storage proposal = proposals[index];
// //         require(
// //             proposal.category == ProposalCategory.coordinatorRewardPercentage,
// //             "Proposal ini bukan untuk persentase keuntungan koordinator"
// //         );

// //         if (_approveProposal(index)) {
// //             coordinatorRewardPercentage = uintProposalValues[index];
// //         }
// //     }

// //     function proposeTransfer(
// //         address recipient,
// //         uint transferAmount
// //     ) external memberOnly {
// //         _propose(ProposalCategory.transfer);

// //         transferProposalValues[proposals.length - 1] = TransferVal({
// //             transferAmount: transferAmount,
// //             recipient: payable(recipient)
// //         });
// //     }

// //     function approveTransferProposal(uint index) external activeVoterOnly {
// //         Proposal storage proposal = proposals[index];
// //         require(
// //             address(this).balance >=
// //                 transferProposalValues[index].transferAmount,
// //             "Saldo tidak cukup, tunggu sampai saldo cukup untuk melanjutkan voting"
// //         );
// //         require(
// //             proposal.category == ProposalCategory.transfer,
// //             "Kategori proposal bukan transfer"
// //         );

// //         if (_approveProposal(index)) {
// //             transferProposalValues[index].recipient.transfer(
// //                 transferProposalValues[index].transferAmount
// //             );
// //         }
// //     }

// //     enum ApprovalStatus {
// //         unset,
// //         approved,
// //         rejected
// //     }

// //     enum ProposalCategory {
// //         title,
// //         telegramGroup,
// //         coordinatorRewardPercentage,
// //         contributionAmount,
// //         prizePercentage,
// //         newMember,
// //         coordinator,
// //         transfer
// //     }

// //     struct GroupData {
// //         address groupAddress;
// //         string title;
// //         string telegramGroupUrl;
// //         uint membersCount;
// //         bool isJoined;
// //     }

// //     struct Member {
// //         string telegramUsername;
// //         bool isActiveVoter;
// //         // bool hasJoinedPeriod;
// //         uint latestPeriodParticipation;
// //     }

// //     struct Period {
// //         // uint id;
// //         uint startedAt;
// //         uint endedAt;
// //         uint totalContributionInWei;
// //         uint contributionAmountInWei;
// //         uint prizeForEachWinnerInWei;
// //         Round[] rounds;
// //         address[] dueWinners;
// //     }

// //     struct Round {
// //         uint drawnAt;
// //         address winner;
// //         uint contributorCount;
// //     }

// //     struct Proposal {
// //         ProposalCategory category;
// //         uint proposedAt;
// //         address proposer;
// //         uint completedAt;
// //         bool isApproved;
// //         uint approvalsCount;
// //     }

// //     struct StringValProposal {
// //         string newValue;
// //         Proposal detail;
// //     }

// //     struct UintValProposal {
// //         uint newValue;
// //         Proposal detail;
// //     }

// //     struct TitleProposal {
// //         uint proposedAt;
// //         address proposer;
// //         uint completedAt;
// //         bool isApproved;
// //         string newTitle;
// //         uint approvalsCount;
// //     }

// //     struct NewMemberVal {
// //         address memberAddress;
// //         string telegramUsername;
// //     }

// //     struct TransferVal {
// //         address payable recipient;
// //         uint transferAmount;
// //     }

// //     struct CoordinatorProposal {
// //         uint proposedAt;
// //         address proposer;
// //         uint completedAt;
// //         bool isApproved;
// //         address newCoordinator;
// //         uint approvalsCount;
// //     }
// // }
