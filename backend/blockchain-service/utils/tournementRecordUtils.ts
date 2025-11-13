import { UUID } from "crypto";
import { validate } from "uuid";

export function uuidToBytes16(uuid: UUID): string {
	if (!validate(uuid))
		throw new Error("Invalid UUID");
	const hexString = uuid.replace(/-/g, "");
	if (hexString.length !== 32)
		throw new Error("Invalid UUID format");
    return "0x" + hexString;
}

export function bytes16ToUuid(bytes16: string): UUID {
	const hexString = bytes16.startsWith("0x") ? bytes16.slice(2) : bytes16;
	if (hexString.length !== 32)
		throw new Error("Invalid bytes16 format");
	return `${hexString.slice(0, 8)}-${hexString.slice(8,12)}-${hexString.slice(12, 16)}-${hexString.slice(16, 20)}-${hexString.slice(20)}` as UUID;
}