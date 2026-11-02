import styled from "styled-components";
import { useState } from "react";
import { useAuthStore, useUsuariosStore } from "../../../index";
import { v } from "../../../styles/variables";
import { NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useMenuDinamico } from "../../../utils/menuPorRol";
import { useThemeStore } from "../../../store/ThemeStore";
import { Dark, Light } from "../../../styles/themes";

const iconByLabel = {
  home: "heroicons:home-20-solid",
  dashboard: "heroicons:chart-bar-20-solid",
  vender: "heroicons:building-storefront-20-solid",
  inventario: "heroicons:cube-20-solid",
  reportes: "heroicons:presentation-chart-line-20-solid",
  compras: "heroicons:shopping-bag-20-solid",
  facturas: "heroicons:receipt-percent-20-solid",
  configuracion: "heroicons:cog-6-tooth-20-solid",
  "mi perfil": "heroicons:user-20-solid",
};

const getSidebarIcon = (label, fallbackIcon) => {
  const key = String(label || "").toLowerCase();
  return iconByLabel[key] || fallbackIcon || "heroicons:square-3-stack-3d-20-solid";
};

const isDarkMode = (theme) => theme?.bodyRgba === "15,20,25";

export function Sidebar({ state, setState }) {
  const { cerrarSesion } = useAuthStore();
  const { datausuarios, editarThemeUser } = useUsuariosStore();
  const { theme, setTheme } = useThemeStore();
  const [openProfileMenu, setOpenProfileMenu] = useState(false);

  const userRole = datausuarios?.rol;
  const { primaryLinks, secondaryLinks } = useMenuDinamico(userRole);

  const handleToggleSidebar = () => {
    if (typeof setState !== "function") return;
    setState((prev) => !prev);
  };

  const handleProfileMenu = () => {
    if (!state) return;
    setOpenProfileMenu((prev) => !prev);
  };

  const handleThemeToggle = () => {
    const themeUse = theme === "light" ? "dark" : "light";
    const themeStyle = themeUse === "light" ? Light : Dark;
    setTheme({ tema: themeUse, style: themeStyle });

    if (datausuarios?.id) {
      editarThemeUser({ id: datausuarios.id, tema: themeUse }).catch(() => null);
    }
  };

  return (
    <Main>
      <Container className={state ? "active" : ""}>
        <HeaderRow>
          <TeamButton type="button" $isopen={state}>
            <LogoWrap>
              <img src={v.logo} alt="Logo" />
            </LogoWrap>
            {state && <TeamName>{datausuarios?.empresa || "Mi empresa"}</TeamName>}
          </TeamButton>
          <ToggleButton onClick={handleToggleSidebar} aria-label="Abrir o cerrar sidebar">
            <Icon icon={state ? "heroicons:chevron-left-20-solid" : "heroicons:chevron-right-20-solid"} />
          </ToggleButton>
        </HeaderRow>

        {state && (
          <TopQuickActions>
            <QuickAction>
              <Icon icon="heroicons:magnifying-glass-20-solid" />
              <span>Search</span>
            </QuickAction>
            <ThemeQuickAction>
              <div className="left">
                <Icon icon={theme === "dark" ? "heroicons:moon-20-solid" : "heroicons:sun-20-solid"} />
                <span>{theme === "dark" ? "Modo oscuro" : "Modo claro"}</span>
              </div>
              <label className="switch" aria-label="Cambiar tema">
                <input type="checkbox" checked={theme === "dark"} onChange={handleThemeToggle} />
                <span className="slider" />
              </label>
            </ThemeQuickAction>
          </TopQuickActions>
        )}

        <SectionDivider />

        <MenuArea>
          <MenuSection>
            {primaryLinks.map(({ icon, label, to }) => (
              <ItemWrap key={label}>
                <NavLink to={to} className={({ isActive }) => `item-link${isActive ? " active" : ""}`}>
                  <Icon className="menu-icon" icon={getSidebarIcon(label, icon)} />
                  <span className={state ? "label show" : "label hide"}>{label}</span>
                </NavLink>
              </ItemWrap>
            ))}
          </MenuSection>

          {state && <InlineDivider />}

          <SidebarSpacer />

          <MenuSection>
            {secondaryLinks.map(({ icon, label, to }) => (
              <ItemWrap key={label}>
                <NavLink to={to} className={({ isActive }) => `item-link${isActive ? " active" : ""}`}>
                  <Icon className="menu-icon" icon={getSidebarIcon(label, icon)} />
                  <span className={state ? "label show" : "label hide"}>{label}</span>
                </NavLink>
              </ItemWrap>
            ))}

            <ItemWrap>
              <button type="button" className="item-link" onClick={cerrarSesion}>
                <Icon className="menu-icon" icon="heroicons:arrow-right-start-on-rectangle-20-solid" />
                <span className={state ? "label show" : "label hide"}>Salir</span>
              </button>
            </ItemWrap>
          </MenuSection>
        </MenuArea>

        <Footer>
          <ProfileButton type="button" onClick={handleProfileMenu} className={state ? "expanded" : "collapsed"}>
            <ProfileAvatar>
              {String(datausuarios?.nombres || "U").charAt(0).toUpperCase()}
            </ProfileAvatar>
            <ProfileInfo className={state ? "show" : "hide"}>
              <strong>{datausuarios?.nombres || "Usuario"}</strong>
              <span>{datausuarios?.correo || "sin-correo"}</span>
            </ProfileInfo>
            {state && <Icon className="chevron-up" icon="heroicons:chevron-up-20-solid" />}
          </ProfileButton>

          {state && openProfileMenu && (
            <ProfileMenu>
              <NavLink to="/miperfil" className="profile-item">
                <Icon icon="heroicons:user-20-solid" />
                <span>Mi Perfil</span>
              </NavLink>
              <NavLink to="/configuracion" className="profile-item">
                <Icon icon="heroicons:cog-6-tooth-20-solid" />
                <span>Configuración</span>
              </NavLink>
              <button type="button" className="profile-item logout" onClick={cerrarSesion}>
                <Icon icon="heroicons:arrow-right-start-on-rectangle-20-solid" />
                <span>Salir</span>
              </button>
            </ProfileMenu>
          )}
        </Footer>
      </Container>
    </Main>
  );
}

