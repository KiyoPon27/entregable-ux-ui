import styled from "styled-components";
import { useForm } from "react-hook-form";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useUpdateEmpresaMutation } from "../../../tanstack/EmpresaStack";
import { ImageSelector } from "../../../hooks/useImageSelector";
import { useGlobalStore } from "../../../store/GlobalStore";
import { FiImage } from "react-icons/fi";

export const BasicosConfig = () => {
  const { fileUrl } = useGlobalStore();

  const { dataempresa } = useEmpresaStore();

  const {
    register,
    formState: { errors },
    handleSubmit,
    
  } = useForm({
    defaultValues:{
      nombre:dataempresa?.nombre,
      id_fiscal:dataempresa?.idFiscal,
      direccion:dataempresa?.direccionFiscal,
      correo:dataempresa?.correo,
      impuesto:dataempresa?.impuesto,
      valor_impuesto: dataempresa?.valorImpuesto
    }
  });


  const { mutate, isPending } = useUpdateEmpresaMutation();

  return (
    <Container>
      {isPending ? (
        <LoadingState>guardando...</LoadingState>
      ) : (
        <ContentRow>
          <Card>
            <Header>
              <Title>Básico</Title>
              <Subtitle>Configura los datos principales de la empresa.</Subtitle>
            </Header>

            <BodyLayout>
              <section>
                <LogoBox>
                  <span className="logoLabel">Logo</span>
                  <div className="logoPreview">
                    <ImageSelector fileUrl={fileUrl || dataempresa?.logo} />
                  </div>
                </LogoBox>

                <Note>
                  <FiImage />
                  <span>Los cambios del logo se reflejan en el lapso de unos segundos.</span>
                </Note>
              </section>

              <Form onSubmit={handleSubmit(mutate)}>
                <FieldsGrid>
                  <Field>
                    <Label>Nombre</Label>
                    <Input
                      type="text"
                      placeholder="Ej: LT Sanchez Importaciones"
                      {...register("nombre", { required: true })}
                    />
                    {errors.nombre?.type === "required" && <ErrorText>Campo requerido</ErrorText>}
                  </Field>

                  <Field>
                    <Label>RUC / ID Fiscal</Label>
                    <Input
                      type="text"
                      placeholder="Ej: 20611076321"
                      {...register("id_fiscal", { required: true })}
                    />
                    {errors.id_fiscal?.type === "required" && <ErrorText>Campo requerido</ErrorText>}
                  </Field>

                  <Field>
                    <Label>Dirección</Label>
                    <Input
                      type="text"
                      placeholder="Ej: Jr. Zela 253 Bar. Chicago"
                      {...register("direccion", { required: true })}
                    />
                    {errors.direccion?.type === "required" && <ErrorText>Campo requerido</ErrorText>}
                  </Field>

                  <Field>
                    <Label>Correo</Label>
                    <Input
                      type="email"
                      placeholder="Ej: contacto@empresa.com"
                      {...register("correo", {
                        required: true,
                        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      })}
                    />
                    {errors.correo?.type === "required" && <ErrorText>Campo requerido</ErrorText>}
                    {errors.correo?.type === "pattern" && <ErrorText>Correo inválido</ErrorText>}
                  </Field>

                  <Field>
                    <Label>Impuesto</Label>
                    <Input
                      type="text"
                      placeholder="Ej: IGV"
                      {...register("impuesto", { required: true })}
                    />
                    {errors.impuesto?.type === "required" && <ErrorText>Campo requerido</ErrorText>}
                  </Field>

                  <Field>
                    <Label>Valor impuesto</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ej: 18"
                      {...register("valor_impuesto", { required: true })}
                    />
                    {errors.valor_impuesto?.type === "required" && <ErrorText>Campo requerido</ErrorText>}
                  </Field>
                </FieldsGrid>

                <Button type="submit">Guardar cambios</Button>
              </Form>
            </BodyLayout>
          </Card>
        </ContentRow>
      )}
    </Container>
  );
};
const Container = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding-top: 8px;
`;

const ContentRow = styled.div`
  display: block;
`;

const Title = styled.h1`
  font-size: 38px;
  margin: 0;
  letter-spacing: -0.8px;
`;

const Subtitle = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colorSubtitle};
  font-size: 16px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.bg3};
  border: 1px solid ${({ theme }) => theme.color2};
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
`;

const Header = styled.div`
  margin-bottom: 16px;
  text-align: left;
`;

const LogoBox = styled.div`
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.color2};
  background: linear-gradient(135deg, #2b1a85 0%, #4f46e5 100%);
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;

  .logoLabel {
    align-self: flex-start;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.85);
  }

  .logoPreview {
    width: 100%;
    display: flex;
    justify-content: center;

    img {
      max-width: 100%;
      border-radius: 14px;
    }
  }

  .logoName {
    color: #f8fafc;
    font-size: 16px;
    font-weight: 700;
    text-align: center;
  }
`;

const BodyLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(280px, 400px) minmax(0, 1fr);
  align-items: start;
  gap: 24px;

  @media (max-width: 1020px) {
    grid-template-columns: 1fr;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.color2};
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  box-sizing: border-box;

  &::placeholder {
    color: ${({ theme }) => theme.colorSubtitle};
  }

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  }
`;

const ErrorText = styled.p`
  margin: 0;
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
`;

const Button = styled.button`
  width: 260px;
  min-height: 50px;
  margin-top: 4px;
  border: 1px solid #111111;
  border-radius: 14px;
  background: #111111;
  color: #ffffff;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  position: relative;
  z-index: 1;
  overflow: hidden;
  transition: transform 0.2s ease;

  &:hover {
    color: #111111;
  }

  &:active {
    transform: translateY(1px);
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

  &:hover {
    transform: translateY(-1px);
  }

  &:hover::after {
    transform: skewX(-45deg) scale(1, 1);
  }

  @media (max-width: 900px) {
    width: 100%;
  }
`;

const LoadingState = styled.div`
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 22px;
  background: ${({ theme }) => theme.bg3};
  border: 1px solid ${({ theme }) => theme.color2};
  color: ${({ theme }) => theme.text};
`;

const Note = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(37, 99, 235, 0.2);
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
  font-size: 13px;
  font-weight: 600;

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;
