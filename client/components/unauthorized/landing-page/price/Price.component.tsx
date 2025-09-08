import PriceCard from "./price-card/priceCard";


export default function Price() {
  return (
    <div className="w-full h-full bg-custom-light-grayish-blue2 pt-9">
      <div className="grid gap-2 ">
        <h1 className="text-5xl font-[700] text-custom-dark-desaturated-blue text-center">
          Plans & Pricing
        </h1>
        <p className="text-3xl font-[600] text-custom-lark-blue text-center">
          Choose a Plan
          That Works for You
        </p>
      </div>
      <br />
      <div className="w-full h-full flex flex-wrap justify-center items-center gap-10">
        <PriceCard />
      </div>
    </div>
  );
}