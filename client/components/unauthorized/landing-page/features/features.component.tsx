import Image from "next/image";
import { cardInformation } from "./features.data";


export default function Features() {
  return (
    <div className="bg-custom-light-grayish-blue2 pt-9">
      <div className="grid gap-2">
        <h1 className="text-5xl font-[700] text-custom-dark-desaturated-blue text-center">
          Features
        </h1>
        <p className="text-3xl font-[600] text-custom-lark-blue text-center">
          Find Your Perfect Influencer Match.

        </p>
        <p className="text-1xl font-[600] text-custom-dark-desaturated-blue text-center">
          Seamlessly discover and collaborate with influencers who align with your brand&apos;s goals.
        </p>
      </div>
      <br />
      <div className="flex flex-wrap gap-2 justify-center items-center">
        <div className="bg-white bg-[url('/svg/BG.svg')] w-[800px] h-auto rounded-lg border-custom-light-grayish-blue border-2 flex flex-wrap justify-center items-center p-4 m-4">
          {cardInformation.map((cardObject) => (
            <div key={cardObject.id}
              className=" flex flex-wrap justify-center items-center p-4">
              <div className=" ">
                <Image
                  src={cardObject.url}
                  alt={`Brand logo ${cardObject.id}`}
                  width={150}
                  height={150}
                  className="w-[120px] h-auto p-3"
                />
              </div>
              <div className="max-w-[600px]">
                <p className="text-2xl font-[600] text-custom-dark-desaturated-blue text-left">
                  {cardObject.text}
                </p>
                <p className=" font-[300] text-custom-dark-desaturated-blue text-start">
                  {cardObject.supText}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

}