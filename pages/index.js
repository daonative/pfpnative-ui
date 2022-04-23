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
  ({ onChange, onBlur, name, label }, ref) => (
    <div className="flex flex-col gap-3">
      <label>{label}</label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="20">20</option>
        <option value="30">30</option>
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
    <div>
      {!account && (
        <button onClick={() => activateBrowserWallet()}>Connect</button>
      )}
      {account && <p>Account: {account}</p>}
      {etherBalance && <p>Balance: {formatEther(etherBalance)}</p>}
    </div>
  );
};
const Wrapper = ({ children }) => {
  const { account } = useEthers()
  if (!account) return null
  return children



}
const CreatorForm = () => {
  const { library } = useEthers()

  const contract = new Contract('0x2dc5f315decc758d5deacbf303f6ec5897c40976', creatorAbi, library.getSigner())
  const { register, handleSubmit } = useForm();


  const { state, send } = useContractFunction(contract, 'createPFPCollection', { transactionName: 'createPFPCollection' })
  console.log(state)

  const createPFPContract = (bodies, heads) => {
    send("PFPNative",
      "PFP",
      0,
      data.bgcolors,
      data.palette,
      bodies.map(({ data }) => data),
      heads.map(({ data }) => data)
    )
  }
  const onSubmit = data => {
    const heads = [
      {
        "filename": "head-0-0",
        "data": "0x0004160d0a0c0d0c0d030d0208020d0208030d030d0101010e020d0101010e030d030d020e020d020e030d030d020e020d020e030d0c0d0c0d080d0308010d0c0d"
      },
      {
        "filename": "head-0-1",
        "data": "0x0003140c0b090109010201020e0101020e02010201010e01030101010e010302010201020e0101020e0201090106010203010105010303010109010901"
      },
      {
        "filename": "head-0-2",
        "data": "0x0005140c0a0a010a010301020e0101020e02010301010e0201010e03010301020e0101020e02010a010a010a01"
      },
      {
        "filename": "head-0-3",
        "data": "0x0004160d0a0c050c050c050305020e0205020e03050305020e0205020e03050305010e01010205010e010103050c050205080702050c050c05"
      },
      {
        "filename": "head-0-4",
        "data": "0x0004160d0a0c070c070c070307020e0207020e03070307020e0207020e03070307010e01010207010e010103070c070c070c070c07"
      },
      {
        "filename": "head-1-0",
        "data": "0x00011a0f080500020f0200060f011002000500030f0110010f061002000400050f0110040f04000400010f0100020f0a000400010f0200040f07000300020f0500030f05000300010f0800030f03000300010f08000211031201000300020f05000211030e031201000211020f021203000211010e020103120211030e03120200021106120211010e02010312020003110512031105120300031103120100041103120b000200031101120c00"
      },
      {
        "filename": "head-1-1",
        "data": "0x00041c190d0200010102060a000100020102060a000200010101060b000200010101060b00020002060b000100050609000406010101060900060109000101040e010109000101010e0101010e020109000101040e010109000601090001060101030601010900010601010306030107000106010104060201070001000101050604010400010002010706020103000100010602010a060100020001060201080602010300010602010606020101000300020603010106040102000400030604010400"
      },
      {
        "filename": "head-1-2",
        "data": "0x00011d1a030c0002100c000c0001100d00090001100107021001000307090007000110030701100206021003070110060005000210010e01070210020601010410020e0110050004000110030e031004060410020e0110040003000110020e01070410050603100107020e01100300020001100207041008060410010e0207020001000210010703100a06061001070200010005100c0607100100041002000d060300041005000106070101060501070005000206010e01060401010604010206060005000206010e02060201030602010306060005000106020e0d06050005000106020e0d06050005000206010e0d06050006000106010e0c06060006000106020e0b06060006000206020e0a06060007000206020e0806070008000206020e070607000a000106030e040608000b0005060a000b00020601010c000c00010601010c00"
      },
      {
        "filename": "head-1-3",
        "data": "0x00011919080a00030a04000900030a05000900020a06000800030a060007000110010f031005000700010a041005000500040101100401030005000101020e010101100101020e0101030002000401010e0401010e02010300020001010110010f0101020e010101100101020e0101030003000110010f04010110040103000200010f0110010a061001130210010f02000200010f08100213010a0110020001000110010a08100213010a010f0110010001000b100213010a011001000110020a0a100213010a01100e100113010a01100d100213020a0d100213010a010001000d100113010a010001000d10020a010002000b10020a020003000a10010a0300030009100500050004100800"
      },
      {
        "filename": "head-1-4",
        "data": "0x0005191a070500030f03000101010f0500040001010200020f0100020f0100010f04000200090f0101060004000101020f0101050f030102000300030f0105040f0105020f0105020101000200020f0305010f01010105010f0205010f02050101010001000605010f05050108020502010100010501080e05010103050101010e050501080101010e040501010305020e0605020e01080305010111050101010004050102030501020605020101000e050201010002000105050103050102030501010200020001010108041406050201020003000501050502010300040008050201040004000205020804050101050005000605020105000500060501010600060002050102010502010600080003010700"
      }
    ]
    const bodies = [
      {
        "filename": "body-0-0",
        "data": "0x000c161b0c080202000803020008020200080302000802020008030200080202000804020008040200080402000204040002040200020404000204020002040400020402000204040002040200040402000404040402000404"
      },
      {
        "filename": "body-0-1",
        "data": "0x000c161b0b0100020501060305010601050200010003050106010501060205020001000405010603050200010008050200010008050200010008050200010008050200010602070106030701060107010601000107010601070106010701060107030601000207010601070106050701000a0701000a07010001000203040002030200010002030400020302000100020301080103020002030108010301000203010801030200020301080103"
      },
      {
        "filename": "body-0-2",
        "data": "0x000c161b0b010008020200010008070200010008020200010008070200010008020200010008070200010008020200090902000209070a02000209070a02000209010a0400020a02000100020a0400020a02000100020a0400020a02000100020a0400020a02000100020a010b010a0200020a010b010a0100020a010b010a0200020a010b010a"
      },
      {
        "filename": "body-0-3",
        "data": "0x000d141a0c070c0100070c0100010c0105020c0105020c0100070c0100010c0105010c0105030c0100070c0100010c0105030c0105010c0100070c01000100010c0300010c02000100010c0300010c02000100010c0300010c02000100010c0300010c02000100010c0300010c02000100020c01050100020c0105"
      },
      {
        "filename": "body-0-4",
        "data": "0x000c161b0c0a010a010a010a010a010a010a010a010a010a010a010a010a01020001010300010103000200010103000101030002000201020002010200"
      },
      {
        "filename": "body-1-0",
        "data": "0x00081b100513000101010001010101020001010f000101010001010201010001010f000301010003010f0002010100020002010e0002010200030002010b00030103000400020109000201050005000301060002010600070008010700"
      },
      {
        "filename": "body-1-1",
        "data": "0x000d1a1805060005010a000400030104000401060003000201090003010400020002010c0002010300010002010e00020102000201100001010200010111000101020003010e000301010004010d00040104010d00040104010d0003010100110003010100"
      },
      {
        "filename": "body-1-2",
        "data": "0x000619100e09000101010009000101010008000301070004010800030109000101010009000101010009000101010008000201010008000101020009010200"
      },
      {
        "filename": "body-1-3",
        "data": "0x00091f0f021b000201170005010100160002010500010004011000020106000201020001011000010107000400010103000a0103000101070004000501080005010700"
      }
    ]
    createPFPContract(bodies, heads)
  };

  return (<form
    onSubmit={handleSubmit(onSubmit)}
    className="flex flex-col gap-y-8"
  >
    <Input
      name="communityName"
      label="Community Name"
      placeholder="DAOschool"
      register={register}
    />
    <CardSelect label={'Head Collections'} />
    <CardSelect label={'Body Collections'} />
    <button
      type="submit"
      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Create
    </button>
  </form>)
}

export default function Home() {


  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Connect />
      <main className={styles.main}>
        <div className="flex justify-between gap-10 w-full max-w-2xl">
          <div>
            <Wrapper>
              <CreatorForm />
            </Wrapper>
          </div>

          <div>
            <h2>preview</h2>
            <div className="w-[300px] h-[300px] flex justify-center items-center bg-white rounded-lg shadow divide-y divide-x divide-gray-200 cursor-pointer">
              image
            </div>
          </div>
        </div>
      </main>

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
