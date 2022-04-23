import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon, CheckCircleIcon, MenuAlt2Icon } from '@heroicons/react/solid';
// import { UserAvatar, UserName } from './PFP';

import { useEthers } from '@usedapp/core';

const ChainLogo = ({ chainId, className }) => {
    if (chainId === 137)
        return <PolygonLogo className={className} />

    if (chainId === 4)
        return (
            <>
                <span className="text-xs tex-daonative-subtitle pr-1">Rinkeby</span>
                <EthereumLogo className={className} />
            </>
        )

    if (chainId === 1)
        return <EthereumLogo className={className} />

    return <></>
}

const HeaderNavigation = ({ onShowSidebar, showLogWork = true }) => {
    const { chainId, account, active, deactivate } = useEthers()
    const isConnected = active

    return (
        <div className="md:pl-64 flex flex-col ">
            <div className="sticky top-0 z-10 flex-shrink-0 flex h-16">
                <div className="flex-1 px-4 flex justify-between">
                    <div className="ml-4 flex items-center md:ml-6">
                        <button
                            type="button"
                            className="mx-2 bg-daonative-component-bg  p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <span className="sr-only">View notifications</span>
                            <BellIcon className="h-6 w-6" aria-hidden="true" />
                        </button>

                        {!isConnected && (
                            <button
                                className="font-sans flex h-8 px-2 items-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500  bg-daonative-component-bg text-daonative-gray-100 rounded-full"
                                onClick={openConnectWalletModal}
                            >
                                Connect
                            </button>
                        )}

                        {isConnected && (
                            <Menu as="div" className="ml-2">
                                <div>
                                    <Menu.Button className="font-sans flex gap-2 px-2 h-8 items-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-daonative-component-bg text-daonative-gray-100 rounded-md">
                                        <span className="sr-only">Open user menu</span>
                                       <div>
                                            <div className="flex gap-1 items-center">
                                                {account}
                                            </div>
                                        </div>
                                        {/* eslint-disable @next/next/no-img-element */}
                                        {/* eslint-enable @next/next/no-img-element */}
                                    </Menu.Button>
                                </div>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items
                                        style={{
                                            boxShadow: '0px 0px 15px rgb(160 163 189 / 10%)',
                                        }}
                                        className=" origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1  ring-1 ring-black ring-opacity-5 focus:outline-none bg-daonative-dark-300 border-[1px] border-daonative-border">
                                        <Menu.Item>
                                            <button
                                                className="font-sans block px-4 py-2 text-sm text-daonative-gray-100 w-full h-full"
                                                onClick={deactivate}
                                            >
                                                Disconnect
                                            </button>
                                        </Menu.Item>
                                    </Menu.Items>
                                </Transition>
                            </Menu>

                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeaderNavigation