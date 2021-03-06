import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useForm } from 'react-hook-form';
import { buildSVG } from '@nouns/sdk';
import ImageData from "../assets/image-data.json";

import { useEthers } from '@usedapp/core';

import { creatorAbi } from '../abi';
import { ethers, Contract, utils } from 'ethers'
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import WalletConnectProvider from '@walletconnect/web3-provider';


export const Input = ({ name, register, required, placeholder, className }) => {
  return <input
    type="text"
    {...register(name, { required })}
    className="text-2xl focus:ring-indigo-500 focus:border-indigo-500 block w-full  border-transparent rounded-md"
    placeholder={placeholder}
  />
}

export const TextField = ({ label, name, register, required, placeholder }) => {
  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <div className="mt-1">
        <Input name={name} register={register} required={required} placeholder={placeholder} />

      </div>
    </div>
  );
};


const CardLabel = ({ children }) => {
  return <label
    htmlFor="email"
    className="block text-sm font-medium text-gray-700"
  >
    {children}
  </label>
}

export const CardSelect = ({ assets, children }) => {
  if (!assets) return null
  return (
    <div role="list" className="grid grid-cols-1 gap-8 grid-cols-2 ">
      {children}
      <div
        className=" w-[150px] peer-checked:bg-blue-100 col-span-1 grid grid-cols-2 bg-white rounded-lg shadow divide-y divide-x divide-gray-200 cursor-pointer "
      >
        {assets.map((asset, index) => {
          return (
            <div key={index} className="w-[75px] h-[75px]  flex items-center justify-between space-x-6 aspect-square pb-full">
              <Preview parts={[asset]} />
            </div>
          )
        })}
      </div>
    </div>
  );
};

const Preview = ({ parts }) => {
  const { bgcolors, palette } = ImageData;
  const svg = buildSVG(parts, palette, 'ffffff00')
  const encodedSvgData = `data:image/svg+xml;base64,${btoa(svg)}`
  return <img src={encodedSvgData} />
}

const RandomPreview = ({ selectedBodies, selectedHeads }) => {
  const [parts, setParts] = useState([])

  const previewRandomParts = useCallback(() => {
    let parts = [];

    if (selectedBodies.length > 0)
      parts.push(selectedBodies[Math.floor(Math.random() * selectedBodies.length)])

    if (selectedHeads.length > 0)
      parts.push(selectedHeads[Math.floor(Math.random() * selectedHeads.length)])

    setParts(parts)
  }, [selectedBodies, selectedHeads])

  useEffect(() => {
    previewRandomParts()
  }, [previewRandomParts])

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <h2>Preview</h2>
        <button onClick={previewRandomParts}>Refresh</button>
      </div>
      <div className="w-[300px] h-[300px] flex justify-center items-center bg-white rounded-lg shadow divide-y divide-x divide-gray-200 cursor-pointer">
        <Preview parts={parts} />
      </div>
    </div>
  )
}

