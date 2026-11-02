import styled from "styled-components";
import { Link } from "react-router-dom";
import {
  Building2,
  Tag,
  Package,
  Store,
  Users,
  HardHat,
  CreditCard,
  Building,
  UserCog,
  Printer,
  Warehouse,
  Receipt,
  FileCheck,
} from "lucide-react";
import { UserAuth } from "../../index";
import { usePermisosStore } from "../../store/PermisosStore";

export function ConfiguracionesTemplate() {
  const { dataPermisosConfiguracion } = usePermisosStore();
  const { user } = UserAuth();

  const isOG = user?.rol?.nombre === "OG" || user?.role === "OG" || user?.roles?.includes("OG");

  const configCards = [
    {
      id: "empresas",
      title: "Administrar Empresas",
      subtitle: "Crear y gestionar empresas",
      icon: Building2,
      bgColor: "#dbeafe",
      bgColorDark: "rgba(59, 130, 246, 0.1)",
      iconColor: "#2563eb",
      link: "/configuracion/administrar-empresas",
      ogOnly: true,
    },
    {
      id: "categorias",
      title: "Categorías de Productos",
      subtitle: "Organiza tus productos",
      icon: Tag,
      bgColor: "#e9d5ff",
      bgColorDark: "rgba(147, 51, 234, 0.1)",
      iconColor: "#9333ea",
      link: "/configuracion/categorias",
    },
    {
      id: "productos",
      title: "Productos",
      subtitle: "Gestiona tu inventario",
      icon: Package,
      bgColor: "#fed7aa",
      bgColorDark: "rgba(234, 88, 12, 0.1)",
      iconColor: "#ea580c",
      link: "/configuracion/productos",
    },
    {
      id: "empresa",
      title: "Empresa",
      subtitle: "Datos de tu empresa",
      icon: Store,
      bgColor: "#fbcfe8",
      bgColorDark: "rgba(236, 72, 153, 0.1)",
      iconColor: "#ec4899",
      link: "/configuracion/empresa",
    },
    {
      id: "clientes",
      title: "Clientes",
      subtitle: "Administra clientes",
      icon: Users,
      bgColor: "#fef3c7",
      bgColorDark: "rgba(202, 138, 4, 0.1)",
      iconColor: "#ca8a04",
      link: "/configuracion/clientes",
    },
    {
      id: "proveedores",
      title: "Proveedores",
      subtitle: "Gestiona proveedores",
      icon: HardHat,
      bgColor: "#fed7aa",
      bgColorDark: "rgba(194, 65, 12, 0.1)",
      iconColor: "#c2410c",
      link: "/configuracion/proveedores",
    },
    {
      id: "metodos-pago",
      title: "Métodos de Pago",
      subtitle: "Configura formas de pago",
      icon: CreditCard,
      bgColor: "#dcfce7",
      bgColorDark: "rgba(34, 197, 94, 0.1)",
      iconColor: "#22c55e",
      link: "/configuracion/metodospago",
    },
    {
      id: "sucursales",
      title: "Sucursales y Cajas",
      subtitle: "Administra ubicaciones",
      icon: Building,
      bgColor: "#fee2e2",
      bgColorDark: "rgba(220, 38, 38, 0.1)",
      iconColor: "#dc2626",
      link: "/configuracion/sucursalcaja",
    },
    {
      id: "usuarios",
      title: "Usuarios",
      subtitle: "Gestiona tu equipo",
      icon: UserCog,
      bgColor: "#ccfbf1",
      bgColorDark: "rgba(20, 184, 166, 0.1)",
      iconColor: "#14b8a6",
      link: "/configuracion/usuarios",
    },
    {
      id: "impresoras",
      title: "Impresoras",
      subtitle: "Configura impresoras",
      icon: Printer,
      bgColor: "#cffafe",
      bgColorDark: "rgba(6, 182, 212, 0.1)",
      iconColor: "#06b6d4",
      link: "/configuracion/impresoras",
    },
    {
      id: "almacenes",
      title: "Almacenes",
      subtitle: "Gestiona almacenes",
      icon: Warehouse,
      bgColor: "#fed7aa",
      bgColorDark: "rgba(234, 88, 12, 0.1)",
      iconColor: "#ea580c",
      link: "/configuracion/almacenes",
    },
    {
      id: "ticket",
      title: "Configuración de Ticket",
      subtitle: "Personaliza tus recibos",
      icon: Receipt,
      bgColor: "#fef3c7",
      bgColorDark: "rgba(202, 138, 4, 0.1)",
      iconColor: "#ca8a04",
      link: "/configuracion/ticket",
    },
    {
      id: "comprobantes",
      title: "Serialización de Comprobantes",
      subtitle: "Configura comprobantes",
      icon: FileCheck,
      bgColor: "#dcfce7",
      bgColorDark: "rgba(34, 197, 94, 0.1)",
      iconColor: "#22c55e",
      link: "/configuracion/serializacion",
    },
  ];

  // Filtrar cards según permisos
  let visibleCards = configCards.filter((card) => {
    if (card.ogOnly && !isOG) return false;
    if (!card.ogOnly && (!dataPermisosConfiguracion || dataPermisosConfiguracion.length === 0)) return false;
    return true;
  });

  if (visibleCards.length === 0) {
    return (
      <Container>
        <NoPermissionsMessage>
          <h2>No tienes permisos de configuración asignados</h2>
          <p>Contacta con el administrador para obtener acceso</p>
        </NoPermissionsMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Configuración</Title>
        <Subtitle>Administra todos los aspectos de tu sistema</Subtitle>
      </Header>

      <GridContainer>
        {visibleCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <CardLink key={card.id} to={card.link}>
              <Card>
                <IconBox $bgColor={card.bgColor} $bgColorDark={card.bgColorDark}>
                  <IconComponent size={38} color={card.iconColor} />
                </IconBox>
                <CardContent>
                  <CardTitle>{card.title}</CardTitle>
                  <CardSubtitle>{card.subtitle}</CardSubtitle>
                </CardContent>
              </Card>
            </CardLink>
          );
        })}
      </GridContainer>
    </Container>
  );
}
const Container = styled.div`
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  padding: 28px 50px;
  padding-top: 18px;
  transition: background-color 0.3s ease;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 14px 14px;
    padding-top: 10px;
  }
`;

