// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/Strings.sol";

contract TournamentRecorder {

	struct Tournament {
		bytes16	tournamentId;
		bytes16	player1;
		bytes16	player2;
		uint256	timestamp;
		bytes16	winner;
	}

	mapping ( bytes16 => Tournament ) public tournamentsRecord;
	uint256 public tournamentsCount;
	address public owner; 

	constructor() {
		owner = msg.sender;
		tournamentsCount = 0;
	}

	modifier onlyOwner() {
		require(msg.sender == owner, "Only the owner can perform this action");
		_;
	}

	event TournamentRecorded(bytes16 indexed TournamentId, bytes16  player1Id, bytes16 player2Id, bytes16 indexed winner, uint256 timestamp);

	function createTournamentRecord(bytes16 _tournamentId, bytes16 _player1Id, bytes16 _player2Id,  bytes16 _winnerId) public onlyOwner {
		require(_tournamentId != tournamentsRecord[_tournamentId].tournamentId, "Invalid tournament Id: this tournament id already exists,  please use different tournament id.");
		require(_player1Id != _player2Id, "Invalid players id: players must be defferent.");
		require((_player1Id == _winnerId || _player2Id == _winnerId), "Invalid winner Id: The winner must be one of the players.");
		Tournament memory newTournamentRecord = Tournament({
			tournamentId: _tournamentId,
			player1: _player1Id,
			player2: _player2Id,
			timestamp: block.timestamp,
			winner: _winnerId
		});
		tournamentsRecord[_tournamentId] = newTournamentRecord;
		emit TournamentRecorded(_tournamentId, _player1Id, _player2Id, _winnerId, block.timestamp);
		tournamentsCount++;
	}

	function getTournamentRecord(bytes16 _tournamentId) public view returns (Tournament memory) {
		require(tournamentsRecord[_tournamentId].tournamentId == _tournamentId, "Match does't exists!!!");
		return tournamentsRecord[_tournamentId];
	}

    function getMatchRecordCount() public view returns (uint256) {
        return tournamentsCount;
    }
}

