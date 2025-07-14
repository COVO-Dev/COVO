import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ForAgenciesQuestions } from "./ForAgencies.data";




export default function ForAgenciesButton() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-900/10 hover:scale-[1.02] hover:-translate-y-1 group w-full max-w-md relative">
          {/* Subtle gradient overlay for visual depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/20 via-transparent to-gray-50/10 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="text-center relative z-10">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-black transition-all duration-300">
              <svg className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black group-hover:text-black transition-colors duration-300">
              For Agencies
            </h3>
            <p className="text-gray-600 text-sm mt-2">
              Questions about agency partnerships
            </p>
          </div>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-4xl w-[95%] sm:w-[90%] max-h-[95vh] sm:max-h-[90vh] bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl shadow-gray-900/20 overflow-hidden border-0 m-4 sm:m-0">
        {/* Subtle gradient overlay for glassmorphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-gray-50/40 pointer-events-none rounded-2xl sm:rounded-3xl -z-10"></div>

        {/* Close Button */}
        <AlertDialogCancel asChild>
          <button className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 border-0 p-0 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group cursor-pointer">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </AlertDialogCancel>

        <AlertDialogHeader className="relative z-10">
          <AlertDialogTitle>
            <div className="text-center pt-8 pb-6 px-8 border-b border-gray-200/50">
              <h2 className="text-3xl lg:text-4xl font-bold text-black tracking-tight mb-2">For Agencies</h2>
              <p className="text-gray-600 text-lg">Questions about agency partnerships</p>
            </div>
          </AlertDialogTitle>
        </AlertDialogHeader>

        {/* Main Content Area */}
        <div className="relative z-10 flex-1 overflow-hidden">
          <ScrollArea className="h-[55vh] px-8 py-6">
            <div className="space-y-8">
              {ForAgenciesQuestions.map((question) => {
                return (
                  <div key={question.id} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-white/80">
                    <h3 className="text-xl font-bold text-black mb-4 leading-tight">{question.question}</h3>
                    <p className="text-gray-700 leading-relaxed text-base">{question.answer}</p>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
        <AlertDialogFooter className="border-t border-gray-200/50 p-8 bg-white/40 backdrop-blur-sm relative z-10">
          <div className="flex justify-center w-full">
            <AlertDialogAction className="bg-black hover:bg-gray-800 text-white px-12 py-4 rounded-2xl font-semibold text-lg transition-all duration-500 hover:scale-[1.05] hover:shadow-2xl active:scale-[0.95] hover:-translate-y-1 min-w-[120px]">
              Close
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}