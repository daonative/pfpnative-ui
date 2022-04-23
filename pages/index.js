import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { useForm } from 'react-hook-form';
import data from '../assets/image-data.json'
import { buildSVG } from '@nouns/sdk';
import ImageData from "../assets/image-data.json";

import { useEtherBalance, useEthers, Config, useContractFunction } from '@usedapp/core';

import { formatEther } from '@ethersproject/units';
import { creatorAbi } from '../abi';
import { Contract, utils } from 'ethers'
import { useRouter } from 'next/router';


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

export const Select = React.forwardRef(
  ({ onChange, onBlur, name, label, data = [] }, ref) => (
    <div className="flex flex-col gap-3">
      <label>{label}</label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        {data.map((item) => {
          return <option value={JSON.stringify(item?.assets)}>{item.title}</option>
        })}
      </select>
    </div>
  )
);
Select.displayName = 'Select';
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
        {assets.map((asset) => {
          return (
            <div className="w-[75px] h-[75px]  flex items-center justify-between space-x-6 aspect-square pb-full">
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

const PreviewExample = () => {
  const { images } = ImageData;
  const parts = [
    images.bodies[2],
    images.heads[1]
  ]

  return <Preview parts={parts} />
}

const Connect = () => {
  const { activateBrowserWallet, account } = useEthers();

  const etherBalance = useEtherBalance(account);

  return (
    <div className='h-screen w-screen flex justify-center items-center'>
      <button
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={() => activateBrowserWallet()}>
        Connect
      </button>
    </div>
  );
};
const Wrapper = ({ children }) => {
  const { account } = useEthers()
  if (!account) return <Connect />
  return children
}
const CreatorForm = () => {
  const { library } = useEthers()

  const router = useRouter()

  const contract = new Contract('0x2dc5f315decc758d5deacbf303f6ec5897c40976', creatorAbi, library.getSigner())
  const { register, handleSubmit } = useForm();
  const { state, send } = useContractFunction(contract, 'createPFPCollection', { transactionName: 'createPFPCollection' })

  const createPFPContract = (bodies, heads, name, price) => {

    contract.on('PFPCollectionCreated', (event) => {
      router.push(`/pfp/${event}`)
    })
    send("PFPNative",
      name,
      // add different mint price
      price,
      data.bgcolors,
      data.palette,
      bodies.map(({ data }) => data),
      heads.map(({ data }) => data)
    )
  }
  const onSubmit = data => {
    console.log(data)
    const heads = data?.images?.heads.slice(...data.heads)
    const bodies = data?.images?.bodies.slice(...data.bodies)
    const price = utils.parseEther(data.mintPrice)
    createPFPContract(bodies, heads, data.communityName, price)
  };

  const bodiesA = data.images.bodies.slice(0, 4)
  const bodiesB = data.images.bodies.slice(5, 8)

  const headsA = data.images.heads.slice(0, 4)
  const headsB = data.images.heads.slice(5, 9)

  console.log('preview', headsA)
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
            <input className="sr-only peer" type="radio" value={[0, 4]} {...register('heads',)} id="heads-0" />
          </CardSelect>
        </label>

        <label htmlFor="heads-1">
          <CardSelect assets={headsB} >
            <input className="sr-only peer" type="radio" value={[5, 9]} {...register('heads',)} id="heads-1" />
          </CardSelect>
        </label>
      </div>
      <CardLabel>Body Collections</CardLabel>

      <div className='flex'>
        <label htmlFor="bodies-1">
          <CardSelect assets={bodiesA} >
            <input className="sr-only peer" type="radio" value={[5, 9]} {...register('bodies',)} id="bodies-1" />
          </CardSelect>
        </label>
        <label htmlFor="bodies-2">
          <CardSelect assets={bodiesB} >
            <input className="sr-only peer" type="radio" value={[5, 9]} {...register('bodies',)} id="bodies-2" />
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
              <CreatorForm />
            </div>

            <div>
              <h2>preview</h2>
              <div className="w-[300px] h-[300px] flex justify-center items-center bg-white rounded-lg shadow divide-y divide-x divide-gray-200 cursor-pointer">
                <PreviewExample />
              </div>
            </div>
          </div>
        </main>
      </Wrapper>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}
