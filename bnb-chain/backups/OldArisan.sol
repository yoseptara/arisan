// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.5 <0.9.0;

// // Uncomment this line to use console.log
// // import "hardhat/console.sol";
// import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
// import "@openzeppelin/contracts/utils/Counters.sol";

// contract ArisanGroupFactory {
//     address[] public groupAddreseses;

//     function createGroup(
//         string memory title,
//         string memory telegramGroupUrl,
//         uint coordinatorRewardPercentage,
//         uint contributionAmountInBNB,
//         uint prizePercentage,
//         uint votingEligibilityThreshold
//     ) external {
//         Group newGroup = new Group(
//             title,
//             telegramGroupUrl,
//             msg.sender,
//             coordinatorRewardPercentage,
//             contributionAmountInBNB,
//             prizePercentage,
//             votingEligibilityThreshold
//         );
//         groupAddreseses.push(address(newGroup));
//     }

//     function getGroupAddreseses() public view returns (address[] memory) {
//         return groupAddreseses;
//     }
// }

// contract Group {
//     using Counters for Counters.Counter;
//     using EnumerableMap for EnumerableMap.AddressToUintMap;

//     string public title;
//     string public telegramGroupUrl;
//     address public coordinator;
//     uint public coordinatorRewardPercentage;
//     uint public contributionAmountInBNB;
//     uint public prizePercentage;
//     uint public votingEligibilityThreshold;

//     uint public activeVotersCount;
//     uint public membersCount;
//     mapping(address => Member) public members;

//     Period[] public periods;
//     mapping(uint => EnumerableMap.AddressToUintMap) periodToParticipantToContributionCountMaps;

//     enum ApprovalStatus {
//         unset,
//         approved,
//         rejected
//     }

//     mapping(uint => TitleProposal) titleProposals;
//     mapping(uint => mapping(address => ApprovalStatus)) titleProposalsApprovals;
//     Counters.Counter public titleProposalsCounter;

//     mapping(uint => TelegramGroupProposal) tgGroupProposals;
//     mapping(uint => mapping(address => ApprovalStatus)) tgGroupProposalsApprovals;
//     Counters.Counter public tgGroupProposalsCounter;

//     mapping(uint => NewMemberProposal) newMemberProposals;
//     mapping(uint => mapping(address => ApprovalStatus)) newMemberProposalsApprovals;
//     Counters.Counter public newMemberProposalsCounter;

//     mapping(uint => CoordinatorProposal) coordinatorProposals;
//     mapping(uint => mapping(address => ApprovalStatus)) coordinatorProposalsApprovals;
//     Counters.Counter public coordinatorProposalsCounter;

//     mapping(uint => CoordinatorRewardPercentageProposal) coordinatorRewardPercentageProposals;
//     mapping(uint => mapping(address => ApprovalStatus)) coordinatorRewardPercentageProposalsApprovals;
//     Counters.Counter public coordinatorRewardPercentageProposalsCounter;

//     mapping(uint => ContributionAmountProposal) contributionAmountProposals;
//     mapping(uint => mapping(address => ApprovalStatus)) contributionAmountProposalsApprovals;
//     Counters.Counter public contributionAmountProposalsCounter;

//     mapping(uint => PrizePercentageProposal) prizePercentageProposals;
//     mapping(uint => mapping(address => ApprovalStatus)) prizePercentageProposalsApprovals;
//     Counters.Counter public prizePercentageProposalsCounter;

//     mapping(uint => TransferProposal) transferProposals;
//     mapping(uint => mapping(address => ApprovalStatus)) transferProposalsApprovals;
//     Counters.Counter public transferProposalsCounter;

//     mapping(uint => VotingEligibilityThresholdProposal) votingEligibilityThresholdProposals;
//     mapping(uint => mapping(address => ApprovalStatus)) votingEligibilityThresholdProposalsApprovals;
//     Counters.Counter public votingEligibilityThresholdProposalsCounter;

