import { useState } from "react";
import styled from "styled-components";
import { FiX } from "react-icons/fi";
import Swal from "sweetalert2";
import { CrearEmpresaCompleta } from "../../supabase/crudEmpresa";

const Container = styled.div`
  position: relative;
  max-width: 520px;
  margin: ${props => props.isModal ? "0" : "40px auto"};
  background: #ffffff;
  border-radius: 12px;
  box-shadow:
    0px 0px 3px rgba(0, 0, 0, 0.084),
    0px 2px 3px rgba(0, 0, 0, 0.168);
  padding: 26px 22px;
  box-sizing: border-box;
  animation: slideIn 0.6s ease-out;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: #212121;
  width: 100%;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    margin: ${props => props.isModal ? "0" : "20px auto"};
    padding: 22px 16px;
  }

  ${props => props.isModal && `
    max-width: 520px;
    width: min(520px, calc(100vw - 32px));
    margin: 0 auto;
  `}
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 34px;
  height: 34px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #111827;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const LogoContainer = styled.div`
  text-align: center;
  font-weight: 600;
  font-size: 32px;
  margin-bottom: 18px;
  letter-spacing: -0.3px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionLabel = styled.div`
  margin-top: 6px;
  margin-bottom: 4px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 6px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 2px;
  color: #212121;
  font-weight: 600;
  font-size: 14px;

  .required {
    color: #e74c3c;
    margin-left: 3px;
  }

  .optional {
    color: #999;
    font-weight: 400;
    font-size: 12px;
    margin-left: 5px;
  }
`;

const Input = styled.input`
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
`;

const SectionDivider = styled.div`
  height: 1px;
  background: #eceff3;
  margin: 12px 0;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 12px;
`;

const Button = styled.button`
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

  ${props =>
    props.primary
      ? `
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
  `
      : `
    background: #ffffff;
    color: #212121;
    border: 1px solid #ccc;

    &:hover {
      background: #f7f7f7;
    }

    &:active {
      scale: 0.98;
    }
  `}
`;

