"use client"
import React, { useState } from 'react'

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
import { erc20Schema } from '@/validators/transactions';
import { PiCoinVerticalThin } from 'react-icons/pi';
import { tokens } from '@/lib/tokens';
import { IDomain, createPermit, createTransferPermit, getMaxFee, getPaymasterDomain, getTokenDomain, getTokenNonce } from '@/lib/utils';
import { useAccount } from 'wagmi';
import { paymaster } from '@/lib/paymasters';
import { Address, formatEther, parseEther } from 'viem';
import { ITransactions } from '@/lib/interfaces';
import { toast } from 'sonner';
import { TbChevronsDownLeft } from 'react-icons/tb';


export default function SendForm() {
    const { address } = useAccount()
    const [fee, setFee] = useState<bigint | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)


    //define form
    const form = useForm<z.infer<typeof erc20Schema>>({
        resolver: zodResolver(erc20Schema),
        defaultValues: {
            token: "",
            receiver: "",
            amount: ""
        },
    })

    const send = async (sender: Address, to: Address, permitSignature: any, transactionSignature: any, amount: string, fee: string, nonce: string, paymasterAddress: Address, deadline: string) => {
        const transaferData: ITransactions = {
            sender,
            to,
            permitSignature,
            transactionSignature,
            amount,
            fee,
            nonce,
            paymasterAddress,
            deadline

        }
        console.log("🚀 ~ send ~ body:", transaferData)

        try {
            const response = await fetch('/api/transfers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transaferData),
            });

            if (!response.ok) {
                throw new Error('Something went wrong');
            }

            const data = await response.json();
            console.log(data)
            form.reset()
            toast.info("token transfer in progress.")
            setIsLoading(false)

        } catch (error) {
            setIsLoading(false)
            toast.error("An error occurred during transaction.")
        }
    }

    const onSubmit = async (values: z.infer<typeof erc20Schema>) => {
        // * get matching contract addresses
        const selectedToken = (tokens as any)[values.token]
        const selectedPaymaster = (paymaster as any)[values.token]
        //* convert to wei
        const weiValue = parseEther(values.amount, "wei")
        try {
            setIsLoading(true)

            //* get token domain info
            const tokenDomainInfo: any = address && await getTokenDomain(selectedToken, address)

            const tokenDomain: IDomain = {
                name: tokenDomainInfo[1],
                version: tokenDomainInfo[2],
                verifyingContract: tokenDomainInfo[4],
                chainId: Number(tokenDomainInfo[3]),
            }

            //* get nonce
            const nonce = address && await getTokenNonce(selectedToken, address)


            //* Get the current date and time
            const now = new Date();

            //* Calculate 1 hour from now
            const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

            //* Convert the time to Unix timestamp (in seconds)
            const unixTimestampInSeconds = Math.floor(oneHourFromNow.getTime() / 1000);

            //* get max fee
            const maxFee = address && await getMaxFee(selectedPaymaster)

            //@ts-ignore
            const amt = weiValue + maxFee

            //*sign first permit
            const tokenSignature = address && await createPermit(
                address,
                (paymaster as any)[values.token],
                amt as any,
                nonce as any,
                unixTimestampInSeconds.toString(),
                tokenDomain
            )

            //* get paymaster domain
            const paymasterDomainInfo: any = address && await getPaymasterDomain(selectedPaymaster)

            const paymasterDomain: IDomain = {
                name: paymasterDomainInfo[1],
                version: paymasterDomainInfo[2],
                verifyingContract: paymasterDomainInfo[4],
                chainId: Number(paymasterDomainInfo[3]),
            }


            //*get final signature
            const paymasterSignature = address && await createTransferPermit(
                address,
                values.receiver as Address,
                weiValue as any,
                maxFee as any,
                paymasterDomain
            )

            if (typeof nonce === "bigint" && typeof maxFee === "bigint") {

                address && send(address, values.receiver as Address, tokenSignature?.signature, paymasterSignature?.signature, weiValue?.toString(), maxFee.toString(), nonce.toString(), selectedPaymaster, unixTimestampInSeconds.toString())
            }
        } catch (error) {
            setIsLoading(false)
            toast.error("An error occurred during transaction.")
        }

    }

    const getQuote = async (data: any) => {

        const { token } = data
        const selectedPaymaster = (paymaster as any)[token]
        if (selectedPaymaster) {
            //* get max fee
            const maxFee = address && await getMaxFee(selectedPaymaster)
            maxFee && setFee(maxFee as any)
        }
    }

    form.watch(getQuote);


    return (
        <Card className="w-full max-w-[400px] shadow-md">
            <CardHeader>
                <CardTitle className='text-center flex items-center justify-center gap-x-3'>
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-black">
                        <PiCoinVerticalThin size={30} />
                    </div>
                    ERC20 Transaction
                </CardTitle>
                <CardDescription className='text-center'>Send ERC20 and pay in ERC20</CardDescription>
            </CardHeader>
            <CardContent>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="token"
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>Token</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a token to send" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
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
                        <FormField
                            control={form.control}
                            name="receiver"
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>Receiver</FormLabel>
                                    <FormControl>
                                        <Input placeholder="enter receiver's address" {...field} />
                                    </FormControl>
                                    {/* <FormDescription>
                                        This is the address of your token receiver.
                                    </FormDescription> */}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <Input type='number' required step={0.000000000000000001} placeholder="enter amount to be sent" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    {
                                        Number(fee) > 0 &&
                                        <FormDescription>
                                            {`Estimated Fee: ${typeof fee == "bigint" && Number(formatEther(fee)).toFixed(4)}  ${form.getValues().token.toUpperCase()}`}
                                        </FormDescription>
                                    }
                                </FormItem>
                            )}
                        />


                        <div className='flex w-full justify-end'>
                            {!isLoading && <Button type="submit">Transfer</Button>}
                            {isLoading && <Button disabled={true} variant={"secondary"} type="submit">please wait...</Button>}
                        </div>
                    </form>
                </Form>

            </CardContent>

        </Card>
    )
}
