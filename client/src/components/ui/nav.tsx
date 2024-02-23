import React from 'react'
import { ModeToggle } from './modetoggle'
import { ConnectKitButton } from 'connectkit'
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Link from 'next/link'




export default function Nav() {
    return (
        <div className='h-[10%] max-h-[100px] flex  justify-between  items-center px-10 shadow-sm'>
            <div className='flex gap-3 items-center'>
                <Link href="/"> <h1 className='font-semibold text-xl'>TokenGas</h1></Link>


            </div>
            <div className='flex justify-end items-end gap-3'>
                <NavigationMenu>
                    <NavigationMenuList>

                        <NavigationMenuItem>
                            <Link href="/sponsor" legacyBehavior passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                    Sponsors
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                <ModeToggle />
                <ConnectKitButton />
            </div>
        </div>
    )
}
