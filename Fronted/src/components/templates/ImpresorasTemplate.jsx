import styled from "styled-components";
import { Btn1 } from "../moleculas/Btn1";
import { slideBackground } from "../../styles/keyframes";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useImpresorasStore } from "../../store/ImpresorasStore";
import { BarLoader } from "react-spinners";
import { Switch } from "../ui/toggles/Switch";
import { SelectList } from "../ui/lists/SelectList";
import { toast, Toaster } from "sonner";
import { useUsuariosStore } from "../../store/UsuariosStore";
import { useState } from "react";
import ticket from "../../reports/TicketPrueba";
import { Title } from "../atomos/Title";
import { useMostrarImpresorasPorUsuarioQuery } from "../../tanstack/ImpresorasStack";

export const ImpresorasTemplate = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const {
    mostrarDatosPc,
    statePrintDirecto,
    setStatePrintDirecto,
    mostrarListaImpresoraLocales,
    selectImpresora,
    setSelectImpresora,
    editarImpresoras,
    insertarImpresoras,
    mostrarImpresoraXUsuario,
  } = useImpresorasStore();
  const { datausuarios } = useUsuariosStore();
  
  // Asegurar que las impresoras se carguen
  const { isLoading: isLoadingImpresorasUsuario, data: dataImpresorasPorUsuario } = useMostrarImpresorasPorUsuarioQuery();
  
  const queryClient = useQueryClient();
  
  //mostrar datos de Pc local
  const {
    data: dataPcLocal,
    isLoading: isLocadingDatosPc,
    error: errorDatosPc,
  } = useQuery({
    queryKey: ["mostrar datos de PC"],
    queryFn: mostrarDatosPc,
  });
  //mostrar las impresoras locales
  const {
    data: dataImpresorasLocales,
    isLoading: isloadingImpresorasLocales,
    error: errorImpresorasLocales,
  } = useQuery({
    queryKey: ["mostrar lista impresoras locales"],
    queryFn: mostrarListaImpresoraLocales,
    enabled: !!dataPcLocal,
  });
  //editar o crear impresoras
  const { mutate: doEditar, isPending } = useMutation({
    mutationKey: ["editar impresoras"],
    mutationFn: guardarImpresora,
    onError: (error) => {
      toast.error("Error al guardar impresora: " + error.message);
    },
    onSuccess: () => {
      toast.success("Datos guardados");
      queryClient.invalidateQueries(["mostrar impresora por usuario"]);
    },
  });
  
  async function guardarImpresora() {
    // Validar que se haya seleccionado una impresora cuando está activado
    if (statePrintDirecto && !selectImpresora?.name) {
      throw new Error("Debes seleccionar una impresora de la lista");
    }
    
    const datosImpresora = {
      id_usuario: datausuarios?.id,
      estado: statePrintDirecto,
      nombre_pc: dataPcLocal?.machineName || "-",
      ip_local: dataPcLocal?.localIPs?.[0] || "-",
      nombre: selectImpresora?.name || "-",
    };
    
    // Si ya existe impresora, EDITAR; si no, CREAR
    if (dataImpresorasPorUsuario?.id) {
      console.log("Editando impresora:", dataImpresorasPorUsuario.id);
      await editarImpresoras({
        ...datosImpresora,
        id: dataImpresorasPorUsuario.id,
      });
    } else {
      console.log("Creando nueva impresora para usuario:", datausuarios?.id);
      await insertarImpresoras(datosImpresora);
    }
  }
  const probarTicket = async () => {
    const response = await ticket("b64");
    // Convertir el contenido base64 en un archivo Blob
    const binaryString = atob(response.content);
    const binaryLen = binaryString.length;
    const bytes = new Uint8Array(binaryLen);
    for (let i = 0; i < binaryLen; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "application/pdf" });
    // Crear un archivo simulando un archivo subido
    const file = new File([blob], "GeneratedTicket.pdf", {
      type: "application/pdf",
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("printerName", selectImpresora?.name);
    const responseApi = await fetch("http://localhost:5075/api/print-ticket", {
      method: "POST",
      body: formData,
    });
    if (responseApi.ok) {
      toast.success("El PDF se envió a imprimir correctamente.");
    } else {
      const error = await responseApi.text();
      toast.error("Error al imprimir" + error);
    }
  };
  const descargarArchivo = (ruta) => {
    const link = document.createElement("a");
    link.href = ruta;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const isLoading = isLocadingDatosPc || isLoadingImpresorasUsuario;
  const error = errorDatosPc;
  
  if (isLoading) {
    return <BarLoader color="#b7b7b7" />;
  }
  
  return (
    <Container>
      <Toaster />
      <section className="header">
        <Title>Impresoras</Title>
      </section>

      <section className="main">
        <Card>
          {dataPcLocal ? (
            <>
              <CardHeader>
                <CardTitle>Configuración de Impresoras</CardTitle>
                <UserInfo>
                  <span><strong>Usuario:</strong> {datausuarios?.nombres}</span>
                  <span><strong>PC:</strong> {dataPcLocal?.machineName || "-"}</span>
                </UserInfo>
              </CardHeader>

              <CardBody>
                <ConfigSection>
                  <SectionHeader>
                    <SectionTitle>Imprimir directo</SectionTitle>
                    <Switch
                      setState={() => {
                        setStatePrintDirecto();
                        doEditar();
                      }}
                      state={statePrintDirecto}
                    />
                  </SectionHeader>
                  <SuccessMessage>
                    ✓ Tu configuración de impresora se guarda automáticamente y está disponible en todas las cajas
                  </SuccessMessage>
                </ConfigSection>

                {statePrintDirecto ? (
                  <ControlsSection>
                    <Btn1
                      funcion={probarTicket}
                      bgcolor={"#d70e79"}
                      color={"#fff"}
                      titulo={"Probar"}
                    />
                    
                    <SelectListWrapper>
                      <SelectList
                        itemSelect={selectImpresora}
                        onSelect={setSelectImpresora}
                        data={dataImpresorasLocales}
                        displayField="name"
                      />
                    </SelectListWrapper>

                    <ButtonGroup>
                      <Btn1
                        funcion={doEditar}
                        disabled={isPending}
                        bgcolor={"#fff"}
                        color={"#111"}
                        titulo={"Guardar"}
                      />
                    </ButtonGroup>
                  </ControlsSection>
                ) : (
                  <DisabledMessage>
                    Se mostrará un cuadro de diálogo al momento de imprimir
                  </DisabledMessage>
                )}
              </CardBody>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Servidor de Impresión No Detectado</CardTitle>
              </CardHeader>

              <CardBody>
                <InfoSection>
                  <SectionTitle>Descargue e instale el servidor</SectionTitle>
                  <Description>
                    Servicio para imprimir directo a impresoras térmicas
                  </Description>

                  <DownloadSection>
                    <Btn1
                      funcion={() =>
                        descargarArchivo(
                          "https://drive.google.com/file/d/1v5Q632tEWx8yTlfnC4HYT6SsGKnORduw/view?usp=sharing"
                        )
                      }
                      bgcolor={"#1424a0"}
                      color={"#fff"}
                      titulo={"Descargar"}
                    />
                    <TutorialLink href="#">Ver tutorial</TutorialLink>
                  </DownloadSection>

                  <WarningSection>
                    <WarningIcon>
                      <Icon icon="meteocons:barometer" />
                    </WarningIcon>
                    <span>Si ya instaló el servidor, actualice esta página.</span>
                  </WarningSection>
                </InfoSection>
              </CardBody>
            </>
          )}
        </Card>
      </section>
    </Container>
  );
};

const Container = styled.div`
  height: calc(100vh - 80px);
  margin-top: 50px;
  padding: 0;
  display: grid;
  grid-template:
    "header" auto
    "main" 1fr;
  overflow: hidden;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;

  .header {
    grid-area: header;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 15px;
  }

  .main {
    grid-area: main;
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
    padding: 0 15px 15px 15px;
    display: flex;
    align-items: flex-start;
    justify-content: center;
  }
`;

const Card = styled.div`
  width: 100%;
  max-width: 600px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  overflow: visible;
  margin-top: 10px;
  position: relative;
`;

const CardHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
`;

const CardTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;

  span {
    display: flex;
    gap: 8px;

    strong {
      color: #111827;
    }
  }
`;

const CardBody = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  z-index: 1;
`;

const ConfigSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #dcfce7;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  font-size: 13px;
  color: #166534;
  font-weight: 500;
`;

const ControlsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 32px 24px 24px 24px;
  background-color: #d70e79;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 120 120'%3E%3Cpolygon fill='%23000' fill-opacity='0.15' points='120 0 120 60 90 30 60 0 0 0 0 0 60 60 0 120 60 120 90 90 120 60 120 0'/%3E%3C/svg%3E");
  background-size: 60px 60px;
  background-position: 0 0;
  animation: ${slideBackground} 8s linear infinite;
  border-radius: 12px;
  position: relative;
  overflow: visible;
  z-index: 10;

  button {
    width: 100%;
  }
`;

const ControlsLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
`;

const SelectListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;

  button {
    flex: 1;
  }
`;

const DisabledMessage = styled.div`
  padding: 16px;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  color: #92400e;
  font-weight: 500;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Description = styled.p`
  margin: 0;
  font-size: 14px;
  color: #6b7280;
`;

const DownloadSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  button {
    width: 100%;
  }
`;

const TutorialLink = styled.a`
  text-align: center;
  color: #2563eb;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const WarningSection = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(237, 95, 6, 0.1);
  border-radius: 8px;
  border-left: 4px solid #f97316;
  font-size: 14px;
  color: #92400e;
  font-weight: 500;
`;

const WarningIcon = styled.div`
  font-size: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;
