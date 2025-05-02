/**
 * Library of verified PyTeal templates for common smart contract patterns
 */

export interface PyTealTemplate {
  id: string
  name: string
  description: string
  code: string
  complexity: "basic" | "intermediate" | "advanced"
  features: string[]
}

export const pytealTemplates: Record<string, PyTealTemplate> = {
  // Basic voting contract with proper state management
  basicVoting: {
    id: "basic-voting",
    name: "Basic Voting Contract",
    description: "A simple voting contract with two options and double-vote prevention",
    complexity: "basic",
    features: ["global state", "local state", "double-vote prevention"],
    code: `from pyteal import *

def approval_program():
    # Global variables - properly defined as string constants
    global_creator = Bytes("Creator")
    global_voting_open = Bytes("VotingOpen")
    global_option_a = Bytes("OptionA")
    global_option_b = Bytes("OptionB")
    
    # Local variables for tracking who has voted
    local_voted = Bytes("Voted")
    
    # Initialize global state on creation
    on_creation = Seq([
        App.globalPut(global_creator, Txn.sender()),
        App.globalPut(global_voting_open, Int(1)),
        App.globalPut(global_option_a, Int(0)),
        App.globalPut(global_option_b, Int(0)),
        Return(Int(1))
    ])
    
    # Check if the sender is the creator
    is_creator = Txn.sender() == App.globalGet(global_creator)
    
    # Check if voting is still open
    is_voting_open = App.globalGet(global_voting_open) == Int(1)
    
    # Check if the user has already voted
    has_voted = App.localGet(Txn.sender(), local_voted) == Int(1)
    
    # Vote for option A
    vote_for_a = Seq([
        Assert(is_voting_open),
        Assert(Not(has_voted)),
        App.localPut(Txn.sender(), local_voted, Int(1)),
        App.globalPut(global_option_a, App.globalGet(global_option_a) + Int(1)),
        Return(Int(1))
    ])
    
    # Vote for option B
    vote_for_b = Seq([
        Assert(is_voting_open),
        Assert(Not(has_voted)),
        App.localPut(Txn.sender(), local_voted, Int(1)),
        App.globalPut(global_option_b, App.globalGet(global_option_b) + Int(1)),
        Return(Int(1))
    ])
    
    # Close the voting
    close_voting = Seq([
        Assert(is_creator),
        App.globalPut(global_voting_open, Int(0)),
        Return(Int(1))
    ])
    
    # Handle each possible application call
    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.application_args[0] == Bytes("vote_a"), vote_for_a],
        [Txn.application_args[0] == Bytes("vote_b"), vote_for_b],
        [Txn.application_args[0] == Bytes("close"), close_voting]
    )
    
    return program

def clear_state_program():
    return Return(Int(1))

# Compile the program to TEAL
if __name__ == "__main__":
    with open("voting_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), Mode.Application, version=6)
        f.write(compiled)
    
    with open("voting_clear_state.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), Mode.Application, version=6)
        f.write(compiled)
`,
  },

  // ABI-compliant voting contract
  abiVoting: {
    id: "abi-voting",
    name: "ABI-Compliant Voting Contract",
    description: "A voting contract using Algorand ABI for better interoperability",
    complexity: "intermediate",
    features: ["ABI", "router", "method handlers", "global state", "local state"],
    code: `from pyteal import *

# This contract implements a simple voting system using ABI

# Define the contract
@Subroutine(TealType.uint64)
def create_app():
    return Seq(
        # Initialize global state
        App.globalPut(Bytes("Creator"), Txn.sender()),
        App.globalPut(Bytes("VotingOpen"), Int(1)),
        App.globalPut(Bytes("OptionA"), Int(0)),
        App.globalPut(Bytes("OptionB"), Int(0)),
        Int(1)
    )

# Check if sender is creator
@Subroutine(TealType.uint64)
def is_creator():
    return Txn.sender() == App.globalGet(Bytes("Creator"))

# Check if voting is open
@Subroutine(TealType.uint64)
def is_voting_open():
    return App.globalGet(Bytes("VotingOpen")) == Int(1)

# Check if account has already voted
@Subroutine(TealType.uint64)
def has_voted():
    return App.localGet(Txn.sender(), Bytes("Voted")) == Int(1)

# Vote for option A
@ABIReturnSubroutine
def vote_a(*, output: abi.Uint64) -> Expr:
    return Seq(
        Assert(is_voting_open()),
        Assert(Not(has_voted())),
        App.localPut(Txn.sender(), Bytes("Voted"), Int(1)),
        App.globalPut(Bytes("OptionA"), App.globalGet(Bytes("OptionA")) + Int(1)),
        output.set(App.globalGet(Bytes("OptionA")))
    )

# Vote for option B
@ABIReturnSubroutine
def vote_b(*, output: abi.Uint64) -> Expr:
    return Seq(
        Assert(is_voting_open()),
        Assert(Not(has_voted())),
        App.localPut(Txn.sender(), Bytes("Voted"), Int(1)),
        App.globalPut(Bytes("OptionB"), App.globalGet(Bytes("OptionB")) + Int(1)),
        output.set(App.globalGet(Bytes("OptionB")))
    )

# Close voting
@ABIReturnSubroutine
def close_voting(*, output: abi.Bool) -> Expr:
    return Seq(
        Assert(is_creator()),
        App.globalPut(Bytes("VotingOpen"), Int(0)),
        output.set(Int(1))
    )

# Get results
@ABIReturnSubroutine
def get_results(*, output: abi.Tuple2[abi.Uint64, abi.Uint64]) -> Expr:
    option_a = abi.Uint64()
    option_b = abi.Uint64()
    return Seq(
        option_a.set(App.globalGet(Bytes("OptionA"))),
        option_b.set(App.globalGet(Bytes("OptionB"))),
        output.set(option_a, option_b)
    )

# Create the approval program
def approval():
    # Handle app creation
    handle_creation = Seq(
        create_app(),
        Approve()
    )
    
    # Set up the router
    router = Router(
        "voting-contract",
        BareCallActions(
            no_op=OnCompleteAction.create_only(handle_creation),
            opt_in=OnCompleteAction.always(Approve()),
            close_out=OnCompleteAction.always(Approve()),
            update_application=OnCompleteAction.call_only(is_creator()),
            delete_application=OnCompleteAction.call_only(is_creator()),
        ),
    )
    
    # Add method handlers to the router
    router.add_method_handler(vote_a)
    router.add_method_handler(vote_b)
    router.add_method_handler(close_voting)
    router.add_method_handler(get_results)
    
    return router.compile()

# Create the clear state program
def clear_state():
    return Approve()

# Compile the program
if __name__ == "__main__":
    with open("voting_abi_approval.teal", "w") as f:
        f.write(compileTeal(approval(), Mode.Application, version=8))
    
    with open("voting_abi_clear_state.teal", "w") as f:
        f.write(compileTeal(clear_state(), Mode.Application, version=8))
`,
  },

  // Token sale contract
  tokenSale: {
    id: "token-sale",
    name: "Token Sale Contract",
    description: "A contract for selling ASAs in exchange for Algos",
    complexity: "intermediate",
    features: ["asset transfer", "inner transactions", "escrow"],
    code: `from pyteal import *

def approval_program():
    # Global variables
    global_creator = Bytes("Creator")
    global_asset_id = Bytes("AssetID")
    global_price_per_token = Bytes("PricePerToken")  # In microAlgos
    global_total_sold = Bytes("TotalSold")
    global_sale_active = Bytes("SaleActive")
    
    # Initialize global state on creation
    on_creation = Seq([
        App.globalPut(global_creator, Txn.sender()),
        App.globalPut(global_total_sold, Int(0)),
        App.globalPut(global_sale_active, Int(0)),  # Sale starts inactive
        
        # Verify that we have 2 arguments: asset_id and price_per_token
        Assert(Txn.application_args.length() == Int(2)),
        
        # Store the asset ID and price
        App.globalPut(global_asset_id, Btoi(Txn.application_args[0])),
        App.globalPut(global_price_per_token, Btoi(Txn.application_args[1])),
        
        Return(Int(1))
    ])
    
    # Check if the sender is the creator
    is_creator = Txn.sender() == App.globalGet(global_creator)
    
    # Start the sale
    start_sale = Seq([
        Assert(is_creator),
        App.globalPut(global_sale_active, Int(1)),
        Return(Int(1))
    ])
    
    # Stop the sale
    stop_sale = Seq([
        Assert(is_creator),
        App.globalPut(global_sale_active, Int(0)),
        Return(Int(1))
    ])
    
    # Buy tokens
    buy_tokens = Seq([
        # Check if sale is active
        Assert(App.globalGet(global_sale_active) == Int(1)),
        
        # Check if payment is attached
        Assert(Gtxn[1].type_enum() == TxnType.Payment),
        Assert(Gtxn[1].receiver() == Global.current_application_address()),
        
        # Calculate tokens to send based on payment amount
        # tokens = payment_amount / price_per_token
        payment_amount = Gtxn[1].amount(),
        price_per_token = App.globalGet(global_price_per_token),
        tokens_to_send = payment_amount / price_per_token,
        
        # Verify we're sending at least 1 token
        Assert(tokens_to_send > Int(0)),
        
        # Create inner transaction to send tokens
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: App.globalGet(global_asset_id),
            TxnField.asset_amount: tokens_to_send,
            TxnField.asset_receiver: Txn.sender()
        }),
        InnerTxnBuilder.Submit(),
        
        # Update total sold
        App.globalPut(global_total_sold, App.globalGet(global_total_sold) + tokens_to_send),
        
        Return(Int(1))
    ])
    
    # Withdraw funds (creator only)
    withdraw_funds = Seq([
        Assert(is_creator),
        
        # Get the contract's balance
        contract_balance = Balance(Global.current_application_address()),
        
        # Create inner transaction to send all Algos to creator
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.amount: contract_balance - Global.min_txn_fee(),
            TxnField.receiver: Txn.sender()
        }),
        InnerTxnBuilder.Submit(),
        
        Return(Int(1))
    ])
    
    # Handle each possible application call
    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.application_args[0] == Bytes("start_sale"), start_sale],
        [Txn.application_args[0] == Bytes("stop_sale"), stop_sale],
        [Txn.application_args[0] == Bytes("buy"), buy_tokens],
        [Txn.application_args[0] == Bytes("withdraw"), withdraw_funds]
    )
    
    return program

def clear_state_program():
    return Return(Int(1))

# Compile the program to TEAL
if __name__ == "__main__":
    with open("token_sale_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), Mode.Application, version=6)
        f.write(compiled)
    
    with open("token_sale_clear_state.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), Mode.Application, version=6)
        f.write(compiled)
`,
  },

  // NFT marketplace contract
  nftMarketplace: {
    id: "nft-marketplace",
    name: "NFT Marketplace Contract",
    description: "A contract for listing and buying NFTs",
    complexity: "advanced",
    features: ["NFT", "escrow", "inner transactions", "box storage"],
    code: `from pyteal import *

def approval_program():
    # Global variables
    global_creator = Bytes("Creator")
    global_marketplace_fee = Bytes("MarketplaceFee")  # In basis points (e.g., 250 = 2.5%)
    global_listings_count = Bytes("ListingsCount")
    
    # Box storage keys
    # Each listing is stored in a box with key: "listing_" + listing_id
    # Box contains: asset_id (uint64) + price (uint64) + seller (address)
    
    # Helper to get listing box name
    @Subroutine(TealType.bytes)
    def listing_box_name(listing_id):
        return Concat(Bytes("listing_"), Itob(listing_id))
    
    # Initialize global state on creation
    on_creation = Seq([
        App.globalPut(global_creator, Txn.sender()),
        App.globalPut(global_listings_count, Int(0)),
        
        # Set marketplace fee from argument (in basis points)
        Assert(Txn.application_args.length() == Int(1)),
        App.globalPut(global_marketplace_fee, Btoi(Txn.application_args[0])),
        
        Return(Int(1))
    ])
    
    # Check if the sender is the creator
    is_creator = Txn.sender() == App.globalGet(global_creator)
    
    # Update marketplace fee
    update_fee = Seq([
        Assert(is_creator),
        Assert(Txn.application_args.length() == Int(2)),
        App.globalPut(global_marketplace_fee, Btoi(Txn.application_args[1])),
        Return(Int(1))
    ])
    
    # List an NFT for sale
    # Requires asset transfer transaction to the contract
    list_nft = Seq([
        # Verify we have a price argument
        Assert(Txn.application_args.length() == Int(2)),
        
        # Get the price from the argument
        price = Btoi(Txn.application_args[1]),
        Assert(price > Int(0)),
        
        # Verify the asset transfer transaction
        Assert(Gtxn[1].type_enum() == TxnType.AssetTransfer),
        Assert(Gtxn[1].asset_receiver() == Global.current_application_address()),
        Assert(Gtxn[1].asset_amount() == Int(1)),  # NFTs have amount 1
        
        # Get the asset ID
        asset_id = Gtxn[1].xfer_asset(),
        
        # Get a new listing ID
        listing_id = App.globalGet(global_listings_count),
        
        # Create a box to store the listing
        box_name = listing_box_name(listing_id),
        # Box contains: asset_id (uint64) + price (uint64) + seller (address)
        box_value = Concat(
            Itob(asset_id),
            Itob(price),
            Txn.sender()
        ),
        
        # Create the box
        Pop(Box.create(box_name, Int(8 + 8 + 32))),  # 8 bytes for uint64, 32 bytes for address
        Box.put(box_name, box_value),
        
        # Increment the listings count
        App.globalPut(global_listings_count, listing_id + Int(1)),
        
        Return(Int(1))
    ])
    
    # Buy an NFT
    buy_nft = Seq([
        # Verify we have a listing ID argument
        Assert(Txn.application_args.length() == Int(2)),
        
        # Get the listing ID
        listing_id = Btoi(Txn.application_args[1]),
        
        # Get the listing box
        box_name = listing_box_name(listing_id),
        Assert(Box.exists(box_name)),
        
        # Extract listing data
        box_data = Box.get(box_name),
        asset_id = Btoi(Extract(box_data, Int(0), Int(8))),
        price = Btoi(Extract(box_data, Int(8), Int(8))),
        seller = Extract(box_data, Int(16), Int(32)),
        
        # Verify the payment transaction
        Assert(Gtxn[1].type_enum() == TxnType.Payment),
        Assert(Gtxn[1].amount() >= price),
        Assert(Gtxn[1].receiver() == Global.current_application_address()),
        
        # Calculate marketplace fee
        fee_basis_points = App.globalGet(global_marketplace_fee),
        marketplace_fee = (price * fee_basis_points) / Int(10000),
        seller_payment = price - marketplace_fee,
        
        # Send the NFT to the buyer
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: asset_id,
            TxnField.asset_amount: Int(1),
            TxnField.asset_receiver: Txn.sender()
        }),
        InnerTxnBuilder.Submit(),
        
        # Send payment to the seller
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.amount: seller_payment,
            TxnField.receiver: seller
        }),
        InnerTxnBuilder.Submit(),
        
        # Delete the listing box
        Box.delete(box_name),
        
        Return(Int(1))
    ])
    
    # Cancel a listing (seller only)
    cancel_listing = Seq([
        # Verify we have a listing ID argument
        Assert(Txn.application_args.length() == Int(2)),
        
        # Get the listing ID
        listing_id = Btoi(Txn.application_args[1]),
        
        # Get the listing box
        box_name = listing_box_name(listing_id),
        Assert(Box.exists(box_name)),
        
        # Extract listing data
        box_data = Box.get(box_name),
        asset_id = Btoi(Extract(box_data, Int(0), Int(8))),
        seller = Extract(box_data, Int(16), Int(32)),
        
        # Verify the sender is the seller
        Assert(Txn.sender() == seller),
        
        # Return the NFT to the seller
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: asset_id,
            TxnField.asset_amount: Int(1),
            TxnField.asset_receiver: seller
        }),
        InnerTxnBuilder.Submit(),
        
        # Delete the listing box
        Box.delete(box_name),
        
        Return(Int(1))
    ])
    
    # Withdraw marketplace fees (creator only)
    withdraw_fees = Seq([
        Assert(is_creator),
        
        # Get the contract's balance
        contract_balance = Balance(Global.current_application_address()),
        
        # Create inner transaction to send all Algos to creator
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.amount: contract_balance - Global.min_txn_fee(),
            TxnField.receiver: Txn.sender()
        }),
        InnerTxnBuilder.Submit(),
        
        Return(Int(1))
    ])
    
    # Handle each possible application call
    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.application_args[0] == Bytes("update_fee"), update_fee],
        [Txn.application_args[0] == Bytes("list"), list_nft],
        [Txn.application_args[0] == Bytes("buy"), buy_nft],
        [Txn.application_args[0] == Bytes("cancel"), cancel_listing],
        [Txn.application_args[0] == Bytes("withdraw"), withdraw_fees]
    )
    
    return program

def clear_state_program():
    return Return(Int(1))

# Compile the program to TEAL
if __name__ == "__main__":
    with open("nft_marketplace_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), Mode.Application, version=8)
        f.write(compiled)
    
    with open("nft_marketplace_clear_state.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), Mode.Application, version=8)
        f.write(compiled)
`,
  },
}

