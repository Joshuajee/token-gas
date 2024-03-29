
import Nav from "@/components/ui/nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PiCoinVerticalThin } from "react-icons/pi";
import { SiBinance } from "react-icons/si";
import { RiBearSmileFill } from "react-icons/ri";
import { GiAnimalSkull } from "react-icons/gi";
import { FaGear } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { useEffect } from "react";

export default function Home() {




  return (
    <main className="h-screen">
      <Nav />
      <section className="h-[90%] px-4 flex flex-col gap-8 justify-center">
        {/* <div className="h-[50%] flex justify-center gap-6 ">
         
          <Card className="w-1/4 py-3" >
            <CardContent className="flex justify-center">
              <div className="h-32 w-32 rounded-full bg-primary flex items-center justify-center text-black">
                <SiBinance size={100} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col justify-center gap-4">
              <p>BNB Interaction</p>
              <Button>Interact</Button>
            </CardFooter>
          </Card>
          <Card className="w-1/4 py-3" >
            <CardContent className="flex justify-center">
              <div className="h-32 w-32 rounded-full bg-primary flex items-center justify-center text-black">
                <GiAnimalSkull size={100} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col justify-center gap-4">
              <p>NFT Interaction</p>
              <Button>Interact</Button>
            </CardFooter>
          </Card>
        </div> */}
        <div className="h-[50%] flex flex-col md:flex-row justify-center gap-6 ">
          <Card className="w-full md:w-1/4 py-3" >
            <CardContent className="flex justify-center">
              <div className="h-32 w-32 rounded-full bg-primary flex items-center justify-center text-black">
                <RiBearSmileFill size={90} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col justify-center gap-4">
              <p>Pancake Interaction</p>
              <Button asChild>
                <Link href="/swap">Swap</Link>
              </Button>

            </CardFooter>
          </Card>
          <Card className="w-full md:w-1/4 py-3" >
            <CardContent className="flex justify-center">
              <div className="h-32 w-32 rounded-full bg-primary flex items-center justify-center text-black">
                <PiCoinVerticalThin size={100} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col justify-center gap-4">
              <p>Token Interaction</p>
              <Button asChild>
                <Link href="/transfer">Transfer</Link>
              </Button>

            </CardFooter>
          </Card>

        </div>
      </section>
    </main>
  );
}
