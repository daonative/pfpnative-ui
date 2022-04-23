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
  const { query: { collectionId: collectionAddress } } = useRouter()
  const { library } = useEthers()

  const generateInviteCodes = async () => {
    const signer = library.getSigner()
    const inviteCode = (Math.random() + 1).toString(36).substring(2)
    const inviteHash = ethers.utils.solidityKeccak256(['string'], [inviteCode]);
    const inviteSig = await signer.signMessage(ethers.utils.arrayify(inviteHash))
    return { inviteCode, inviteSig }
  }

  const handleGenerateInviteLink = async () => {
    const { inviteCode, inviteSig } = await generateInviteCodes()
    const link = `${window?.origin}/pfp/${collectionAddress}/mint?inviteCode=${inviteCode}&inviteSig=${inviteSig}`
    setInviteLink(link)
  }

  return (
    <>
      {!inviteLink && (
        <div>
          <button onClick={handleGenerateInviteLink} className="hover:bg-indigo-600 bg-indigo-500 text-white px-4 py-2 rounded-md">
            Generate Invite Link
          </button>
        </div>
      )}
      {inviteLink && (
        <div className="w-full">
          <input
            type="text"
            disabled
            className="text-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full  border-transparent rounded-md w-full"
            value={inviteLink}
          />
        </div>
      )}
    </>
  )
}

const Token = ({token}) => {
  console.log(token.metadata)
  return (
    <div>
      <img src={token.metadata.image} />
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
    const getTokenMetadata = async (tokenId) => {
      const contract = new ethers.Contract(collectionAddress, pfpAbi, library.getSigner())
      const uri = await contract.tokenURI(tokenId)
      const metadataEncoded = uri.split(';base64,').pop()
      const metadata = JSON.parse(atob(metadataEncoded))
      return metadata
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
        metadata: await getTokenMetadata(tokenId),
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
      {!isLoading && collectionTokens.length === 0 && (
        <NoTokens />
      )}
      {account === collectionOwner && (
        <InviteLink />
      )}
      {!isLoading && collectionTokens.length !== 0 && (
        <div className="flex gap-4">
          {collectionTokens.map(token => <Token key={token.tokenId} token={token} />)}
        </div>
      )}
    </div>
  );

}

const PFP = () => {
  return (
    <div >
      <main className={styles.main}>
        <div className="flex justify-center w-full max-w-2xl">
          <div>
            <CollectionTokens />
          </div>
        </div>
      </main>
    </div>
  )
}

export default PFP