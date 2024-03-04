
import { columns } from '@/components/Swap/Columns'
import SwapForm from '@/components/Swap/SwapForm'
import { SwapTransactionRecord } from '@/components/Swap/SwapTransactionRecord'
import Nav from '@/components/ui/nav'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import React from 'react'
import { TbArrowBigDownLinesFilled } from "react-icons/tb";
import { Toaster } from 'sonner'

const fetchTransactions = async () => {
    try {
        const response = await fetch('/api/transactions?type=SWAP&start=0&count=30');

        if (!response.ok) {
            throw new Error('Something went wrong');
        }

        const data = await response.json();
        return data.data

    } catch (error) {
        console.error(error);



    }
}


export default function Swap() {
    //! fix this before deployment .
    //@ts-ignore
    // const [data, setData] = useState<SwapTransaction[]>(myData);
    const { data } = useQuery({
        queryKey: ['swap'],
        queryFn: () => fetchTransactions(),

    });


    return (
        <main className='h-screen '>
            <Nav />
            <div className='h-[90%]  '>
                <div className='h-full flex items-center justify-center relative' id='head'>
                    <SwapForm />

                    <Link href="#swaprecord" className='absolute bottom-4 right-14'>
                        <TbArrowBigDownLinesFilled size={30} />
                    </Link>
                </div>
                <div className='h-[100vh]   px-3  pt-[5%] '>
                    {data && <SwapTransactionRecord columns={columns} data={data} />}
                </div>
            </div>
            <Toaster richColors />
        </main>
    )
}

