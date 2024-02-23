"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Transaction = {
    id: string
    hash: string
    sender: string
    receiver: string
    amount: number
    status: "pending" | "processing" | "success" | "failed"
}

export const columns: ColumnDef<Transaction>[] = [

    {
        accessorKey: "hash",
        header: "Hash",
    },
    {
        accessorKey: "sender",
        header: "Sender",
    },

    {
        accessorKey: "receiver",
        header: "Receiver",
    },
    {
        accessorKey: "amount",
        header: "Amount",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status")
            return <div className={`text-left font-medium ${status == "pending" ? "text-yelloe-600" :
                status == "processing" ? "text-green-800" : status == "success" ? "text-green-600" : "text-red-600"}`}>{status}</div>
        },
    },
]
