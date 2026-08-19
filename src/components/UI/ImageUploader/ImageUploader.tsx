import React, { useRef } from 'react';
import '../../../styles/components/UI/ImageUploader.css';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (newImagesBase64: string[]) => void;
  onRemoveImage: (index: number) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onImagesChange, onRemoveImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.image-preview')) {
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    let processedCount = 0;
    const newBase64Images: string[] = [];
    
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        newBase64Images.push(base64String);
        processedCount++;
        
        if (processedCount === files.length) {
          onImagesChange(newBase64Images);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Clear input so same files can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Prevent default behavior for drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      if (files.length === 0) return;

      let processedCount = 0;
      const newBase64Images: string[] = [];

      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          newBase64Images.push(base64String);
          processedCount++;
          
          if (processedCount === files.length) {
            onImagesChange(newBase64Images);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <div 
      className={`image-uploader-container ${images.length > 0 ? 'has-images' : ''}`}
      onClick={handleContainerClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/jpeg, image/png, image/webp" 
        multiple 
        onChange={handleFileChange}
        className="hidden-file-input"
      />

      {images.length === 0 ? (
        <div className="image-uploader-placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="upload-icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <p className="upload-text">Натисніть або перетягніть фото сюди</p>
          <div className="upload-hint">
            <p>Рекомендовані стандарти для ПК та мобільних пристроїв:</p>
            <ul>
              <li>Формати: <strong>JPG, PNG, WEBP</strong></li>
              <li>Розмір файлу: <strong>до 5 МБ</strong></li>
              <li>Співвідношення сторін: <strong>1:1 або 3:4</strong></li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="image-preview-grid">
          {images.map((img, index) => (
            <div key={index} className="image-preview">
              <img src={img} alt={`Preview ${index}`} />
              <button 
                type="button" 
                className="remove-image-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(index);
                }}
                title="Видалити зображення"
              >
                &times;
              </button>
            </div>
          ))}
          <div className="add-more-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Додати ще</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
