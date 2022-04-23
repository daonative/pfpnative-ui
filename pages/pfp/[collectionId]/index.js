import { useEthers } from "@usedapp/core";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from '../../../styles/Home.module.css';
import { pfpAbi } from "../../../abi";
import { ethers } from 'ethers'

const CollectionTokens = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [collectionTokens, setCollectionTokens] = useState([])
  const { query: { collectionId: collectionAddress } } = useRouter()
  const { library } = useEthers()

  useEffect(() => {
    const getTokenURI = async (tokenId) => {
      const contract = new ethers.Contract(collectionAddress, pfpAbi, library.getSigner())
      const uri = await contract.tokenURI(tokenId)
      return uri
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

    if (!library || !collectionAddress)
      return

    retrieveTokens()
  }, [library, collectionAddress])

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
        <div className="flex justify-between w-full max-w-2xl">
          <CollectionTokens />
        </div>
      </main>
    </div>
  )
}

export default PFP