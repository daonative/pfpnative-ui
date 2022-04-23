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
  const [tokenMetadata, setTokenMetadata] = useState()
  const [tokenId, setTokenId] = useState()

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

  const getTokenIdFromTxReceipt = (txReceipt) => {
    const PFPinterface = new utils.Interface(pfpAbi)
    return txReceipt.logs
      // Parse log events
      .map((log) => {
        try {
          return PFPinterface.parseLog(log)
        } catch (e) {
          return undefined
        }
      })
      // Get rid of the unknown events
      .filter((event) => event !== undefined)
      // Keep only Transfer events
      .filter((event) => event.name === "Transfer")
      // Take the third argument which is the token id
      .map((event) => event.args[2].toNumber())
      // Take the first id (there is only one)
      .shift()
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
      const receipt = await tx.wait()
      const tokenId = getTokenIdFromTxReceipt(receipt)
      const tokenMetadata = await getTokenMetadata(tokenId)
      setTokenId(tokenId)
      setTokenMetadata(tokenMetadata)
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
        {!tokenMetadata && (
          <>
            {mintPrice?.gt(0) && (
              <div>{utils.formatEther(mintPrice)} ETH</div>
            )}
            <button onClick={handleMint} className="hover:bg-indigo-600 bg-indigo-500 text-white px-4 py-2 rounded-md">
              Mint your PFP
            </button>
          </>
        )}
        {tokenMetadata && (
          <a href={`https://kovan-optimistic.etherscan.io/token/${collectionAddress}?a=${tokenId}`}>
            <img src={tokenMetadata.image} />
          </a>
        )}
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