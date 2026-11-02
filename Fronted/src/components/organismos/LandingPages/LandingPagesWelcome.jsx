import React, { useEffect } from "react";
import styled from "styled-components";
import { Device } from "../../../styles/breakpoints";
import ScrollReveal from "scrollreveal";
import { useUsuariosStore } from "../../../store/UsuariosStore";
import { useNavigate } from "react-router-dom";
import { AnimatedText } from "../../atomos/AnimatedText";
import { CountdownTimer } from "../CountdownTimer";
import { GravityStarsBackground } from "../../ui/animated/GravityStarsBackground";
import { 
  FiBarChart2, 
  FiSettings, 
  FiShoppingCart,
  FiBox
} from "react-icons/fi";

export const LandingPagesWelcome = () => {
  const { datausuarios } = useUsuariosStore();
  const navigate = useNavigate();



  useEffect(() => {
    ScrollReveal().reveal(".welcome-header", {
      origin: "top",
      distance: "50px",
      duration: 800,
      easing: "ease-in-out",
    });

    ScrollReveal().reveal(".button-container", {
      origin: "bottom",
      distance: "100px",
      duration: 1000,
      easing: "ease-in-out",
      delay: 200,
    });

    ScrollReveal().reveal(".nav-button", {
      origin: "bottom",
      distance: "80px",
      duration: 900,
      easing: "ease-in-out",
      interval: 150,
    });
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Container>
      <BackgroundWrapper>
        <GravityStarsBackground className="gravity-stars-bg" />
      </BackgroundWrapper>
      <Main>
        <WelcomeHeader className="welcome-header">
          <AnimatedText 
            text="¡Bienvenido de vuelta!" 
            fontSize="56px"
            underlinePath="M 0,10 Q 75,0 150,10 Q 225,20 300,10"
            underlineHoverPath="M 0,10 Q 75,20 150,10 Q 225,0 300,10"
            underlineDuration={1.5}
          />
          <UserName>{datausuarios?.nombres || "Usuario"}</UserName>
          <CurrentDateTime>{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CurrentDateTime>
          <CountdownTimer />
        </WelcomeHeader>

        <ButtonContainer className="button-container">
          <NavButton
            className="nav-button"
            onClick={() => handleNavigation("/dashboard")}
            $bgColor="#0077ff"
            $hoverColor="#0056cc"
          >
            <ButtonIcon>
              <FiBarChart2 size={52} />
            </ButtonIcon>
            <ButtonContent>
              <ButtonTitle>Dashboard</ButtonTitle>
              <ButtonDescription>
                Visualiza tu negocio en tiempo real con reportes y gráficos completos
              </ButtonDescription>
            </ButtonContent>
            <ArrowIcon>→</ArrowIcon>
          </NavButton>

          <NavButton
            className="nav-button"
            onClick={() => handleNavigation("/pos")}
            $bgColor="#00b894"
            $hoverColor="#00966a"
          >
            <ButtonIcon>
              <FiShoppingCart size={52} />
            </ButtonIcon>
            <ButtonContent>
              <ButtonTitle>Post de Venta</ButtonTitle>
              <ButtonDescription>
                Gestiona directamente tus ventas y compras con una interfaz optimizada
              </ButtonDescription>
            </ButtonContent>
            <ArrowIcon>→</ArrowIcon>
          </NavButton>

          <NavButton
            className="nav-button"
            onClick={() => handleNavigation("/configuracion")}
            $bgColor="#6c5ce7"
            $hoverColor="#5544b3"
          >
            <ButtonIcon>
              <FiSettings size={52} />
            </ButtonIcon>
            <ButtonContent>
              <ButtonTitle>Configuración</ButtonTitle>
              <ButtonDescription>
                Personaliza tu sistema según las necesidades específicas de tu negocio
              </ButtonDescription>
            </ButtonContent>
            <ArrowIcon>→</ArrowIcon>
          </NavButton>

          <NavButton
            className="nav-button"
            onClick={() => handleNavigation("/inventario")}
            $bgColor="#ff6b9d"
            $hoverColor="#ff5a8e"
          >
            <ButtonIcon>
              <FiBox size={52} />
            </ButtonIcon>
            <ButtonContent>
              <ButtonTitle>Inventarios</ButtonTitle>
              <ButtonDescription>
                Gestiona tu stock y movimientos de inventario en tiempo real
              </ButtonDescription>
            </ButtonContent>
            <ArrowIcon>→</ArrowIcon>
          </NavButton>
        </ButtonContainer>
      </Main>
    </Container>
  );
};


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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  padding: 20px 12px 40px 12px;
  background: ${({ theme }) => theme.bgtotal};
  overflow: visible;
  font-family: 'Segoe UI', 'Trebuchet MS', sans-serif;
  transition: background 0.3s ease-in-out;
  position: relative;
  z-index: 2;
  
  @media ${Device.tablet} {
    padding: 24px 15px;
  }
  
  @media ${Device.desktop} {
    padding: 12px 20px;
  }
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 100%;
  max-width: 1200px;
  height: auto;
  justify-content: flex-start;
  padding: 12px 0;
  min-height: auto;
`;

const WelcomeHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  color: ${({ theme }) => theme.text};
  animation: fadeInDown 0.8s ease-in-out;
  flex-shrink: 1;
  min-height: auto;
  margin-bottom: 20px;

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media ${Device.desktop} {
    gap: 12px;
    margin-bottom: 24px;
  }
`;

const WelcomeText = styled.h2`
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.5px;
  font-family: 'Segoe UI', 'Trebuchet MS', sans-serif;
  color: ${({ theme }) => theme.text};

  @media ${Device.tablet} {
    font-size: 28px;
  }

  @media ${Device.desktop} {
    font-size: 36px;
  }
`;

const UserName = styled.h1`
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 32px 0;
  letter-spacing: -1px;
  font-family: 'Segoe UI', 'Trebuchet MS', sans-serif;
  color: ${({ theme }) => theme.text};

  @media ${Device.tablet} {
    font-size: 44px;
  }

  @media ${Device.desktop} {
    font-size: 56px;
  }
`;

const CurrentDateTime = styled.p`
  font-size: 22px;
  font-weight: 700;
  margin: 12px 0 12px 0;
  opacity: 1;
  font-family: 'Segoe UI', 'Trebuchet MS', sans-serif;
  color: ${({ theme }) => theme.text};
  text-transform: capitalize;
  letter-spacing: 0.5px;

  @media ${Device.tablet} {
    font-size: 24px;
    margin: 0 0 12px 0;
  }

  @media ${Device.desktop} {
    font-size: 26px;
    margin: 0 0 14px 0;
  }
`;

const SubtitleText = styled.p`
  font-size: 13px;
  font-weight: 300;
  margin: 8px 0 16px 0;
  opacity: 0.95;
  max-width: 500px;
  line-height: 1.5;
  font-family: 'Segoe UI', 'Trebuchet MS', sans-serif;
  color: ${({ theme }) => theme.text};

  @media ${Device.tablet} {
    font-size: 14px;
    max-width: 550px;
  }

  @media ${Device.desktop} {
    font-size: 16px;
    max-width: 650px;
  }
`;

const ButtonContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  animation: fadeInUp 1s ease-in-out;
  flex-shrink: 0;
  max-width: 1000px;
  margin-top: 12px;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media ${Device.tablet} {
    gap: 12px;
  }

  @media ${Device.desktop} {
    gap: 16px;
  }
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 6px;
  padding: 20px 20px;
  background: ${({ theme }) => theme.body};
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  text-align: center;
  min-height: 180px;
  justify-content: center;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: ${props => props.$bgColor};
    transition: left 0.4s ease-in-out;
    z-index: -1;
    border-radius: 16px;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);

    &::before {
      left: 0;
    }
  }

  @media ${Device.mobile} {
    flex-direction: column;
    padding: 18px 16px;
    gap: 8px;
    min-height: 160px;
  }

  @media ${Device.tablet} {
    padding: 22px 20px;
    gap: 8px;
    min-height: 180px;
  }

  @media ${Device.desktop} {
    padding: 26px 24px;
    gap: 10px;
    min-height: 200px;
  }