//     constructor(
//         string memory _title,
//         string memory _telegramGroupUrl,
//         address _coordinator,
//         uint _coordinatorRewardPercentage,
//         uint _contributionAmountInBNB,
//         uint _prizePercentage,
//         uint _votingEligibilityThreshold
//     ) {
//         title = _title;
//         telegramGroupUrl = _telegramGroupUrl;
//         coordinator = _coordinator;
//         coordinatorRewardPercentage = _coordinatorRewardPercentage;
//         contributionAmountInBNB = _contributionAmountInBNB;
//         prizePercentage = _prizePercentage;

//         votingEligibilityThreshold = _votingEligibilityThreshold;
//     }

//     modifier coordinatorOnly() {
//         require(msg.sender == coordinator);
//         _;
//     }

//     modifier memberOnly() {
//         require(_isThisStringVarEmpty(members[msg.sender].tgUsername) == false);
//         _;
//     }

//     modifier activeVoterOnly() {
//         require(members[msg.sender].isActiveVoter);
//         _;
//     }

//     modifier onlyDuringOngoingPeriod() {
//         require(
//             periods.length > 0 && periods[periods.length - 1].endedAt == 0,
//             "There is no ongoing period"
//         );
//         _;
//     }

//     modifier onlyWhenPeriodShouldBeOver() {
//         Period storage lastPeriod = _getLastPeriod();
//         require(
//             periods.length > 0 &&
//                 lastPeriod.endedAt == 0 &&
//                 lastPeriod.dueWinners.length == 0 &&
//                 lastPeriod.totalContributionInBNB > 0,
//             "There is no ongoing period that can be ended"
//         );
//         _;
//     }

//     function _isThisStringVarEmpty(
//         string storage value
//     ) private view returns (bool) {
//         return bytes(value).length == 0;
//         // keccak256(abi.encodePacked(value)) !=
//         // keccak256(abi.encodePacked(""));
//     }

//     function _getLastPeriod() private view returns (Period storage) {
//         return periods[periods.length - 1];
//     }

//     function _getLastRound(
//         uint periodIndex
//     ) private view returns (Round storage) {
//         return
//             periods[periodIndex].rounds[periods[periodIndex].rounds.length - 1];
//     }

//     function _generateRandomIndex(uint256 max) private view returns (uint256) {
//         return
//             uint256(
//                 keccak256(abi.encodePacked(block.timestamp, block.prevrandao))
//             ) % max;
//     }

//     function contribute() public payable memberOnly onlyDuringOngoingPeriod {
//         Period storage lastPeriod = _getLastPeriod();
//         uint lastContributionDifference = lastPeriod.rounds.length -
//             (
//                 periodToParticipantToContributionCountMaps[periods.length - 1]
//                     .get(msg.sender)
//             );

//         require(
//             lastContributionDifference == 1,
//             "you already contributed / didn't join previous round"
//         );

//         uint finalContributionAmountInBNB = (lastPeriod
//             .contributionAmountInBNB * lastContributionDifference);

//         require(
//             msg.value == finalContributionAmountInBNB,
//             "Invalid contribution amount"
//         );

//         if (
//             periodToParticipantToContributionCountMaps[periods.length - 1].get(
//                 msg.sender
//             ) == 0
//         ) {
//             lastPeriod.dueWinners.push(msg.sender);
//         }

//         periodToParticipantToContributionCountMaps[periods.length - 1].set(
//             msg.sender,
//             lastPeriod.rounds.length
//         );

//         _getLastRound(periods.length - 1).contributorCount++;
//         lastPeriod.totalContributionInBNB += finalContributionAmountInBNB;
//         lastPeriod.prizeForEachWinnerInBNB =
//             ((lastPeriod.contributionAmountInBNB *
//                 lastPeriod.rounds[0].contributorCount) * prizePercentage) /
//             100;

//         Member storage sender = members[msg.sender];
//         // sender.totalContributionInBNB += finalContributionAmountInBNB;
//         if (sender.isActiveVoter == false) {
//             sender.isActiveVoter = true;
//             activeVotersCount++;
//         }

//         sender.latestPeriodParticipation = periods.length;
//     }

//     function startPeriod() external payable coordinatorOnly {
//         require(
//             periods.length == 0 || periods[periods.length - 1].endedAt > 0,
//             "Last period is not ended"
//         );

