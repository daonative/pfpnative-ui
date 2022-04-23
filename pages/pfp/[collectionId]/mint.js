import { useEthers } from "@usedapp/core";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from '../../../styles/Home.module.css';
import { pfpAbi } from "../../../abi";
import { ethers, utils } from 'ethers'
import toast from "react-hot-toast";
import { Wrapper } from "../..";

const InvalidCode = () => (
  <div className="flex items-center">
    Invalid invite code :-(
  </div>
)

const MintButton = () => {
  const { query: { collectionId: collectionAddress, inviteCode, inviteSig } } = useRouter()
  const { library, account } = useEthers()
  const [mintPrice, setMintPrice] = useState()

  useEffect(() => {
    const retrieveMintPrice = async () => {
      const contract = new ethers.Contract(collectionAddress, pfpAbi, library.getSigner())
      const price = await contract.price()
      console.log(price)
      setMintPrice(price)
    }

    if (!library || !account || !collectionAddress) return

    retrieveMintPrice()
  }, [library, account, collectionAddress])

  const getTokenMetadata = async (tokenId) => {
    const contract = new ethers.Contract(collectionAddress, pfpAbi, library.getSigner())
    const uri = await contract.tokenURI(tokenId)
    const metadataEncoded = uri.split(';base64,').pop()
    const metadata = JSON.parse(atob(metadataEncoded))
    return metadata
  }


  const mintPFP = async () => {
    const contract = new ethers.Contract(collectionAddress, pfpAbi, library.getSigner())
    return await contract.safeMint(inviteCode, inviteSig, { value: mintPrice })
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
      <div className="flex flex-col items-center gap-2">
        {mintPrice?.gt(0) && (
          <div>{utils.formatEther(mintPrice)} ETH</div>
        )}
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