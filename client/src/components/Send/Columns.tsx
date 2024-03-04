"use client"

import { ColumnDef } from "@tanstack/react-table"
import { formatEther } from "viem"
import copy from 'clipboard-copy';
import { toast } from "sonner";


const handleCopyClick = async (text: string) => {
    try {
        await copy(text);
        toast.info("copied")
    } catch (error) {
        console.error('Failed to copy text to clipboard', error);
    }
};

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Transaction = {
    id: string
    txHash: string
    sender: string
    to: string,
    fee: string,
    amount: number
    status: "PENDING" | "SUCCESS"
}

export const truncateAddress = (
    text: string,
    startChars: number,
    endChars: number,
    maxLength: number
) => {
    if (text?.length > maxLength) {
        var start = text.substring(0, startChars);
        var end = text.substring(text.length - endChars, text.length);
        while (start.length + end.length < maxLength) {
            start = start + ".";
        }
        return start + end;
    }
    return text;
};



export const columns: ColumnDef<Transaction>[] = [

    {
        accessorKey: "txHash",
        header: "Hash",
        cell: ({ row }) => {
            const txHash = row.getValue("txHash")
            //@ts-ignore
            return <div className="hover:underline cursor-pointer" onClick={() => handleCopyClick(txHash)} >{truncateAddress(txHash, 3, 3, 9)}</div>
        }
    },
    {
        accessorKey: "sender",
        header: "Sender",
        cell: ({ row }) => {
            const sender = row.getValue("sender")
            //@ts-ignore
            return <div className="hover:underline cursor-pointer" onClick={() => handleCopyClick(sender)} >{truncateAddress(sender, 3, 3, 9)}</div>
        }
    },

    {
        accessorKey: "to",
        header: "Receiver",
        cell: ({ row }) => {
            const to = row.getValue("to")
            //@ts-ignore
            return <div className="hover:underline cursor-pointer" onClick={() => handleCopyClick(to)} >{truncateAddress(to, 3, 3, 9)}</div>
        }
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = row.getValue("amount")
            //@ts-ignore
            return <div >{Number(formatEther(amount, 'wei')).toFixed(4)}</div>
        }
    },
    {
        accessorKey: "fee",
        header: "Fee",
        cell: ({ row }) => {
            const fee = row.getValue("fee")
            //@ts-ignore
            return <div >{Number(formatEther(fee, 'wei')).toFixed(4)}</div>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status")
            //@ts-ignore
            return <div className={`text-left font-medium ${status == "pending" ? "text-yellow-600" : "text-green-600"}`}>{status}</div>
        },
    },
]
