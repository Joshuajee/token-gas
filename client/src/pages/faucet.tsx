import FaucetForm from "@/components/Faucet/FaucetForm";
import { Transaction } from "@/components/Send/Columns";
import Nav from "@/components/ui/nav";
import mydata from "@/lib/data.json";
import React, { useState } from "react";
import { Toaster } from "sonner";

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
      <Toaster richColors />
    </main>
  );
}