//         Period memory newPeriod = Period({
//             // id: (periods.length + 1),
//             startedAt: block.timestamp,
//             endedAt: 0,
//             totalContributionInBNB: 0,
//             contributionAmountInBNB: contributionAmountInBNB,
//             prizeForEachWinnerInBNB: 0,
//             rounds: new Round[](1),
//             dueWinners: new address[](0)
//         });

//         periods.push(newPeriod);
//         contribute();
//     }

//     function drawWinner() private coordinatorOnly onlyDuringOngoingPeriod {
//         Period storage lastPeriod = _getLastPeriod();
//         address[] storage dueWinners = lastPeriod.dueWinners;

//         require(
//             dueWinners.length > 0,
//             "all contributors have won in this period"
//         );

//         Round storage lastRound = _getLastRound(periods.length - 1);

//         require(
//             lastRound.contributorCount ==
//                 periodToParticipantToContributionCountMaps[periods.length - 1]
//                     .length(),
//             "contributors is not enough"
//         );

//         uint winnerIndex = _generateRandomIndex(dueWinners.length - 1);

//         lastRound.drawnAt = block.timestamp;
//         lastRound.winner = dueWinners[winnerIndex];

//         dueWinners[winnerIndex] = dueWinners[dueWinners.length - 1];
//         dueWinners.pop();

//         if (dueWinners.length > 0) {
//             lastPeriod.rounds.push(Round(0, address(0), 0));
//         }
//     }

//     function endPeriod() external coordinatorOnly onlyWhenPeriodShouldBeOver {
//         _getLastPeriod().endedAt = block.timestamp;

//         uint checkIndex = periods.length - 1 - votingEligibilityThreshold;

//         setActiveVoterByCheckIndex(checkIndex);
//     }

// function setActiveVoterByCheckIndex(uint checkIndex) private {
//     if (checkIndex >= 0) {
//         EnumerableMap.AddressToUintMap
//             storage participantToContributionCount = periodToParticipantToContributionCountMaps[
//                 checkIndex
//             ];
//         for (
//             uint256 i = 0;
//             i < participantToContributionCount.length();
//             i++
//         ) {
//             (address key, ) = participantToContributionCount.at(i);
//             if (
//                 members[key].latestPeriodParticipation <= checkIndex &&
//                 members[key].isActiveVoter
//             ) {
//                 members[key].isActiveVoter = false;
//                 activeVotersCount--;
//             }
//         }
//     }
// }

//     function proposeNewTitle(string calldata newTitle) external memberOnly {
//         require(
//             titleProposals[titleProposalsCounter.current()].completedAt != 0,
//             "previous proposal is not complete"
//         );

//         titleProposalsCounter.increment();
//         titleProposals[titleProposalsCounter.current()] = TitleProposal({
//             proposedAt: block.timestamp,
//             proposer: msg.sender,
//             completedAt: 0,
//             isApproved: false,
//             newTitle: newTitle,
//             approvalsCount: 0
//         });
//     }

//     function approveNewTitleProposal() external activeVoterOnly {
//         require(
//             titleProposals[titleProposalsCounter.current()].completedAt == 0,
//             "This proposal is already completed"
//         );

//         require(
//             titleProposalsApprovals[titleProposalsCounter.current()][
//                 msg.sender
//             ] == ApprovalStatus.unset,
//             "You already voted this proposal"
//         );

//         titleProposalsApprovals[titleProposalsCounter.current()][
//             msg.sender
//         ] = ApprovalStatus.approved;

//         titleProposals[titleProposalsCounter.current()].approvalsCount++;

//         if (
//             titleProposals[titleProposalsCounter.current()].approvalsCount ==
//             activeVotersCount
//         ) {
//             titleProposals[titleProposalsCounter.current()].completedAt = block
//                 .timestamp;
//             titleProposals[titleProposalsCounter.current()].isApproved = true;
//             title = titleProposals[titleProposalsCounter.current()].newTitle;
//         }
//     }

//     function rejectNewTitleProposal() external activeVoterOnly {
//         require(
//             titleProposals[titleProposalsCounter.current()].completedAt == 0,
//             "This proposal is already completed"
//         );