`;

const ButtonIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  width: 72px;
  height: 72px;
  border-radius: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex-shrink: 0;
  transition: transform 0.3s ease-in-out;

  ${NavButton}:hover & {
    transform: scale(1.15) rotate(5deg);
  }

  @media ${Device.tablet} {
    width: 80px;
    height: 80px;
    border-radius: 16px;
  }

  @media ${Device.desktop} {
    width: 88px;
    height: 88px;
    border-radius: 18px;
  }
`;

const ButtonContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: center;
  flex: 1;

  @media ${Device.tablet} {
    gap: 2px;
  }

  @media ${Device.desktop} {
    gap: 3px;
  }
`;

const ButtonTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.text};
  transition: color 0.3s ease-in-out;
  font-family: 'Segoe UI', 'Trebuchet MS', sans-serif;
  letter-spacing: -0.3px;

  ${NavButton}:hover & {
    color: white;
  }

  @media ${Device.tablet} {
    font-size: 19px;
  }

  @media ${Device.desktop} {
    font-size: 21px;
  }
`;

const ButtonDescription = styled.p`
  font-size: 13px;
  font-weight: 400;
  margin: 0;
  color: ${({ theme }) => theme.text};
  line-height: 1.5;
  transition: color 0.3s ease-in-out;
  font-family: 'Segoe UI', 'Trebuchet MS', sans-serif;
  opacity: 0.85;

  ${NavButton}:hover & {
    color: white;
  }

  @media ${Device.tablet} {
    font-size: 13px;
    line-height: 1.5;
  }

  @media ${Device.desktop} {
    font-size: 14px;
    line-height: 1.6;
  }
`;

const ArrowIcon = styled.span`
  font-size: 14px;
  color: #667eea;
  transition: all 0.3s ease-in-out;
  font-weight: 300;
  flex-shrink: 0;
  display: none;
  align-items: center;

  ${NavButton}:hover & {
    color: white;
    transform: translateX(6px);
  }

  @media ${Device.tablet} {
    display: none;
    font-size: 18px;
  }

  @media ${Device.desktop} {
    display: none;
    font-size: 20px;
  }
`;