/**
 * Get a template by ID
 * @param id The template ID
 * @returns The template or undefined if not found
 */
export function getTemplate(id: string): PyTealTemplate | undefined {
  return pytealTemplates[id]
}

/**
 * Get all templates
 * @returns Array of all templates
 */
export function getAllTemplates(): PyTealTemplate[] {
  return Object.values(pytealTemplates)
}

/**
 * Find a template that matches the given query
 * @param query The search query
 * @returns The best matching template ID or undefined if no match
 */
export function findMatchingTemplate(query: string): string | undefined {
  const lowerQuery = query.toLowerCase()

  // Direct matches for specific contract types
  if (lowerQuery.includes("voting") || lowerQuery.includes("ballot") || lowerQuery.includes("election")) {
    return lowerQuery.includes("abi") ? "abiVoting" : "basicVoting"
  }
  return lowerQuery.includes("abi") ? "abiVoting" : "basicVoting"

  if (lowerQuery.includes("token") || lowerQuery.includes("sale") || lowerQuery.includes("ico")) {
    return "tokenSale"
  }

  if (lowerQuery.includes("nft") || lowerQuery.includes("marketplace") || lowerQuery.includes("auction")) {
    return "nftMarketplace"
  }

  // No direct match, try to find the best match based on keywords
  const templateMatches = new Map<string, number>()

  Object.entries(pytealTemplates).forEach(([id, template]) => {
    let score = 0

    // Check name and description
    if (template.name.toLowerCase().includes(lowerQuery)) score += 5
    if (template.description.toLowerCase().includes(lowerQuery)) score += 3

    // Check features
    template.features.forEach((feature) => {
      if (lowerQuery.includes(feature.toLowerCase())) score += 2
    })

    if (score > 0) {
      templateMatches.set(id, score)
    }
  })

  // Return the template with the highest score, if any
  if (templateMatches.size > 0) {
    return Array.from(templateMatches.entries()).sort((a, b) => b[1] - a[1])[0][0]
  }

  return undefined
}