//         require(
//             titleProposalsApprovals[titleProposalsCounter.current()][
//                 msg.sender
//             ] == ApprovalStatus.unset,
//             "You already voted this proposal"
//         );

//         titleProposalsApprovals[titleProposalsCounter.current()][
//             msg.sender
//         ] = ApprovalStatus.rejected;

//         titleProposals[titleProposalsCounter.current()].completedAt = block
//             .timestamp;
//     }

//     function proposeNewTelegramGroup(string calldata url) external memberOnly {
//         require(
//             tgGroupProposals[tgGroupProposalsCounter.current()].completedAt !=
//                 0,
//             "previous proposal is not complete"
//         );

//         tgGroupProposalsCounter.increment();
//         tgGroupProposals[
//             tgGroupProposalsCounter.current()
//         ] = TelegramGroupProposal({
//             proposedAt: block.timestamp,
//             proposer: msg.sender,
//             completedAt: 0,
//             isApproved: false,
//             newTelegramGroupUrl: url,
//             approvalsCount: 0
//         });
//     }

//     function approveNewTgGroupProposal() external activeVoterOnly {
//         require(
//             tgGroupProposals[tgGroupProposalsCounter.current()].completedAt ==
//                 0,
//             "This proposal is already completed"
//         );

//         require(
//             tgGroupProposalsApprovals[tgGroupProposalsCounter.current()][
//                 msg.sender
//             ] == ApprovalStatus.unset,
//             "You already voted this proposal"
//         );

//         tgGroupProposalsApprovals[tgGroupProposalsCounter.current()][
//             msg.sender
//         ] = ApprovalStatus.approved;

//         tgGroupProposals[tgGroupProposalsCounter.current()].approvalsCount++;

//         if (
//             tgGroupProposals[tgGroupProposalsCounter.current()]
//                 .approvalsCount == activeVotersCount
//         ) {
//             tgGroupProposals[tgGroupProposalsCounter.current()]
//                 .completedAt = block.timestamp;
//             tgGroupProposals[tgGroupProposalsCounter.current()]
//                 .isApproved = true;
//             telegramGroupUrl = tgGroupProposals[
//                 tgGroupProposalsCounter.current()
//             ].newTelegramGroupUrl;
//         }
//     }

//     function rejectNewTgGroupProposal() external activeVoterOnly {
//         require(
//             tgGroupProposals[tgGroupProposalsCounter.current()].completedAt ==
//                 0,
//             "This proposal is already completed"
//         );

//         require(
//             tgGroupProposalsApprovals[tgGroupProposalsCounter.current()][
//                 msg.sender
//             ] == ApprovalStatus.unset,
//             "You already voted this proposal"
//         );

//         tgGroupProposalsApprovals[tgGroupProposalsCounter.current()][
//             msg.sender
//         ] = ApprovalStatus.rejected;

//         tgGroupProposals[tgGroupProposalsCounter.current()].completedAt = block
//             .timestamp;
//     }

//     // NewMemberProposal
//     function proposeNewMember(
//         address memberAddress,
//         string calldata tgUsername
//     ) external memberOnly {
//         require(
//             newMemberProposals[newMemberProposalsCounter.current()]
//                 .completedAt != 0,
//             "previous proposal is not complete"
//         );

//         newMemberProposalsCounter.increment();
//         newMemberProposals[
//             newMemberProposalsCounter.current()
//         ] = NewMemberProposal({
//             proposedAt: block.timestamp,
//             proposer: msg.sender,
//             completedAt: 0,
//             isApproved: false,
//             memberAddress: memberAddress,
//             tgUsername: tgUsername,
//             approvalsCount: 0
//         });
//     }

//     function approveNewMemberProposal() external activeVoterOnly {
//         require(
//             newMemberProposals[newMemberProposalsCounter.current()]
//                 .completedAt == 0,
//             "This proposal is already completed"
//         );

//         require(
//             newMemberProposalsApprovals[newMemberProposalsCounter.current()][
//                 msg.sender
//             ] == ApprovalStatus.unset,
//             "You already voted this proposal"
//         );

