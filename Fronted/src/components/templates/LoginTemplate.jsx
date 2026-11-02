import styled from "styled-components";
import {
  Btn1,
  Generarcodigo,
  Linea,
  useAuthStore,
} from "../../index";
import { v } from "../../styles/variables";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { useState, useEffect, useRef } from "react";
import api from "../../api/api";
import { CardModos } from "../organismos/LoginDesign/CardModos";
import { VolverBtn } from "../moleculas/VolverBtn";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

export function LoginTemplate() {
  const [stateModos, setStateModos] = useState(false);
  const [stateModo, setStateModo] = useState("empleado");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState("request");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState(["", "", "", "", "", ""]);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const otpRefs = useRef([]);
  const { loginGoogle, loginEmail, crearUserYLogin } = useAuthStore();

  const { register, handleSubmit, setValue } = useForm();
  
  // Cargar credenciales guardadas
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    const isRemembered = localStorage.getItem("rememberMe");
    
    if (savedEmail && savedPassword && isRemembered === "true") {
      setValue("email", savedEmail);
      setValue("password", savedPassword);
      setRememberMe(true);
    }
  }, [setValue]);

  const { mutate } = useMutation({
    mutationKey: ["iniciar con email"],
    mutationFn: loginEmail,
    onError: (error) => {
      const mensajeBackend = (error?.response?.data?.message || error?.message || "").toLowerCase();
      if (mensajeBackend.includes("deshabilitada")) {
        setLoginError("Cuenta deshabilitada");
        return;
      }
      setLoginError("Contraseña o Correo incorrecto");
    },
    onSuccess: () => {
      setLoginError("");
      // Limpiar credenciales si está marcado recordar
      if (!rememberMe) {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
        localStorage.removeItem("rememberMe");
      }
    },
  });
  const { mutate: mutateTester, isPending } = useMutation({
    mutationKey: ["iniciar con email tester"],
    mutationFn: crearUserYLogin,
    onError: (error) => {
      const mensaje = error?.response?.data?.message || error.message || "No se pudo iniciar sesion";
      toast.error(mensaje);
    },
    onSuccess: () => {
      //queryClient.invalidateQueries();
      // window.location.reload();
    },
  });

  const { mutate: sendResetCode, isPending: isSendingReset } = useMutation({
    mutationKey: ["forgot password"],
    mutationFn: async (correo) => {
      const resp = await api.post("/auth/forgot-password", { correo });
      return resp.data;
    },
    onSuccess: () => {
      toast.success("Codigo enviado al correo correctamente");
      setForgotStep("verify");
      setForgotCode(["", "", "", "", "", ""]);
      setIsCodeVerified(false);
      setTimeout(() => {
        otpRefs.current?.[0]?.focus?.();
      }, 60);
    },
    onError: (error) => {
      const status = error?.response?.status;
      if (status === 404) {
        toast.error("El correo no existe en el sistema");
        return;
      }
      toast.error("No se pudo enviar el correo. Revisa la configuracion SMTP de Gmail.");
    },
  });

  const { mutate: verifyResetCode, isPending: isVerifyingCode } = useMutation({
    mutationKey: ["verify reset code"],
    mutationFn: async ({ correo, codigo }) => {
      const resp = await api.post("/auth/verify-reset-code", { correo, codigo });
      return resp.data;
    },
    onSuccess: () => {
      setIsCodeVerified(true);
      toast.success("Codigo verificado correctamente");
    },
    onError: () => {
      setIsCodeVerified(false);
      toast.error("El codigo no es valido o ya expiro");
    },
  });

  const { mutate: resetPassword, isPending: isResettingPassword } = useMutation({
    mutationKey: ["reset password"],
    mutationFn: async ({ correo, codigo, nuevaContrasena }) => {
      const resp = await api.post("/auth/reset-password", {
        correo,
        codigo,
        nuevaContrasena,
      });
      return resp.data;
    },
    onSuccess: () => {
      toast.success("Contraseña actualizada correctamente");
      resetForgotState();
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || "No se pudo actualizar la contraseña";
      toast.error(msg);
    },
  });

  const resetForgotState = () => {
    setShowForgotPassword(false);
    setForgotStep("request");
    setForgotEmail("");
    setForgotCode(["", "", "", "", "", ""]);
    setIsCodeVerified(false);
    setNewPassword("");
    setShowNewPassword(false);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...forgotCode];
    next[index] = value;
    setForgotCode(next);

    if (value && index < 5) {
      otpRefs.current?.[index + 1]?.focus?.();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !forgotCode[index] && index > 0) {
      otpRefs.current?.[index - 1]?.focus?.();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((digit, i) => {
      next[i] = digit;
    });
    setForgotCode(next);
    const focusIndex = Math.min(pasted.length, 5);
    otpRefs.current?.[focusIndex]?.focus?.();
  };

  const submitVerifyCode = () => {
    const correo = forgotEmail.trim().toLowerCase();
    const codigo = forgotCode.join("").trim();
    if (!correo) {
      toast.error("No se encontro el correo para verificar");
      return;
    }
    if (codigo.length !== 6) {
      toast.error("Ingresa los 6 digitos del codigo");
      return;
    }
    verifyResetCode({ correo, codigo });
  };

  const passwordRules = {
    hasLower: /[a-z]/.test(newPassword),
    hasUpper: /[A-Z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasLength: newPassword.length >= 8,
  };

  const isPasswordValid =
    passwordRules.hasLower &&
    passwordRules.hasUpper &&
    passwordRules.hasNumber &&
    passwordRules.hasLength;

  const submitNewPassword = () => {
    if (!isCodeVerified) {
      toast.error("Primero verifica el codigo");
      return;
    }
    if (!isPasswordValid) {
      toast.error("La contraseña no cumple los requisitos");
      return;
    }

    const correo = forgotEmail.trim().toLowerCase();
    const codigo = forgotCode.join("").trim();
    resetPassword({ correo, codigo, nuevaContrasena: newPassword });
  };
  const manejadorEmailSesion = (data) => {
    setLoginError("");
    // Guardar credenciales si está marcado recordar
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", data.email);
      localStorage.setItem("rememberedPassword", data.password);
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("rememberedPassword");
      localStorage.removeItem("rememberMe");
    }
    mutate({ email: data.email, password: data.password });
  };
  const manejarCrearUSerTester = () => {
    const response = Generarcodigo({ id: 2 });
    const gmail = "@gmail.com";
    const correoCompleto = response.toLowerCase() + gmail;
    mutateTester({ email: correoCompleto, password: "123456" });
  };

  // Prevent browser back from returning to previous pages/screens
  useEffect(() => {
    try {
      window.history.pushState(null, "", window.location.href);
      const onPop = () => {
        window.history.pushState(null, "", window.location.href);
      };
      window.addEventListener("popstate", onPop);
      return () => window.removeEventListener("popstate", onPop);
    } catch (e) {
      // ignore in non-browser environments
    }
  }, []);

  return (
    <Container>
      <Toaster />
      <LoginShell>
        <LeftPanel>
          <CharactersStage>
            <PurpleCharacter>
              <EyesRow>
                <EyeDot />
                <EyeDot />
              </EyesRow>
            </PurpleCharacter>
            <BlackCharacter>
              <EyesRow>
                <EyeDot />
                <EyeDot />
              </EyesRow>
            </BlackCharacter>
            <OrangeCharacter>
              <EyesRow>
                <EyeDot />
                <EyeDot />
              </EyesRow>
            </OrangeCharacter>
            <YellowCharacter>
              <EyesRow>
                <EyeDot />
                <EyeDot />
              </EyesRow>
              <MouthLine />
            </YellowCharacter>
          </CharactersStage>

        </LeftPanel>

        <RightPanel>
          {stateModos ? (
            <ContentModos>
              <CardModos
                title={"Super admin"}
                subtitle={"crea y gestiona tu empresa"}
                bgcolor={"#ed7323"}
                img={"https://i.ibb.co/TDXYj7r9/rey.png"}
                funcion={() => {
                  setStateModo("superadmin");
                  setStateModos(!stateModos);
                }}
              />
              <CardModos
                title={"Empleado"}
                subtitle={"vende y crece"}
                bgcolor={"#542a1b"}
                img={"https://i.ibb.co/ksfCmJyy/casco.png"}
                funcion={() => {
                  setStateModo("empleado");
                  setStateModos(!stateModos);
                }}
              />
            </ContentModos>
          ) : stateModo === "empleado" ? (
            <LoginForm>
              {showForgotPassword ? (
                <ForgotPasswordCard>
                  {forgotStep === "request" ? (
                    <>
                      <h2>Recuperar contraseña</h2>
                      <p>Ingresa tu correo para recibir un codigo de recuperacion</p>

                      <div className="field">
                        <label htmlFor="forgot-email">Correo</label>
                        <input
                          id="forgot-email"
                          type="email"
                          placeholder="nombre@ejemplo.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                        />
                      </div>

                      <button
                        type="button"
                        disabled={isSendingReset}
                        onClick={() => {
                          const correo = forgotEmail.trim().toLowerCase();
                          if (!correo) {
                            toast.error("Ingresa un correo valido");
                            return;
                          }
                          sendResetCode(correo);
                        }}
                      >
                        {isSendingReset ? "Enviando..." : "Enviar enlace de recuperacion"}
                      </button>

                      <small>
                        Te enviaremos un codigo para restablecer tu contraseña.
                      </small>
                    </>
                  ) : (
                    <>
                      <h2>Restablecer contraseña</h2>
                      <p>
                        Ingresa el codigo enviado a <strong>{forgotEmail}</strong> para restablecer
                        tu contraseña.
                      </p>

                      <div className="otpRow" onPaste={handleOtpPaste}>
                        {forgotCode.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => {
                              otpRefs.current[index] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className="otpInput"
                            disabled={isVerifyingCode}
                          />
                        ))}
                      </div>

                      <hr className="separator" />

                      <div className="otpActions">
                        <button
                          type="button"
                          className="btnCancel"
                          onClick={() => setForgotStep("request")}
                          disabled={isVerifyingCode}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="btnSubmitCode"
                          onClick={submitVerifyCode}
                          disabled={isVerifyingCode || forgotCode.join("").length !== 6}
                        >
                          {isVerifyingCode ? "Verificando..." : "Verificar codigo"}
                        </button>
                      </div>

                      {isCodeVerified ? (
                        <small className="successText">Codigo verificado</small>
                      ) : null}

                      {isCodeVerified ? (
                        <>
                          <hr className="separator" />

                          <div className="newPasswordWrap">
                            <label>Nueva contraseña</label>
                            <div className="newPasswordInputWrap">
                              <input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                              />
                              <button
                                type="button"
                                className="toggleNewPassword"
                                onClick={() => setShowNewPassword((s) => !s)}
                              >
                                {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                              </button>
                            </div>

                            <div className="passwordChecklist">
                              <div className="checkItem">
                                {passwordRules.hasLower ? (
                                  <FiCheckCircle className="ok" />
                                ) : (
                                  <FiXCircle className="ko" />
                                )}
                                <span>Al menos una letra minuscula</span>
                              </div>
                              <div className="checkItem">
                                {passwordRules.hasLength ? (
                                  <FiCheckCircle className="ok" />
                                ) : (
                                  <FiXCircle className="ko" />
                                )}
                                <span>Minimo 8 caracteres</span>
                              </div>
                              <div className="checkItem">
                                {passwordRules.hasUpper ? (
                                  <FiCheckCircle className="ok" />
                                ) : (
                                  <FiXCircle className="ko" />
                                )}
                                <span>Al menos una letra mayuscula</span>
                              </div>
                              <div className="checkItem">
                                {passwordRules.hasNumber ? (
                                  <FiCheckCircle className="ok" />
                                ) : (
                                  <FiXCircle className="ko" />
                                )}
                                <span>Al menos un numero</span>
                              </div>
                            </div>

                            <div className="otpActions newPasswordActions">
                              <button
                                type="button"
                                className="btnCancel"
                                onClick={() => setForgotStep("request")}
                                disabled={isResettingPassword}
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                className="btnSubmitCode"
                                onClick={submitNewPassword}
                                disabled={!isPasswordValid || isResettingPassword}
                              >
                                {isResettingPassword ? "Actualizando..." : "Restablecer contraseña"}
                              </button>
                            </div>
                          </div>
                        </>
                      ) : null}
                    </>
                  )}

                  <div className="backLogin">
                    <span>Recordaste tu contraseña?</span>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        resetForgotState();
                      }}
                    >
                      Iniciar sesion
                    </a>
                  </div>
                </ForgotPasswordCard>
              ) : (
                <>
                  <FormHeader>
                    <h1>Bienvenido</h1>
                    <p>Inicia sesion para continuar</p>
                  </FormHeader>

                  <form onSubmit={handleSubmit(manejadorEmailSesion)}>
                    {loginError ? <LoginErrorMessage>{loginError}</LoginErrorMessage> : null}

                    <InputWrapper>
                      <InputTitle>Usuario</InputTitle>
                      <InputGroup>
                        <InputIcon>
                          <FiMail size={20} color="#767676" />
                        </InputIcon>
                        <StyledInput
                          placeholder="Ingresa tu usuario"
                          aria-label="Usuario"
                          type="email"
                          {...register("email", {
                            required: true,
                            onChange: () => setLoginError(""),
                          })}
                        />
                      </InputGroup>
                    </InputWrapper>

                    <InputWrapper>
                      <InputTitle>Contraseña</InputTitle>
                      <InputGroup>
                        <InputIcon>
                          <FiLock size={20} color="#767676" />
                        </InputIcon>
                        <StyledInput
                          placeholder="Ingresa tu contraseña"
                          aria-label="Contraseña"
                          type={showPassword ? "text" : "password"}
                          {...register("password", {
                            required: true,
                            onChange: () => setLoginError(""),
                          })}
                        />
                        <TogglePasswordBtn
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <FiEyeOff size={24} color="#111111" />
                          ) : (
                            <FiEye size={24} color="#111111" />
                          )}
                        </TogglePasswordBtn>
                      </InputGroup>
                    </InputWrapper>

                    <RememberSection>
                      <CheckboxWrapper>
                        <CheckboxInput
                          type="checkbox"
                          id="remember"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <CheckboxLabel htmlFor="remember">
                          Recordarme
                        </CheckboxLabel>
                      </CheckboxWrapper>
                      <ForgotLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowForgotPassword(true);
                          setForgotStep("request");
                          setForgotEmail("");
                          setForgotCode(["", "", "", "", "", ""]);
                          setIsCodeVerified(false);
                        }}
                      >
                        Olvidaste tu contraseña?
                      </ForgotLink>
                    </RememberSection>

                    <LoginButton type="submit" disabled={isPending}>
                      {isPending ? "Ingresando..." : "Iniciar sesion"}
                    </LoginButton>
                  </form>
                </>
              )}
            </LoginForm>
          ) : (
            <PanelModo>
              <VolverBtn funcion={() => setStateModos(!stateModos)} />
              <span>Modo super admin</span>
              <Btn1
                disabled={isPending}
                funcion={manejarCrearUSerTester}
                border="2px"
                titulo="MODO INVITADO"
                bgcolor="#f6ce1c"
                color="255,255,255"
                width="100%"
              />
              <Linea>
                <span>0</span>
              </Linea>
              <Btn1
                border="2px"
                funcion={loginGoogle}
                titulo="Google"
                bgcolor="#fff"
                icono={<v.iconogoogle />}
              />
            </PanelModo>
          )}
        </RightPanel>
      </LoginShell>
    </Container>
  );
}
const Container = styled.div`
  height: 100vh;
  width: 100%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: hidden;
`;

