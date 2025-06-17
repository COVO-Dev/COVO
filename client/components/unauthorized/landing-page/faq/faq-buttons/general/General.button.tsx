import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GeneralQuestions } from "./General.data";




export default function GeneralButton() {
  return (
    <AlertDialog>
      <AlertDialogTrigger className="bg-white bg-[url('/svg/BG.svg')] hover:bg-gray-300/70 w-[400px] h-[100px] border-2 border-custom-light-grayish-blue rounded-md"><p className="text-4xl font-[700] text-custom-dark-desaturated-blue text-center ">General</p></AlertDialogTrigger>
      <AlertDialogContent className="w-[70%] border-none">
        <AlertDialogTitle>
          <div className="w-full text-center p-5">
            <strong className="text-3xl text-center text-custom-lark-blue">General Questions</strong>
          </div>
        </AlertDialogTitle>
        <AlertDialogHeader className="bg-white bg-[url('/svg/BG.svg')] h-auto">
          <ScrollArea className="max-h-[550px]">
          {GeneralQuestions.map((question) => {
              return (
                <div key={question.id}>
                  <strong className="text-custom-dark-desaturated-blue">{question.question}</strong>
                  <p className="text-custom-dark-desaturated-blue">{question.answer}</p>
                  <br />
                </div>
              );
            })}
          </ScrollArea>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="bg-custom-lark-blue w-[100px]">Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}