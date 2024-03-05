// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  status: "success" | "error";
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    res.send({status: "success", message: "Hello, World!"})

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
