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

type BuilderState = {
  programId: boolean;
  accounts: boolean;
  data: boolean;
  signers: boolean;
};

type DefaultState = {
  programId: false;
  accounts: false;
  data: false;
  signers: false;
};

type RequiredComplete = {
  programId: true;
  accounts: true;
  data: true;
};

type AllRequiredSet<T extends BuilderState> = T extends RequiredComplete
  ? true
  : false;

type SetField<S extends BuilderState, K extends keyof S> = {
  [P in keyof S]: P extends K ? true : S[P];
};

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

export class InstructionBuilder<S extends BuilderState = DefaultState> {
  // TODO: Add private fields to store the instruction parts
  private _programId?: string;
  private _accounts?: AccountMeta[];
  private _data?: Buffer;
  private _signers?: string[];

  // TODO: Implement programId(id: string)
  // Should return a builder with programId marked as set in the type
  programId(id: string): InstructionBuilder<SetField<S, "programId">> {
    this._programId = id;
    return this as any;
  }

  accounts(
    accounts: AccountMeta[],
  ): InstructionBuilder<SetField<S, "accounts">> {
    this._accounts = accounts;
    return this as any;
  }

  data(data: Buffer): InstructionBuilder<SetField<S, "data">> {
    this._data = data;
    return this as any;
  }

  signers(signers: string[]): InstructionBuilder<SetField<S, "signers">> {
    this._signers = signers;
    return this as any;
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
  build(): AllRequiredSet<S> extends true ? TransactionInstruction : never {
    if (!this._programId || !this._accounts || !this._data) {
      throw new Error("Mising required fields");
    }

    return {
      programId: this._programId,
      accounts: this._accounts,
      data: this._data,
      signers: this._signers,
    } as any;
  }
}
