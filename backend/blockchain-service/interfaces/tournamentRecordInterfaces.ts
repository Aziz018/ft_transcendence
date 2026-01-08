import { UUID } from "crypto";


export default interface TournamentRecord {
	tournamentId: UUID;
	player1: UUID;
	player2: UUID;
	timestamp?: number;
	winner: UUID;
}