const LoginShell = styled.div`
  width: 100%;
  height: 100vh;
  background: #ffffff;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  display: grid;
  grid-template-columns: 1.05fr 1fr;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    min-height: 100vh;
  }
`;

const LeftPanel = styled.section`
  position: relative;
  height: 100%;
  background: radial-gradient(circle at 50% 55%, #303030 0%, #17191f 45%, #0d0f13 100%);
  padding: 34px 36px;
  color: #f3f4f6;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const CharactersStage = styled.div`
  position: relative;
  height: min(430px, 56vh);
  margin: auto auto 0;
  width: min(500px, 100%);
`;

const EyesRow = styled.div`
  position: absolute;
  display: flex;
  gap: 12px;
  top: 28px;
  left: 38px;
`;

const EyeDot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #1f2937;
`;

const PurpleCharacter = styled.div`
  position: absolute;
  left: 72px;
  bottom: 0;
  width: 150px;
  height: 330px;
  background: #6d42f8;
  border-radius: 12px 12px 0 0;

  ${EyesRow} {
    left: 38px;
    top: 22px;
  }
`;

const BlackCharacter = styled.div`
  position: absolute;
  left: 200px;
  bottom: 0;
  width: 98px;
  height: 255px;
  background: #25272e;
  border-radius: 10px 10px 0 0;

  ${EyesRow} {
    left: 22px;
    top: 18px;
  }
`;