const Main = styled.div`
  position: relative;
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
`;

const Container = styled.aside`
  background:
    ${({ theme }) =>
      isDarkMode(theme)
        ? "linear-gradient(180deg, rgba(11, 22, 35, 0.86) 0%, rgba(13, 28, 45, 0.78) 100%)"
        : "linear-gradient(180deg, rgba(255, 255, 255, 0.62) 0%, rgba(255, 255, 255, 0.4) 100%)"},
    ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  backdrop-filter: blur(8px);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 20;
  width: 86px;
  height: 100vh;
  border-right: 1px solid ${({ theme }) => theme.color2};
  transition: width 0.24s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: ${({ theme }) =>
    isDarkMode(theme)
      ? "8px 0 30px rgba(2, 6, 23, 0.46)"
      : "8px 0 26px rgba(15, 23, 42, 0.08)"};

  &.active {
    width: 255px;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 6px 10px 6px;
  border-bottom: 1px solid ${({ theme }) => theme.color2};
`;

const TeamButton = styled.button`
  flex: ${({ $isopen }) => ($isopen ? "1" : "0 0 36px")};
  width: ${({ $isopen }) => ($isopen ? "auto" : "36px")};
  min-width: 0;
  border: 1px solid ${({ theme }) => theme.color2};
  background: ${({ theme }) => theme.bg3};
  border-radius: 12px;
  height: 38px;
  padding: ${({ $isopen }) => ($isopen ? "0 10px" : "0")};
  display: flex;
  align-items: center;
  justify-content: ${({ $isopen }) => ($isopen ? "flex-start" : "center")};
  gap: ${({ $isopen }) => ($isopen ? "10px" : "0")};
  color: ${({ theme }) => theme.text};
  box-shadow: ${({ theme }) =>
    isDarkMode(theme)
      ? "inset 0 1px 0 rgba(255,255,255,0.06)"
      : "inset 0 1px 0 rgba(255,255,255,0.45)"};
`;

const LogoWrap = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 999px;
  flex-shrink: 0;
  overflow: hidden;
  display: inline-flex;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const TeamName = styled.span`
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ToggleButton = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.color2};
  background: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.primary};
  }

  svg {
    font-size: 15px;
  }
`;

const TopQuickActions = styled.div`
  padding: 10px;
  display: grid;
  gap: 6px;
`;

const QuickAction = styled.button`
  height: 40px;
  border: 1px solid transparent;
  background: ${({ theme }) =>
    isDarkMode(theme) ? "rgba(148, 163, 184, 0.12)" : "rgba(255, 255, 255, 0.24)"};
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 10px;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.primary};
    color: #ffffff;
    border-color: ${({ theme }) => theme.primary};
    transform: translateY(-1px);
  }

  svg {
    font-size: 20px;
    color: ${({ theme }) => theme.colorSubtitle};
  }

  &:hover svg {
    color: #ffffff;
  }
`;

