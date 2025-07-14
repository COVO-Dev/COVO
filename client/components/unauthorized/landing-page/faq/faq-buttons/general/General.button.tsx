import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GeneralQuestions } from "./General.data";

export default function GeneralButton() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-900/10 hover:scale-[1.02] hover:-translate-y-1 group w-full max-w-md relative">
          {/* Subtle gradient overlay for visual depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/20 via-transparent to-gray-50/10 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="text-center relative z-10">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-black transition-all duration-300">
              <svg className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black group-hover:text-black transition-colors duration-300">
              General
            </h3>
            <p className="text-gray-600 text-sm mt-2">
              Common questions about COVO
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
            <div className="text-center pt-6 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-8 border-b border-gray-200/50">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black tracking-tight mb-2">General Questions</h2>
              <p className="text-base sm:text-lg text-gray-600">Common questions about COVO</p>
            </div>
          </AlertDialogTitle>
        </AlertDialogHeader>

        {/* Main Content Area */}
        <div className="relative z-10 flex-1 overflow-hidden">
          <ScrollArea className="h-[50vh] sm:h-[55vh] px-4 sm:px-8 py-4 sm:py-6">
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              {GeneralQuestions.map((question) => {
                return (
                  <div key={question.id} className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-white/80">
                    <h3 className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4 leading-tight">{question.question}</h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{question.answer}</p>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
        <AlertDialogFooter className="border-t border-gray-200/50 p-4 sm:p-6 lg:p-8 bg-white/40 backdrop-blur-sm relative z-10">
          <div className="flex justify-center w-full">
            <AlertDialogAction className="bg-black hover:bg-gray-800 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all duration-500 hover:scale-[1.05] hover:shadow-2xl active:scale-[0.95] hover:-translate-y-1 min-w-[100px] sm:min-w-[120px]">
              Close
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}