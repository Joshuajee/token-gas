// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ITransactionDetails, ITransactions } from "@/lib/interfaces";
import prisma from "@/lib/prisma";
import { transfer } from "@/lib/utils";
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
  } = body

  const transactionDetails : ITransactionDetails = {
    sender,
    amount,
    maxFee: fee,
    deadline,
    receiver: to
  } 

  try {

    await  prisma.transactions.create({
      data: { 
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
    })

    await transfer(paymasterAddress, permitSignature, transactionSignature, transactionDetails)

  } catch (e) {
    //await prisma.$connect()
    console.error(e)
    res.status(400).json({status: "error", message: (e as any)?.message})
    
  }
  
  res.status(200).json({status: "success", message: "done"});
}


export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  // Specifies the maximum allowed duration for this function to execute (in seconds)
  maxDuration: 30,
}