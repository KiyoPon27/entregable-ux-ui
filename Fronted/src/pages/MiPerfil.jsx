import React, { useState, useEffect } from "react";
import styled from "styled-components";

import { ImageSelector } from "../hooks/useImageSelector";
import { useForm } from "react-hook-form";
import { Toaster } from "sonner";
import { useUsuariosStore } from "../store/UsuariosStore";
import { useEditarPerfilMutation } from "../tanstack/UsuariosStack";
import { useGlobalStore } from "../store/GlobalStore";
import { GravityStarsBackground } from "../components/ui/animated/GravityStarsBackground";

export const MiPerfil = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const { datausuarios, mostrarusuarios } = useUsuariosStore();
  const { fileUrl: globalFileUrl } = useGlobalStore();
  const { mutate: mutatePerfil, isPending } = useEditarPerfilMutation();
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
  } = useForm({
    defaultValues: {
      nombres: datausuarios?.nombres || "",
      nro_doc: datausuarios?.nroDoc || "",
      telefono: datausuarios?.telefono || "",
    },
  });

  // Ver cambios en tiempo real
  const formValues = watch();

  // Cargar datos del usuario al iniciar
  useEffect(() => {
    if (!datausuarios?.id) {
      mostrarusuarios();
    }
    // Cargar avatar del usuario
    if (datausuarios?.avatar) {
      setAvatarUrl(datausuarios.avatar);
    }
  }, []);

  // Actualizar form cuando cambien los datos del usuario
  useEffect(() => {
    reset({
      nombres: datausuarios?.nombres || "",
      nro_doc: datausuarios?.nroDoc || "",
      telefono: datausuarios?.telefono || "",
    });
    if (datausuarios?.avatar) {
      setAvatarUrl(datausuarios.avatar);
    }
  }, [datausuarios, reset]);

  // Sincronizar avatar cuando cambia el fileUrl global
  useEffect(() => {
    if (globalFileUrl) {
      setAvatarUrl(globalFileUrl);
    }
  }, [globalFileUrl]);

  const handleSave = (data) => {
    mutatePerfil({
      ...data,
      avatar: avatarUrl || datausuarios?.avatar,
    }, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  // Si no hay datos de usuario, mostrar loading
  if (!datausuarios || !datausuarios.id) {
    return (
      <Container>
        <BackgroundWrapper>
          <GravityStarsBackground className="gravity-stars-bg" />
        </BackgroundWrapper>
        <Card>
          <LoadingMessage>Cargando datos del usuario...</LoadingMessage>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Toaster position="top-right" />
      <BackgroundWrapper>
        <GravityStarsBackground className="gravity-stars-bg" />
      </BackgroundWrapper>
      
      <Card>
        {!isEditing ? (
          // Modo Vista
          <ViewMode>
            <CardBanner />
            <AvatarContainer>
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Avatar de perfil" />
              ) : (
                <AvatarPlaceholder>
                  {datausuarios?.nombres?.charAt(0)?.toUpperCase() || "U"}
                </AvatarPlaceholder>
              )}
            </AvatarContainer>
            
            <UserInfo>
              <UserName>{datausuarios?.nombres || "Nombre"}</UserName>
              <UserEmail>{datausuarios?.correo || "Email"}</UserEmail>
              {(datausuarios?.roles?.nombre || datausuarios?.rol?.nombre) && (
                <RolBadge>{datausuarios?.roles?.nombre || datausuarios?.rol?.nombre}</RolBadge>
              )}
            </UserInfo>

            <InfoGrid>
              <InfoItem>
                <InfoLabel>Identidad</InfoLabel>
                <InfoValue>{datausuarios?.nroDoc || "N/A"}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Teléfono</InfoLabel>
                <InfoValue>{datausuarios?.telefono || "N/A"}</InfoValue>
              </InfoItem>
            </InfoGrid>

            <ViewSaveButton onClick={() => setIsEditing(true)}>
              EDITAR PERFIL
            </ViewSaveButton>
          </ViewMode>
        ) : (
          // Modo Edición
          <EditMode>
            <EditTitle>Editar Información</EditTitle>
            
            <AvatarSelectorContainer>
              <ImageSelector fileUrl={avatarUrl || datausuarios?.avatar} />
            </AvatarSelectorContainer>

            <form onSubmit={handleSubmit(handleSave)}>
              <FormGroup>
                <Label>Nombres</Label>
                <StyledInput
                  placeholder="Nombres"
                  type="text"
                  {...register("nombres", { required: true })}
                />
                {errors.nombres?.type === "required" && (
                  <ErrorText>Campo requerido</ErrorText>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Número de Identidad</Label>
                <StyledInput
                  placeholder="Número de identidad"
                  type="text"
                  {...register("nro_doc", { required: true })}
                />
                {errors.nro_doc?.type === "required" && (
                  <ErrorText>Campo requerido</ErrorText>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Celular</Label>
                <StyledInput
                  placeholder="Celular"
                  type="text"
                  {...register("telefono", { required: true })}
                />
                {errors.telefono?.type === "required" && (
                  <ErrorText>Campo requerido</ErrorText>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Email</Label>
                <StyledInput
                  disabled
                  defaultValue={datausuarios?.correo || ""}
                  placeholder="Email"
                  type="text"
                />
              </FormGroup>

              <ButtonGroup>
                <SaveButton type="submit" disabled={isPending}>
                  {isPending ? "Guardando..." : "Guardar"}
                </SaveButton>
                <CancelButton onClick={() => setIsEditing(false)} type="button">
                  Cancelar
                </CancelButton>
              </ButtonGroup>
            </form>
          </EditMode>
        )}
      </Card>
    </Container>
  );
};
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: ${({ theme }) => theme.bgtotal};
  overflow: hidden;
  font-family: 'Segoe UI', 'Trebuchet MS', sans-serif;
  transition: background 0.3s ease-in-out;
  position: relative;
  z-index: 2;
`;

const BackgroundWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 0;
  opacity: 0.7;
  pointer-events: none;
  overflow: hidden;
  
  .gravity-stars-bg {
    width: 100%;
    height: 100%;
  }
`;

const Card = styled.div`
  position: relative;
  z-index: 10;
  background: #ffffff;
  border-radius: 20px;
  padding: 0;
  width: 90%;
  max-width: 500px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.07),
    0 20px 50px -10px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.07);
  overflow: hidden;
  animation: slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1);

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(24px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

const ViewMode = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding-bottom: 32px;
`;

const CardBanner = styled.div`
  width: 100%;
  height: 110px;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%);
  flex-shrink: 0;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='20' fill='none' stroke='rgba(255,255,255,0.07)' stroke-width='1'/%3E%3C/svg%3E");
  }
`;

const RolBadge = styled.div`
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  letter-spacing: 0.3px;
  text-transform: uppercase;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0 32px;
`;

const UserName = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.3px;
`;

const UserEmail = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  width: calc(100% - 48px);
  margin: 20px 24px 0;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;

  & > div:first-child {
    border-right: 1px solid #e5e7eb;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 20px;
  background: #f9fafb;
`;

const InfoLabel = styled.label`
  font-size: 10px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

const InfoValue = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  word-break: break-word;
`;

const ViewButtonWrapper = styled.div`
  width: calc(100% - 48px);
  margin: 16px 24px 28px;
`;

const EditMode = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 32px 28px;
`;

const EditTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  text-align: center;
  margin: 0 0 4px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 2px;
  color: #212121;
  font-weight: 600;
  font-size: 14px;
`;

const ErrorText = styled.span`
  font-size: 11px;
  color: #ff6b6b;
  font-weight: 600;
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  font-size: 16px;
  color: ${({ theme }) => theme.text2 || '#64748b'};
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 12px;
`;

const SaveButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
  overflow: hidden;
  font-family: inherit;
  border: none;
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #212121;
  color: white;
  box-shadow:
    0px 0px 3px rgba(0, 0, 0, 0.084),
    0px 2px 3px rgba(0, 0, 0, 0.168);

  &:hover:not(:disabled) {
    color: #212121;
  }

  &:active {
    scale: 0.98;
  }

  &::after {
    content: "";
    background: #ffffff;
    position: absolute;
    z-index: -1;
    left: -20%;
    right: -20%;
    top: 0;
    bottom: 0;
    transform: skewX(-45deg) scale(0, 1);
    transition: all 0.5s;
  }

  &:hover::after {
    transform: skewX(-45deg) scale(1, 1);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: inherit;
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
  color: #212121;
  border: 1px solid #ccc;
  margin-top: 8px;

  &:hover {
    background: #f7f7f7;
  }

  &:active {
    scale: 0.98;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 6px;
  font-family: inherit;
  border: 1px solid #ccc;
  font-size: 14px;
  box-sizing: border-box;

  &::placeholder {
    opacity: 0.5;
  }

  &:focus {
    outline: none;
    border-color: #1778f2;
  }

  &:disabled {
    background: #f3f4f6;
    color: #6b7280;
    cursor: not-allowed;
  }
`;

const AvatarContainer = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  border: 4px solid #ffffff;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
  margin-top: -50px;
  margin-bottom: 8px;
  position: relative;
  z-index: 2;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
`;

const AvatarSelectorContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 12px;
  background: ${({ theme }) => theme.bgtotal || '#f8fafc'};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.color2 || '#e2e8f0'};
`;

const ViewSaveButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
  overflow: hidden;
  font-family: inherit;
  border: none;
  width: calc(100% - 48px);
  margin: 20px 24px 0;
  padding: 12px 16px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #212121;
  color: white;
  box-shadow:
    0px 0px 3px rgba(0, 0, 0, 0.084),
    0px 2px 3px rgba(0, 0, 0, 0.168);

  &:hover {
    color: #212121;
  }

  &::after {
    content: "";
    background: #ffffff;
    position: absolute;
    z-index: -1;
    left: -20%;
    right: -20%;
    top: 0;
    bottom: 0;
    transform: skewX(-45deg) scale(0, 1);
    transition: all 0.5s;
  }

  &:hover::after {
    transform: skewX(-45deg) scale(1, 1);
  }
`;