const ThemeQuickAction = styled.div`
  height: 40px;
  border: 1px solid transparent;
  background: ${({ theme }) =>
    isDarkMode(theme) ? "rgba(148, 163, 184, 0.12)" : "rgba(255, 255, 255, 0.24)"};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 10px;
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  font-weight: 500;

  .left {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .left svg {
    font-size: 20px;
    color: ${({ theme }) => theme.colorSubtitle};
    flex-shrink: 0;
  }

  .left span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .switch {
    position: relative;
    width: 34px;
    height: 20px;
    flex-shrink: 0;
    display: inline-block;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background: #9ca3af;
    transition: 0.2s;
    border-radius: 999px;
  }

  .slider::before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 3px;
    top: 3px;
    background: #ffffff;
    transition: 0.2s;
    border-radius: 50%;
  }

  .switch input:checked + .slider {
    background: ${({ theme }) => theme.primary};
  }

  .switch input:checked + .slider::before {
    transform: translateX(14px);
  }
`;

const SectionDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.color2};
  margin: 0 10px;
`;

const MenuArea = styled.div`
  padding: 6px 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 5px;
  }
`;

const MenuSection = styled.div`
  display: grid;
  gap: 4px;
`;

const InlineDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.color2};
  margin: 4px 4px;
`;

const SidebarSpacer = styled.div`
  flex: 1;
`;

const ItemWrap = styled.div`
  .item-link {
    width: 100%;
    min-height: 42px;
    border-radius: 10px;
    border: 1px solid transparent;
    background: transparent;
    color: ${({ theme }) => theme.text};
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .item-link:hover {
    background: ${({ theme }) => theme.primary};
    border-color: ${({ theme }) => theme.primary};
    color: #ffffff;
    transform: translateX(2px);
  }

  .item-link:hover .menu-icon {
    color: #ffffff;
  }

  .item-link.active {
    background: ${({ theme }) => theme.primary};
    border-color: ${({ theme }) => theme.primary};
    color: #ffffff;
    box-shadow: 0 8px 18px -8px rgba(37, 99, 235, 0.8);
  }

  .menu-icon {
    font-size: 20px;
    color: ${({ theme }) => theme.colorSubtitle};
    flex-shrink: 0;
  }

  .item-link.active .menu-icon {
    color: #ffffff;
  }

  .label.show {
    display: inline;
    text-transform: none;
  }

  .label.hide {
    display: none;
  }
`;

const Footer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.color2};
  padding: 10px;
  position: relative;
  background: ${({ theme }) =>
    isDarkMode(theme) ? "rgba(15, 23, 42, 0.42)" : "rgba(255, 255, 255, 0.18)"};
`;

const ProfileButton = styled.button`
  width: 100%;
  height: 52px;
  border: 1px solid ${({ theme }) => theme.color2};
  border-radius: 12px;
  background: ${({ theme }) => theme.bg3};
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }

  .chevron-up {
    margin-left: auto;
    color: ${({ theme }) => theme.colorSubtitle};
    font-size: 16px;
  }
`;

const ProfileAvatar = styled.span`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(37, 99, 235, 0.14);
  color: ${({ theme }) => theme.primary};
  font-size: 15px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ProfileInfo = styled.span`
  min-width: 0;

  strong,
  span {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  strong {
    font-size: 14px;
    font-weight: 600;
  }

  span {
    font-size: 12px;
    color: ${({ theme }) => theme.colorSubtitle};
  }

  &.hide {
    display: none;
  }
`;

const ProfileMenu = styled.div`
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: calc(100% + 8px);
  border: 1px solid ${({ theme }) => theme.color2};
  border-radius: 12px;
  background: ${({ theme }) => theme.bg3};
  box-shadow: ${({ theme }) =>
    isDarkMode(theme)
      ? "0 14px 28px rgba(2, 6, 23, 0.58)"
      : "0 10px 25px rgba(15, 23, 42, 0.18)"};
  overflow: hidden;
  z-index: 40;

  .profile-item {
    width: 100%;
    min-height: 40px;
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.text};
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 10px;
    font-size: 14px;
    cursor: pointer;
  }

  .profile-item:hover {
    background: ${({ theme }) => theme.primary};
    color: #ffffff;
  }

  .profile-item svg {
    font-size: 18px;
    color: ${({ theme }) => theme.colorSubtitle};
  }

  .profile-item:hover svg {
    color: #ffffff;
  }

  .logout {
    border-top: 1px solid ${({ theme }) => theme.color2};
  }
`;
