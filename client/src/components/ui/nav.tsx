"use client"
import React, { useState } from 'react'
import { ModeToggle } from './modetoggle'
import { ConnectKitButton } from 'connectkit'
import {
    NavigationMenu,
    // NavigationMenuContent,
    // NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    // NavigationMenuTrigger,
    // NavigationMenuViewport,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Link from 'next/link'
import { TiThMenu } from "react-icons/ti";
<TiThMenu />
import { useRouter } from 'next/router';


export default function Nav() {

    const [mobileNav, setMobileNav] = useState<boolean>(false)
    const router = useRouter();
    console.log(router.pathname)

    return (
        <div className='h-[10%] max-h-[100px] flex  justify-between  items-center px-10 shadow-sm relative'>
            <div className='flex gap-3 items-center'>
                <Link href="/"> <h1 className='font-semibold text-xl'>TokenGas</h1></Link>


            </div>
            <div className='hidden md:flex justify-end items-end gap-3' id='nav'>
                <NavigationMenu>
                    <NavigationMenuList>

                        <NavigationMenuItem>
                            <Link href="/transfer" legacyBehavior passHref >
                                <NavigationMenuLink className={`${router.pathname == "/transfer" ? "bg-secondary" : ""} ${navigationMenuTriggerStyle()}`}>
                                    Transfer
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link href="/swap" legacyBehavior passHref>
                                <NavigationMenuLink className={`${router.pathname == "/swap" ? "bg-secondary" : ""} ${navigationMenuTriggerStyle()}`}>
                                    Swap
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link href="/liquidity" legacyBehavior passHref>
                                <NavigationMenuLink className={`${router.pathname == "/liquidity" ? "bg-secondary" : ""} ${navigationMenuTriggerStyle()}`}>
                                    Liquidity
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link href="/faucet" legacyBehavior passHref>
                                <NavigationMenuLink className={`${router.pathname == "/faucet" ? "bg-secondary" : ""} ${navigationMenuTriggerStyle()}`}>
                                    Faucet
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                <ModeToggle />
                <ConnectKitButton />
            </div>
            <div className='flex md:hidden justify-end items-center  h-full ' id='nav'>
                <TiThMenu size={30} className='cursor-pointer' onClick={() => setMobileNav(!mobileNav)} />
            </div>

            {
                mobileNav && <div className='flex flex-col gap-4 w-[90%] max-w-[300px] absolute z-30 right-3 top-[100%] h-auto py-6  bg-background shadow-md shadow-muted rounded-lg'>
                    <Link href={"/transfer"} onClick={() => setMobileNav(!mobileNav)} className='h-12 flex px-3  items-center cursor-pointer hover:bg-gray-600 font-semibold text-sm'>Transfer</Link>
                    <Link href={"/swap"} onClick={() => setMobileNav(!mobileNav)} className='h-12 flex px-3  items-center cursor-pointer hover:bg-gray-600 font-semibold text-sm'>Swap</Link>
                    <Link href={"/liquidity"} onClick={() => setMobileNav(!mobileNav)} className='h-12 flex px-3  items-center cursor-pointer hover:bg-gray-600 font-semibold text-sm'>Liquidity</Link>
                    <Link href={"/faucet"} onClick={() => setMobileNav(!mobileNav)} className='h-12 flex px-3  items-center cursor-pointer hover:bg-gray-600 font-semibold text-sm'>Faucet</Link>

                    <div className='px-3'>
                        <ModeToggle />
                    </div>
                    <div className='px-3'>
                        <ConnectKitButton />
                    </div>
                </div>
            }
        </div>
    )
}
