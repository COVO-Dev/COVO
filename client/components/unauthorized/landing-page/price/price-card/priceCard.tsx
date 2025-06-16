import React from 'react';
import Image from "next/image";
import { priceInformation } from "./priceCard.data";


export default function PriceCard() {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {priceInformation.map((plan) => (
        <div
          key={plan.id}
          className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105 h-auto w-[350px] flex flex-col"
        >
          <div className="p-1 bg-custom-dark-desaturated-blue" />
          <div className="p-8 flex-grow">
            <div className='flex justify-center items-center w-full h-[180px]'>
              <Image src={plan.imageURL} width={120} alt={plan.plan} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{plan.plan}</h2>
            <p className="text-gray-600 mb-6">{plan.description}</p>
            <p className="text-4xl font-bold text-gray-800 mb-6">
              {plan.currency}{plan.price} <span className="text-base font-normal">/{plan.duration}</span>
            </p>
            <p className="text-gray-500 mb-4">{plan.validity}</p>
            <ul className="text-sm text-gray-600 mb-6">
              {plan.includes.map((feature, index) => (
                <li key={index} className="mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" fill="none" className="w-4 h-4 mr-2 text-green-500">
                    <path d="M5 13l4 4L19 7" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4">
            <button className="w-full bg-custom-dark-desaturated-blue text-white rounded-full px-4 py-2 hover:bg-custom-dark-desaturated-blue/95 focus:outline-none focus:shadow-outline-green active:bg-green-800">
              Select Plan
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
