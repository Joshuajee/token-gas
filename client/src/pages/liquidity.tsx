import LiquidityForm from '@/components/Liquidity/LiquidityForm'
import { SwapTransaction } from '@/components/Swap/Columns'
import Nav from '@/components/ui/nav'
import mydata from "@/lib/swapData.json"
import { useState } from 'react'
import { Toaster } from 'sonner';

export default function Liquidity() {
    //@ts-ignore
    const [data, setData] = useState<SwapTransaction[]>(mydata);


    return (
        <main className='h-screen '>
            <Nav />
            <div className='h-[90%]  '>
                <div className='h-full flex items-center justify-center relative'>
                    <LiquidityForm />
                </div>

            </div>
            <Toaster richColors />
        </main>
    )
}

