"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Code, Coins, FileCode, Layers } from "lucide-react"
import { CopyButton } from "@/components/ui/copy-button"

interface AlgorandEducationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AlgorandEducationModal({ isOpen, onClose }: AlgorandEducationModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Example code snippets that could be copied
  const codeExamples = {
    pyteal: `from pyteal import *

def approval_program():
    on_creation = Seq([
        App.globalPut(Bytes("Creator"), Txn.sender()),
        Return(Int(1))
    ])
    
    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Int(1))],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Int(1))],
        [Txn.on_completion() == OnComplete.CloseOut, Return(Int(1))],
        [Txn.on_completion() == OnComplete.OptIn, Return(Int(1))]
    )
    
    return program

if __name__ == "__main__":
    print(compileTeal(approval_program(), Mode.Application, version=5))`,

    asaCreation: `from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.future.transaction import AssetConfigTxn

# Connect to Algorand node
algod_address = "https://testnet-api.algonode.cloud"
algod_token = ""
algod_client = algod.AlgodClient(algod_token, algod_address)

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
    decimals=0)`,
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-[#020D19] border border-[rgba(0,201,201,0.2)] text-[#E6F1FF]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#00C9C9]">Algorand Development Guide</DialogTitle>
          <DialogDescription className="text-[#8892B0]">
            Learn about Algorand's key concepts and development tools
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="smart-contracts" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              <span className="hidden sm:inline">Smart Contracts</span>
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              <span className="hidden sm:inline">Assets</span>
            </TabsTrigger>
            <TabsTrigger value="development" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Development</span>
            </TabsTrigger>
            <TabsTrigger value="architecture" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Architecture</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)]">
              <CardHeader>
                <CardTitle className="text-[#00C9C9]">What is Algorand?</CardTitle>
                <CardDescription className="text-[#8892B0]">A high-performance blockchain platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-[#E6F1FF]">
                <p>
                  Algorand is a blockchain platform founded by Turing Award-winning MIT professor Silvio Micali. It's
                  designed to be secure, scalable, and decentralized, solving the blockchain trilemma.
                </p>
                <p>Key features of Algorand include:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Pure Proof-of-Stake (PPoS) consensus mechanism</li>
                  <li>Fast finality (transactions finalize in ~4.5 seconds)</li>
                  <li>Low transaction fees (0.001 ALGO per transaction)</li>
                  <li>Carbon-negative blockchain</li>
                  <li>Native support for assets and smart contracts</li>
                  <li>No forking, providing absolute finality</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="smart-contracts">
            <Card className="bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)]">
              <CardHeader>
                <CardTitle className="text-[#00C9C9]">Algorand Smart Contracts</CardTitle>
                <CardDescription className="text-[#8892B0]">Build with TEAL and PyTeal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-[#E6F1FF]">
                <p>
                  Algorand smart contracts are written in TEAL (Transaction Execution Approval Language) or PyTeal (a
                  Python library that generates TEAL code).
                </p>
                <p>
                  <strong className="text-[#00C9C9]">TEAL</strong> is Algorand's assembly-like language for smart
                  contracts. It's a stack-based language that evaluates to either true or false.
                </p>
                <p>
                  <strong className="text-[#00C9C9]">PyTeal</strong> is a Python library that allows developers to write
                  Algorand smart contracts in Python, which then compiles to TEAL. This makes it easier to write and
                  maintain complex smart contracts.
                </p>

                <div className="bg-[rgba(2,13,25,0.7)] rounded-md p-4 relative group">
                  <div className="absolute top-2 right-2">
                    <CopyButton
                      text={codeExamples.pyteal}
                      size="icon"
                      className="h-7 w-7 rounded-full bg-[rgba(2,13,25,0.7)] text-[#00C9C9] opacity-0 group-hover:opacity-100 transition-opacity"
                      tooltipText="Copy PyTeal example"
                    />
                  </div>
                  <pre className="text-sm overflow-x-auto font-mono text-[#E6F1FF]">
                    <code>{codeExamples.pyteal}</code>
                  </pre>
                </div>

                <p>Algorand supports two types of smart contracts:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Stateful Smart Contracts</strong>: Applications that can store state on the blockchain
                  </li>
                  <li>
                    <strong>Stateless Smart Contracts</strong>: Logic signatures that approve transactions
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets">
            <Card className="bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)]">
              <CardHeader>
                <CardTitle className="text-[#00C9C9]">Algorand Standard Assets (ASAs)</CardTitle>
                <CardDescription className="text-[#8892B0]">Create and manage digital assets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-[#E6F1FF]">
                <p>
                  Algorand Standard Assets (ASAs) are built directly into the Algorand protocol, allowing for the
                  creation of a wide range of digital assets.
                </p>
                <p>ASAs can represent:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fungible tokens (cryptocurrencies, stablecoins)</li>
                  <li>Non-fungible tokens (NFTs, digital collectibles)</li>
                  <li>Security tokens</li>
                  <li>Utility tokens</li>
                </ul>

                <div className="bg-[rgba(2,13,25,0.7)] rounded-md p-4 relative group">
                  <div className="absolute top-2 right-2">
                    <CopyButton
                      text={codeExamples.asaCreation}
                      size="icon"
                      className="h-7 w-7 rounded-full bg-[rgba(2,13,25,0.7)] text-[#00C9C9] opacity-0 group-hover:opacity-100 transition-opacity"
                      tooltipText="Copy ASA creation example"
                    />
                  </div>
                  <pre className="text-sm overflow-x-auto font-mono text-[#E6F1FF]">
                    <code>{codeExamples.asaCreation}</code>
                  </pre>
                </div>

                <p>Key features of ASAs:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Role-based asset control (manager, reserve, freeze, clawback)</li>
                  <li>Optional asset freezing</li>
                  <li>Optional asset clawback</li>
                  <li>Flexible metadata</li>
                  <li>Fast and low-cost transactions</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="development">
            <Card className="bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)]">
              <CardHeader>
                <CardTitle className="text-[#00C9C9]">Development Tools</CardTitle>
                <CardDescription className="text-[#8892B0]">Resources for building on Algorand</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-[#E6F1FF]">
                <p>Algorand provides a rich ecosystem of development tools:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong className="text-[#00C9C9]">SDKs</strong>: Official SDKs for Python, JavaScript, Go, Java,
                    and more
                  </li>
                  <li>
                    <strong className="text-[#00C9C9]">Algorand Sandbox</strong>: Local development environment
                  </li>
                  <li>
                    <strong className="text-[#00C9C9]">AlgoExplorer</strong>: Blockchain explorer for Algorand
                  </li>
                  <li>
                    <strong className="text-[#00C9C9]">Goal CLI</strong>: Command-line tools for Algorand
                  </li>
                  <li>
                    <strong className="text-[#00C9C9]">Algorand Builder</strong>: Framework for building Algorand
                    applications
                  </li>
                  <li>
                    <strong className="text-[#00C9C9]">Reach</strong>: Language for building decentralized applications
                  </li>
                  <li>
                    <strong className="text-[#00C9C9]">Beaker</strong>: Framework for building Algorand applications
                    with PyTeal
                  </li>
                </ul>

                <div className="bg-[rgba(2,13,25,0.7)] rounded-md p-4 relative group">
                  <div className="absolute top-2 right-2">
                    <CopyButton
                      text="pip install py-algorand-sdk pyteal beaker-pyteal"
                      size="icon"
                      className="h-7 w-7 rounded-full bg-[rgba(2,13,25,0.7)] text-[#00C9C9] opacity-0 group-hover:opacity-100 transition-opacity"
                      tooltipText="Copy installation command"
                    />
                  </div>
                  <pre className="text-sm overflow-x-auto font-mono text-[#E6F1FF]">
                    <code>pip install py-algorand-sdk pyteal beaker-pyteal</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="architecture">
            <Card className="bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)]">
              <CardHeader>
                <CardTitle className="text-[#00C9C9]">Algorand Architecture</CardTitle>
                <CardDescription className="text-[#8892B0]">Understanding the Algorand blockchain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-[#E6F1FF]">
                <p>Algorand's architecture is designed for high performance and security:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong className="text-[#00C9C9]">Pure Proof-of-Stake (PPoS)</strong>: Algorand's consensus
                    mechanism randomly selects validators based on their stake
                  </li>
                  <li>
                    <strong className="text-[#00C9C9]">Byzantine Agreement</strong>: Algorand uses a Byzantine agreement
                    protocol to reach consensus
                  </li>
                  <li>
                    <strong className="text-[#00C9C9]">Block Production</strong>: New blocks are produced approximately
                    every 4.5 seconds
                  </li>
                  <li>
                    <strong className="text-[#00C9C9]">Atomic Transfers</strong>: Multiple transactions can be grouped
                    and executed atomically
                  </li>
                  <li>
                    <strong className="text-[#00C9C9]">Rekeying</strong>: Change a spending key without changing the
                    public address
                  </li>
                </ul>

                <div className="bg-[rgba(2,13,25,0.7)] rounded-md p-4 relative group">
                  <div className="absolute top-2 right-2">
                    <CopyButton
                      text="https://developer.algorand.org/docs/get-details/algorand_consensus/"
                      size="icon"
                      className="h-7 w-7 rounded-full bg-[rgba(2,13,25,0.7)] text-[#00C9C9] opacity-0 group-hover:opacity-100 transition-opacity"
                      tooltipText="Copy documentation URL"
                    />
                  </div>
                  <pre className="text-sm overflow-x-auto font-mono text-[#E6F1FF]">
                    <code>https://developer.algorand.org/docs/get-details/algorand_consensus/</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