//         newMemberProposalsApprovals[newMemberProposalsCounter.current()][
//             msg.sender
//         ] = ApprovalStatus.approved;
//         newMemberProposals[newMemberProposalsCounter.current()]
//             .approvalsCount++;

//         if (
//             newMemberProposals[newMemberProposalsCounter.current()]
//                 .approvalsCount == activeVotersCount
//         ) {
//             newMemberProposals[newMemberProposalsCounter.current()]
//                 .completedAt = block.timestamp;
//             newMemberProposals[newMemberProposalsCounter.current()]
//                 .isApproved = true;

//             members[
//                 newMemberProposals[newMemberProposalsCounter.current()]
//                     .memberAddress
//             ] = Member({
//                 tgUsername: newMemberProposals[
//                     newMemberProposalsCounter.current()
//                 ].tgUsername,
//                 isActiveVoter: false,
//                 latestPeriodParticipation: 0
//             });
//         }
//     }

//     function rejectNewMemberProposal() external activeVoterOnly {
//         require(
//             newMemberProposals[newMemberProposalsCounter.current()]
//                 .completedAt == 0,
//             "This proposal is already completed"
//         );

//         require(
//             newMemberProposalsApprovals[newMemberProposalsCounter.current()][
//                 msg.sender
//             ] == ApprovalStatus.unset,
//             "You already voted this proposal"
//         );

//         newMemberProposalsApprovals[newMemberProposalsCounter.current()][
//             msg.sender
//         ] = ApprovalStatus.rejected;
//         newMemberProposals[newMemberProposalsCounter.current()]
//             .completedAt = block.timestamp;
//     }

//     // ContributionAmountProposal
//     function proposeContributionAmount(
//         uint newContributionAmount
//     ) external memberOnly {
//         require(
//             contributionAmountProposals[
//                 contributionAmountProposalsCounter.current()
//             ].completedAt != 0,
//             "previous proposal is not complete"
//         );

//         contributionAmountProposalsCounter.increment();
//         contributionAmountProposals[
//             contributionAmountProposalsCounter.current()
//         ] = ContributionAmountProposal({
//             proposedAt: block.timestamp,
//             proposer: msg.sender,
//             completedAt: 0,
//             isApproved: false,
//             newContributionAmount: newContributionAmount,
//             approvalsCount: 0
//         });
//     }

//     function approveContributionAmountProposal() external activeVoterOnly {
//         require(
//             contributionAmountProposals[
//                 contributionAmountProposalsCounter.current()
//             ].completedAt == 0,
//             "This proposal is already completed"
//         );

//         require(
//             contributionAmountProposalsApprovals[
//                 contributionAmountProposalsCounter.current()
//             ][msg.sender] == ApprovalStatus.unset,
//             "You already voted this proposal"
//         );

//         contributionAmountProposalsApprovals[
//             contributionAmountProposalsCounter.current()
//         ][msg.sender] = ApprovalStatus.approved;
//         contributionAmountProposals[
//             contributionAmountProposalsCounter.current()
//         ].approvalsCount++;

//         if (
//             contributionAmountProposals[
//                 contributionAmountProposalsCounter.current()
//             ].approvalsCount == activeVotersCount
//         ) {
//             contributionAmountProposals[
//                 contributionAmountProposalsCounter.current()
//             ].completedAt = block.timestamp;

//             contributionAmountProposals[
//                 contributionAmountProposalsCounter.current()
//             ].isApproved = true;

//             contributionAmountInBNB = contributionAmountProposals[
//                 contributionAmountProposalsCounter.current()
//             ].newContributionAmount;
//         }
//     }

//     function rejectContributionAmountProposal() external activeVoterOnly {
//         require(
//             contributionAmountProposals[
//                 contributionAmountProposalsCounter.current()
//             ].completedAt == 0,
//             "This proposal is already completed"
//         );

//         require(
//             contributionAmountProposalsApprovals[
//                 contributionAmountProposalsCounter.current()
//             ][msg.sender] == ApprovalStatus.unset,
//             "You already voted this proposal"
//         );

