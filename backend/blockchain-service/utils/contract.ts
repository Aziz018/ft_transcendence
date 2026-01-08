import { Contract, ethers, Wallet, type JsonRpcProvider } from "ethers";
import { env } from "process";
import abi from '../contract-abis/TournamentRecorder.json' with { type: 'json' };

export function initializeContract() {

  let provider: JsonRpcProvider;
  let signer: Wallet;
  let contract: Contract;

	provider = new ethers.JsonRpcProvider(env.AVALANCHE_TESTNET_RPC);
	signer = new ethers.Wallet(env.PRIVATE_KEY as string, provider);
	const contractAddress = env.CONTRACT_ADDRESS as string;
	contract = new ethers.Contract(
		contractAddress,
		abi,
		signer
	);
  return contract as Contract;
}

export const contract = initializeContract();
