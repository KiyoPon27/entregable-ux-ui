import { useMemo, useState, useEffect } from "react";
import styled from "styled-components";
import { FiEye, FiUserX, FiUserCheck, FiActivity, FiXCircle, FiShield, FiUsers, FiPlus, FiRefreshCw } from "react-icons/fi";
import { Building2, TrendingUp, AlertCircle } from "lucide-react";
import { ObtenerEmpresas, ObtenerTodasIncluiyendoDeshabilitadas, DeshabilitarEmpresa, HabilitarEmpresa } from "../supabase/crudEmpresa";
import { CrearEmpresaTemplate } from "../components/templates/CrearEmpresaTemplate";
import { MostrarUsuarios } from "../supabase/crudUsuarios";
import Swal from "sweetalert2";

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 28px 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: fixed;
    top: -200px;
    right: -200px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }

  &::after {
    content: "";
    position: fixed;
    bottom: -300px;
    left: -100px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }
`;

const Shell = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1600px;
  margin: 0 auto;
`;

const Header = styled.header`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: start;
  margin-bottom: 32px;
  padding: 40px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  border-radius: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(248, 250, 252, 0.1);
  box-shadow: 0 25px 50px rgba(15, 23, 42, 0.15);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    right: -120px;
    top: -80px;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
    border-radius: 50%;
  }

  &::after {
    content: "";
    position: absolute;
    right: 100px;
    bottom: -100px;
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%);
    border-radius: 50%;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  h1 {
    font-size: clamp(32px, 4vw, 48px);
    font-weight: 900;
    color: #f8fafc;
    margin: 0;
    letter-spacing: -1px;
    background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    margin: 12px 0 0;
    color: rgba(248, 250, 252, 0.8);
    font-size: 16px;
    line-height: 1.6;
    max-width: 500px;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 32px;

    h1 {
      font-size: 36px;
    }
  }

  @media (max-width: 768px) {
    padding: 24px;

    h1 {
      font-size: 28px;
    }

    p {
      font-size: 14px;
    }
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: 1024px) {
    justify-content: flex-start;
    width: 100%;
  }
`;

const DesignSwitch = styled.div`
  display: inline-flex;
  align-items: center;
  background: rgba(248, 250, 252, 0.15);
  border: 1px solid rgba(248, 250, 252, 0.25);
  border-radius: 12px;
  padding: 4px;
  backdrop-filter: blur(4px);
`;

const SwitchButton = styled.button`
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  background: ${props => (props.active ? "#f8fafc" : "transparent")};
  color: ${props => (props.active ? "#0f172a" : "rgba(248, 250, 252, 0.7)")};
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &:hover {
    background: ${props => (props.active ? "#f8fafc" : "rgba(248, 250, 252, 0.1)")};
    color: #f8fafc;
  }
`;

const RefreshButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.2) 0%, rgba(248, 250, 252, 0.1) 100%);
  border: 1px solid rgba(248, 250, 252, 0.3);
  border-radius: 12px;
  color: #f8fafc;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);

  &:hover {
    background: linear-gradient(135deg, rgba(248, 250, 252, 0.3) 0%, rgba(248, 250, 252, 0.15) 100%);
    border-color: rgba(248, 250, 252, 0.5);
    transform: translateY(-2px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const StatsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
    border-color: #cbd5e1;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.gradient || "linear-gradient(90deg, #3b82f6, #1e40af)"};
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.bgColor || "#dbeafe"};
    color: ${props => props.iconColor || "#1e40af"};
    margin-bottom: 16px;
    font-size: 24px;
  }

  .stat-label {
    font-size: 13px;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
  }

  .stat-value {
    font-size: 42px;
    font-weight: 900;
    color: #0f172a;
    line-height: 1;
    margin-bottom: 12px;
  }

  .stat-change {
    font-size: 12px;
    color: #64748b;

    &.positive {
      color: #16a34a;
    }

    &.negative {
      color: #dc2626;
    }
  }
`;

const ControlsBar = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;

    &:hover {
      background: #94a3b8;
    }
  }
`;

const Tab = styled.button`
  padding: 10px 16px;
  border: none;
  background: ${props => (props.active ? "#0f172a" : "transparent")};
  color: ${props => (props.active ? "#f8fafc" : "#475569")};
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  border: 1px solid ${props => (props.active ? "#0f172a" : "transparent")};

  &:hover {
    background: ${props => (props.active ? "#0f172a" : "#f1f5f9")};
    color: ${props => (props.active ? "#f8fafc" : "#0f172a")};
  }
`;

