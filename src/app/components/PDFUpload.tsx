'use client'
import React, { useState,Dispatch, useRef, ChangeEvent, FormEvent, SetStateAction } from 'react';
import toast from 'react-hot-toast';

interface FileUploadProps {
    setSelectedFile: Dispatch<SetStateAction<File | null>>
    maxSizeInMB?: number;
    setFileUrl: Dispatch<SetStateAction<string>>
  }

const PDFUpload:React.FC<FileUploadProps> = ({setSelectedFile, setFileUrl, maxSizeInMB=10}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
   
    // PDF type check
    const isPDF = file.type === 'application/pdf';
    
    // File size check (convert MB to bytes)
    const isValidSize = file.size <= (maxSizeInMB * 1024 * 1024);

    if (!isPDF) {
      toast.error('Please select a PDF file.');
      return false;
    }

    if (!isValidSize) {
      toast.error(`File must be less than ${maxSizeInMB}MB.`);
      return false;
    }

    return true;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log(event)
    // Reset previous errors
    toast.dismiss();

    const file = event.target.files?.[0];
    
    if (file) {
      if (validateFile(file)) {
        setSelectedFile(file);
        const fileUrl = URL.createObjectURL(file)
        console.log(fileUrl)
        setFileUrl(fileUrl)
      }
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <>
    <div>
    {/* Label triggers the file input click */}
    <label
      htmlFor="file-upload"
      className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto cursor-pointer hover:cursor-pointer active:cursor-pointer"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 ">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
      </svg>
      Upload Document
    </label>

    {/* Hidden file input */}
    <input
      id="file-upload"
      type="file"
      ref={fileInputRef}
      onChange={handleFileChange}
      accept=".pdf"
      className="hidden"
    />
  </div>
  
  </>
  )
}

export default PDFUpload