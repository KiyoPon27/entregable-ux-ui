import styled from "styled-components";
import { useMonedasStore } from "../../../store/MonedasStore";
import { getAllInfoByISO } from "iso-country-currency";
import iso from "iso-country-currency";
import { FlagIcon } from "react-flag-kit";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FiGlobe } from "react-icons/fi";


export const MonedaConfig = () => {
  const { dataempresa, editarMonedaEmpresa } = useEmpresaStore();
  const { search, setSearch, selectedCountry, setSelectedCountry } =
    useMonedasStore();
    const queryClient = useQueryClient();
  const isocodigos = iso.getAllISOCodes();
  const handleSearchChange = (e) => {
    setSearch(e.target.value.toLowerCase());
  };

  const handleSelectCountry = (country) => {
    const countryInfo = getAllInfoByISO(country.iso);
    setSelectedCountry({ ...country, currency: countryInfo.currency });
    setSearch(country.name);
  
    mutate.mutateAsync();
   
  };

  const filteredCountries = isocodigos.filter((country) =>
    country.countryName.toLowerCase().includes(search)
  );
   const editar = async () => {
    const p = {
      id:dataempresa?.id,
      simbolo_moneda: selectedCountry.symbol,
      iso: selectedCountry.iso,
      pais: selectedCountry.countryName,
      currency:selectedCountry.currency
    };
    await editarMonedaEmpresa(p);
  };
  const mutate = useMutation({
    mutationKey: "editar empresa moneda",
    mutationFn: editar,
    onSuccess: () => {
      queryClient.invalidateQueries('mostrar empresa');
      toast.success("🎉 datos guardados");
    },
  });
 
  return (
    <Container>
      <Card>
        <Header>
          <Title>Moneda</Title>
          <Subtitle>Busca el país y actualiza la moneda de la empresa.</Subtitle>
        </Header>

        <SearchField>
          <FiGlobe />
          <input
            type="search"
            placeholder="Buscar país..."
            value={search}
            onChange={handleSearchChange}
            onFocus={() => setSearch(search)}
          />
        </SearchField>

        {search && filteredCountries.length > 0 && (
          <Dropdown>
            <DropdownList>
              {filteredCountries.map((country, index) => (
                <DropdownItem key={index} onClick={() => handleSelectCountry(country)}>
                  {country.countryName}
                </DropdownItem>
              ))}
            </DropdownList>
          </Dropdown>
        )}

        <Cardselect>
          <article className="area1">
            <span className="titulo">Moneda actual</span>
          </article>
          <article className="area2">
            <article className="area2_1">
              <FlagIcon
                code={selectedCountry == null ? dataempresa?.iso : selectedCountry.iso}
                size={60}
              />
            </article>

            <article className="area2_2">
              <span>
                {selectedCountry == null ? dataempresa?.pais : selectedCountry.countryName}
              </span>
              <span className="simbolo">
                <Icon className="icono" icon="fluent-emoji:money-with-wings" />
                {selectedCountry == null ? dataempresa?.simbolo_moneda : selectedCountry.symbol}
              </span>
            </article>
          </article>
        </Cardselect>

        {mutate.isSuccess && (
          <SuccessText>
            cambios guardados <Icon icon="emojione:pig" />
          </SuccessText>
        )}
      </Card>
    </Container>
  );
};
const Container = styled.div`
  width: 100%;
  max-width: 560px;
  margin: 8px auto 0;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: ${({ theme }) => theme.bg3};
  border: 1px solid ${({ theme }) => theme.color2};
  border-radius: 22px;
  padding: 22px;
  box-sizing: border-box;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
`;

const Header = styled.div``;

const Title = styled.h1`
  margin: 0;
  font-size: 30px;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colorSubtitle};
  font-size: 14px;
`;

const SearchField = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid ${({ theme }) => theme.color2};
  border-radius: 14px;
  background: ${({ theme }) => theme.bg};
  padding: 0 14px;
  min-height: 50px;

  svg {
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.colorSubtitle};
    flex-shrink: 0;
  }

  input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    color: ${({ theme }) => theme.text};
    font-size: 15px;

    &::placeholder {
      color: ${({ theme }) => theme.colorSubtitle};
    }
  }
`;

const Dropdown = styled.div`
  position: relative;
`;

const DropdownList = styled.ul`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  position: absolute;
  margin-bottom: 15px;
  top: ${(props) => props.$top};
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  gap: 10px;
  z-index: 3;
  height: 230px;
  width: 95%;
  overflow: hidden;
  &:focus {
    outline: none;
  }
`;

const DropdownItem = styled.li`
  gap: 10px;
  display: flex;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.bgtotal};
  }
`;
const Cardselect = styled.section`
  border: 2px solid ${({ theme }) => theme.color2};
  border-radius: 18px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  align-self: stretch;
  background: ${({ theme }) => theme.bg};


  .area2 {
    display: flex;
    align-items: center;
    gap: 18px;
    .area2_2 {
      display: flex;
      flex-direction: column;
      gap: 8px;
      .simbolo {
        align-items: center;
        display: flex;
        gap: 5px;
        font-weight: 700;
        font-size: 20px;
        .icono {
          font-size: 30px;
        }
      }
    }
  }
`;
const Linea = styled.span`
  width: 100%;
  border-bottom: solid 2px ${({ theme }) => theme.color2};
  margin: 10px 0;
`;

const SuccessText = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #16a34a;
`;
