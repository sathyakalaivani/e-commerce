// Converts a File object to a base64 data URI for uploading to the backend (which forwards to Cloudinary)
export default function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
