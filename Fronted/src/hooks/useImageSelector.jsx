import { Icon } from "@iconify/react/dist/iconify.js";
import { useRef, useState } from "react";
import styled from "styled-components";
import { useGlobalStore } from "../store/GlobalStore";

export const ImageSelector = ({ fileUrl, onFileSelected, onRemove, compact = false }) => {
  const fileInputRef = useRef(null);
  const { setFile, setFileUrl } = useGlobalStore();
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState(null);

  function openFileSelector() {
    fileInputRef.current.click();
  }

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    setFile(file);
    fileReader.onload = () => {
      setFileUrl(fileReader.result);
      try { if (typeof onFileSelected === 'function') onFileSelected(file, fileReader.result); } catch(e) { console.error('onFileSelected callback error', e); }
    };
  };

  const handleImageChange = (e) => {
    processFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleRemove = (e) => {
    e && e.stopPropagation && e.stopPropagation();
    setFileUrl(null);
    setFile(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    try { if (typeof onRemove === 'function') onRemove(); } catch(e) { console.error('onRemove callback error', e); }
  };

  const hasImage = fileUrl && fileUrl !== "-";

  return (
    <Wrapper>
      <HiddenInput
        onChange={handleImageChange}
        ref={fileInputRef}
        type="file"
        accept="image/*"
      />

      {!hasImage ? (
        <DropZone
          $isDragging={isDragging}
          $compact={compact}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileSelector}
        >
          <IconCircle $compact={compact}>
            <Icon icon="ph:image-plus" style={{ fontSize: (compact ? 18 : 22), color: "#6b7280" }} />
          </IconCircle>
          <DropText>
            <DropMainText>Click para seleccionar</DropMainText>
            <DropSubText>o arrastra y suelta aquí</DropSubText>
          </DropText>
        </DropZone>
      ) : (
        <PreviewWrapper>
          <PreviewArea $compact={compact}>
            <PreviewImage src={fileUrl} alt="Vista previa" />
            <PreviewOverlay>
              <OverlayBtn onClick={openFileSelector} title="Cambiar imagen">
                <Icon icon="ph:upload-simple" style={{ fontSize: 16 }} />
              </OverlayBtn>
              <OverlayBtnDanger onClick={handleRemove} title="Eliminar imagen">
                <Icon icon="ph:trash" style={{ fontSize: 16 }} />
              </OverlayBtnDanger>
            </PreviewOverlay>
          </PreviewArea>
          {fileName && (
            <FileNameRow>
              <FileNameText>{fileName}</FileNameText>
              <RemoveBtn onClick={handleRemove}>
                <Icon icon="ph:x" style={{ fontSize: 14 }} />
              </RemoveBtn>
            </FileNameRow>
          )}
        </PreviewWrapper>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
`;

const DropZone = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: ${({ $compact }) => ($compact ? '120px' : '160px')};
  border: 2px dashed ${({ $isDragging }) => ($isDragging ? "#6366f1" : "#d1d5db")};
  border-radius: 10px;
  background-color: ${({ $isDragging }) => ($isDragging ? "#f5f3ff" : "#f9fafb")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #9ca3af;
    background-color: #f3f4f6;
  }
`;

const IconCircle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ $compact }) => ($compact ? '44px' : '48px')};
  height: ${({ $compact }) => ($compact ? '44px' : '48px')};
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
`;

const DropText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const DropMainText = styled.p`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin: 0;
`;

const DropSubText = styled.p`
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
`;

const PreviewWrapper = styled.div`
  width: 100%;
`;

const PreviewArea = styled.div`
  position: relative;
  width: 100%;
  height: ${({ $compact }) => ($compact ? '120px' : '160px')};
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  overflow: hidden;

  &:hover > div {
    opacity: 1;
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${PreviewArea}:hover & {
    transform: scale(1.03);
  }
`;

const PreviewOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
`;

const OverlayBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.35);
  }
`;

const OverlayBtnDanger = styled(OverlayBtn)`
  background: rgba(239, 68, 68, 0.7);
  border-color: rgba(239, 68, 68, 0.5);

  &:hover {
    background: rgba(239, 68, 68, 0.9);
  }
`;

const FileNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

const FileNameText = styled.span`
  font-size: 12px;
  color: #6b7280;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RemoveBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;