//         contributionAmountProposalsApprovals[
//             contributionAmountProposalsCounter.current()
//         ][msg.sender] = ApprovalStatus.rejected;
//         contributionAmountProposals[
//             contributionAmountProposalsCounter.current()
//         ].completedAt = block.timestamp;
//     }

//     // PrizePercentageProposal
//     function proposePrizePercentage(
//         uint newPrizePercentage
//     ) external memberOnly {
//         require(
//             prizePercentageProposals[prizePercentageProposalsCounter.current()]
//                 .completedAt != 0,
//             "previous proposal is not complete"
//         );

//         prizePercentageProposalsCounter.increment();
//         prizePercentageProposals[
//             prizePercentageProposalsCounter.current()
//         ] = PrizePercentageProposal({
//             proposedAt: block.timestamp,
//             proposer: msg.sender,
//             completedAt: 0,
//             isApproved: false,
//             newPrizePercentage: newPrizePercentage,
//             approvalsCount: 0
//         });
//     }

//     function approvePrizePercentageProposal() external activeVoterOnly {
//         require(
//             prizePercentageProposals[prizePercentageProposalsCounter.current()]
//                 .completedAt == 0,
//             "This proposal is already completed"
//         );

//         require(
//             prizePercentageProposalsApprovals[
//                 prizePercentageProposalsCounter.current()
//             ][msg.sender] == ApprovalStatus.unset,
//             "You already voted this proposal"
//         );

//         prizePercentageProposalsApprovals[
//             prizePercentageProposalsCounter.current()
//         ][msg.sender] = ApprovalStatus.approved;
//         prizePercentageProposals[prizePercentageProposalsCounter.current()]
//             .approvalsCount++;

//         if (
//             prizePercentageProposals[prizePercentageProposalsCounter.current()]
//                 .approvalsCount == activeVotersCount
//         ) {
//             prizePercentageProposals[prizePercentageProposalsCounter.current()]
//                 .completedAt = block.timestamp;

//             prizePercentageProposals[prizePercentageProposalsCounter.current()]
//                 .isApproved = true;

//             prizePercentage = prizePercentageProposals[
//                 prizePercentageProposalsCounter.current()
//             ].newPrizePercentage;
//         }
//     }

//     function rejectPrizePercentageProposal() external activeVoterOnly {
//         require(
//             prizePercentageProposals[prizePercentageProposalsCounter.current()]
//                 .completedAt == 0,
//             "This proposal is already completed"
//         );

//         require(
//             prizePercentageProposalsApprovals[
//                 prizePercentageProposalsCounter.current()
//             ][msg.sender] == ApprovalStatus.unset,
//             "You already voted this proposal"
//         );

//         prizePercentageProposalsApprovals[
//             prizePercentageProposalsCounter.current()
//         ][msg.sender] = ApprovalStatus.rejected;
//         prizePercentageProposals[prizePercentageProposalsCounter.current()]
//             .completedAt = block.timestamp;
//     }

//     // TransferProposal
//     function proposeTransfer(
//         address recipient,
//         uint transferAmount
//     ) external memberOnly {
//         require(
//             address(this).balance >=
//                 transferProposals[transferProposalsCounter.current()]
//                     .transferAmount,
//             "balance not enough"
//         );
//         require(
//             transferProposals[transferProposalsCounter.current()].completedAt !=
//                 0,
//             "previous proposal is not complete"
//         );

//         transferProposalsCounter.increment();
//         transferProposals[
//             transferProposalsCounter.current()
//         ] = TransferProposal({
//             proposedAt: block.timestamp,
//             proposer: msg.sender,
//             completedAt: 0,
//             isApproved: false,
//             transferAmount: transferAmount,
//             recipient: payable(recipient),
//             approvalsCount: 0
//         });
//     }

//     function approveTransferProposal() external activeVoterOnly {
//         require(
//             transferProposals[transferProposalsCounter.current()].completedAt ==
//                 0,
//             "This proposal is already completed"
//         );

//         require(
//             transferProposalsApprovals[transferProposalsCounter.current()][
//                 msg.sender
//             ] == ApprovalStatus.unset,
//             "You already voted this proposal"
//         );

