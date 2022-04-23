import { useEthers } from "@usedapp/core";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from '../../../styles/Home.module.css';
import { pfpAbi } from "../../../abi";
import { ethers } from 'ethers'

const NoTokens = () => (
  <div className="flex items-center">
    No PFPs minted yet. Generate an invite link and mint your first PFP!
  </div>
)

const InviteLink = () => {
  const [inviteLink, setInviteLink] = useState()

  const generateInviteCodes = async () => {
    const signer = library.getSigner()
    const inviteCode = (Math.random() + 1).toString(36).substring(2)
    const inviteHash = ethers.utils.solidityKeccak256(['string', 'uint'], [inviteCode, 0]);
    const inviteSig = await signer.signMessage(ethers.utils.arrayify(inviteHash))
    return { inviteCode, inviteSig }
  }

  const handleGenerateInviteLink = async () => {
    const { inviteCode, inviteSig } = await generateInviteCodes()
    const link = `${window?.origin}/pfp/${collectionAddress}/mint?inviteCode=${inviteCode}&inviteSig=${inviteSig}`
    setInviteLink(link)
  }

  return (
    <div>
      <button onClick={handleGenerateInviteLink}>
        Generate Invite Link
      </button>
      {inviteLink}
    </div>
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

  if (!isLoading && collectionTokens.length === 0) {
    return <NoTokens />
  }

  if (account === collectionOwner) {
    return <InviteLink />
  }

  return (
    <></>
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
          <CollectionTokens />
        </div>
      </main>
    </div>
  )
}

export default PFP