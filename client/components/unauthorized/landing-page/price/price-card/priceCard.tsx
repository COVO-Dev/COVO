import React from 'react';
import Image from "next/image";
import { priceInformation } from "./priceCard.data";

export default function PriceCard() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {priceInformation.map((plan, index) => (
        <div
          key={plan.id}
          className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden ${
            index === 1 ? 'ring-2 ring-blue-500 relative' : ''
          }`}
        >
          {/* Popular badge */}
          {index === 1 && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
          )}

          <div className="p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Image src={plan.imageURL} width={32} height={32} alt={plan.plan} className="w-8 h-8" />
              </div>
            </div>

            {/* Plan name */}
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">{plan.plan}</h3>

            {/* Description */}
            <p className="text-gray-600 text-center mb-6">{plan.description}</p>

            {/* Price */}
            <div className="text-center mb-6">
              <span className="text-4xl font-bold text-gray-900">
                {plan.currency}{plan.price}
              </span>
              <span className="text-gray-600 ml-2">/{plan.duration}</span>
            </div>

            {/* Validity */}
            <p className="text-sm text-gray-500 text-center mb-6">{plan.validity}</p>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {plan.includes.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <button className={`w-full py-4 px-6 rounded-lg font-semibold transition-colors duration-300 ${
              index === 1
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}>
              {index === 1 ? 'Get Started' : 'Select Plan'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
