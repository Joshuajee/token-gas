"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type SwapTransaction = {
    id: string
    hash: string
    pair: string
    deposited: number
    received: number
    status: "pending" | "processing" | "success" | "failed"
}

export const columns: ColumnDef<SwapTransaction>[] = [

    {
        accessorKey: "hash",
        header: "Hash",
    },
    {
        accessorKey: "pair",
        header: "Pair",
    },

    {
        accessorKey: "deposited",
        header: "Deposited",
    },
    {
        accessorKey: "received",
        header: "Received",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status")
            //@ts-ignore
            return <div className={`text-left font-medium ${status == "pending" ? "text-yelloe-600" : status == "processing" ? "text-green-800" : status == "success" ? "text-green-600" : "text-red-600"}`}>{status}</div>
        },
    },
]
