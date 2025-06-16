export default function SubscribeComponent() {
  return (
    <div className="flex flex-row lg:pr-[20%] justify-between">
      <div className="flex flex-row align-center" >
        <input type="checkbox" className="appearance-none my-auto w-4 h-4 mr-[0.5em] border border-[#e3f0ff] rounded-sm checked:bg-[#e3f0ff] checked:border-transparent checked:ring-2 transition-all duration-150 checked:ring-blue-500" id="subscribe" name="subscribe" value="yes" />
        <label htmlFor="subscribe" className="pt-[9px]">Subscribe to newsletter</label>
      </div>
      <button type="submit" className="h-[40px] w-[120px] bg-[#053565] hover:text-[#053565] hover:bg-[#e3f0ff] hover:border-2 hover:border-double hover:border-[#053565] transition-all duration-300 ">Submit</button>
    </div>
  )
}