"use client"
import React, { useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from '../ui/button'
import { liquiditySchema } from '@/validators/transactions';
import { GiCoinsPile } from "react-icons/gi";
import { paymaster } from '@/lib/paymasters';
import { formatEther, parseEther } from 'viem';
import paymasterAbi from "@abi/contracts/GaslessPaymaster.sol/GaslessPaymaster.json"
import { useAccount, useWriteContract } from 'wagmi'
import { useReadContract } from 'wagmi'

export default function LiquidityForm() {
    const { address } = useAccount()
    const { writeContract, isSuccess: depositSuccess, isError: depositError } = useWriteContract()

    //define form
    const form = useForm<z.infer<typeof liquiditySchema>>({
        resolver: zodResolver(liquiditySchema),
        defaultValues: {
            amount: "",
            pool: "usdc"
        },
    })


    const { data: totalAsset, refetch: refetchTotalAsset } = useReadContract({
        abi: paymasterAbi,
        address: (paymaster as any)[form.getValues().pool],
        functionName: 'totalAssets',
        account: address
    })
    const { data: lpData, refetch: refetchLpData } = useReadContract({
        abi: paymasterAbi,
        address: (paymaster as any)[form.getValues().pool],
        functionName: 'balanceOf',
        account: address,
        args: [address]
    })




    const handleDepsits = async () => {
        const values = form.getValues()
        if (Number(values.amount) > 0 && values.pool.length > 0) {
            const selectedPaymaster = (paymaster as any)[values.pool]
            console.log("🚀 ~ onDeposit ~ selectedPaymaster:", selectedPaymaster)
            const weiValue = parseEther(values.amount, "wei")
            try {
                const tx = await writeContract({
                    address: selectedPaymaster,
                    abi: paymasterAbi,
                    functionName: 'deposit',
                    args: [address],
                    //@ts-ignore
                    value: weiValue,

                })

            } catch (error) {
                console.log("🚀 ~ onDeposit ~ error:", error)

            }
        }

    }
    const handleWithdrawals = async () => {
        const values = form.getValues()
        if (Number(values.amount) > 0 && values.pool.length > 0) {
            const selectedPaymaster = (paymaster as any)[values.pool]
            console.log("🚀 ~ handleWithdrawals ~ selectedPaymaster:", selectedPaymaster)
            const weiValue = parseEther(values.amount, "wei")
            try {
                const tx = await writeContract({
                    address: selectedPaymaster,
                    abi: paymasterAbi,
                    functionName: 'withdraw',
                    args: [weiValue, address, address],

                })

            } catch (error) {
                console.log("🚀 ~ onDeposit ~ error:", error)

            }
        }

    }

    useEffect(() => {

        //* Refetch balances from current token
        refetchLpData()
        refetchTotalAsset()

    }, [form.getValues])

    useEffect(() => {

        if (depositSuccess) {
            console.log("🚀 ~ useEffect ~ depositSuccess:", depositSuccess)
            form.reset()
        } else if (depositError) {
            console.log("🚀 ~ useEffect ~ depositError:", depositError)
        }

        //* Refetch balances from current token
        refetchLpData()
        refetchTotalAsset()
    }, [depositSuccess, depositError])
    return (
        <Card className="w-full max-w-[400px] shadow-md">
            <CardHeader>
                <CardTitle className='text-center flex items-center justify-center gap-x-3'>
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-black">
                        <GiCoinsPile size={30} />
                    </div>
                    Liquidity Pool
                </CardTitle>
                <CardDescription className='text-center'>Contribute to liquidity pool</CardDescription>
            </CardHeader>
            <CardContent>
                <div className='h-10 grid grid-cols-3 mb-4'>
                    <div className='border-r'>
                        <div className='h-[50%] flex justify-center items-center text-xs font-semibold text-muted-foreground'>
                            Total
                        </div>
                        <div className='h-[50%] flex justify-center items-center text-md font-semibold'>
                            {typeof totalAsset == "bigint" && formatEther(totalAsset)}
                        </div>
                    </div>
                    <div className='border-r'>
                        <div className='h-[50%] flex justify-center items-center text-xs font-semibold text-muted-foreground'>
                            Share
                        </div>
                        <div className='h-[50%] flex justify-center items-center text-md font-semibold'>
                            1.1023
                        </div>
                    </div>
                    <div className=''>
                        <div className='h-[50%] flex justify-center items-center text-xs font-semibold text-muted-foreground'>
                            Balance
                        </div>
                        <div className='h-[50%] flex justify-center items-center text-md font-semibold'>
                            {typeof lpData == "bigint" && Number(formatEther(lpData)).toFixed(4)}
                        </div>
                    </div>

                </div>
                <div className='flex flex-col gap-4'>
                    <Form {...form}>
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                            <div className=''>
                                <FormField
                                    control={form.control}
                                    name="pool"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            {/* <FormLabel>Pool</FormLabel> */}
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Pool" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="dai">DAI</SelectItem>
                                                    <SelectItem value="usdc">USDC</SelectItem>

                                                </SelectContent>
                                            </Select>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className=''>
                                <FormField

                                    control={form.control}
                                    name="amount"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input type='number' required step={0.000000000000000001} placeholder="enter amount to deposit" {...field} />
                                            </FormControl>
                                            {/* <FormDescription>
                                        Gas fee will be charged on the selected token

                                    </FormDescription> */}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className='flex w-full gap-3 justify-end'>
                                <Button variant={'secondary'} onClick={handleWithdrawals} type="submit" className='w-1/2'>Withdraw</Button>
                                <Button onClick={handleDepsits} type="submit" className='w-1/2'>Deposit</Button>
                            </div>
                        </form>
                    </Form>



                </div>

            </CardContent>
        </Card>
    )
}
