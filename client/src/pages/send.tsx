import { Transaction, columns } from '@/components/Send/Columns'
import SendForm from '@/components/Send/SendForm'
import { TransactionRecord } from '@/components/Send/TransactionRecord'
import Nav from '@/components/ui/nav'
import mydata from "@/lib/data.json"
import React, { useEffect, useState } from 'react'

export default function send() {
    //@ts-ignore
    const [data, setData] = useState<Transaction[]>(mydata);


    return (
        <main className='h-screen '>
            <Nav />
            <div className='h-[90%]  overflow-auto'>
                <div className='h-[90vh]  flex items-center justify-center '>
                    <SendForm />
                </div>
                <div className='h-[100vh]  px-3 '>
                    {data && <TransactionRecord columns={columns} data={data} />}
                </div>
            </div>
        </main>
    )
}

