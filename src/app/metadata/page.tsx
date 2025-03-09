"use client";

import React, { useState, useRef, useEffect } from 'react';
import * as exifr from 'exifr';
import Navbar from "../navbar";

interface MetadataCategory {
  title: string;
  items: Array<{ key: string; value: string | number }>;
}

const ImageMetadataViewer: React.FC = () => {
  const [metadataCategories, setMetadataCategories] = useState<MetadataCategory[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const imagePreviewRef = useRef<HTMLDivElement>(null);

  // Format GPS coordinates from decimal to degrees, minutes, seconds
  const formatGPSCoordinates = (decimal: number, isLatitude: boolean): string => {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);
    
    const direction = isLatitude 
      ? (decimal >= 0 ? "N" : "S") 
      : (decimal >= 0 ? "E" : "W");
      
    return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
  };

  // Format date from EXIF format
  const formatExifDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  // Format value based on key name
  const formatValue = (key: string, value: any): string | number => {
    if (value === undefined || value === null) return "Not available";
    
    // Handle arrays
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    
    // Handle objects
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }

    // Format specific types of data
    if (key.toLowerCase().includes('date')) {
      return formatExifDate(value.toString());
    }
    
    if (key === 'exposureTime') {
      // Convert to fraction format (e.g., 1/125)
      const denominator = Math.round(1 / value);
      return denominator > 1 ? `1/${denominator}s` : `${value}s`;
    }
    
    if (key === 'fNumber') {
      return `f/${value}`;
    }
    
    if (key === 'focalLength') {
      return `${value}mm`;
    }
    
    if (key === 'iso' || key === 'ISO') {
      return `ISO ${value}`;
    }
    
    return value;
  };

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const extractMetadata = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setMetadataCategories([]);
    setOriginalFile(file);
    
    // Create URL for preview
    const fileUrl = URL.createObjectURL(file);
    setImageUrl(fileUrl);

    try {
      // Get basic file info
      const basicInfo = {
        title: "File Information",
        items: [
          { key: 'File Name', value: file.name },
          { key: 'File Size', value: `${(file.size / 1024).toFixed(2)} KB` },
          { key: 'File Type', value: file.type },
          { key: 'Last Modified', value: new Date(file.lastModified).toLocaleString() },
        ]
      };

      // Get image dimensions
      const img = new Image();
      const getDimensions = new Promise<MetadataCategory>((resolve) => {
        img.onload = () => {
          resolve({
            title: "Image Dimensions",
            items: [
              { key: 'Width', value: `${img.width} px` },
              { key: 'Height', value: `${img.height} px` },
              { key: 'Aspect Ratio', value: `${(img.width / img.height).toFixed(2)}` },
            ]
          });
        };
        img.onerror = () => {
          resolve({
            title: "Image Dimensions",
            items: [{ key: 'Error', value: 'Could not load image dimensions' }]
          });
        };
        img.src = fileUrl;
      });

      // Get all metadata using exifr
      const options = {
        // Include these blocks
        tiff: true,
        exif: true,
        gps: true,
        iptc: true,
        xmp: true,
        icc: true,
        makerNote: true,
        jfif: true,
        ihdr: true // PNG metadata
      };

      const allMetadata = await exifr.parse(file, options);
      const dimensionsData = await getDimensions;
      
      // Create categories for different types of metadata
      const categories: MetadataCategory[] = [basicInfo, dimensionsData];
      
      if (allMetadata) {
        // Create a map to organize metadata by category
        const metadataMap: Record<string, any> = {
          "EXIF Information": {},
          "Camera Information": {},
          "Image Settings": {},
          "GPS Information": {},
          "IPTC Information": {},
          "XMP Information": {},
          "ICC Profile": {},
          "JFIF Information": {},
          "Maker Notes": {},
          "Other Metadata": {}
        };

        // Sort metadata into appropriate categories
        for (const [key, value] of Object.entries(allMetadata)) {
          if (value === undefined || value === null) continue;
          
          // Camera info
          if (['Make', 'Model', 'Software', 'CameraOwnerName', 'BodySerialNumber', 'LensMake', 'LensModel', 'LensSerialNumber'].includes(key)) {
            metadataMap["Camera Information"][key] = value;
          } 
          // GPS data
          else if (['latitude', 'longitude', 'altitude', 'GPSLatitudeRef', 'GPSLongitudeRef', 'GPSAltitudeRef', 'GPSDateStamp', 'GPSTimeStamp', 'GPSProcessingMethod'].includes(key)) {
            metadataMap["GPS Information"][key] = value;
          } 
          // Image settings
          else if (['ExposureTime', 'exposureTime', 'FNumber', 'fNumber', 'ISO', 'ISOSpeedRatings', 'ShutterSpeedValue', 'ApertureValue', 'ExposureBiasValue', 'MaxApertureValue', 'MeteringMode', 'Flash', 'FocalLength', 'focalLength', 'WhiteBalance', 'ExposureMode', 'ExposureProgram'].includes(key)) {
            metadataMap["Image Settings"][key] = value;
          } 
          // IPTC data
          else if (key.startsWith('iptc') || ['ObjectName', 'Keywords', 'Caption-Abstract', 'By-line', 'Copyright', 'Credit', 'Source', 'City', 'Country', 'Category'].includes(key)) {
            metadataMap["IPTC Information"][key] = value;
          } 
          // XMP data
          else if (key.startsWith('xmp') || key.startsWith('Xmp')) {
            metadataMap["XMP Information"][key] = value;
          } 
          // ICC data
          else if (key.startsWith('icc') || key.startsWith('ICC') || 
                  ['ProfileVersion', 'ProfileClass', 'ColorSpaceData', 'ProfileConnectionSpace', 
                   'ProfileDateTime', 'ProfileFileSignature', 'RenderingIntent', 'ProfileDescription',
                   'RedMatrixColumn', 'GreenMatrixColumn', 'BlueMatrixColumn', 'MediaWhitePoint',
                   'RedTRC', 'GreenTRC', 'BlueTRC', 'ProfileCopyright'].includes(key)) {
            metadataMap["ICC Profile"][key] = value;
          } 
          // JFIF data
          else if (key.startsWith('jfif') || key.startsWith('JFIF') || 
                  ['JFIFVersion', 'ResolutionUnit', 'XResolution', 'YResolution', 
                   'ThumbnailWidth', 'ThumbnailHeight'].includes(key)) {
            metadataMap["JFIF Information"][key] = value;
          }
          // Maker notes
          else if (key.startsWith('MakerNote') || key.startsWith('makerNote')) {
            metadataMap["Maker Notes"][key] = value;
          } 
          // EXIF data (catch-all for remaining standard EXIF tags)
          else if (key.startsWith('exif') || ['CreateDate', 'ModifyDate', 'DateTimeOriginal', 'OffsetTime', 'ExifVersion', 'ComponentsConfiguration', 'CompressedBitsPerPixel', 'SubjectDistance', 'SubjectArea'].includes(key)) {
            metadataMap["EXIF Information"][key] = value;
          } 
          // Everything else
          else {
            metadataMap["Other Metadata"][key] = value;
          }
        }

        // Special handling for GPS to show formatted coordinates
        if (allMetadata.latitude !== undefined && allMetadata.longitude !== undefined) {
          metadataMap["GPS Information"]["Formatted Latitude"] = formatGPSCoordinates(allMetadata.latitude, true);
          metadataMap["GPS Information"]["Formatted Longitude"] = formatGPSCoordinates(allMetadata.longitude, false);
          
          // Add Google Maps link
          metadataMap["GPS Information"]["Maps Link"] = `https://maps.google.com/?q=${allMetadata.latitude},${allMetadata.longitude}`;
        }

        // Convert the map to our categories format
        for (const [categoryName, items] of Object.entries(metadataMap)) {
          const itemsArray = Object.entries(items).map(([key, value]) => ({
            key,
            value: formatValue(key, value)
          }));
          
          if (itemsArray.length > 0) {
            categories.push({
              title: categoryName,
              items: itemsArray
            });
          }
        }
      }

      // Set initial expanded state for all categories
      const initialExpandedState = categories.reduce((acc, category) => {
        acc[category.title] = true; // Start with all expanded
        return acc;
      }, {} as Record<string, boolean>);
      
      setExpandedCategories(initialExpandedState);
      setMetadataCategories(categories);
    } catch (err) {
      console.error('Error reading metadata:', err);
      setError('Error reading metadata: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      extractMetadata(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      extractMetadata(files[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDeleteMetadata = async () => {
    if (!originalFile) {
      setError("No image loaded to remove metadata from");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Create a canvas to strip metadata (EXIF, etc.)
      const img = new Image();
      
      // Create a promise to handle image loading
      const loadImagePromise = new Promise<HTMLCanvasElement>((resolve, reject) => {
        img.onload = () => {
          // Create canvas with the same dimensions as the image
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw the image on the canvas (this strips the metadata)
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }
          
          // Set quality and encoding options to avoid adding profile data
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          resolve(canvas);
        };
        
        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };
        
        // Load the image
        img.src = URL.createObjectURL(originalFile);
      });

      // Wait for the image to load and be drawn on canvas
      const canvas = await loadImagePromise;
      
      // Determine the best format for the output
      let outputType = originalFile.type;
      let outputQuality = 1.0;
      
      // If it's a JPEG, use specific quality settings
      if (outputType === 'image/jpeg' || outputType === 'image/jpg') {
        outputQuality = 0.95; // High quality but avoid metadata
      } else if (outputType === 'image/png') {
        // PNG is already lossless
      } else {
        // For other formats, default to PNG to ensure no metadata
        outputType = 'image/png';
      }
      
      // Convert the canvas to a blob with specific quality settings
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to convert canvas to blob"));
          }
        }, outputType, outputQuality);
      });
      
      // Create a new file from the blob
      const fileExtension = outputType.split('/')[1];
      const newFileName = `${originalFile.name.split('.')[0]}_clean.${fileExtension}`;
      const newFile = new File([blob], newFileName, { type: outputType });
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = newFileName;
      
      // Trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Verify metadata removal by trying to extract it again
      const metadataAfterRemoval = await exifr.parse(newFile, {
        tiff: true, exif: true, gps: true, iptc: true, 
        xmp: true, icc: true, jfif: true, ihdr: true
      });
      
      const hasRemainingMetadata = metadataAfterRemoval && 
        Object.keys(metadataAfterRemoval).length > 0 && 
        !Object.keys(metadataAfterRemoval).every(key => 
          ["ifd0", "exif", "gps", "interop", "thumbnail"].includes(key) && 
          Object.keys(metadataAfterRemoval[key]).length === 0
        );
        
      if (hasRemainingMetadata) {
        console.warn("Some metadata may still be present:", metadataAfterRemoval);
        setSuccessMessage("Metadata removed and image downloaded. Some embedded data might remain.");
      } else {
        setSuccessMessage("All metadata successfully removed. Clean image downloaded.");
      }
      
      // Reload the file to show updated metadata
      extractMetadata(newFile);
      
    } catch (err) {
      console.error('Error removing metadata:', err);
      setError('Error removing metadata: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Setup scroll behavior for sticky image preview
  useEffect(() => {
    const handleScroll = () => {
      if (imagePreviewRef.current) {
        const imagePreviewRect = imagePreviewRef.current.getBoundingClientRect();
        const parentColumn = imagePreviewRef.current.parentElement;
        
        if (parentColumn) {
          // Get the parent's top position relative to the viewport
          const parentRect = parentColumn.getBoundingClientRect();
          
          // If the "Image Preview" text would be near the top of the screen
          if (parentRect.top <= 100) {
            imagePreviewRef.current.style.position = 'fixed';
            imagePreviewRef.current.style.top = '100px';
            imagePreviewRef.current.style.width = `${parentRect.width}px`;
            
            // Don't let it go below its container bounds
            const parentBottom = parentRect.bottom - imagePreviewRect.height;
            if (parentBottom <= 50) {
              imagePreviewRef.current.style.top = `${parentBottom}px`;
            }
          } else {
            imagePreviewRef.current.style.position = 'static';
            imagePreviewRef.current.style.width = '100%';
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <>
      {/* <span className='absolute top-0 left-0 w-full'> */}
            <Navbar/>
          {/* </span> */}
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-amber-400 text-center">Comprehensive Image Metadata Viewer</h1>
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
      
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center cursor-pointer"
        onClick={triggerFileInput}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="text-gray-500">
          <p className="mb-2">Click to select or drag and drop an image</p>
          <p className="text-sm">Supported formats: JPG, PNG, TIFF, HEIC</p>
        </div>
      </div>
      
      {isLoading && (
        <div className="text-center py-4">
          <p>Processing image...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {imageUrl && !isLoading && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-amber-400">Image Preview & Metadata</h2>
            <button
              onClick={handleDeleteMetadata}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Delete All Metadata
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div ref={imagePreviewRef} className="z-10">
                <h3 className="text-lg font-medium mb-3 text-amber-400">Image Preview</h3>
                <div className="border rounded-lg overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt="Selected image preview" 
                    className="max-w-full h-auto"
                  />
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium mb-3 text-amber-400">Metadata</h3>
              {metadataCategories.length > 0 ? (
                <div className="space-y-4">
                  {metadataCategories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                      <div 
                        className="flex items-center justify-between bg-gray-100 p-3 cursor-pointer"
                        onClick={() => toggleCategory(category.title)}
                      >
                        <h3 className="font-medium">{category.title}</h3>
                        <span className="text-gray-500">
                          {expandedCategories[category.title] ? '▼' : '▶'}
                        </span>
                      </div>
                      
                      {expandedCategories[category.title] && (
                        <div className="p-3">
                          <table className="w-full">
                            <tbody>
                              {category.items.map((item, itemIndex) => (
                                <tr key={itemIndex} className={itemIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="py-2 px-3 font-medium text-sm">{item.key}</td>
                                  <td className="py-2 px-3 text-sm break-words break-all">
                                    {typeof item.value === 'string' && item.value.startsWith('https://') ? (
                                      <a 
                                        href={item.value} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        Open in Google Maps
                                      </a>
                                    ) : (
                                      item.value
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No metadata available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default ImageMetadataViewer;