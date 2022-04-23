import { useEthers } from "@usedapp/core";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from '../../../styles/Home.module.css';
import { pfpAbi } from "../../../abi";
import { ethers } from 'ethers'
import toast from "react-hot-toast";
import { Wrapper } from "../..";

const InvalidCode = () => (
  <div className="flex items-center">
    Invalid invite code :-(
  </div>
)

const MintButton = () => {
  const { query: { collectionId: collectionAddress, inviteCode, inviteSig } } = useRouter()
  const { library } = useEthers()

  const mintPFP = async () => {
    console.log(inviteCode, inviteSig)
    const contract = new ethers.Contract(collectionAddress, pfpAbi, library.getSigner())
    return await contract.safeMint(inviteCode, inviteSig, { value: 0 })
  }

  const handleMint = async () => {
    const toastId = toast.loading("Waiting for transaction signature...")
    try {
      const tx = await mintPFP()
      toast.loading("Minting your PFP...", { id: toastId })
      await tx.wait()
      toast.success("Successfully minted your PFP", { id: toastId })
    } catch (e) {
      const message = e?.data?.message || e?.error?.message || e.message
      toast.error("Failed to mint your PFP", { id: toastId })
      toast.error(message)
    }
  }

  return (
    <>
      <div>
        <button onClick={handleMint} className="hover:bg-indigo-600 bg-indigo-500 text-white px-4 py-2 rounded-md">
          Mint your PFP
        </button>
      </div>
    </>
  )
}

const PFP = () => {
  return (
    <div >
      <main className={styles.main}>
        <div className="flex justify-center w-full max-w-2xl">
          <div>
            <Wrapper>
              <MintButton />
            </Wrapper>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PFP