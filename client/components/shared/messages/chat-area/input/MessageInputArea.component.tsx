// import { Paperclip, Send, Smile } from 'lucide-react'
// import { useState } from 'react';
// import IMessageInputArea from './MessageInputArea.model';

// export default function MessageInputArea({ handleSendMessage }: IMessageInputArea) {
//   const [inputValue, setInputValue] = useState('');

//   const handleSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     handleSendMessage(inputValue);
//     setInputValue('');
//   };

//   const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setInputValue(event.target.value);
//   };

//   return (
//     <div className="bg-base-100 border-t border-base-300 p-3 sticky bottom-0">
//       <form onSubmit={handleSubmitMessage} className="flex items-center">
//         <button type="button" className="btn btn-ghost btn-sm rounded-full">
//           <Smile className="h-5 w-5 text-base-content" />
//         </button>
//         <input type="file" className="btn btn-ghost btn-sm rounded-full">
//           <Paperclip className="h-5 w-5 text-base-content" />
//         </input>
//         <input
//           type="text"
//           placeholder="Type a message"
//           className="input input-bordered input-sm rounded-full flex-1 mx-2 focus:outline-none"
//           value={inputValue}
//           onChange={(e) => handleInputChange(e)}
//         />
//         <button type="submit" className="btn btn-ghost btn-sm rounded-full">
//           <Send className="h-5 w-5 text-base-content" />
//         </button>
//       </form>
//     </div>
//   )
// }



