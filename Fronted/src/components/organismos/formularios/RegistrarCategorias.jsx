import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import {
  InputText,
  Btn1,
  useCategoriasStore,
  Icono,
  ConvertirCapitalize,
} from "../../../index";
import { useForm } from "react-hook-form";
import { CirclePicker } from "react-color";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useMutation } from "@tanstack/react-query";

export function RegistrarCategorias({
  onClose,
  dataSelect,
  accion,
  setIsExploding,
}) {
  const { insertarCategorias, editarCategoria } = useCategoriasStore();
  const { dataempresa } = useEmpresaStore();
  const [currentColor, setColor] = useState("#F44336");
  function elegirColor(color) {
    setColor(color.hex);
  }
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const { isPending, mutate: doInsertar } = useMutation({
    mutationFn: insertar,
    mutationKey: "insertar categorias",
    onError: (err) => console.log("El error", err.message),
    onSuccess: (result) => {
      // Solo cerrar si la operación fue exitosa
      if (result?.success) {
        cerrarFormulario();
      }
      // Si hay error (duplicate o not_found), el modal permanece abierto
      // Los mensajes ya se muestran en el store con SweetAlert2
    },
  });
  const handlesub = (data) => {
    doInsertar(data);
  };
  const cerrarFormulario = () => {
    onClose();
    setIsExploding(true);
  };
  async function insertar(data) {
    let result;
    
    if (accion === "Editar") {
      const p = {
        nombre: ConvertirCapitalize(data.descripcion),
        id_empresa: dataempresa.id,
        color: currentColor,
        id: dataSelect.id,
      };
      result = await editarCategoria(p, dataSelect.icono, null);
    } else {
      const p = {
        nombre: ConvertirCapitalize(data.descripcion),
        color: currentColor,
        icono: "-",
        id_empresa: dataempresa.id,
      };
      result = await insertarCategorias(p, null);
    }
    
    // Retornar el resultado para que onSuccess pueda evaluarlo
    return result;
  }
  useEffect(() => {
    if (accion === "Editar") {
      setColor(dataSelect.color);
    }
  }, []);
  return (
    <Container>
      {isPending ? (
        <span>...🔼</span>
      ) : (
        <div className="sub-contenedor">
          <div className="headers">
            <section>
              <h1>
                {accion == "Editar"
                  ? "Editar categoria"
                  : "Registrar nueva categoria"}
              </h1>
            </section>

            <section>
              <span onClick={onClose}>x</span>
            </section>
          </div>
          <form className="formulario" onSubmit={handleSubmit(handlesub)}>
            <section className="form-subcontainer">
              <article>
                <InputText icono={<v.iconoflechaderecha />}>
                  <input
                    className="form__field"
                    defaultValue={dataSelect.nombre}
                    type="text"
                    placeholder="categoria"
                    {...register("descripcion", {
                      required: true,
                    })}
                  />
                  <label className="form__label">categoria</label>
                  {errors.descripcion?.type === "required" && (
                    <p>Campo requerido</p>
                  )}
                </InputText>
              </article>

              <article className="colorContainer">
                <ContentTitle>
                  {<v.paletacolores />}
                  <span>Color</span>
                </ContentTitle>
                <div className="colorPickerContent">
                  <CirclePicker onChange={elegirColor} color={currentColor} />
                </div>
              </article>

              <Btn1
                icono={<v.iconoguardar />}
                titulo="Guardar"
                bgcolor="#F9D70B"
              />
            </section>
          </form>
        </div>
      )}
    </Container>
  );
}
const Container = styled.div`
  transition: 0.5s;
  top: 0;
  left: 0;
  position: fixed;
  background-color: rgba(10, 9, 9, 0.5);
  display: flex;
  width: 100%;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .sub-contenedor {
    position: relative;
    width: 500px;
    max-width: 85%;
    border-radius: 20px;
    background: ${({ theme }) => theme.bgtotal};
    box-shadow: -10px 15px 30px rgba(10, 9, 9, 0.4);
    padding: 13px 36px 20px 36px;
    z-index: 100;

    .headers {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h1 {
        font-size: 20px;
        font-weight: 500;
      }
      span {
        font-size: 20px;
        cursor: pointer;
      }
    }
    .formulario {
      .form-subcontainer {
        gap: 20px;
        display: flex;
        flex-direction: column;
        .colorContainer {
          .colorPickerContent {
            padding-top: 15px;
            min-height: 50px;
          }
        }
      }
    }
  }
`;

const ContentTitle = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 20px;

  svg {
    font-size: 25px;
  }
  input {
    border: none;
    outline: none;
    background: transparent;
    padding: 2px;
    width: 40px;
    font-size: 28px;
  }
`;
