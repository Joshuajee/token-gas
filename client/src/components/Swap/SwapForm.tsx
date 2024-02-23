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
import { uniswapSchema } from '@/validators/transactions';
import { GiUnicorn } from 'react-icons/gi';


export default function SwapForm() {

    //define form
    const form = useForm<z.infer<typeof uniswapSchema>>({
        resolver: zodResolver(uniswapSchema),
        defaultValues: {
            tokenToPay: "",
            tokenToReceive: "",
            amtToPay: 0,
            amtToReceive: 0
        },
    })

    const onSubmit = (values: z.infer<typeof uniswapSchema>) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
    }
    return (
        <Card className="w-full max-w-[400px] shadow-md">
            <CardHeader>
                <CardTitle className='text-center flex items-center justify-center gap-x-3'>
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-black">
                        <GiUnicorn size={30} />
                    </div>
                    Uniswap
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
                                                <Input placeholder="enter amount to pay" {...field} />
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
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="" />
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
                                                <Input placeholder="enter amount to pay" {...field} />
                                            </FormControl>

                                            <FormMessage />
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
                                                    <SelectItem value="bnb">BNB</SelectItem>
                                                    <SelectItem value="busdc">BUSDC</SelectItem>
                                                    <SelectItem value="dai">DAI</SelectItem>
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
                            <Button type="submit">swap</Button>
                        </div>
                    </form>
                </Form>

            </CardContent>
            <CardFooter className="flex justify-between">

                {/* <Button variant="outline">Cancel</Button>
                <Button>Transfer</Button> */}
            </CardFooter>
        </Card>
    )
}
