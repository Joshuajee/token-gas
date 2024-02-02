
import { Inter } from "next/font/google";
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
import { GiUnicorn } from "react-icons/gi";
import { GiAnimalSkull } from "react-icons/gi";
import { FaGear } from "react-icons/fa6";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className="h-screen">
      <Nav />
      <section className="h-[90%] flex flex-col gap-8 py-3">
        <div className="h-[50%] flex justify-center gap-6 ">
          <Card className="w-1/4 py-3" >
            <CardContent className="flex justify-center">
              <div className="h-32 w-32 rounded-full bg-primary flex items-center justify-center text-black">
                <PiCoinVerticalThin size={100} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col justify-center gap-4">
              <p>Token Interaction</p>
              <Button>Interact</Button>
            </CardFooter>
          </Card>
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
        </div>
        <div className="h-[50%] flex justify-center gap-6 ">
          <Card className="w-1/4 py-3" >
            <CardContent className="flex justify-center">
              <div className="h-32 w-32 rounded-full bg-primary flex items-center justify-center text-black">
                <GiUnicorn size={90} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col justify-center gap-4">
              <p>UniSwap Interaction</p>
              <Button>Interact</Button>
            </CardFooter>
          </Card>
          <Card className="w-1/4 py-3" >
            <CardContent className="flex justify-center">
              <div className="h-32 w-32 rounded-full bg-primary flex items-center justify-center text-black">
                <FaGear size={100} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col justify-center gap-4">
              <p>Custom</p>
              <Button>Interact</Button>
            </CardFooter>
          </Card>

        </div>
      </section>
    </main>
  );
}
