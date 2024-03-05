"use client"
import React, { useEffect, useState } from 'react'

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
import { uniswapSchema } from '@/validators/transactions';
import { GiUnicorn } from 'react-icons/gi';
import { tokens } from '@/lib/tokens';
import { format } from 'path';
import { paymaster } from '@/lib/paymasters';
import { useAccount } from 'wagmi';
import { IDomain, createPermit, createSwapPermit, encodePath, getMaxFee, getPaymasterDomain, getPool, getSwapMaxFee, getSwapQuote, getTokenDomain, getTokenNonce } from '@/lib/utils';
import { Address, formatEther, parseEther } from 'viem';
import { FeeAmount } from '@/lib/enums';
import { ITransactions } from '@/lib/interfaces';
import { toast } from 'sonner';
import { RiBearSmileFill } from 'react-icons/ri';
import { Value } from '@radix-ui/react-select';


export default function SwapForm() {
    const { address } = useAccount()
    const [fee, setFee] = useState<bigint | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [minValue, setMinValue] = useState<BigInt>(0n)

    //define form
    const form = useForm<z.infer<typeof uniswapSchema>>({
        resolver: zodResolver(uniswapSchema),
        defaultValues: {
            tokenToPay: "",
            tokenToReceive: "",
            amtToPay: "",
            amtToReceive: ""
        },
    })

    const getQuote = async (data: any) => {

        const { tokenToPay, tokenToReceive, amtToPay, amtToReceive } = data
        const depositPaymaster = (paymaster as any)[data.tokenToPay]
        if (depositPaymaster) {

            //* get max fee
            const maxFee = address && await getSwapMaxFee(depositPaymaster)
            maxFee && setFee(maxFee as any)
        }


        // if (Number(amtToPay) > 0 && tokenToPay && tokenToReceive && tokenToPay != tokenToReceive) {
        //     const path = encodePath([tokenToPay, tokenToReceive], [FeeAmount.HIGH])
        //     console.log("🚀 ~ getQuote ~ path:", path)
        //     const quoterAddress: Address = process.env.NEXT_PUBLIC_QUOTER_ADDRESS as Address
        //     //* convert to wei
        //     const amountIn = parseEther(amtToPay, "wei")
        //     const quote = await getSwapQuote(quoterAddress, path, amountIn)
        //     console.log("🚀 ~ getQuote ~ quote:", quote)
        // }

        if (Number(amtToPay) > 0 && tokenToPay && tokenToReceive && tokenToPay != tokenToReceive) {

            // const pool = await getPool((tokens as any)[tokenToPay], (tokens as any)[tokenToReceive])

            // if (!pool) return

            // const price = await getSwapQuote(pool as Address)

            // console.log(pool, price)
            // const path = encodePath([tokenToPay, tokenToReceive], [FeeAmount.HIGH])
            // console.log("🚀 ~ getQuote ~ path:", path)
            // const quoterAddress: Address = process.env.NEXT_PUBLIC_QUOTER_ADDRESS as Address
            // //* convert to wei
            // const amountIn = parseEther(amtToPay, "wei")
            // const quote = await getSwapQuote(quoterAddress, path, amountIn)
            // console.log("🚀 ~ getQuote ~ quote:", quote)
        }

    }

    const swap = async (sender: Address, to: Address, permitSignature: any, transactionSignature: any, amount: string, amountOutMin: string, fee: string, nonce: string, paymasterAddress: Address, deadline: string, path: string) => {
        const swapData: ITransactions = {
            sender,
            to,
            permitSignature,
            transactionSignature,
            amount,
            amountOutMin,
            fee,
            nonce,
            paymasterAddress,
            deadline,
            path

        }

        try {
            const response = await fetch('/api/swaps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(swapData),
            });

            if (!response.ok) {
                throw new Error('Something went wrong');
            }

            const data = await response.json();

            form.reset()
            toast.info("token swap in progress.")
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            toast.error("An error occurred during transaction.")
        }
    }

    const onSubmit = async (values: z.infer<typeof uniswapSchema>) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(minValue)

        const tokenToPay = (tokens as any)[values.tokenToPay]
        const tokenToReceive = (tokens as any)[values.tokenToReceive]
        const amtToPay = values.amtToPay
        const depositPaymaster = (paymaster as any)[values.tokenToPay]
        const receptionPaymaster = (paymaster as any)[values.tokenToReceive]

        try {
            setIsLoading(true)
            if (tokenToReceive == tokenToPay) {

                //* set error for same token selection
                form.setError("tokenToReceive", {
                    message: "Invalid"
                })
            }
            //* get max fee
            const maxFee = address && await getSwapMaxFee(depositPaymaster)

            //* get nonce
            const nonce = address && await getTokenNonce(tokenToPay, address)
            //* convert to wei
            const amountIn = parseEther(amtToPay, "wei")
            const amountOutMin = minValue
            const amountWithFee = typeof maxFee == 'bigint' && amountIn + maxFee

            //* Get the current date and time
            const now = new Date();

            //* Calculate 1 hour from now
            const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

            //* Convert the time to Unix timestamp (in seconds)
            const deadline = Math.floor(oneHourFromNow.getTime() / 1000);


            //* get token domain info
            const tokenDomainInfo: any = address && await getTokenDomain(tokenToPay, address)

            const tokenDomain: IDomain = {
                name: tokenDomainInfo[1],
                version: tokenDomainInfo[2],
                verifyingContract: tokenDomainInfo[4],
                chainId: Number(tokenDomainInfo[3]),
            }

            //*sign first permit
            const tokenSignature = address && await createPermit(
                address,
                depositPaymaster,
                amountWithFee as any,
                nonce as any,
                deadline.toString(),
                tokenDomain
            )

            //* get paymaster domain
            const paymasterDomainInfo: any = address && await getPaymasterDomain(depositPaymaster)

            const paymasterDomain: IDomain = {
                name: paymasterDomainInfo[1],
                version: paymasterDomainInfo[2],
                verifyingContract: paymasterDomainInfo[4],
                chainId: Number(paymasterDomainInfo[3]),
            }

            const tx_signatures = typeof maxFee == "bigint" && address && await createSwapPermit(
                address,
                address,
                encodePath([tokenToPay, tokenToReceive], [FeeAmount.HIGH]),
                amountIn.toString(),
                amountOutMin.toString(),
                maxFee.toString(),
                paymasterDomain
            )


            //*get path
            const path = encodePath([tokenToPay, tokenToReceive], [FeeAmount.HIGH])

            if (typeof nonce === "bigint" && typeof maxFee === "bigint") {

                //@ts-ignore
                address && swap(address, address, tokenSignature?.signature, tx_signatures?.signature, amountIn?.toString(), amountOutMin?.toString(), maxFee.toString(), nonce.toString(), depositPaymaster, deadline.toString(), path)
            }


        } catch (error) {
            setIsLoading(false)
            toast.error("An error occurred during transaction.")
        }


    }


    form.watch(getQuote);
    // const val = Number(form.watch('amtToPay')) > 0 ? form.setValue("amtToReceive", (Number(form.watch('amtToPay')) / 100).toString()) : form.setValue("amtToReceive", "")


    useEffect(() => {

        async function get() {

            const from = form.getValues().tokenToPay

            const to = form.getValues().tokenToReceive

            if (!from || !to) return

            const pool = await getPool((tokens as any)[from], (tokens as any)?.[to])

            if (!pool) return

            const price = await getSwapQuote(pool as Address)

            // const val = Number(form.watch('amtToPay')) > 0
            // ? (Number(form.watch('amtToPay')) / 100).toString()
            // : "";

            // work
            form.setValue("amtToReceive", String(price * BigInt(Number(form.getValues().amtToPay))));
            const val = price * BigInt(Number(form.getValues().amtToPay))
            setMinValue(parseEther((Number(val) * 0.90).toString(), 'wei'))

        }

        get()


    }, [form.watch('amtToPay'), form.watch('tokenToPay'), form.watch('tokenToReceive')]);


    return (
        <Card className="w-full max-w-[400px] shadow-md">
            <CardHeader>
                <CardTitle className='text-center flex items-center justify-center gap-x-3'>
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-black">
                        <RiBearSmileFill size={30} />
                    </div>
                    Pancake swap
                </CardTitle>
                <CardDescription className='text-center'>Swap any Token today</CardDescription>
            </CardHeader>
            <CardContent>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className='flex gap-1'>
                            <div className='w-[75%]'>
                                <FormField

                                    control={form.control}
                                    name="amtToPay"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormLabel>Pay</FormLabel>
                                            <FormControl>
                                                <Input type='number' required step={0.000000000000000001} placeholder="enter amount to swap" {...field} />
                                            </FormControl>
                                            {/* <FormDescription>
                                        Gas fee will be charged on the selected token

                                    </FormDescription> */}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            </div>
                            <div className='w-[25%]'>
                                <FormField
                                    control={form.control}
                                    name="tokenToPay"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormLabel>Token</FormLabel>
                                            <Select onValueChange={
                                                field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent >
                                                    <SelectItem value="dai">DAI</SelectItem>
                                                    <SelectItem value="usdc">USDC</SelectItem>

                                                </SelectContent>
                                            </Select>
                                            {/* <FormDescription>
                                        Gas fee will be charged on the selected token

                                    </FormDescription> */}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='flex gap-1'>
                            <div className='w-[75%]'>
                                <FormField

                                    control={form.control}
                                    name="amtToReceive"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormLabel>Receive</FormLabel>
                                            <FormControl>
                                                <Input readOnly={true} placeholder="" {...field} />
                                            </FormControl>

                                            <FormMessage />
                                            {/* <FormDescription>{Number(fee) > 0 && <p>Estimated Fee: {typeof fee == "bigint" && Number(formatEther(fee)).toFixed(4)} {form.getValues().tokenToPay.toUpperCase()}</p>}</FormDescription> */}
                                            {
                                                Number(fee) > 0 &&
                                                <FormDescription>
                                                    {`Estimated Fee: ${typeof fee == "bigint" && Number(formatEther(fee)).toFixed(4)}  ${form.getValues().tokenToPay.toUpperCase()}`}
                                                </FormDescription>
                                            }
                                        </FormItem>
                                    )}
                                />

                            </div>
                            <div className='w-[25%]'>
                                <FormField
                                    control={form.control}
                                    name="tokenToReceive"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormLabel>Token</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="dai">DAI</SelectItem>
                                                    <SelectItem value="busd">BUSD</SelectItem>
                                                    <SelectItem value="usdc">USDC</SelectItem>

                                                </SelectContent>
                                            </Select>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='flex w-full justify-end'>
                            {/* <Button type="submit">swap</Button> */}
                            {!isLoading && <Button type="submit">Swap</Button>}
                            {isLoading && <Button disabled={true} variant={"secondary"} type="submit">please wait...</Button>}
                        </div>
                    </form>
                </Form>

            </CardContent>

        </Card>
    )
}
