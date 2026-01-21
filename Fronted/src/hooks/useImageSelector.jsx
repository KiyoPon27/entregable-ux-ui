import { Icon } from "@iconify/react/dist/iconify.js";
import { useRef, useState } from "react";
import styled from "styled-components";
import { useGlobalStore } from "../store/GlobalStore";

export const ImageSelector = ({ fileUrl }) => {
  const fileInputRef = useRef(null);
  const { setFile, setFileUrl } = useGlobalStore();
  const [isDragging, setIsDragging] = useState(false);
  
  function openFileSelector() {
    fileInputRef.current.click();
  }
  
  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Validar que sea imagen
    if (!selectedFile.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }
    
    const fileReader = new FileReader();
    fileReader.readAsDataURL(selectedFile);
    setFile(selectedFile);
    fileReader.onload = () => {
      setFileUrl(fileReader.result);
    };
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;
    
    // Validar que sea imagen
    if (!droppedFile.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }
    
    const fileReader = new FileReader();
    fileReader.readAsDataURL(droppedFile);
    setFile(droppedFile);
    fileReader.onload = () => {
      setFileUrl(fileReader.result);
    };
  };
  
  const hasImage = fileUrl && fileUrl !== "-";
  
  return (
    <Container>
      <DropZone
        isDragging={isDragging}
        hasImage={hasImage}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        {hasImage ? (
          <>
            <PreviewImage src={fileUrl} alt="Logo de empresa" />
            <OverlayEdit>
              <Icon icon="lets-icons:edit-fill" className="edit-icon" />
              <span>Cambiar logo</span>
            </OverlayEdit>
          </>
        ) : (
          <PlaceholderContent>
            <Icon icon="ph:image-duotone" className="placeholder-icon" />
            <TextContainer>
              <MainText>Click para seleccionar tu logo</MainText>
              <SubText>o arrastra y suelta aquí</SubText>
              <FormatText>PNG, JPG, GIF hasta 5MB</FormatText>
            </TextContainer>
          </PlaceholderContent>
        )}
        <HiddenInput
          onChange={handleImageChange}
          ref={fileInputRef}
          type="file"
          accept="image/*"
        />
      </DropZone>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  margin: 20px 0;
  display: flex;
  justify-content: center;
`;

const DropZone = styled.div`
  position: relative;
  width: 280px;
  height: 200px;
  border: 2px dashed ${props => props.isDragging ? '#ffc107' : props.hasImage ? '#4CAF50' : '#ccc'};
  border-radius: 12px;
  background-color: ${props => props.isDragging ? '#fffde7' : props.hasImage ? '#f9f9f9' : '#fafafa'};
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    border-color: ${props => props.hasImage ? '#45a049' : '#ffc107'};
    background-color: ${props => props.hasImage ? '#f5f5f5' : '#fff9c4'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 10px;
`;

const OverlayEdit = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  gap: 8px;
  
  ${DropZone}:hover & {
    opacity: 1;
  }
  
  .edit-icon {
    font-size: 32px;
  }
  
  span {
    font-size: 14px;
    font-weight: 500;
  }
`;

const PlaceholderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  text-align: center;
  
  .placeholder-icon {
    font-size: 48px;
    color: #999;
  }
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MainText = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const SubText = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0;
`;

const FormatText = styled.p`
  font-size: 11px;
  color: #999;
  margin: 0;
`;

const HiddenInput = styled.input`
  display: none;
`;