const Header = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-bottom: 8px;
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  margin-bottom: 2px;
  font-family: "Rubik", sans-serif;
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: #64748b;
  margin: 0;
  font-family: "Rubik", sans-serif;
  font-weight: 400;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 18px;
  width: 100%;
  flex: 1;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Card = styled.div`
  background-color: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 14px;
  padding: 28px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  min-height: 200px;
  justify-content: center;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #e8e8e8;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 20px 14px;
    min-height: 170px;
  }

  @media (max-width: 500px) {
    padding: 18px 12px;
    min-height: 150px;
  }
`;

const IconBox = styled.div`
  width: 68px;
  height: 68px;
  border-radius: 14px;
  background-color: ${(props) => props.$bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.08);
  }

  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
    margin-bottom: 12px;
  }

  @media (max-width: 500px) {
    width: 48px;
    height: 48px;
    margin-bottom: 10px;
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const CardTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 18px;
  font-family: "Rubik", sans-serif;
`;

const CardSubtitle = styled.p`
  font-size: 12px;
  color: #64748b;
  margin: 0;
  margin-top: 5px;
  line-height: 15px;
  font-family: "Rubik", sans-serif;
  font-weight: 400;
`;

const NoPermissionsMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #ffffff;
  text-align: center;

  h2 {
    font-size: 24px;
    margin-bottom: 12px;
  }

  p {
    font-size: 16px;
    color: #c0c0c0;
  }
`;
