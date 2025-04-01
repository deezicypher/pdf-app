import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import toast from 'react-hot-toast'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  fileUrl: string;
}

// Comprehensive Annotation Types
type BaseAnnotation = {
  id: string;
  page: number;
  x: number;
  y: number;
};

type HighlightAnnotation = BaseAnnotation & {
  type: 'highlight';
  color: string;
  width: number;
  height: number;
};

type UnderlineAnnotation = BaseAnnotation & {
  type: 'underline';
  color: string;
  width: number;
};

type CommentAnnotation = BaseAnnotation & {
  type: 'comment';
  text: string;
};

type SignatureAnnotation = BaseAnnotation & {
  type: 'signature';
  imageData: string;
};

type Annotation = 
  | HighlightAnnotation 
  | UnderlineAnnotation 
  | CommentAnnotation 
  | SignatureAnnotation;

type AnnotationTool = 'select' | 'highlight' | 'underline' | 'comment' | 'signature';


const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentTool, setCurrentTool] = useState<AnnotationTool>('select');

 // Annotation-specific states
 const [highlightColor, setHighlightColor] = useState<string>('#ffff00');
 const [underlineColor, setUnderlineColor] = useState<string>('#0000ff');
 const [commentText, setCommentText] = useState<string>('');
 
 // Refs and drawing states
 const documentRef = useRef<HTMLDivElement>(null);
 const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
 const [isDrawing, setIsDrawing] = useState<boolean>(false);
 const [startCoords, setStartCoords] = useState<{x: number, y: number} | null>(null);

 // Unique ID generator
 const generateId = () => Math.random().toString(36).substr(2, 9);

 // Event Handlers for Different Annotation Types
 const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
   if (!documentRef.current) return;

   const rect = documentRef.current.getBoundingClientRect();
   const x = e.clientX - rect.left;
   const y = e.clientY - rect.top;

   setStartCoords({ x, y });
   setIsDrawing(true);
 };

 const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
   if (!isDrawing || !documentRef.current || !startCoords) return;

   const rect = documentRef.current.getBoundingClientRect();
   const currentX = e.clientX - rect.left;
   const currentY = e.clientY - rect.top;

   // Handle different annotation types
   switch (currentTool) {
     case 'highlight':
     case 'underline':
       // Can add preview logic here if needed
       break;
   }
 };

 const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
   if (!isDrawing || !documentRef.current || !startCoords) return;

   const rect = documentRef.current.getBoundingClientRect();
   const endX = e.clientX - rect.left;
   const endY = e.clientY - rect.top;

   // Create annotation based on current tool
   switch (currentTool) {
     case 'highlight':
       setAnnotations(prev => [...prev, {
         id: generateId(),
         type: 'highlight',
         page: pageNumber,
         x: Math.min(startCoords.x, endX),
         y: Math.min(startCoords.y, endY),
         width: Math.abs(endX - startCoords.x),
         height: 20,
         color: highlightColor
       }]);
       break;

     case 'underline':
       setAnnotations(prev => [...prev, {
         id: generateId(),
         type: 'underline',
         page: pageNumber,
         x: Math.min(startCoords.x, endX),
         y: Math.max(startCoords.y, endY),
         width: Math.abs(endX - startCoords.x),
         color: underlineColor
       }]);
       break;

     case 'comment':
       setAnnotations(prev => [...prev, {
         id: generateId(),
         type: 'comment',
         page: pageNumber,
         x: endX,
         y: endY,
         text: commentText || 'New Comment'
       }]);
       setCommentText('');
       break;

     case 'signature':
       if (signatureCanvasRef.current) {
         const imageData = signatureCanvasRef.current.toDataURL();
         setAnnotations(prev => [...prev, {
           id: generateId(),
           type: 'signature',
           page: pageNumber,
           x: endX,
           y: endY,
           imageData
         }]);
       }
       break;
   }

   // Reset drawing state
   setIsDrawing(false);
   setStartCoords(null);
 };

 // Signature drawing logic
 const handleSignatureDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
   if (!signatureCanvasRef.current) return;

   const canvas = signatureCanvasRef.current;
   const ctx = canvas.getContext('2d');
   if (!ctx) return;

   const rect = canvas.getBoundingClientRect();
   const x = e.clientX - rect.left;
   const y = e.clientY - rect.top;

   ctx.lineWidth = 2;
   ctx.lineCap = 'round';
   ctx.lineTo(x, y);
   ctx.stroke();
   ctx.beginPath();
   ctx.moveTo(x, y);
 };

 // Render Annotations for Current Page
 const renderAnnotations = () => {
   return annotations
     .filter(a => a.page === pageNumber)
     .map((annotation) => {
       switch (annotation.type) {
         case 'highlight':
           return (
             <div 
               key={annotation.id}
               style={{
                 position: 'absolute',
                 left: `${annotation.x}px`,
                 top: `${annotation.y}px`,
                 width: `${annotation.width}px`,
                 height: `${annotation.height}px`,
                 backgroundColor: annotation.color,
                 opacity: 0.5,
                 pointerEvents: 'none'
               }}
             />
           );
         case 'underline':
           return (
             <div 
               key={annotation.id}
               style={{
                 position: 'absolute',
                 left: `${annotation.x}px`,
                 top: `${annotation.y}px`,
                 width: `${annotation.width}px`,
                 height: '3px',
                 backgroundColor: annotation.color,
               }}
             />
           );
         case 'comment':
           return (
             <div 
               key={annotation.id}
               className="absolute bg-yellow-100 p-2 rounded shadow-md"
               style={{
                 left: `${annotation.x}px`,
                 top: `${annotation.y}px`,
               }}
             >
               {annotation.text}
             </div>
           );
         case 'signature':
           return (
             <img 
               key={annotation.id}
               src={annotation.imageData}
               alt="Signature"
               style={{
                 position: 'absolute',
                 left: `${annotation.x}px`,
                 top: `${annotation.y}px`,
                 maxWidth: '200px',
                 maxHeight: '100px',
               }}
             />
           );
       }
     });
 };

 // Annotation Tools Render
 const renderAnnotationTools = () => (
   <div className="flex space-x-4 mb-4 items-center">
     <select 
       value={currentTool}
       onChange={(e) => setCurrentTool(e.target.value as AnnotationTool)}
       className="p-2 border rounded"
     >
       <option value="select">Select</option>
       <option value="highlight">Highlight</option>
       <option value="underline">Underline</option>
       <option value="comment">Comment</option>
       <option value="signature">Signature</option>
     </select>

     {currentTool === 'highlight' && (
       <div className="flex items-center space-x-2">
         <label>Highlight Color:</label>
         <input 
           type="color"
           value={highlightColor}
           onChange={(e) => setHighlightColor(e.target.value)}
           className="w-10 h-10"
         />
       </div>
     )}

     {currentTool === 'underline' && (
       <div className="flex items-center space-x-2">
         <label>Underline Color:</label>
         <input 
           type="color"
           value={underlineColor}
           onChange={(e) => setUnderlineColor(e.target.value)}
           className="w-10 h-10"
         />
       </div>
     )}

     {currentTool === 'comment' && (
       <input 
         type="text"
         value={commentText}
         onChange={(e) => setCommentText(e.target.value)}
         placeholder="Enter comment"
         className="p-2 border rounded"
       />
     )}
   </div>
 );

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToPreviousPage = () => {
    setPageNumber((prevPage) => Math.max(1, prevPage - 1));
  };

  const goToNextPage = () => {
    setPageNumber((prevPage) => Math.min(numPages, prevPage + 1));
  };

  
  

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        if(containerRef.current.offsetWidth > 600 &&  containerRef.current.offsetWidth< 1000){
          return setWidth(containerRef.current.offsetWidth/2);
        }
        if(containerRef.current.offsetWidth > 600 &&  containerRef.current.offsetWidth< 1000){
          return setWidth(containerRef.current.offsetWidth/2);
        }
        setWidth(containerRef.current.offsetWidth);
      }
    };

    // Initial width calculation
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);




  return (
<div className="flex flex-col items-center space-y-4 w-full max-w-4xl mx-auto">
      {fileUrl && (
        <div className="bg-white shadow-lg p-4 rounded-lg  w-full">
           {/* Annotation Tools */}
           {renderAnnotationTools()}

          {/* PDF Document Container */}
          <div
            ref={containerRef}
            className="w-full overflow-auto"
            style={{
              maxHeight: '1800px',
              height: '100%',
              width: '100%',
              padding: '10px',
              boxSizing: 'border-box',
            }}
          >
           {/* Signature Canvas */}
        {currentTool === 'signature' && (
          <canvas
            ref={signatureCanvasRef}
            className="absolute top-0 left-0 z-50"
            width={window.innerWidth}
            height={window.innerHeight}
            onMouseMove={handleSignatureDraw}
          />
        )}
        <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => {
                console.error("Error loading PDF: ", error);
                toast.error("Error loading PDF.");
              }}
              loading={
                <div className="flex justify-center items-center">
                  <p className="text-gray-500">Loading PDF...</p>
                </div>
              }
              error={
                <div className="text-red-500 text-center p-4">
                  Error loading PDF. Please try again.
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                width={width} // Fallback to a default size if container size is unavailable
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
{/* Render Annotations */}
{renderAnnotations()}

        {/* Page Number and Navigation */}
        {numPages > 0 && (
          <div className="flex items-center justify-center space-x-4 w-full">
            {/* Previous Button */}
            <button
              onClick={goToPreviousPage}
              disabled={pageNumber <= 1}
              className="p-2 bg-blue-500 text-white rounded-full cursor-pointer disabled:bg-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="sm:w-6 w-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18"
                />
              </svg>
            </button>

            {/* Page Number Text */}
            <span className="text-center text-slate-900">
              Page {pageNumber} of {numPages}
            </span>

            {/* Next Button */}
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="p-2 bg-blue-500 text-white rounded-full cursor-pointer disabled:bg-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="sm:w-6 w-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )}
</div>

  );
};

export default PDFViewer;
