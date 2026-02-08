// Challenge 1.3: Type-Safe Builder Pattern
// ==========================================
// Build a transaction instruction builder that tracks required fields at the type level.
// `.build()` should only be callable when programId, accounts, and data are all set.

// ---- Types ----

export interface AccountMeta {
  pubkey: string;
  isSigner: boolean;
  isWritable: boolean;
}

export interface TransactionInstruction {
  programId: string;
  accounts: AccountMeta[];
  data: Buffer;
  signers?: string[];
}

// TODO: Define a type that tracks which builder fields have been set.
// Example approach: use a Record with boolean flags.
//
// type BuilderState = {
//   programId: boolean;
//   accounts: boolean;
//   data: boolean;
//   signers: boolean;
// };
//
// type DefaultState = {
//   programId: false;
//   accounts: false;
//   data: false;
//   signers: false;
// };
//
// type RequiredComplete = {
//   programId: true;
//   accounts: true;
//   data: true;
// };

// TODO: Define a conditional type or helper that checks if all required fields are set.
// The build() method should only be available when programId, accounts, and data are true.
// Signers is always optional.

// TODO: Implement the InstructionBuilder class.
// It should be generic over a State parameter that tracks which fields are set.
//
// Each setter method should:
// 1. Store the value internally
// 2. Return a new type where the corresponding state field is `true`
//
// The build() method should:
// 1. Only be callable when the state satisfies the required fields
// 2. Return a TransactionInstruction

export class InstructionBuilder {
  // TODO: Add private fields to store the instruction parts
  // private _programId?: string;
  // private _accounts?: AccountMeta[];
  // private _data?: Buffer;
  // private _signers?: string[];

  // TODO: Implement programId(id: string)
  // Should return a builder with programId marked as set in the type
  programId(id: string): InstructionBuilder {
    throw new Error("Not implemented");
  }

  // TODO: Implement accounts(accounts: AccountMeta[])
  // Should return a builder with accounts marked as set in the type
  accounts(accounts: AccountMeta[]): InstructionBuilder {
    throw new Error("Not implemented");
  }

  // TODO: Implement data(data: Buffer)
  // Should return a builder with data marked as set in the type
  data(data: Buffer): InstructionBuilder {
    throw new Error("Not implemented");
  }

  // TODO: Implement signers(signers: string[])
  // Should return a builder with signers marked as set in the type
  signers(signers: string[]): InstructionBuilder {
    throw new Error("Not implemented");
  }

  // TODO: Implement build()
  // This method should ONLY be callable when programId, accounts, and data are set.
  // When the builder is incomplete, calling build() should be a TYPE ERROR.
  //
  // Approaches:
  // 1. Use a conditional type on the return value
  // 2. Use overloaded signatures
  // 3. Use `this is` type predicates
  // 4. Only add build() via conditional intersection types
  //
  // For now, this is a placeholder that always throws:
  build(): TransactionInstruction {
    throw new Error("Not implemented");
  }
}
