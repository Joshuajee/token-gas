// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ISwapDetails, ITransactions } from "@/lib/interfaces";
import prisma from "@/lib/prisma";
import { swapOnPancake } from "@/lib/transactions";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  status: "success" | "error";
  data?: any[];
  message: string;
  total?: number
};

export default async function handler(req: NextApiRequest,res: NextApiResponse<Data>) {

    const { type, start, count, } = req.query

    try {

        const total = await prisma.transactions.count({
            where: {type: type as any },
        })

        const transactions = await prisma.transactions.findMany({
            where: {type: type as any },
            orderBy: {  id: "desc"  },
            take: Number(count),
            skip: Number(start),
        })

        res.status(200).json({status: "success", message: "hash", data: transactions, total });

        await prisma.$disconnect()

    } catch (e) {

        console.error(e)

        await prisma.$disconnect()

        res.status(400).json({status: "error", message: (e as any)?.message})
    }

}


export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  // Specifies the maximum allowed duration for this function to execute (in seconds)
  maxDuration: 360,
}