import { useEthers } from "@usedapp/core";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from '../../../styles/Home.module.css';
import { pfpAbi } from "../../../abi";
import { ethers } from 'ethers'
import toast from "react-hot-toast";

const InvalidCode = () => (
  <div className="flex items-center">
    Invalid invite code :-(
  </div>
)

const MintButton = () => {
  const { query: { collectionId: collectionAddress,  inviteCode, inviteSig  } } = useRouter()
  const { library } = useEthers()

  const mintPFP = async () => {
    console.log(inviteCode, inviteSig)
    const contract = new ethers.Contract(collectionAddress, pfpAbi, library.getSigner())
    await contract.safeMint(inviteCode, inviteSig)
  }

  const handleMint = async () => {
    const toastId = toast.loading("Waiting for transaction signature...")
    try {
      const tx = await mintPFP()
      toast.loading("Minting your PFP...", { id: toastId })
      await tx.wait()
      toast.success("Successfully minted your PFP", { id: toastId })
    } catch(e) {
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

const CollectionTokens = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [collectionTokens, setCollectionTokens] = useState([])
  const [collectionOwner, setCollectionOwner] = useState()
  const { query: { collectionId: collectionAddress } } = useRouter()
  const { library, account } = useEthers()

  useEffect(() => {
    const getTokenURI = async (tokenId) => {
      const contract = new ethers.Contract(collectionAddress, pfpAbi, library.getSigner())
      const uri = await contract.tokenURI(tokenId)
      return uri
    }

    const retrieveCollectionOwner = async () => {
      const contract = new ethers.Contract(collectionAddress, pfpAbi, library.getSigner())
      const owner = await contract.owner()
      setCollectionOwner(owner)
    }

    const retrieveTokens = async () => {
      setIsLoading(true)
      const contract = new ethers.Contract(collectionAddress, pfpAbi, library.getSigner())
      const currentSupply = await contract.totalSupply()
      const tokenIds = [...Array(currentSupply.toNumber()).keys()]
      const tokens = await Promise.all(tokenIds.map(async tokenId => ({
        tokenId,
        owner: await contract.ownerOf(tokenId),
        metadata: await getTokenURI(tokenId),
      })))
      setCollectionTokens(tokens)
      setIsLoading(false)
    }

    if (!library || !account || !collectionAddress)
      return

    retrieveTokens()
    retrieveCollectionOwner()
  }, [library, account, collectionAddress])

  return (
    <div className="flex flex-col gap-4 items-center">
    </div>
  );

}

const Wrapper = ({ children }) => {
  const { account } = useEthers()
  if (!account) return null
  return children
}

const PFP = () => {
  return (
    <div >
      <main className={styles.main}>
        <div className="flex justify-center w-full max-w-2xl">
          <div>
            <MintButton />
          </div>
        </div>
      </main>
    </div>
  )
}

export default PFP