const OrangeCharacter = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 210px;
  height: 170px;
  background: #ff9969;
  border-radius: 105px 105px 0 0;

  ${EyesRow} {
    left: 66px;
    top: 64px;
  }
`;

const YellowCharacter = styled.div`
  position: absolute;
  left: 258px;
  bottom: 0;
  width: 118px;
  height: 190px;
  background: #e4d557;
  border-radius: 60px 60px 0 0;

  ${EyesRow} {
    left: 28px;
    top: 24px;
  }
`;

const MouthLine = styled.span`
  position: absolute;
  left: 24px;
  top: 68px;
  width: 64px;
  height: 4px;
  border-radius: 999px;
  background: #1f2937;
`;

const RightPanel = styled.section`
  height: 100%;
  padding: 54px 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;

  @media (max-width: 768px) {
    min-height: 100vh;
    padding: 32px 20px;
  }
`;

const LoginForm = styled.div`
  width: 100%;
  max-width: 430px;
  margin: 0 auto;

  form {
    width: 100%;
  }
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 22px;

  h1 {
    margin: 0;
    font-size: 54px;
    font-weight: 700;
    color: #111827;
    letter-spacing: -0.4px;
  }

  p {
    margin: 8px 0 0;
    font-size: 14px;
    color: #7a7a7a;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 24px;
    }
  }