export function CrearEmpresaTemplate({ onSuccess, onClose, isModal = false }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombreEmpresa: "",
    correoEmpresa: "",
    nombreSuperAdmin: "",
    emailSuperAdmin: "",
    contraseña: "",
    confirmarContraseña: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validarFormulario = () => {
    if (!formData.nombreEmpresa.trim()) {
      Swal.fire("❌ Error", "El nombre de la empresa es requerido", "error");
      return false;
    }
    if (!formData.correoEmpresa.trim()) {
      Swal.fire("❌ Error", "El correo de la empresa es requerido", "error");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correoEmpresa)) {
      Swal.fire("❌ Error", "Ingrese un correo válido para la empresa", "error");
      return false;
    }
    if (!formData.nombreSuperAdmin.trim()) {
      Swal.fire("❌ Error", "El nombre del SuperAdmin es requerido", "error");
      return false;
    }
    if (!formData.emailSuperAdmin.trim()) {
      Swal.fire("❌ Error", "El email del SuperAdmin es requerido", "error");
      return false;
    }
    if (!emailRegex.test(formData.emailSuperAdmin)) {
      Swal.fire("❌ Error", "Ingrese un email válido para el SuperAdmin", "error");
      return false;
    }
    if (!formData.contraseña.trim()) {
      Swal.fire("❌ Error", "La contraseña del SuperAdmin es requerida", "error");
      return false;
    }
    if (formData.contraseña.length < 6) {
      Swal.fire("❌ Error", "La contraseña debe tener mínimo 6 caracteres", "error");
      return false;
    }
    if (formData.contraseña !== formData.confirmarContraseña) {
      Swal.fire("❌ Error", "Las contraseñas no coinciden", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const datosEnvio = {
        nombreEmpresa: formData.nombreEmpresa,
        idFiscal: "AUTO",
        direccionFiscal: "Por definir",
        iso: "PEN",
        pais: "peru",
        currency: "PEN",
        simboloMoneda: "S/.",
        nombreMoneda: "Nuevo Sol",
        impuesto: "IGV",
        valorImpuesto: 18,
        correo: formData.correoEmpresa,
        piePaginaTicket: `Empresa creada el ${new Date().toLocaleDateString('es-PE')}`,
        nombreSuperAdmin: formData.nombreSuperAdmin,
        emailSuperAdmin: formData.emailSuperAdmin,
        contrasenyaSuperAdmin: formData.contraseña,
      };

      const respuesta = await CrearEmpresaCompleta(datosEnvio);

      await Swal.fire({
        icon: "success",
        title: "¡Empresa Creada! 🎉",
        html: `
          <div style="text-align: left;">
            <p><strong>Nombre:</strong> ${respuesta.nombreEmpresa}</p>
            <p><strong>SuperAdmin:</strong> ${formData.nombreSuperAdmin}</p>
            <p><strong>Email SuperAdmin:</strong> ${formData.emailSuperAdmin}</p>
            <hr style="margin: 15px 0;">
            <p style="font-size: 12px; color: #666;">
              ✓ Sucursal Principal creada<br>
              ✓ Almacén Principal creado<br>
              ✓ Caja 1 creada<br>
              ✓ SuperAdmin listo para usar
            </p>
          </div>
        `,
        confirmButtonColor: "#667eea",
        confirmButtonText: "Aceptar",
      });

      setFormData({
        nombreEmpresa: "",
        correoEmpresa: "",
        nombreSuperAdmin: "",
        emailSuperAdmin: "",
        contraseña: "",
        confirmarContraseña: "",
      });

      // Llamar al callback de éxito si existe
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      Swal.fire(
        "❌ Error",
        error.message || "Error al crear la empresa",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container isModal={isModal}>
      {isModal && (
        <CloseButton type="button" aria-label="Cerrar" title="Cerrar" onClick={onClose}>
          <FiX />
        </CloseButton>
      )}
      <LogoContainer>CREAR SUPER ADMIN</LogoContainer>
      <Form onSubmit={handleSubmit}>
          <SectionLabel>Empresa</SectionLabel>

          <FormGroup>
            <Label htmlFor="nombreEmpresa">
              Nombre de la Empresa <span className="required">*</span>
            </Label>
            <Input
              id="nombreEmpresa"
              type="text"
              name="nombreEmpresa"
              value={formData.nombreEmpresa}
              onChange={handleInputChange}
              placeholder="Ej: Tienda China Express"
              autoFocus
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="correoEmpresa">
              Correo de la Empresa <span className="required">*</span>
            </Label>
            <Input
              id="correoEmpresa"
              type="email"
              name="correoEmpresa"
              value={formData.correoEmpresa}
              onChange={handleInputChange}
              placeholder="Ej: contacto@tiendachina.com"
            />
          </FormGroup>

          <SectionDivider />
          <SectionLabel>Usuario</SectionLabel>

          <FormGroup>
            <Label htmlFor="nombreSuperAdmin">
              Nombre del SuperAdmin <span className="required">*</span>
            </Label>
            <Input
              id="nombreSuperAdmin"
              type="text"
              name="nombreSuperAdmin"
              value={formData.nombreSuperAdmin}
              onChange={handleInputChange}
              placeholder="Ej: Juan Perez Garcia"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="emailSuperAdmin">
              Email del SuperAdmin <span className="required">*</span>
            </Label>
            <Input
              id="emailSuperAdmin"
              type="email"
              name="emailSuperAdmin"
              value={formData.emailSuperAdmin}
              onChange={handleInputChange}
              placeholder="Ej: juanperez@tiendachina.com"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="contraseña">
              Contraseña <span className="required">*</span>
            </Label>
            <Input
              id="contraseña"
              type="password"
              name="contraseña"
              value={formData.contraseña}
              onChange={handleInputChange}
              placeholder="Minimo 6 caracteres"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="confirmarContraseña">
              Confirmar Contraseña <span className="required">*</span>
            </Label>
            <Input
              id="confirmarContraseña"
              type="password"
              name="confirmarContraseña"
              value={formData.confirmarContraseña}
              onChange={handleInputChange}
              placeholder="Repite la contrasena"
            />
          </FormGroup>

          <ButtonsContainer>
            <Button primary type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Super Admin"}
            </Button>
          </ButtonsContainer>
      </Form>
    </Container>
  );
}

