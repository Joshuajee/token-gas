import React from 'react'

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


export default function SendForm() {

    //define form
    const form = useForm<z.infer<typeof erc20Schema>>({
        resolver: zodResolver(erc20Schema),
        defaultValues: {
            token: "",
            receiver: "",
            amount: 0
        },
    })

    const onSubmit = (values: z.infer<typeof erc20Schema>) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
    }
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
                                        <Input placeholder="enter amount to be sent" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    <FormDescription>
                                        Gas estimate : 0.01
                                    </FormDescription>
                                </FormItem>
                            )}
                        />


                        <div className='flex w-full justify-end'>
                            <Button type="submit">Transfer</Button>
                        </div>
                    </form>
                </Form>

            </CardContent>

        </Card>
    )
}
