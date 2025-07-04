import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ForBrandsQuestions } from "./ForBrands.data";

export default function ForBrandsButton() {
  return (
    <AlertDialog>
      <AlertDialogTrigger className="bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-300 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg group w-full max-w-md">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
            For Brands
          </h3>
          <p className="text-gray-600 text-sm mt-2">
            Questions about brand partnerships
          </p>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-4xl max-h-[80vh] border-none">
        <AlertDialogTitle>
          <div className="text-center p-6 border-b">
            <h2 className="text-3xl font-bold text-blue-600">For Brands Questions</h2>
          </div>
        </AlertDialogTitle>
        <AlertDialogHeader className="p-0">
          <ScrollArea className="max-h-[60vh] p-6">
            <div className="space-y-6">
              {ForBrandsQuestions.map((question) => {
                return (
                  <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{question.question}</h3>
                    <p className="text-gray-600 leading-relaxed">{question.answer}</p>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </AlertDialogHeader>
        <AlertDialogFooter className="border-t p-6">
          <AlertDialogAction className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
            Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}