`;

const LoginErrorMessage = styled.div`
  width: 100%;
  max-width: 420px;
  margin: 0 auto 10px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 700;
`;

const InputWrapper = styled.div`
  margin-bottom: 16px;
  width: 100%;
  max-width: 420px;
  margin-left: auto;
  margin-right: auto;
`;

const InputTitle = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
`;

const InputGroup = styled.div`
  position: relative;
  width: 100%;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const TogglePasswordBtn = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  width: 30px;
  height: 30px;
`;

const StyledInput = styled.input`
  width: 100%;
  height: 52px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  font-size: 16px;
  color: #111827;
  padding: 0 46px 0 44px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: #8a8a8a;
  }

  &:focus {
    outline: none;
    border-color: #111827;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.12);
  }

  &:hover:not(:focus) {
    border-color: #9ca3af;
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
    box-shadow: 0 0 0 1000px #ffffff inset !important;
    -webkit-text-fill-color: #202020 !important;
  }
`;

const RememberSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0 18px;
  width: 100%;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CheckboxInput = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #111827;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: 13px;
  color: #646464;
  cursor: pointer;
`;

const ForgotLink = styled.a`
  font-size: 13px;
  color: #111827;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 10px;
  background: #111111;
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background: #000000;
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

`;

const ContentModos = styled.div`
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PanelModo = styled.div`
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ForgotPasswordCard = styled.div`
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background: #ffffff;
  padding: 24px 22px 16px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);

  h2 {
    margin: 0;
    font-size: 30px;
    font-weight: 700;
    text-align: center;
    color: #111827;
  }

  > p {
    margin: 8px 0 18px;
    font-size: 14px;
    color: #6b7280;
    text-align: center;
  }

  .otpRow {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 4px;
    margin-bottom: 16px;
  }

  .otpInput {
    width: 50px;
    height: 48px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    text-align: center;
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    background: #ffffff;
  }

  .otpInput:focus {
    outline: none;
    border-color: #111827;
    box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.14);
  }

  .separator {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 10px 0 16px;
  }

  .otpActions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .btnCancel,
  .btnSubmitCode {
    min-width: 86px;
    height: 40px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }

  .btnCancel {
    border: 1px solid #d1d5db;
    background: #ffffff;
    color: #111827;
  }

  .btnCancel:hover:not(:disabled) {
    background: #f3f4f6;
  }

  .btnSubmitCode {
    border: none;
    background: #111111;
    color: #ffffff;
  }

  .btnSubmitCode:disabled,
  .btnCancel:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .successText {
    display: block;
    margin-top: 12px;
    color: #16a34a;
    font-weight: 700;
    text-align: right;
  }

  .newPasswordWrap {
    margin-top: 4px;
  }

  .newPasswordWrap label {
    display: block;
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 10px;
  }

  .newPasswordInputWrap {
    position: relative;
  }

  .newPasswordInputWrap input {
    width: 100%;
    box-sizing: border-box;
    height: 44px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    padding: 0 42px 0 12px;
    font-size: 16px;
    color: #111827;
    background: #ffffff;
  }

  .newPasswordInputWrap input:focus {
    outline: none;
    border-color: #111827;
    box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.14);
  }

  .toggleNewPassword {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: transparent;
    color: #6b7280;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
  }

  .passwordChecklist {
    margin-top: 14px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 14px;
  }

  .checkItem {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    color: #4b5563;
    line-height: 1.2;
  }

  .checkItem .ok {
    color: #16a34a;
    flex-shrink: 0;
  }

  .checkItem .ko {
    color: #6b7280;
    flex-shrink: 0;
  }

  .newPasswordActions {
    margin-top: 16px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .field label {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
  }

  .field input {
    width: 100%;
    box-sizing: border-box;
    height: 42px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 0 12px;
    font-size: 14px;
    color: #111827;
    background: #ffffff;
  }

  .field input:focus {
    outline: none;
    border-color: #111827;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.12);
  }

  > button {
    width: 100%;
    box-sizing: border-box;
    height: 42px;
    margin-top: 14px;
    border: none;
    border-radius: 8px;
    background: #111111;
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }

  > button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  > button:hover {
    background: #000000;
  }

  > small {
    display: block;
    margin-top: 14px;
    font-size: 13px;
    color: #6b7280;
    text-align: center;
    line-height: 1.4;
  }

  .backLogin {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
    text-align: center;
    font-size: 13px;
    color: #6b7280;
  }

  .backLogin a {
    margin-left: 6px;
    color: #111827;
    font-weight: 700;
    text-decoration: none;
  }

  .backLogin a:hover {
    text-decoration: underline;
  }
`;