//         transferProposalsApprovals[transferProposalsCounter.current()][
//             msg.sender
//         ] = ApprovalStatus.approved;
//         transferProposals[transferProposalsCounter.current()].approvalsCount++;

//         if (
//             transferProposals[transferProposalsCounter.current()]
//                 .approvalsCount == activeVotersCount
//         ) {
//             transferProposals[transferProposalsCounter.current()]
//                 .completedAt = block.timestamp;
//             transferProposals[transferProposalsCounter.current()]
//                 .isApproved = true;

//             require(
//                 address(this).balance >=
//                     transferProposals[transferProposalsCounter.current()]
//                         .transferAmount,
//                 "balance not enough"
//             );

//             transferProposals[transferProposalsCounter.current()]
//                 .recipient
//                 .transfer(
//                     transferProposals[transferProposalsCounter.current()]
//                         .transferAmount
//                 );
//         }
//     }

//     function rejectTransferProposal() external activeVoterOnly {
//         require(
//             transferProposals[transferProposalsCounter.current()].completedAt ==
//                 0,
//             "This proposal is already completed"
//         );

//         require(
//             transferProposalsApprovals[transferProposalsCounter.current()][
//                 msg.sender
//             ] == ApprovalStatus.unset,
//             "You already voted this proposal"
//         );

//         transferProposalsApprovals[transferProposalsCounter.current()][
//             msg.sender
//         ] = ApprovalStatus.rejected;
//         transferProposals[transferProposalsCounter.current()]
//             .completedAt = block.timestamp;
//     }

//     // VotingEligibilityThresholdProposal
//     function proposeVotingEligibilityThreshold(
//         uint newVotingEligibilityThreshold
//     ) external memberOnly {
//         require(
//             votingEligibilityThresholdProposals[
//                 votingEligibilityThresholdProposalsCounter.current()
//             ].completedAt != 0,
//             "previous proposal is not complete"
//         );

//         votingEligibilityThresholdProposalsCounter.increment();
//         votingEligibilityThresholdProposals[
//             votingEligibilityThresholdProposalsCounter.current()
//         ] = VotingEligibilityThresholdProposal({
//             proposedAt: block.timestamp,
//             proposer: msg.sender,
//             completedAt: 0,
//             isApproved: false,
//             newVotingEligibilityThreshold: newVotingEligibilityThreshold,
//             approvalsCount: 0
//         });
//     }

//     function approveVotingEligibilityThresholdProposal()
//         external
//         activeVoterOnly
//     {
//         require(
//             votingEligibilityThresholdProposals[
//                 votingEligibilityThresholdProposalsCounter.current()
//             ].completedAt == 0,
//             "This proposal is already completed"
//         );

//         require(
//             votingEligibilityThresholdProposalsApprovals[
//                 votingEligibilityThresholdProposalsCounter.current()
//             ][msg.sender] == ApprovalStatus.unset,
//             "You already voted this proposal"
//         );

//         votingEligibilityThresholdProposalsApprovals[
//             votingEligibilityThresholdProposalsCounter.current()
//         ][msg.sender] = ApprovalStatus.approved;
//         votingEligibilityThresholdProposals[
//             votingEligibilityThresholdProposalsCounter.current()
//         ].approvalsCount++;

//         if (
//             votingEligibilityThresholdProposals[
//                 votingEligibilityThresholdProposalsCounter.current()
//             ].approvalsCount == activeVotersCount
//         ) {
//             votingEligibilityThresholdProposals[
//                 votingEligibilityThresholdProposalsCounter.current()
//             ].completedAt = block.timestamp;

//             votingEligibilityThresholdProposals[
//                 votingEligibilityThresholdProposalsCounter.current()
//             ].isApproved = true;

//             uint oldVotingEligibilityThreshold = votingEligibilityThreshold;

//             votingEligibilityThreshold = votingEligibilityThresholdProposals[
//                 votingEligibilityThresholdProposalsCounter.current()
//             ].newVotingEligibilityThreshold;

//             if (oldVotingEligibilityThreshold < votingEligibilityThreshold) {
//                 uint difference = votingEligibilityThreshold -
//                     oldVotingEligibilityThreshold;

