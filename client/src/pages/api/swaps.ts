// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ISwapDetails, ITransactions } from "@/lib/interfaces";
import prisma from "@/lib/prisma";
import { swapOnPancake, transfer } from "@/lib/transactions";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  status: "success" | "error";
  message: string;
};

export default async function handler(req: NextApiRequest,res: NextApiResponse<Data>) {

  const body = JSON.parse(req.body) as ITransactions

  const { 
    sender, to, permitSignature, transactionSignature,
    amount, fee, nonce, paymasterAddress, deadline, 
    amountOutMin, path
  } = body

  const swapDetails : ISwapDetails = {
    sender,
    amountIn: amount,
    amountOutMin,
    path,
    maxFee: fee,
    deadline,
    receiver: to
  } 

  let hash = "";

  try {

    await prisma.transactions.create({
      data: { 
        sender, 
        to,
        permitSignature,
        transactionSignature,
        amount,
        fee,
        nonce,
        paymasterAddress,
        deadline,
        amountOutMin,
        path
      }
    })

    hash = await swapOnPancake(paymasterAddress, permitSignature, transactionSignature, swapDetails)

    await prisma.transactions.updateMany({
      where: {
        sender,
        permitSignature,
        transactionSignature,
        paymasterAddress
      },
      data: {
        status: "SUCCESS",
        txHash: hash
      }
    })

  } catch (e) {

    console.error(e)

    await prisma.$disconnect()

    res.status(400).json({status: "error", message: (e as any)?.message})
  }

  await prisma.$disconnect()
  
  res.status(200).json({status: "success", message: hash });
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