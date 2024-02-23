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
        <Card className="w-full max-w-[400px]">
            <CardHeader>
                <CardTitle>ERC20 Transaction</CardTitle>
                <CardDescription>Send ERC20 and pay in ERC20</CardDescription>
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
                                            <SelectItem value="usdt">USDT</SelectItem>

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


                        <Button type="submit">Transfer</Button>
                    </form>
                </Form>
                {/* <form>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="framework">Token</Label>
                            <Select>
                                <SelectTrigger id="framework">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectItem value="usdt">USDT</SelectItem>

                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="amt">Amount</Label>
                            <Input type='number' id="amt" placeholder="0.0" />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="receiver">Receiver</Label>
                            <Input id="receiver" placeholder="The address to receive the token" />
                        </div>
                        <small className='text-muted-foreground'>Gas estimate: 0.001 </small>

                    </div>
                </form> */}
            </CardContent>
            <CardFooter className="flex justify-between">

                {/* <Button variant="outline">Cancel</Button>
                <Button>Transfer</Button> */}
            </CardFooter>
        </Card>
    )
}
