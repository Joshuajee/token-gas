import SendForm from '@/components/Send/SendForm'
import { SwapTransaction, columns } from '@/components/Swap/Columns'
import SwapForm from '@/components/Swap/SwapForm'
import { SwapTransactionRecord } from '@/components/Swap/SwapTransactionRecord'
import Nav from '@/components/ui/nav'
import myData from "@/lib/swapData.json"
import Link from 'next/link'
import React, { useState } from 'react'
import { TbArrowBigDownLinesFilled } from "react-icons/tb";

export default function Swap() {
    //! fix this before deployment .
    //@ts-ignore
    const [data, setData] = useState<SwapTransaction[]>(myData);

    return (
        <main className='h-screen '>
            <Nav />
            <div className='h-[90%]  '>
                <div className='h-full flex items-center justify-center relative'>
                    <SwapForm />

                    <Link href="#swaprecord" className='absolute bottom-4 right-14'>
                        <TbArrowBigDownLinesFilled size={30} />
                    </Link>
                </div>
                <div className='h-[100vh]   px-3  pt-[5%] '>
                    {data && <SwapTransactionRecord columns={columns} data={data} />}
                </div>
            </div>
        </main>
    )
}

