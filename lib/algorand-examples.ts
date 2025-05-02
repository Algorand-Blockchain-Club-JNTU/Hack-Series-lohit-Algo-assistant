interface AlgorandExample {
  id: string
  title: string
  code: string
  explanation: string
}

const algorandExamples: Record<string, AlgorandExample> = {
  voting: {
    id: "voting",
    title: "Voting Smart Contract",
    code: `from pyteal import *

def approval_program():
    # Global variables
    global_creator = Bytes("Creator")
    global_voting_open = Bytes("VotingOpen")
    global_option_a = Bytes("OptionA")
    global_option_b = Bytes("OptionB")
    
    # Local variables
    local_voted = Bytes("Voted")
    
    # On creation, set up the contract
    on_creation = Seq([
        App.globalPut(global_creator, Txn.sender()),
        App.globalPut(global_voting_open, Int(1)),
        App.globalPut(global_option_a, Int(0)),
        App.globalPut(global_option_b, Int(0)),
        Return(Int(1))
    ])
    
    # Check if the sender is the creator
    is_creator = Txn.sender() == App.globalGet(global_creator)
    
    # Vote for option A
    vote_for_a = Seq([
        Assert(App.globalGet(global_voting_open) == Int(1)),
        Assert(App.localGet(Txn.sender(), local_voted) == Int(0)),
        App.localPut(Txn.sender(), local_voted, Int(1)),
        App.globalPut(global_option_a, App.globalGet(global_option_a) + Int(1)),
        Return(Int(1))
    ])
    
    # Vote for option B
    vote_for_b = Seq([
        Assert(App.globalGet(global_voting_open) == Int(1)),
        Assert(App.localGet(Txn.sender(), local_voted) == Int(0)),
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

if __name__ == "__main__":
    with open("voting_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), Mode.Application, version=6)
        f.write(compiled)
    
    with open("voting_clear_state.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), Mode.Application, version=6)
        f.write(compiled)`,
    explanation:
      "This is a simple voting smart contract for Algorand. It allows users to vote for one of two options (A or B), and only the creator can close the voting. Each account can only vote once.",
  },
  token: {
    id: "token",
    title: "Algorand Standard Asset (ASA) Creation",
    code: `from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.future.transaction import AssetConfigTxn, wait_for_confirmation

# Connect to Algorand node
algod_address = "https://testnet-api.algonode.cloud"
algod_token = ""
algod_client = algod.AlgodClient(algod_token, algod_address)

# Create a new account for this transaction
private_key, address = account.generate_account()
print("Created new account: ", address)
print("Generated mnemonic: ", mnemonic.from_private_key(private_key))

# Check account balance
account_info = algod_client.account_info(address)
print("Account balance: {} microAlgos".format(account_info.get('amount')))

# Asset Creation transaction
txn = AssetConfigTxn(
    sender=address,
    sp=algod_client.suggested_params(),
    total=1000000,
    default_frozen=False,
    unit_name="MYASA",
    asset_name="My Algorand Standard Asset",
    manager=address,
    reserve=address,
    freeze=address,
    clawback=address,
    url="https://example.com",
    decimals=0)

# Sign with secret key
stxn = txn.sign(private_key)

# Send the transaction to the network
try:
    txid = algod_client.send_transaction(stxn)
    print("Signed transaction with txID: {}".format(txid))
    
    # Wait for confirmation
    confirmed_txn = wait_for_confirmation(algod_client, txid, 4)
    print("TXID: ", txid)
    print("Result confirmed in round: {}".format(confirmed_txn['confirmed-round']))
    
    # Get the new asset ID
    ptx = algod_client.pending_transaction_info(txid)
    asset_id = ptx["asset-index"]
    print("Asset ID: {}".format(asset_id))
except Exception as e:
    print(e)`,
    explanation:
      "This code demonstrates how to create an Algorand Standard Asset (ASA) using the Algorand Python SDK. ASAs are Algorand's built-in token standard, similar to ERC-20 on Ethereum but with native support in the protocol.",
  },
  nft: {
    id: "nft",
    title: "Algorand NFT Creation",
    code: `from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.future.transaction import AssetConfigTxn, wait_for_confirmation
import json

# Connect to Algorand node
algod_address = "https://testnet-api.algonode.cloud"
algod_token = ""
algod_client = algod.AlgodClient(algod_token, algod_address)

# Create a new account for this transaction
private_key, address = account.generate_account()
print("Created new account: ", address)
print("Generated mnemonic: ", mnemonic.from_private_key(private_key))

# Check account balance
account_info = algod_client.account_info(address)
print("Account balance: {} microAlgos".format(account_info.get('amount')))

# Define NFT metadata
metadata = {
    "name": "My Algorand NFT",
    "description": "This is a unique digital asset on the Algorand blockchain",
    "image": "https://example.com/nft-image.png",
    "properties": {
        "simple_property": "Example value",
        "rich_property": {
            "name": "Name",
            "value": "Value",
            "display_value": "Display Value"
        }
    }
}

# Convert metadata to JSON string
metadata_json = json.dumps(metadata)

# Asset Creation transaction for NFT
txn = AssetConfigTxn(
    sender=address,
    sp=algod_client.suggested_params(),
    total=1,  # NFTs have a total of 1
    default_frozen=False,
    unit_name="NFT",
    asset_name="My Algorand NFT",
    manager=address,
    reserve=address,
    freeze=address,
    clawback=address,
    url="ipfs://QmXjkFQjnD8i8ntmwehoAHBfJEApETx8YTdefDxysuJw1n#arc3",  # IPFS URL to metadata
    metadata_hash=b"your_metadata_hash_here",  # Hash of the metadata
    decimals=0)  # NFTs have 0 decimals

# Sign with secret key
stxn = txn.sign(private_key)

# Send the transaction to the network
try:
    txid = algod_client.send_transaction(stxn)
    print("Signed transaction with txID: {}".format(txid))
    
    # Wait for confirmation
    confirmed_txn = wait_for_confirmation(algod_client, txid, 4)
    print("TXID: ", txid)
    print("Result confirmed in round: {}".format(confirmed_txn['confirmed-round']))
    
    # Get the new asset ID
    ptx = algod_client.pending_transaction_info(txid)
    asset_id = ptx["asset-index"]
    print("NFT Asset ID: {}".format(asset_id))
except Exception as e:
    print(e)`,
    explanation:
      "This code demonstrates how to create a Non-Fungible Token (NFT) on Algorand. Algorand NFTs are created as ASAs with a total supply of 1 and 0 decimals, following the ARC-3 standard for metadata.",
  },
  escrow: {
    id: "escrow",
    title: "Algorand Escrow Account",
    code: `from pyteal import *

def escrow_contract(
    seller_address,
    buyer_address,
    price,
    asset_id,
    timeout_rounds
):
    """
    This escrow allows a buyer to purchase an asset from a seller.
    The buyer sends Algos to the escrow, and the seller sends the asset.
    Once both are received, the escrow automatically releases the funds to the seller
    and the asset to the buyer.
    """
    
    # Verify the transaction is a payment
    is_payment = Txn.type_enum() == TxnType.Payment
    
    # Verify the transaction is an asset transfer
    is_asset_transfer = Txn.type_enum() == TxnType.AssetTransfer
    
    # Verify the transaction is a close out
    is_close_out = Txn.type_enum() == TxnType.Payment
    
    # Verify the payment is from the buyer to the seller for the correct amount
    valid_payment = And(
        is_payment,
        Txn.sender() == Addr(buyer_address),
        Txn.receiver() == Addr(seller_address),
        Txn.amount() == Int(price),
        Global.group_size() == Int(2)
    )
    
    # Verify the asset transfer is from the seller to the buyer for the correct asset
    valid_asset_transfer = And(
        is_asset_transfer,
        Txn.sender() == Addr(seller_address),
        Txn.asset_receiver() == Addr(buyer_address),
        Txn.xfer_asset() == Int(asset_id),
        Txn.asset_amount() == Int(1),
        Global.group_size() == Int(2)
    )
    
    # Allow the seller to recover the asset if the timeout has passed
    timeout_recovery = And(
        is_asset_transfer,
        Txn.sender() == Addr(seller_address),
        Txn.asset_receiver() == Addr(seller_address),
        Txn.xfer_asset() == Int(asset_id),
        Global.round() > Int(timeout_rounds)
    )
    
    # Allow the buyer to recover their payment if the timeout has passed
    payment_recovery = And(
        is_close_out,
        Txn.sender() == Addr(buyer_address),
        Txn.receiver() == Addr(buyer_address),
        Global.round() > Int(timeout_rounds)
    )
    
    # Combine all conditions
    program = Cond(
        [Or(valid_payment, valid_asset_transfer), Return(Int(1))],
        [timeout_recovery, Return(Int(1))],
        [payment_recovery, Return(Int(1))]
    )
    
    return program

if __name__ == "__main__":
    # Example parameters
    seller = "SELLER_ADDRESS_HERE"
    buyer = "BUYER_ADDRESS_HERE"
    price = 1000000  # 1 Algo in microAlgos
    asset_id = 12345  # The ID of the asset being sold
    timeout = 5000  # Number of rounds before timeout
    
    # Compile the program
    program = escrow_contract(seller, buyer, price, asset_id, timeout)
    compiled = compileTeal(program, Mode.Signature, version=6)
    
    with open("escrow.teal", "w") as f:
        f.write(compiled)
        
    print("Escrow contract compiled to escrow.teal")`,
    explanation:
      "This PyTeal code creates an escrow smart contract for Algorand. It facilitates a secure transaction between a buyer and seller, where the buyer sends Algos and the seller sends an asset. The contract automatically releases the funds and asset when both are received, or allows recovery after a timeout period.",
  },
  atomic: {
    id: "atomic",
    title: "Algorand Atomic Transfers",
    code: `from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.future.transaction import PaymentTxn, AssetTransferTxn, assign_group_id, wait_for_confirmation

# Connect to Algorand node
algod_address = "https://testnet-api.algonode.cloud"
algod_token = ""
algod_client = algod.AlgodClient(algod_token, algod_address)

# Create accounts for demonstration
# In a real application, you would use existing accounts
account1_private_key, account1_address = account.generate_account()
account2_private_key, account2_address = account.generate_account()

print("Account 1:", account1_address)
print("Account 2:", account2_address)

# Get suggested parameters
params = algod_client.suggested_params()

# Create a payment transaction from account 1 to account 2
txn1 = PaymentTxn(
    sender=account1_address,
    sp=params,
    receiver=account2_address,
    amt=1000000  # 1 Algo
)

# Create a payment transaction from account 2 to account 1
txn2 = PaymentTxn(
    sender=account2_address,
    sp=params,
    receiver=account1_address,
    amt=500000  # 0.5 Algo
)

# Group the transactions
group_id = assign_group_id([txn1, txn2])

# Sign the transactions
signed_txn1 = txn1.sign(account1_private_key)
signed_txn2 = txn2.sign(account2_private_key)

# Combine the signed transactions
signed_group = [signed_txn1, signed_txn2]

# Send the transactions to the network
try:
    tx_id = algod_client.send_transactions(signed_group)
    print("Transaction ID:", tx_id)
    
    # Wait for confirmation
    confirmed_txn = wait_for_confirmation(algod_client, tx_id, 4)
    print("Transaction confirmed in round:", confirmed_txn['confirmed-round'])
    
    # Print account balances
    account1_info = algod_client.account_info(account1_address)
    account2_info = algod_client.account_info(account2_address)
    print("Account 1 balance:", account1_info.get('amount'))
    print("Account 2 balance:", account2_info.get('amount'))
    
except Exception as e:
    print("Error:", e)`,
    explanation:
      "This code demonstrates Algorand's atomic transfers, which allow multiple transactions to be grouped together and executed as a single unit. Either all transactions in the group succeed, or none of them do. This is useful for applications like decentralized exchanges, escrow services, and complex financial transactions.",
  },
}

export function getAlgorandExample(id: string): AlgorandExample | undefined {
  return algorandExamples[id]
}

export function getAllAlgorandExamples(): AlgorandExample[] {
  return Object.values(algorandExamples)
}

export function findMatchingExample(query: string): string | undefined {
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes("voting") || lowerQuery.includes("ballot")) {
    return "voting"
  }

  if (lowerQuery.includes("token") || lowerQuery.includes("asa") || lowerQuery.includes("standard asset")) {
    return "token"
  }

  if (lowerQuery.includes("nft") || lowerQuery.includes("non-fungible")) {
    return "nft"
  }

  if (lowerQuery.includes("escrow")) {
    return "escrow"
  }

  if (lowerQuery.includes("atomic transfer") || lowerQuery.includes("group transaction")) {
    return "atomic"
  }

  return undefined
}
