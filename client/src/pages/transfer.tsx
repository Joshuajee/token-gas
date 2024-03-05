
import { Transaction, columns } from '@/components/Send/Columns'
import SendForm from '@/components/Send/SendForm'
import { TransactionRecord } from '@/components/Send/TransactionRecord'
import Nav from '@/components/ui/nav'
import mydata from "@/lib/data.json"
import { createPermit } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { TbArrowBigDownLinesFilled } from 'react-icons/tb'
import { Toaster } from 'sonner'

const fetchTransactions = async () => {
    try {
        const response = await fetch('/api/transactions?type=TRANSFER&start=0&count=30');

        if (!response.ok) {
            throw new Error('Something went wrong');
        }

        const data = await response.json();

        return data.data

    } catch (error) {
        console.error(error);



    }
}

export default function Transfer() {

    const { data } = useQuery({
        queryKey: ['initial-users'],
        queryFn: () => fetchTransactions(),

    });




    return (
        <main className='h-screen '>
            <Nav />
            <div className='h-[90%]  overflow-auto px-3'>
                <div className='h-[90vh]  flex items-center justify-center relative ' id='head'>
                    <SendForm />
                    <Link href="#transferrecord" className='absolute bottom-4 right-14'>
                        <TbArrowBigDownLinesFilled size={30} />
                    </Link>
                </div>
                <div className='h-[100vh]   px-3  pt-[5%] '>
                    {data && <TransactionRecord columns={columns} data={data} />}
                </div>
            </div>
            <Toaster richColors />
        </main>
    )
}