const CreateButton = styled.button`
  padding: 10px 16px;
  background: #0f172a;
  color: #f8fafc;
  border: 1px solid #334155;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #1e293b;
    border-color: #475569;
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 1024px) {
    width: 100%;
    justify-content: center;
  }
`;

const Panel = styled.section`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
`;

const PanelHeader = styled.div`
  padding: 32px 32px 24px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);

  h2 {
    font-size: 32px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
  }

  p {
    font-size: 15px;
    color: #64748b;
    margin: 0;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    padding: 24px;

    h2 {
      font-size: 24px;
    }
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;

    &:hover {
      background: #94a3b8;
    }
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;

  thead {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  }

  th {
    padding: 14px 16px;
    text-align: left;
    font-weight: 700;
    font-size: 12px;
    color: #334155;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-bottom: 2px solid #e2e8f0;
  }

  tbody tr {
    border-bottom: 1px solid #f1f5f9;
    transition: all 0.2s ease;

    &:hover {
      background: #f8fafc;
      box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.1);
    }

    &:last-child {
      border-bottom: none;
    }
  }

  td {
    padding: 16px;
    font-size: 14px;
    color: #1e293b;

    strong {
      color: #0f172a;
      font-weight: 700;
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${props => (props.active ? "#dcfce7" : "#fee2e2")};
  color: ${props => (props.active ? "#166534" : "#991b1b")};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => (props.delete ? "#fee2e2" : "#dbeafe")};
  color: ${props => (props.delete ? "#991b1b" : "#0f4ea8")};
  border-color: ${props => (props.delete ? "#fecaca" : "#93c5fd")};

  &:hover {
    background: ${props => (props.delete ? "#fecaca" : "#93c5fd")};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => (props.delete ? "rgba(153, 27, 27, 0.15)" : "rgba(15, 78, 168, 0.15)")};
  }

  svg {
    width: 18px;
    height: 18px;
    stroke-width: 2;
  }
`;

const EmptyState = styled.div`
  padding: 60px 32px;
  text-align: center;
  color: #64748b;

  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 20px;
    color: #cbd5e1;
  }

  h3 {
    font-size: 20px;
    font-weight: 700;
    color: #334155;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    max-width: 400px;
    margin: 0 auto;
  }
`;

