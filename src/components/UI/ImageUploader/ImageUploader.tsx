import React, { useRef, useState } from 'react';
import '../../../styles/components/UI/ImageUploader.css';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (newImagesBase64: string[]) => void;
  onRemoveImage: (index: number) => void;
  onReorderImages?: (newImages: string[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  images, 
  onImagesChange, 
  onRemoveImage,
  onReorderImages 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItemIndex = useRef<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

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

  // Container drag events: allow dragging external files into container
  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragItemIndex.current !== null) {
      e.dataTransfer.dropEffect = 'move';
    } else {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // If dropped on container background while reordering, clean up
    if (dragItemIndex.current !== null) {
      dragItemIndex.current = null;
      setDraggedIndex(null);
      setDropTargetIndex(null);
      return;
    }

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

  // Drag and drop handlers for reordering items
  const handleItemDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragItemIndex.current = index;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleItemDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (dragItemIndex.current === null) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dropTargetIndex !== index) {
      setDropTargetIndex(index);
    }
  };

  const handleItemDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (dragItemIndex.current === null) return;
    e.preventDefault();
    e.stopPropagation();
    setDropTargetIndex(index);
  };

  const handleItemDragLeave = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (dragItemIndex.current === null) return;
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      if (dropTargetIndex === index) {
        setDropTargetIndex(null);
      }
    }
  };

  const handleItemDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    const fromIndex = dragItemIndex.current;
    if (
      fromIndex !== null && 
      fromIndex !== targetIndex && 
      fromIndex >= 0 && 
      fromIndex < images.length && 
      targetIndex >= 0 && 
      targetIndex < images.length
    ) {
      const reordered = [...images];
      const [movedItem] = reordered.splice(fromIndex, 1);
      reordered.splice(targetIndex, 0, movedItem);
      onReorderImages?.(reordered);
    }

    dragItemIndex.current = null;
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const handleItemDragEnd = () => {
    dragItemIndex.current = null;
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const handleAddMoreDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (dragItemIndex.current === null) return;
    e.preventDefault();
    e.stopPropagation();

    const fromIndex = dragItemIndex.current;
    if (fromIndex !== null && fromIndex >= 0 && fromIndex < images.length - 1) {
      const reordered = [...images];
      const [movedItem] = reordered.splice(fromIndex, 1);
      reordered.push(movedItem);
      onReorderImages?.(reordered);
    }

    dragItemIndex.current = null;
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  return (
    <div 
      className={`image-uploader-container ${images.length > 0 ? 'has-images' : ''}`}
      onClick={handleContainerClick}
      onDragOver={handleContainerDragOver}
      onDrop={handleContainerDrop}
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
          {images.map((img, index) => {
            const isDragging = draggedIndex === index;
            const isDropTarget = dropTargetIndex === index;

            return (
              <div 
                key={index} 
                className={`image-preview ${isDragging ? 'is-dragging' : ''} ${isDropTarget ? 'drop-target' : ''}`}
                draggable
                onDragStart={(e) => handleItemDragStart(e, index)}
                onDragOver={(e) => handleItemDragOver(e, index)}
                onDragEnter={(e) => handleItemDragEnter(e, index)}
                onDragLeave={(e) => handleItemDragLeave(e, index)}
                onDrop={(e) => handleItemDrop(e, index)}
                onDragEnd={handleItemDragEnd}
                title="Перетягніть для зміни порядку"
              >
                <div className={`image-position-badge ${index === 0 ? 'main-badge' : ''}`}>
                  {index + 1}
                </div>
                <img src={img} alt={`Preview ${index + 1}`} draggable={false} />
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
            );
          })}
          <div 
            className="add-more-placeholder"
            onDragOver={(e) => {
              if (dragItemIndex.current !== null) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }
            }}
            onDrop={handleAddMoreDrop}
          >
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
