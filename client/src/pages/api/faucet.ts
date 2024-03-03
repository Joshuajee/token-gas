// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import prisma from "@/lib/prisma";
import { faucet, transfer } from "@/lib/transactions";
import type { NextApiRequest, NextApiResponse } from "next";
import { parseEther } from "viem";

type Data = {
  status: "success" | "error";
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  
    const body = JSON.parse(req.body) 
  
    const { to, token } = body;

    try {

        const hash = await faucet(token, to, 1n)

        res.send({status: "success", message: hash })

    } catch (e) {

        await prisma.$disconnect();

        res.status(400).json({ status: "error", message: (e as any)?.message });
    }

    await prisma.$disconnect();

}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
  // Specifies the maximum allowed duration for this function to execute (in seconds)
  maxDuration: 360,
};
