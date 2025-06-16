export default interface IChatUploadPhoto {
  mediaFiles: File[];
  messageContent?: string;
  chatId: string;
  senderId: string;
}