const Connect = () => {
  const { activateBrowserWallet, account, activate } = useEthers();

  const handleWalletConnect = async () => {
    const provider = new WalletConnectProvider({
      infuraId: '2b1d42fbf594412093c66e1efcdf8b3d',
      rpc: {
        69: 'https://kovan.optimism.io/'
      },
    })
    await provider.enable()
    activate(provider)
  }

  return (
    <div className='h-screen w-screen flex justify-center items-center flex-col gap-5'>
      <button
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={() => activateBrowserWallet()}>
        Metamask
      </button>

      <button

        className="border-1 inline-flex items-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md shadow-sm text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"

        onClick={handleWalletConnect}>
        Wallet Connect
      </button>
    </div>
  );
};
export const Wrapper = ({ children }) => {
  const { account, deactivate } = useEthers()
  if (!account) return <Connect />
  return (
    <div>
      <div className="cursor-pointer" onClick={deactivate}>{account}</div>
      <div>
        {children}
      </div>
    </div>
  )
}
const CreatorForm = ({ onSelectedBodies = () => { }, onSelectedHeads = () => { } }) => {
  const { library } = useEthers()

  const router = useRouter()

  const contract = new Contract('0xbc578FeC851a2A5195A3D5407e832E769BE8E1E1', creatorAbi, library.getSigner())
  const { register, handleSubmit, watch } = useForm();

  const selectedBodyRange = watch('bodies')
  const selectedHeadRange = watch('heads')

  useEffect(() => {
    if (!selectedBodyRange) return
    const selectedBodies = ImageData.images?.bodies.slice(...(selectedBodyRange.split(',')))
    onSelectedBodies(selectedBodies)
  }, [selectedBodyRange, onSelectedBodies])

  useEffect(() => {
    if (!selectedHeadRange) return
    const selectedHeads = ImageData.images?.heads.slice(...(selectedHeadRange.split(',')))
    onSelectedHeads(selectedHeads)
  }, [selectedHeadRange, onSelectedHeads])

  const getPFPContractFromTxReceipt = (txReceipt) => {
    const creatorInterface = new utils.Interface(creatorAbi)
    return txReceipt.logs
      // Parse log events
      .map((log) => {
        try {
          return creatorInterface.parseLog(log)
        } catch (e) {
          return undefined
        }
      })
      // Get rid of the unknown events
      .filter((event) => event !== undefined)
      // Keep only PFPCollectionCreated events
      .filter((event) => event.name === "PFPCollectionCreated")
      // Take the first argument which is the collection address
      .map((event) => event.args[0])
      // Take the first id (there is only one)
      .shift()
  }

  const createPFPContract = async (bodies, heads, name, price) => {
    const toastId = toast.loading("Waiting for transaction signature...")
    try {
      const contract = new ethers.Contract('0xbc578FeC851a2A5195A3D5407e832E769BE8E1E1', creatorAbi, library.getSigner())
      const tx = await contract.createPFPCollection(
        "PFPnative",
        name,
        // add different mint price
        price,
        ImageData.bgcolors,
        ImageData.palette,
        bodies.map(({ data }) => data),
        heads.map(({ data }) => data),
        {
          gasPrice: 1000000000,
          gasLimit: '10000000'
        }
      )
      toast.loading("Creating your PFP collection", { id: toastId })
      const receipt = await tx.wait()
      await new Promise(r => setTimeout(r, 2000));
      const collectionAddress = getPFPContractFromTxReceipt(receipt)
      await router.push(`/pfp/${collectionAddress}`)
      toast.success("Created your PFP collection!", { id: toastId })
    } catch (e) {
      const message = e?.data?.message || e?.error?.message || e.message
      toast.error("Failed create your PFP collection", { id: toastId })
      toast.error(message)
    }
  }
  const onSubmit = data => {
    console.log(data)
    const heads = ImageData.images?.heads.slice(...data.heads.split(','))
    const bodies = ImageData.images?.bodies.slice(...data.bodies.split(','))
    const price = utils.parseEther(data.mintPrice)
    console.log(heads, bodies)
    createPFPContract(bodies, heads, data.communityName, price)
  };

  console.log(ImageData.images.heads)

  const bodiesARange = '0,11'
  const bodiesBRange = '11,15'
  const headsARange = '0,10'
  const headsBRange = '10,15'

  const bodiesA = ImageData.images.bodies.slice(...bodiesARange.split(',')).slice(0, 4)
  const bodiesB = ImageData.images.bodies.slice(...bodiesBRange.split(',')).slice(0, 4)
  const headsA = ImageData.images.heads.slice(...headsARange.split(',')).slice(0, 4)
  const headsB = ImageData.images.heads.slice(...headsBRange.split(',')).slice(0, 4)

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-y-8"
    >
      <TextField
        name="communityName"
        label="Community Name"
        placeholder="DAOschool"
        register={register}
      />
      <div>
        <label className="block text-sm font-medium pb-2">
          Mint Price
        </label>
        <div className="relative rounded-md shadow-sm" style={{ maxWidth: '100px' }}>
          <Input register={register} name="mintPrice" required placeholder="0.1" />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm" id="price-currency">
              ETH
            </span>
          </div>
        </div>
      </div>
      <CardLabel>Head Collections</CardLabel>
      <div className='flex'>
        <label htmlFor="heads-0">
          <CardSelect assets={headsA} >
            <input className="sr-only peer" type="radio" value={headsARange} {...register('heads',)} id="heads-0" />
          </CardSelect>
        </label>

        <label htmlFor="heads-1">
          <CardSelect assets={headsB} >
            <input className="sr-only peer" type="radio" value={headsBRange} {...register('heads',)} id="heads-1" />
          </CardSelect>
        </label>
      </div>
      <CardLabel>Body Collections</CardLabel>

      <div className='flex'>
        <label htmlFor="bodies-1">
          <CardSelect assets={bodiesA} >
            <input className="sr-only peer" type="radio" value={bodiesARange} {...register('bodies',)} id="bodies-1" />
          </CardSelect>
        </label>
        <label htmlFor="bodies-2">
          <CardSelect assets={bodiesB} >
            <input className="sr-only peer" type="radio" value={bodiesBRange} {...register('bodies',)} id="bodies-2" />
          </CardSelect>
        </label>
      </div>
      <CardSelect label={'Body Collections'} />
      <button
        type="submit"
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Create
      </button>
    </form >
  )
}

export default function Home() {
  const [selectedBodies, setSelectedBodies] = useState([])
  const [selectedHeads, setSelectedHeads] = useState([])

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Wrapper>
        <main className={styles.main}>
          <div className="flex justify-between gap-10 w-full max-w-2xl">
            <div>
              <CreatorForm onSelectedHeads={setSelectedHeads} onSelectedBodies={setSelectedBodies} />
            </div>

            <div>
              <RandomPreview selectedBodies={selectedBodies} selectedHeads={selectedHeads} />
            </div>
          </div>
        </main>
      </Wrapper>
    </div>
  );
}
