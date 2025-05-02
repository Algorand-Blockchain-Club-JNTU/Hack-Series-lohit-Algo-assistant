/**
 * Updated PyTeal templates with correct implementations
 */

import type { PyTealTemplate } from "./pyteal-templates-enhanced"

/**
 * Updated voting contract template with proper state management
 */
export const updatedVotingTemplate: PyTealTemplate = {
  id: "voting-contract-updated",
  name: "Voting Contract (Updated)",
  description: "A voting contract with proper state management and ABI support",
  complexity: "intermediate",
  features: ["global state", "local state", "ABI", "router", "voting"],
  version: "2.0.0",
  lastUpdated: new Date().toISOString().split("T")[0], // YYYY-MM-DD
  algorandVersion: "3.17.0",
  pytealVersion: "0.24.0",
  documentation: [
    "https://developer.algorand.org/docs/get-details/dapps/smart-contracts/apps/",
    "https://developer.algorand.org/docs/get-details/dapps/smart-contracts/apps/#modifying-state-in-smart-contracts",
    "https://pyteal.readthedocs.io/en/latest/abi.html",
  ],
  code: `from pyteal import *

# This contract implements a voting system with proper state management and ABI support

# Define global state keys
CREATOR_KEY = Bytes("creator")
START_TIME_KEY = Bytes("start_time")
END_TIME_KEY = Bytes("end_time")
TOPIC_KEY = Bytes("topic")
OPTION_PREFIX_KEY = Bytes("option_")
COUNT_PREFIX_KEY = Bytes("count_")
NUM_OPTIONS_KEY = Bytes("num_options")

# Define local state keys
VOTED_KEY = Bytes("voted")

# Initialize the contract
@Subroutine(TealType.none)
def init_contract(creator: abi.Address, start_time: abi.Uint64, end_time: abi.Uint64, topic: abi.String, options: abi.DynamicArray[abi.String]):
    num_options = options.length()
    
    # Initialize option storage
    init_options = Seq([
        For(i := Int(0), i < num_options, i := i + Int(1)).Do(
            Seq([
                # Store option text
                App.globalPut(Concat(OPTION_PREFIX_KEY, Itob(i)), options[i].get()),
                # Initialize vote count to 0
                App.globalPut(Concat(COUNT_PREFIX_KEY, Itob(i)), Int(0))
            ])
        )
    ])
    
    return Seq([
        # Store basic voting information
        App.globalPut(CREATOR_KEY, creator.get()),
        App.globalPut(START_TIME_KEY, start_time.get()),
        App.globalPut(END_TIME_KEY, end_time.get()),
        App.globalPut(TOPIC_KEY, topic.get()),
        App.globalPut(NUM_OPTIONS_KEY, num_options),
        
        # Initialize options and vote counts
        init_options
    ])

# Cast a vote
@Subroutine(TealType.uint64)
def vote(option_index: abi.Uint64):
    option_idx = option_index.get()
    
    return Seq([
        # Check if voting period is active
        Assert(Global.latest_timestamp() >= App.globalGet(START_TIME_KEY)),
        Assert(Global.latest_timestamp() <= App.globalGet(END_TIME_KEY)),
        
        # Check if option index is valid
        Assert(option_idx < App.globalGet(NUM_OPTIONS_KEY)),
        
        # Check if user has already voted
        Assert(App.localGet(Txn.sender(), VOTED_KEY) == Int(0)),
        
        # Increment the vote count for the selected option
        App.globalPut(
            Concat(COUNT_PREFIX_KEY, Itob(option_idx)),
            App.globalGet(Concat(COUNT_PREFIX_KEY, Itob(option_idx))) + Int(1)
        ),
        
        # Mark user as voted
        App.localPut(Txn.sender(), VOTED_KEY, Int(1)),
        
        # Return the new vote count
        Return(App.globalGet(Concat(COUNT_PREFIX_KEY, Itob(option_idx))))
    ])

# Get vote count for an option
@Subroutine(TealType.uint64)
def get_vote_count(option_index: abi.Uint64):
    option_idx = option_index.get()
    
    return Seq([
        # Check if option index is valid
        Assert(option_idx < App.globalGet(NUM_OPTIONS_KEY)),
        
        # Return the vote count
        Return(App.globalGet(Concat(COUNT_PREFIX_KEY, Itob(option_idx))))
    ])

# Get option text
@Subroutine(TealType.bytes)
def get_option_text(option_index: abi.Uint64):
    option_idx = option_index.get()
    
    return Seq([
        # Check if option index is valid
        Assert(option_idx < App.globalGet(NUM_OPTIONS_KEY)),
        
        # Return the option text
        Return(App.globalGet(Concat(OPTION_PREFIX_KEY, Itob(option_idx))))
    ])

# Get voting topic
@Subroutine(TealType.bytes)
def get_topic():
    return Return(App.globalGet(TOPIC_KEY))

# Check if user has voted
@Subroutine(TealType.uint64)
def has_voted(user: abi.Address):
    return Return(App.localGet(user.get(), VOTED_KEY))

# Router for contract calls
router = Router(
    "Voting Contract",
    BareCallActions(
        no_op=OnCompleteAction.create_only(Approve()),
        opt_in=OnCompleteAction.always(Approve()),
        close_out=OnCompleteAction.always(Approve()),
        update_application=OnCompleteAction.always(Reject()),
        delete_application=OnCompleteAction.always(Reject()),
    ),
)

# Create the contract
@router.method(no_op=CallConfig.CREATE)
def create(creator: abi.Address, start_time: abi.Uint64, end_time: abi.Uint64, topic: abi.String, options: abi.DynamicArray[abi.String], *, output: abi.Bool):
    return Seq([
        init_contract(creator, start_time, end_time, topic, options),
        output.set(Int(1))
    ])

# Cast a vote
@router.method(no_op=CallConfig.CALL)
def cast_vote(option_index: abi.Uint64, *, output: abi.Uint64):
    return output.set(vote(option_index))

# Get vote count
@router.method(no_op=CallConfig.CALL)
def get_votes(option_index: abi.Uint64, *, output: abi.Uint64):
    return output.set(get_vote_count(option_index))

# Get option text
@router.method(no_op=CallConfig.CALL)
def get_option(option_index: abi.Uint64, *, output: abi.String):
    return output.set(get_option_text(option_index))

# Get voting topic
@router.method(no_op=CallConfig.CALL)
def get_voting_topic(*, output: abi.String):
    return output.set(get_topic())

# Check if user has voted
@router.method(no_op=CallConfig.CALL)
def check_voted(user: abi.Address, *, output: abi.Bool):
    return output.set(has_voted(user))

# Compile the program
if __name__ == "__main__":
    approval_program, clear_program, contract = router.compile_program(version=8)
    
    # Print out the results
    print("Approval program:")
    print(approval_program)
    
    print("Clear program:")
    print(clear_program)
    
    print("Contract ABI:")
    print(contract.dictify())
`,
}

/**
 * Add the updated template to the template registry
 * @param templateRegistry The template registry to update
 */
export function addUpdatedTemplates(templateRegistry: Record<string, PyTealTemplate>): void {
  templateRegistry["voting-contract-updated"] = updatedVotingTemplate
}
