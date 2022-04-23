import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { useForm } from 'react-hook-form';
import data from '../assets/image-data.json'

import { useEtherBalance, useEthers, Config, useContractFunction } from '@usedapp/core';

import { formatEther } from '@ethersproject/units';
import { creatorAbi } from '../abi';
import { Contract } from 'ethers'
import { useRouter } from 'next/router';

export const Input = ({ label, name, register, required, placeholder }) => {
  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor="email"
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <div className="mt-1">
        <input
          type="text"
          {...register(name, { required })}
          className="text-2xl focus:ring-indigo-500 focus:border-indigo-500 block w-full  border-transparent rounded-md"
          placeholder={placeholder}
        />
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

export const CardSelect = ({ label }) => {
  const people = [1, 2];
  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor="email"
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <ul role="list" className="grid grid-cols-1 gap-8 grid-cols-2 ">
        {people.map(person => (
          <li
            key={person.email}
            className="w-[150px] col-span-1 grid grid-cols-2 bg-white rounded-lg shadow divide-y divide-x divide-gray-200 cursor-pointer "
          >
            <div className="w-[75px] h-[75px]  flex items-center justify-between p-6 space-x-6 aspect-square pb-full">
              1
            </div>
            <div className="aspect-square w-[75px] h-[75px] flex items-center justify-between p-6 space-x-6">
              2
            </div>
            <div className="aspect-square w-[75px] h-[75px] flex items-center justify-between p-6 space-x-6">
              3
            </div>
            <div className="w-[75px] h-[75px] flex items-center justify-between p-6 space-x-6">
              4
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

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
export const Wrapper = ({ children }) => {
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
  console.log(state)

  const createPFPContract = (bodies, heads, name) => {
    contract.on('PFPCollectionCreated', (event) => {
      router.push(`/pfp/${event}`)
    })
    send("PFPNative",
      name,
      // add different mint price
      0,
      data.bgcolors,
      data.palette,
      bodies.map(({ data }) => data),
      heads.map(({ data }) => data)
    )
  }
  const onSubmit = data => {

    console.log(data)
    const parsedHeads = JSON.parse(data.heads)
    const parsedBodies = JSON.parse(data.bodies)

    createPFPContract(parsedBodies, parsedHeads, data.communityName)
  };

  const bodiesA = data.images.bodies.slice(0, 4)
  const bodiesB = data.images.bodies.slice(5, 8)

  const headsA = data.images.heads.slice(0, 4)
  const headsB = data.images.heads.slice(5, 9)
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-y-8"
    >
      <Input
        name="communityName"
        label="Community Name"
        placeholder="DAOschool"
        register={register}
      />
      <Select label={"Head Collections"} name="heads" {...register('heads')} data={[{ title: 'A', assets: headsA }, { title: 'B', assets: headsB }]} />
      <Select label={"Body Collections"} name="bodies" {...register('bodies')} data={[{ title: 'A', assets: bodiesA }, { title: 'B', assets: bodiesB }]} />
      {/* <CardSelect label={'Head Collections'} register={register}/>
      <CardSelect label={'Body Collections'} /> */}
      < button
        type="submit"
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                image
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