//                 for (uint i = 1; i <= difference; i++) {
//                     uint checkIndex = periods.length -
//                         1 -
//                         oldVotingEligibilityThreshold -
//                         i;

//                     setActiveVoterByCheckIndex(checkIndex);
//                 }
//             } else if (
//                 votingEligibilityThreshold < oldVotingEligibilityThreshold
//             ) {
//                 uint difference = oldVotingEligibilityThreshold -
//                     votingEligibilityThreshold;

//                 for (uint i = 1; i <= difference; i++) {
//                     uint checkIndex = periods.length -
//                         1 -
//                         oldVotingEligibilityThreshold +
//                         i;

//                     setActiveVoterByCheckIndex(checkIndex);
//                 }
//             }
//         }
//     }

//     function rejectVotingEligibilityThresholdProposal()
//         external
//         activeVoterOnly
//     {
//         require(
//             votingEligibilityThresholdProposals[
//                 votingEligibilityThresholdProposalsCounter.current()
//             ].completedAt == 0,
//             "This proposal is already completed"
//         );

//         require(
//             votingEligibilityThresholdProposalsApprovals[
//                 votingEligibilityThresholdProposalsCounter.current()
//             ][msg.sender] == ApprovalStatus.unset,
//             "You already voted this proposal"
//         );
//         votingEligibilityThresholdProposalsApprovals[
//             votingEligibilityThresholdProposalsCounter.current()
//         ][msg.sender] = ApprovalStatus.rejected;

//         votingEligibilityThresholdProposals[
//             votingEligibilityThresholdProposalsCounter.current()
//         ].completedAt = block.timestamp;
//     }
// }

// struct Member {
//     string tgUsername;
//     // uint totalContributionInBNB;
//     // uint totalWinningInBNB;
//     bool isActiveVoter;
//     uint latestPeriodParticipation;
// }

// struct Period {
//     // uint id;
//     uint startedAt;
//     uint endedAt;
//     uint totalContributionInBNB;
//     uint contributionAmountInBNB;
//     uint prizeForEachWinnerInBNB;
//     Round[] rounds;
//     address[] dueWinners;
// }

// struct Round {
//     uint drawnAt;
//     address winner;
//     uint contributorCount;
// }

// struct TitleProposal {
//     uint proposedAt;
//     address proposer;
//     uint completedAt;
//     bool isApproved;
//     string newTitle;
//     uint approvalsCount;
// }

// struct TelegramGroupProposal {
//     uint proposedAt;
//     address proposer;
//     uint completedAt;
//     bool isApproved;
//     string newTelegramGroupUrl;
//     uint approvalsCount;
// }

// struct NewMemberProposal {
//     uint proposedAt;
//     address proposer;
//     uint completedAt;
//     bool isApproved;
//     address memberAddress;
//     string tgUsername;
//     uint approvalsCount;
// }

// struct ContributionAmountProposal {
//     uint proposedAt;
//     address proposer;
//     uint completedAt;
//     bool isApproved;
//     uint newContributionAmount;
//     uint approvalsCount;
// }

// struct PrizePercentageProposal {
//     uint proposedAt;
//     address proposer;
//     uint completedAt;
//     bool isApproved;
//     uint newPrizePercentage;
//     uint approvalsCount;
// }

// struct TransferProposal {
//     uint proposedAt;
//     address proposer;
//     uint completedAt;
//     bool isApproved;
//     address payable recipient;
//     uint transferAmount;
//     uint approvalsCount;
// }

// struct VotingEligibilityThresholdProposal {
//     uint proposedAt;
//     address proposer;
//     uint completedAt;
//     bool isApproved;
//     uint newVotingEligibilityThreshold;
//     uint approvalsCount;
// }

// struct CoordinatorProposal {
//     uint proposedAt;
//     address proposer;
//     uint completedAt;
//     bool isApproved;
//     address newCoordinator;
//     uint approvalsCount;
// }

// struct CoordinatorRewardPercentageProposal {
//     uint proposedAt;
//     address proposer;
//     uint completedAt;
//     bool isApproved;
//     uint newCoordinatorRewardPercentage;
//     uint approvalsCount;
// }
