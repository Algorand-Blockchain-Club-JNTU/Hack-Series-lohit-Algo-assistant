/**
 * Corrected voting contract template for Algorand
 */

export const correctedVotingContractTemplate = `from pyteal import *

# Define the global and local state schemas
# Global state stores: num_candidates (uint64) and vote counts for each candidate
# Local state stores: voted flag (uint64)
GLOBAL_SCHEMA = GlobalStateSchema(
    num_uints=64,  # Support up to 63 candidates + 1 for num_candidates
    num_byte_slices=0
)

LOCAL_SCHEMA = LocalStateSchema(
    num_uints=1,   # Just need 1 uint for the voted flag
    num_byte_slices=0
)

# Key for storing the number of candidates
NUM_CANDIDATES_KEY = Bytes("num_candidates")

# Key for tracking if an account has voted
VOTED_KEY = Bytes("voted")

# Get a consistent key for a candidate's vote count
@Subroutine(TealType.bytes)
def candidate_key(candidate_idx):
    return Concat(Bytes("candidate_"), Itob(candidate_idx))

# Vote for a candidate
@Subroutine(TealType.uint64)
def vote(candidate_idx):
    candidate_key_bytes = candidate_key(candidate_idx)
    current_votes = App.globalGet(candidate_key_bytes)
    
    return Seq([
        # Mark the account as having voted
        App.localPut(Txn.sender(), VOTED_KEY, Int(1)),
        
        # Increment the candidate's vote count
        App.globalPut(candidate_key_bytes, current_votes + Int(1)),
        
        # Return the new vote count
        Return(current_votes + Int(1))
    ])

def approval_program():
    # Handle application creation
    on_creation = Seq([
        # Verify we have at least one argument (number of candidates)
        Assert(Txn.application_args.length() > Int(0)),
        
        # Get the number of candidates
        num_candidates := Btoi(Txn.application_args[0]),
        
        # Verify the number of candidates is valid (between 2 and 63)
        Assert(And(num_candidates >= Int(2), num_candidates <= Int(63))),
        
        # Store the number of candidates
        App.globalPut(NUM_CANDIDATES_KEY, num_candidates),
        
        # Initialize vote counts for each candidate to 0
        For(
            i := Int(0),
            i < num_candidates,
            i := i + Int(1)
        ).Do(
            App.globalPut(candidate_key(i), Int(0))
        ),
        
        Return(Int(1))  # Approve
    ])
    
    # Handle account opt-in
    on_opt_in = Seq([
        # Initialize the voted flag to 0 (not voted)
        App.localPut(Txn.sender(), VOTED_KEY, Int(0)),
        Return(Int(1))  # Approve
    ])
    
    # Handle voting
    on_vote = Seq([
        # Verify we have at least one argument (candidate index)
        Assert(Txn.application_args.length() > Int(0)),
        
        # Get the candidate index
        candidate_idx := Btoi(Txn.application_args[0]),
        
        # Verify the candidate index is valid
        Assert(candidate_idx < App.globalGet(NUM_CANDIDATES_KEY)),
        
        # Verify the account has opted in
        Assert(App.optedIn(Txn.sender(), Global.current_application_id())),
        
        # Verify the account has not already voted
        Assert(App.localGet(Txn.sender(), VOTED_KEY) == Int(0)),
        
        # Vote for the candidate
        vote(candidate_idx),
        
        Return(Int(1))  # Approve
    ])
    
    # Handle application calls
    on_call = Cond(
        [Txn.application_args[0] == Bytes("vote"), on_vote]
    )
    
    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.on_completion() == OnComplete.OptIn, on_opt_in],
        [Txn.on_completion() == OnComplete.NoOp, on_call],
        [Txn.on_completion() == OnComplete.CloseOut, Return(Int(1))],  # Allow closing out
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Int(0))],  # Disallow updates
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Int(0))]   # Disallow deletion
    )
    
    return program

def clear_state_program():
    # Simple clear state program that allows clearing local state
    return Return(Int(1))

if __name__ == "__main__":
    # Compile the approval program
    approval_program_teal = compileTeal(
        approval_program(),
        mode=Mode.Application,
        version=8
    )
    
    # Compile the clear state program
    clear_state_program_teal = compileTeal(
        clear_state_program(),
        mode=Mode.Application,
        version=8
    )
    
    # Print the compiled programs
    print("Approval Program:")
    print(approval_program_teal)
    print("\\nClear State Program:")
    print(clear_state_program_teal)

# Deployment instructions:
# 1. Compile the approval and clear state programs
# 2. Create the application with the compiled programs and schemas
# 3. Users must opt in to the application before voting
# 4. To vote, call the application with the "vote" action and candidate index
#
# Example deployment (pseudo-code):
# create_app_txn = ApplicationCreateTxn(
#     sender=creator_address,
#     sp=suggested_params,
#     on_complete=OnComplete.NoOpOC,
#     approval_program=compiled_approval,
#     clear_program=compiled_clear,
#     global_schema=GLOBAL_SCHEMA,
#     local_schema=LOCAL_SCHEMA,
#     app_args=[num_candidates]  # e.g., 5 candidates
# )
#
# Example opt-in (pseudo-code):
# opt_in_txn = ApplicationOptInTxn(
#     sender=voter_address,
#     sp=suggested_params,
#     index=app_id
# )
#
# Example voting (pseudo-code):
# vote_txn = ApplicationNoOpTxn(
#     sender=voter_address,
#     sp=suggested_params,
#     index=app_id,
#     app_args=["vote", candidate_index]  # e.g., vote for candidate 2
# )
`

/**
 * Get the corrected voting contract template
 * @returns The corrected voting contract template
 */
export function getVotingContractTemplate(): string {
  return correctedVotingContractTemplate
}
