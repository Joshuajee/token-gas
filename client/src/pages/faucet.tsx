import FaucetForm from "@/components/Faucet/FaucetForm";
import { Transaction, columns } from "@/components/Send/Columns";
import SendForm from "@/components/Send/SendForm";
import { TransactionRecord } from "@/components/Send/TransactionRecord";
import Nav from "@/components/ui/nav";
import mydata from "@/lib/data.json";
import { createPermit } from "@/lib/utils";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { TbArrowBigDownLinesFilled } from "react-icons/tb";

export default function Faucet() {
  //@ts-ignore
  const [data, setData] = useState<Transaction[]>(mydata);

  return (
    <main className="h-screen ">
      <Nav />
      <div className="h-[90%]  overflow-auto">
        <div className="h-[90vh]  flex items-center justify-center relative ">
          <FaucetForm />
        </div>

      </div>
    </main>
  );
}
