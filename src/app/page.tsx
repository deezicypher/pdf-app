'use client'
import React, {useState} from 'react'
import PDFUpload from "./components/PDFUpload"
import PDFViewer from './components/PDFViewer';


export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');

  const handleCloseFile = () => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    setSelectedFile(null);
    setFileUrl('');
  };
  return (
    <div className="dark  items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center ">
        <h1 className="text-6xl text-bold">PDF App</h1>
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            Get started by uploading a document
          </li>
          <li className="tracking-[-.01em]">
           Annotate and see your changes instantly.
          </li>
          <li className="tracking-[-.01em]">
            Export your document.
          </li>
        </ol>

<PDFViewer fileUrl={fileUrl} />
        <div className="flex gap-4 items-center flex-col sm:flex-row">
<PDFUpload  setSelectedFile={setSelectedFile} setFileUrl={setFileUrl} />
  <div
    onClick={() => {}}
    className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto  cursor-pointer hover:cursor-pointer active:cursor-pointer"
  >
    Export Document
  </div>
</div>
      </main>

    </div>
  );
}