const LoadingState = styled.div`
  padding: 60px 32px;
  text-align: center;
  color: #64748b;

  p {
    font-size: 15px;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  animation: fadeIn 0.3s ease;
  overflow: hidden;
  overflow-y: auto;
  scrollbar-gutter: stable;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: visible;
  border-radius: 16px;
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(40px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

export function AdministrarEmpresas() {
  const [empresas, setEmpresas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState("empresas");

  // Deshabilitar scroll del body cuando el modal está abierto
  useEffect(() => {
    if (mostrarModal) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, [mostrarModal]);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      let dataEmpresas = [];
      try {
        dataEmpresas = await ObtenerTodasIncluiyendoDeshabilitadas();
      } catch (errorListadoCompleto) {
        console.warn("No se pudo listar incluyendo deshabilitadas, se usa listado basico", errorListadoCompleto);
        dataEmpresas = await ObtenerEmpresas();
      }

      const dataUsuarios = await MostrarUsuarios();
      setEmpresas(Array.isArray(dataEmpresas) ? dataEmpresas : []);
      setUsuarios(Array.isArray(dataUsuarios) ? dataUsuarios : []);
    } catch (error) {
      console.error("Error al cargar panel de empresas:", error);
      Swal.fire("Error", "No se pudo cargar el panel de administracion", "error");
    } finally {
      setCargando(false);
    }
  };

  const handleCrearEmpresa = () => {
    setMostrarModal(true);
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
    cargarDatos();
  };

  const empresasActivas = useMemo(() => empresas.filter(e => e?.habilitada !== false), [empresas]);
  const empresasDeshabilitadas = useMemo(() => empresas.filter(e => e?.habilitada === false), [empresas]);

  const usuariosPorEmpresa = useMemo(() => {
    return usuarios.reduce((acc, usuario) => {
      const idEmpresa = usuario?.empresaId || usuario?.idEmpresa || usuario?.empresa?.id;
      if (!idEmpresa) return acc;
      const key = String(idEmpresa);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [usuarios]);

  const usuariosSuperAdmin = useMemo(() => {
    return usuarios.filter(u => String(u.rol || "").toLowerCase().includes("superadmin"));
  }, [usuarios]);

  const handleDeshabilitarEmpresa = async (empresa) => {
    const result = await Swal.fire({
      title: "Deshabilitar empresa",
      text: `¿Deseas deshabilitar ${empresa.nombre}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, deshabilitar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await DeshabilitarEmpresa({ id: empresa.id });
      await cargarDatos();
      Swal.fire("¡Éxito!", "Empresa deshabilitada correctamente", "success");
    } catch (error) {
      console.error("Error al deshabilitar empresa", error);
      Swal.fire("Error", "No se pudo deshabilitar la empresa", "error");
    }
  };

  const handleHabilitarEmpresa = async (empresa) => {
    const result = await Swal.fire({
      title: "Habilitar empresa",
      text: `¿Deseas habilitar ${empresa.nombre}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, habilitar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await HabilitarEmpresa({ id: empresa.id });
      await cargarDatos();
      Swal.fire("¡Éxito!", "Empresa habilitada correctamente", "success");
    } catch (error) {
      console.error("Error al habilitar empresa", error);
      Swal.fire("Error", "No se pudo habilitar la empresa", "error");
    }
  };

  const getRoleName = (usuario) => {
    if (!usuario) return "sin rol";
    if (typeof usuario.rol === "string") return usuario.rol;
    return usuario.rol?.nombre || "sin rol";
  };

  const getEmpresaName = (empresaId) => {
    if (!empresaId) return "Sin empresa";
    const found = empresas.find(e => String(e.id) === String(empresaId));
    return found?.nombre || `Empresa #${empresaId}`;
  };

  const renderEmpresasTable = (data, mostrarAcciones = true) => {
    if (!data.length) {
      return (
        <EmptyState>
          <AlertCircle />
          <h3>No hay datos para mostrar</h3>
          <p>Las empresas registradas aparecerán aquí.</p>
        </EmptyState>
      );
    }

    return (
      <TableWrapper>
        <StyledTable>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>ID Fiscal</th>
              <th>Correo</th>
              <th>País</th>
              <th>Moneda</th>
              <th>Usuarios</th>
              <th>Estado</th>
              {mostrarAcciones && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {data.map(empresa => (
              <tr key={empresa.id}>
                <td><strong>{empresa.nombre || "-"}</strong></td>
                <td>{empresa.idFiscal || empresa.id_fiscal || "-"}</td>
                <td>{empresa.correo || "-"}</td>
                <td>{empresa.pais || "-"}</td>
                <td>{empresa.simboloMoneda || empresa.simbolo_moneda || "-"}</td>
                <td><strong>{usuariosPorEmpresa[String(empresa.id)] || 0}</strong></td>
                <td>
                  <StatusBadge active={empresa.habilitada !== false}>
                    {empresa.habilitada !== false ? "Activa" : "Inactiva"}
                  </StatusBadge>
                </td>
                {mostrarAcciones && (
                  <td>
                    <ActionButtons>
                      <ActionButton title="Ver empresa">
                        <FiEye />
                      </ActionButton>
                      {empresa.habilitada !== false ? (
                        <ActionButton delete title="Deshabilitar" onClick={() => handleDeshabilitarEmpresa(empresa)}>
                          <FiUserX />
                        </ActionButton>
                      ) : (
                        <ActionButton title="Habilitar" onClick={() => handleHabilitarEmpresa(empresa)}>
                          <FiUserCheck />
                        </ActionButton>
                      )}
                    </ActionButtons>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </TableWrapper>
    );
  };

  const renderUsuariosTable = (data) => {
    if (!data.length) {
      return (
        <EmptyState>
          <AlertCircle />
          <h3>No hay usuarios para mostrar</h3>
          <p>Los usuarios registrados aparecerán aquí.</p>
        </EmptyState>
      );
    }

    return (
      <TableWrapper>
        <StyledTable>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Empresa</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.map(usuario => (
              <tr key={usuario.id}>
                <td><strong>{usuario.nombres || "-"}</strong></td>
                <td>{usuario.correo || "-"}</td>
                <td>{getRoleName(usuario)}</td>
                <td>{getEmpresaName(usuario?.empresaId || usuario?.idEmpresa)}</td>
                <td>
                  <StatusBadge active={String(usuario.estado || "ACTIVO").toUpperCase() === "ACTIVO"}>
                    {usuario.estado || "ACTIVO"}
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </TableWrapper>
    );
  };

  const secciones = [
    { id: "empresas", label: "Empresas", icon: Building2 },
    { id: "superadmin", label: "Super Admin", icon: FiShield },
    { id: "usuarios", label: "Usuarios Globales", icon: FiUsers },
    { id: "deshabilitadas", label: "Deshabilitadas", icon: FiXCircle },
  ];

  return (
    <Container>
      <Shell>
        <Header>
          <div>
            <h1>Administrar Empresas</h1>
            <p>Panel global para gestionar empresas, administradores y usuarios de todo el ecosistema. Control centralizado y seguro.</p>
          </div>
          <HeaderActions>
            <DesignSwitch>
              <SwitchButton active>Moderno</SwitchButton>
              <SwitchButton>Clásico</SwitchButton>
            </DesignSwitch>
            <RefreshButton onClick={cargarDatos}>
              <FiRefreshCw />
              Actualizar
            </RefreshButton>
          </HeaderActions>
        </Header>

        <StatsGrid>
          <StatCard gradient="linear-gradient(90deg, #3b82f6, #1e40af)" bgColor="#dbeafe" iconColor="#1e40af">
            <div className="stat-icon"><FiActivity /></div>
            <div className="stat-label">Empresas Activas</div>
            <div className="stat-value">{empresasActivas.length}</div>
            <div className="stat-change positive">↑ Operativas</div>
          </StatCard>

          <StatCard gradient="linear-gradient(90deg, #ef4444, #dc2626)" bgColor="#fee2e2" iconColor="#991b1b">
            <div className="stat-icon"><FiXCircle /></div>
            <div className="stat-label">Empresas Inactivas</div>
            <div className="stat-value">{empresasDeshabilitadas.length}</div>
            <div className="stat-change negative">↓ Deshabilitadas</div>
          </StatCard>

          <StatCard gradient="linear-gradient(90deg, #8b5cf6, #6d28d9)" bgColor="#ede9fe" iconColor="#6d28d9">
            <div className="stat-icon"><FiShield /></div>
            <div className="stat-label">Super Administradores</div>
            <div className="stat-value">{usuariosSuperAdmin.length}</div>
            <div className="stat-change">Globales</div>
          </StatCard>

          <StatCard gradient="linear-gradient(90deg, #10b981, #059669)" bgColor="#d1fae5" iconColor="#059669">
            <div className="stat-icon"><FiUsers /></div>
            <div className="stat-label">Usuarios Totales</div>
            <div className="stat-value">{usuarios.length}</div>
            <div className="stat-change positive">↑ Registrados</div>
          </StatCard>
        </StatsGrid>

        <ControlsBar>
          <TabsContainer>
            {secciones.map(seccion => (
              <Tab
                key={seccion.id}
                active={seccionActiva === seccion.id}
                onClick={() => setSeccionActiva(seccion.id)}
              >
                {seccion.label}
              </Tab>
            ))}
          </TabsContainer>
          <div />
          <CreateButton onClick={handleCrearEmpresa}>
            <FiPlus />
            Nueva Empresa
          </CreateButton>
        </ControlsBar>

        <Panel>
          {cargando ? (
            <LoadingState>
              <p>Cargando información del panel...</p>
            </LoadingState>
          ) : (
            <>
              {seccionActiva === "empresas" && (
                <>
                  <PanelHeader>
                    <h2>Empresas Activas</h2>
                    <p>Gestiona todas las empresas habilitadas del sistema con acceso a funcionalidades completas.</p>
                  </PanelHeader>
                  {renderEmpresasTable(empresasActivas)}
                </>
              )}

              {seccionActiva === "superadmin" && (
                <>
                  <PanelHeader>
                    <h2>Administradores Globales</h2>
                    <p>Usuarios con acceso administrativo a nivel sistema en todas las empresas.</p>
                  </PanelHeader>
                  {renderUsuariosTable(usuariosSuperAdmin)}
                </>
              )}

              {seccionActiva === "usuarios" && (
                <>
                  <PanelHeader>
                    <h2>Usuarios del Sistema</h2>
                    <p>Listado completo de todos los usuarios registrados en el ecosistema.</p>
                  </PanelHeader>
                  {renderUsuariosTable(usuarios)}
                </>
              )}

              {seccionActiva === "deshabilitadas" && (
                <>
                  <PanelHeader>
                    <h2>Empresas Deshabilitadas</h2>
                    <p>Empresas que han sido desactivadas pero conservan sus registros históricos.</p>
                  </PanelHeader>
                  {renderEmpresasTable(empresasDeshabilitadas, false)}
                </>
              )}
            </>
          )}
        </Panel>
      </Shell>

      {mostrarModal && (
        <ModalOverlay onClick={handleCerrarModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <CrearEmpresaTemplate onSuccess={handleCerrarModal} onClose={handleCerrarModal} isModal={true} />
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}
