import styled from "styled-components";
import { Btn1 } from "../components/moleculas/Btn1";
import { ImageSelector } from "../hooks/useImageSelector";
import { useEmpresaStore } from "../store/EmpresaStore";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

import { Toaster } from "sonner";

import { useGlobalStore } from "../store/GlobalStore";
import { useUpdateEmpresaTicketMutation } from "../tanstack/EmpresaStack";
import { SpinnerSecundario } from "../components/moleculas/SpinnerSecundario";

export const ConfiguracionTicket = () => {
  const { dataempresa } = useEmpresaStore();
  const { fileUrl } = useGlobalStore();
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      nombre_moneda: dataempresa?.nombre_moneda || dataempresa?.nombreMoneda || "Soles",
      pie_pagina_ticket: dataempresa?.pie_pagina_ticket || dataempresa?.piePaginaTicket || "",
    },
  });
  const { mutate, isPending } = useUpdateEmpresaTicketMutation();

  // Observar cambios en tiempo real del formulario
  const formValues = watch();

  // Actualizar valores del formulario cuando dataempresa cambie
  useEffect(() => {
    if (dataempresa) {
      reset({
        nombre_moneda: dataempresa.nombre_moneda || dataempresa.nombreMoneda || "Soles",
        pie_pagina_ticket: dataempresa.pie_pagina_ticket || dataempresa.piePaginaTicket || "",
      });
    }
  }, [dataempresa, reset]);

  return (
    <Container>
      <Toaster position="top-right" />
      {isPending ? (
        <SpinnerSecundario texto={"guardando..."} />
      ) : (
        <div className="left-section">
          <Contentguia>
            <span className="title">CONFIGURACIÓN DE TICKET</span>
            <span className="format-title">
              Personaliza cómo se verá tu comprobante de pago
            </span>
          </Contentguia>

          <LogoSection>
            <LogoLabel>Logo de tu empresa</LogoLabel>
            <LogoDescription>Este logo aparecerá en todos tus comprobantes</LogoDescription>
            <ImageSelector fileUrl={fileUrl || dataempresa?.logo} />
          </LogoSection>
          
          <form className="receipt-content" onSubmit={handleSubmit(mutate)}>
            <ButtonContainer>
              <Btn1 bgcolor={"#fad43c"} titulo={"Guardar cambios"} />
            </ButtonContainer>

            <SectionTitle>Información de la empresa (solo lectura)</SectionTitle>
            <InfoNote>Estos datos se modifican desde Configuración → Empresa</InfoNote>
            
            <div className="company-info">
              <div className="company-name">
                <InputLabel>Nombre de la empresa</InputLabel>
                <ReadOnlyInput 
                  type="text"
                  value={dataempresa?.nombre || "Sin nombre"}
                  readOnly
                />
              </div>

              <div className="company-details">
                <InputLabel>RUC / Número de identificación fiscal</InputLabel>
                <ReadOnlyInput 
                  type="text"
                  value={dataempresa?.id_fiscal || dataempresa?.idFiscal || "Sin RUC"}
                  readOnly
                />
              </div>

              <div className="company-details">
                <InputLabel>Dirección fiscal</InputLabel>
                <ReadOnlyInput 
                  type="text"
                  value={dataempresa?.direccion_fiscal || dataempresa?.direccionFiscal || "Sin dirección"}
                  readOnly
                />
              </div>
            </div>

            <div className="divider"></div>
            
            <SectionTitle>Configuración de moneda</SectionTitle>

            <div className="footer-info">
              <div className="footer-row">
                <InputLabel>Nombre de la moneda</InputLabel>
                <input
                  type="text"
                  placeholder="Ej: Soles, Pesos, Dólares"
                  {...register("nombre_moneda", {
                    required: "Campo requerido",
                  })}
                />
                {errors.nombre_moneda && <ErrorText>{errors.nombre_moneda.message}</ErrorText>}
                <InputHelper>Este texto aparecerá en el monto en letras del ticket</InputHelper>
              </div>
            </div>

            <div className="divider"></div>
            
            <SectionTitle>Mensaje de agradecimiento</SectionTitle>

            <div className="footer-info">
              <div className="footer-row">
                <InputLabel>Pie de página del ticket</InputLabel>
                <input
                  type="text"
                  placeholder="Ej: Gracias por su compra. Vuelva pronto!"
                  {...register("pie_pagina_ticket", {
                    required: "Campo requerido",
                  })}
                />
                {errors.pie_pagina_ticket && (
                  <ErrorText>{errors.pie_pagina_ticket.message}</ErrorText>
                )}
                <InputHelper>Mensaje que aparecerá al final de cada ticket</InputHelper>
              </div>
            </div>

            <PreviewSection>
              <PreviewTitle>Vista previa del ticket</PreviewTitle>
              <PreviewNote>Así se verá tu comprobante (se actualiza en tiempo real):</PreviewNote>
              
              <TicketPreview>
                <div className="ticket-header">
                  {(fileUrl || dataempresa?.logo) && fileUrl !== "-" ? (
                    <img src={fileUrl || dataempresa?.logo} alt="Logo" className="preview-logo" />
                  ) : (
                    <div className="no-logo">Sin logo</div>
                  )}
                  <div className="preview-company-name">
                    {dataempresa?.nombre || "Nombre de Empresa"}
                  </div>
                  <div className="preview-ruc">
                    RUC: {dataempresa?.id_fiscal || dataempresa?.idFiscal || "00000000000"}
                  </div>
                  <div className="preview-address">
                    {dataempresa?.direccion_fiscal || dataempresa?.direccionFiscal || "Dirección fiscal"}
                  </div>
                </div>
                
                <div className="divider-preview"></div>
                
                <div className="preview-number">BOLETA - B001-00001</div>
                
                <div className="divider-preview"></div>
                
                <div className="preview-details">
                  <div>Cajero: Usuario Demo</div>
                  <div>Fecha: {new Date().toLocaleDateString()}</div>
                  <div>Cliente: Cliente General</div>
                </div>
                
                <div className="divider-preview"></div>
                
                <div className="preview-products">
                  <div className="product-row">
                    <span>1</span>
                    <span>Producto ejemplo</span>
                    <span>S/ 10.00</span>
                  </div>
                </div>
                
                <div className="divider-preview"></div>
                
                <div className="preview-total">
                  <div>TOTAL: <strong>S/ 10.00</strong></div>
                  <div className="preview-amount-text">
                    SON: DIEZ CON 00/100 {formValues.nombre_moneda?.toUpperCase() || dataempresa?.nombre_moneda?.toUpperCase() || "SOLES"}
                  </div>
                </div>
                
                <div className="divider-preview"></div>
                
                <div className="preview-footer">
                  {formValues.pie_pagina_ticket || dataempresa?.pie_pagina_ticket || "Gracias por su compra"}
                </div>
                
                <div className="preview-qr">
                  <div className="qr-placeholder">QR Code</div>
                </div>
              </TicketPreview>
            </PreviewSection>
          </form>
        </div>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  color: #2c3e50;

  input {
    width: 100%;
    padding: 12px 16px;
    font-size: 14px;
    border: 2px solid #e0e6ed;
    border-radius: 8px;
    background-color: #ffffff;
    transition: all 0.3s ease;
    color: #2c3e50;
    font-family: inherit;

    &::placeholder {
      color: #95a5a6;
    }

    &:hover {
      border-color: #ffc107;
    }

    &:focus {
      outline: none;
      border-color: #ffc107;
      background-color: #fffef5;
      box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.1);
    }
  }

  .left-section {
    width: 100%;
    max-width: 800px;
    background-color: #ffffff;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    position: relative;
  }

  .divider {
    width: 100%;
    border-top: 2px dashed #e0e6ed;
    margin: 30px 0;
  }

  .company-info {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .company-name,
  .company-details {
    width: 100%;
  }

  .receipt-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .footer-info {
    width: 100%;
  }

  .footer-row {
    width: 100%;
  }
`;

const Contentguia = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 8px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f3f7;

  .title {
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    letter-spacing: -0.5px;
  }

  .format-title {
    color: #7f8c8d;
    font-size: 14px;
  }
`;

const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #fafbfc 0%, #f8f9fb 100%);
  border-radius: 12px;
  border: 1px solid #e8ecf1;
`;

const LogoLabel = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
`;

const LogoDescription = styled.p`
  font-size: 13px;
  color: #7f8c8d;
  margin: 0 0 12px 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #34495e;
  margin: 10px 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #ffc107;
  display: inline-block;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 8px;
  letter-spacing: 0.3px;
`;

const InputHelper = styled.p`
  font-size: 12px;
  color: #95a5a6;
  margin: 6px 0 0 0;
  font-style: italic;
`;

const ErrorText = styled.p`
  color: #e74c3c;
  font-size: 12px;
  margin: 6px 0 0 0;
  font-weight: 500;
`;

const PreviewSection = styled.div`
  margin-top: 40px;
  padding-top: 30px;
  border-top: 3px double #e0e6ed;
`;

const PreviewTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 8px;
`;

const PreviewNote = styled.p`
  font-size: 13px;
  color: #7f8c8d;
  margin-bottom: 20px;
`;

const TicketPreview = styled.div`
  width: 100%;
  max-width: 350px;
  margin: 0 auto;
  padding: 30px 20px;
  background: white;
  border: 2px dashed #bdc3c7;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #2c3e50;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  .ticket-header {
    text-align: center;
    margin-bottom: 15px;
    
    .preview-logo {
      width: 80px;
      height: 80px;
      object-fit: contain;
      margin-bottom: 10px;
    }
    
    .no-logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 10px;
      background: #ecf0f1;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      color: #95a5a6;
      font-size: 11px;
    }
    
    .preview-company-name {
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 5px;
    }
    
    .preview-ruc,
    .preview-address {
      font-size: 11px;
      color: #7f8c8d;
      margin: 3px 0;
    }
  }

  .divider-preview {
    border-top: 1px dashed #bdc3c7;
    margin: 12px 0;
  }

  .preview-number {
    text-align: center;
    font-weight: bold;
    font-size: 13px;
    margin: 10px 0;
  }

  .preview-details {
    font-size: 11px;
    margin: 10px 0;
    
    div {
      margin: 5px 0;
    }
  }

  .preview-products {
    margin: 10px 0;
    
    .product-row {
      display: grid;
      grid-template-columns: 30px 1fr 80px;
      gap: 5px;
      font-size: 11px;
      margin: 5px 0;
    }
  }

  .preview-total {
    margin: 15px 0;
    text-align: right;
    
    div {
      margin: 5px 0;
    }
    
    strong {
      font-size: 14px;
    }
    
    .preview-amount-text {
      font-size: 10px;
      color: #7f8c8d;
      text-align: center;
      margin-top: 10px;
    }
  }

  .preview-footer {
    text-align: center;
    font-size: 11px;
    margin: 15px 0;
    font-style: italic;
    color: #7f8c8d;
  }

  .preview-qr {
    text-align: center;
    margin-top: 15px;
    
    .qr-placeholder {
      width: 100px;
      height: 100px;
      margin: 0 auto;
      background: #ecf0f1;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px dashed #bdc3c7;
      border-radius: 8px;
      color: #95a5a6;
      font-size: 11px;
    }
  }
`;
const ReadOnlyInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  border: 2px solid #e0e6ed;
  border-radius: 8px;
  background-color: #f5f7fa;
  color: #7f8c8d;
  cursor: not-allowed;
  font-family: inherit;
  
  &:focus {
    outline: none;
  }
`;

const InfoNote = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-left: 4px solid #2196f3;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #1976d2;
  
  &::before {
    content: "ℹ";
    font-size: 18px;
    font-weight: bold;
  }
`;

export default ConfiguracionTicket;