import { Paperclip, Send, Smile, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react';
import IMessageInputArea from './MessageInputArea.model';
import { FileUpload, FileUploadDropzone, FileUploadItem, FileUploadItemDelete, FileUploadItemMetadata, FileUploadItemPreview, FileUploadItemProgress, FileUploadList, FileUploadTrigger } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import IChatUploadPhoto from '@/lib/api/upload/chat-upload-photo/chatUploadPhoto.model';
import { chatUploadPhoto } from '@/lib/api/upload/chat-upload-photo/chatUploadPhoto.route';

export default function MessageInputArea({ handleSendMessage, activeChatId, token, id, socketState }: IMessageInputArea) {
  const [inputValue, setInputValue] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // const onInputChange = React.useCallback(
  //   (event: React.ChangeEvent<HTMLTextAreaElement>) => {
  //     setInput(event.target.value);
  //   },
  //   [],
  // );

  const onUpload = useCallback(
    async (
      files: File[],
      {
        onProgress,
        onSuccess,
        onError,
      }: {
        onProgress: (file: File, progress: number) => void;
        onSuccess: (file: File) => void;
        onError: (file: File, error: Error) => void;
      },
    ) => {
      try {
        setIsUploading(true);
        // Process each file individually
        const uploadPromises = files.map(async (file) => {
          try {
            // Simulate file upload with progress
            const totalChunks = 10;
            let uploadedChunks = 0;

            // Simulate chunk upload with delays
            for (let i = 0; i < totalChunks; i++) {
              // Simulate network delay (100-300ms per chunk)
              await new Promise((resolve) =>
                setTimeout(resolve, Math.random() * 200 + 100),
              );

              // Update progress for this specific file
              uploadedChunks++;
              const progress = (uploadedChunks / totalChunks) * 100;
              onProgress(file, progress);
            }

            // Simulate server processing delay
            await new Promise((resolve) => setTimeout(resolve, 500));
            onSuccess(file);
          } catch (error) {
            onError(
              file,
              error instanceof Error ? error : new Error("Upload failed"),
            );
          } finally {
            setIsUploading(false);
          }
        });

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
      } catch (error) {
        // This handles any error that might occur outside the individual upload processes
        console.error("Unexpected error during upload:", error);
      }
    },
    [],
  );

  const onFileReject = useCallback((file: File, message: string) => {
    toast({
      title: "Error",
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
      duration: 3000,
    });
  }, []);

  const handleSubmitMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    // if (!inputValue.trim()) {
    //   if (files.length > 0) {
    //     handleSendMessage(inputValue, files);
    //   } else {
    //     return;
    //   }
    // }

    // const messageData: IChatUploadPhoto = {
    //   chatId: acitveChatId,
    //   senderId: id,
    //   mediaFiles: files,
    // }
    // e.preventDefault();
    // handleSendMessage(inputValue, files);
    // setInputValue('');
    // setFiles([]);

    e.preventDefault();

    if (!socketState) {
      console.error('Socket not initialized');
      toast({
        title: "Error",
        description: "Socket not initialized",
        variant: "destructive",
      });
      return;
    }

    console.log(inputValue, 'handleSendMessage');
    if (!files || files.length === 0) {
      socketState?.emit('send_message', {
        chatId: activeChatId,
        senderId: id,
        content: inputValue,
        // content: e.target.value,
        // recipientId: activeChat._id,
      });
    } else {
      setIsUploading(true);
      try {
        const fileResponse = await chatUploadPhoto(token, {
          mediaFiles: files,
          chatId: activeChatId,
          senderId: id,
          messageContent: inputValue,
        })
      } catch (error) {
        console.error("Error uploading files:", error);
        toast({
          title: "Error",
          description: `Error uploading files: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }

    }
    setInputValue('');
    setFiles([]);

  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  // console.log(files)

  return (
    <FileUpload
      value={files}
      onValueChange={setFiles}
      // onUpload={onUpload}
      onFileReject={onFileReject}
      maxFiles={10}
      maxSize={5 * 1024 * 1024}
      // className="relative w-full max-w-md"
      multiple
      accept="image/*, video/*, .pdf, .docx, .pptx, .txt,"
      disabled={isUploading}
      className="bg-base-100 border-t border-base-300 p-3 sticky bottom-0"
    >

      {/* <FileUploadDropzone
        tabIndex={-1}
        // Prevents the dropzone from triggering on click
        onClick={(event) => event.preventDefault()}
        className="absolute inset-0 z-0 flex h-svh w-full items-center justify-center rounded-none border-none bg-background/50 p-0 opacity-0 backdrop-blur transition-opacity duration-200 ease-out data-[dragging]:z-10 data-[dragging]:opacity-100 border-4 border-red-500"
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex items-center justify-center rounded-full border p-2.5">
            <Upload className="size-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm">Drag & drop files here</p>
          <p className="text-muted-foreground text-xs">
            Upload max 5 Files each up to 5MB
          </p>
        </div>
      </FileUploadDropzone> */}

      <FileUploadList
        orientation="horizontal"
        className="overflow-x-auto px-0 py-1"
      >
        {files.map((file, index) => (
          <FileUploadItem key={index} value={file} className="max-w-52 p-1.5">
            <FileUploadItemPreview className="size-8 [&>svg]:size-5">
              <FileUploadItemProgress variant="fill" />
            </FileUploadItemPreview>
            <FileUploadItemMetadata size="sm" />
            <FileUploadItemDelete asChild>
              <Button
                variant="secondary"
                size="icon"
                className="-top-1 -right-1 absolute size-4 shrink-0 cursor-pointer rounded-full"
              >
                <X className="size-2.5" />
              </Button>
            </FileUploadItemDelete>
          </FileUploadItem>
        ))}
      </FileUploadList>

      <form onSubmit={handleSubmitMessage} className="flex items-center">

        <button type="button" className="btn btn-ghost btn-sm rounded-full">
          <Smile className="h-5 w-5 text-base-content" />
        </button>
        {/* <button type="button" className="btn btn-ghost btn-sm rounded-full">
          <Paperclip className="h-5 w-5 text-base-content" />
        </button> */}
        <FileUploadTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-7 rounded-sm"
          >
            {/* <Paperclip className="size-3.5" /> */}
            <Paperclip className="h-5 w-5 text-base-content" />
            <span className="sr-only">Attach file</span>
          </Button>
        </FileUploadTrigger>
        <input
          type="text"
          placeholder="Type a message"
          className="input input-bordered input-sm rounded-full flex-1 mx-2 focus:outline-none"
          value={inputValue}
          onChange={(e) => handleInputChange(e)}
        />
        {/* <Button type="submit" disabled={!inputValue.trim() || !inputValue.trim() && files.length === 0} className="rounded-full" variant='outline'>
          <Send className="h-5 w-5 text-base-content" />
        </Button> */}
        <button type="submit" disabled={!inputValue.trim() || !inputValue.trim() && files.length === 0} className={`btn btn-outline btn-sm rounded-full ${!inputValue.trim() && files.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {
            isUploading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Send className="h-5 w-5 text-base-content" />
            )
          }
        </button>
      </form>
    </FileUpload>
  )
}


