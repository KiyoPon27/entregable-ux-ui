package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.models.MovimientoCaja;
import tienda.posbackend.repositories.MovimientoCajaRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * SERVICE: MovimientoCajaService
 * 
 * LÓGICA DE NEGOCIO PARA MOVIMIENTOS DE CAJA
 * 
 * IMPORTANTE:
 * - Los movimientos son INMUTABLES (no se editan, solo se crean)
 * - Cada movimiento actualiza el saldo de la caja
 * - El saldo se calcula basado en el último movimiento
 * 
 * FLUJO TÍPICO:
 * 1. VentaService crea venta
 * 2. VentaService llama a registrarMovimiento() con tipo VENTA
 * 3. Se registra el ingreso en caja
 * 4. Se actualiza el saldo
 */
@Service
@Transactional
public class MovimientoCajaService {

    @Autowired
    private MovimientoCajaRepository repository;

    /**
     * ============================================================
     * FUNCIÓN: mostrarmovimientoscaja
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Muestra movimientos de una caja con información del usuario
     * 
     * FRONTEND:
     * const response = await axios.get("/api/movimientos-caja/mostrar", {
     *   params: { idCaja: 1 }
     * });
     * 
     * @param idCaja - ID de la caja
     * @return Lista con Maps { id, tipoMovimiento, monto, saldoAnterior, saldoNuevo, descripcion, fechaMovimiento, usuario }
     */
    public List<Map<String, Object>> mostrarMovimientos(Long idCaja) {
        return repository.mostrarMovimientosPorCaja(idCaja);
    }

    /**
     * ============================================================
     * FUNCIÓN: registrarmovimientocaja
     * ============================================================
     * 
     * FUNCIÓN PRINCIPAL: Registra un movimiento de caja
     * 
     * Esta función:
     * 1. Obtiene el saldo actual de la caja
     * 2. Calcula el nuevo saldo según el tipo de movimiento
     * 3. Registra el movimiento con saldo anterior y nuevo
     * 
     * POSTGRESQL ORIGINAL:
     * Trigger o función que calcula saldos automáticamente
     * 
     * PARÁMETROS:
     * @param idCaja - ID de la caja
     * @param idUsuario - Usuario que realiza el movimiento
     * @param tipoMovimiento - VENTA, APERTURA, CIERRE, INGRESO, EGRESO, ANULACION
     * @param monto - Monto del movimiento (siempre positivo)
     * @param descripcion - Descripción del movimiento
     * @param idVenta - ID de venta asociada (puede ser null)
     * 
     * @return MovimientoCaja creado
     * @throws Exception si hay error
     */
    @Transactional
    public MovimientoCaja registrarMovimiento(
        Long idCaja,
        Long idUsuario,
        String tipoMovimiento,
        BigDecimal monto,
        String descripcion,
        Long idVenta
    ) throws Exception {

        // Validar monto positivo
        if (monto.compareTo(BigDecimal.ZERO) <= 0) {
            throw new Exception("El monto debe ser mayor a 0");
        }

        // Obtener saldo actual (del último movimiento)
        BigDecimal saldoAnterior = repository.calcularSaldoActual(idCaja);
        if (saldoAnterior == null) {
            saldoAnterior = BigDecimal.ZERO;
        }

        BigDecimal saldoNuevo;

        // Calcular nuevo saldo según tipo de movimiento
        switch (tipoMovimiento.toUpperCase()) {
            case "VENTA":
            case "INGRESO":
            case "APERTURA":
                // Suma al saldo
                saldoNuevo = saldoAnterior.add(monto);
                break;
            
            case "EGRESO":
            case "ANULACION":
                // Resta del saldo
                saldoNuevo = saldoAnterior.subtract(monto);
                // Validar que no quede negativo (opcional: permitir negativo para sobregiros)
                if (saldoNuevo.compareTo(BigDecimal.ZERO) < 0) {
                    throw new Exception(String.format(
                        "Saldo insuficiente en caja. Disponible: %.2f, Requerido: %.2f",
                        saldoAnterior, monto
                    ));
                }
                break;
            
            case "CIERRE":
                // El cierre registra el saldo final sin modificarlo
                saldoNuevo = saldoAnterior;
                break;
            
            default:
                throw new Exception("Tipo de movimiento no válido: " + tipoMovimiento);
        }

        // Crear registro de movimiento
        MovimientoCaja movimiento = new MovimientoCaja();
        movimiento.setIdCaja(idCaja);
        movimiento.setIdUsuario(idUsuario);
        movimiento.setIdVenta(idVenta);
        movimiento.setTipoMovimiento(tipoMovimiento.toUpperCase());
        movimiento.setMonto(monto);
        movimiento.setSaldoAnterior(saldoAnterior);
        movimiento.setSaldoNuevo(saldoNuevo);
        movimiento.setDescripcion(descripcion);

        return repository.save(movimiento);
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Registrar apertura de caja
     * ============================================================
     * 
     * Se usa al inicio del turno
     * 
     * @param idCaja - ID de la caja
     * @param idUsuario - Usuario que abre
     * @param montoInicial - Efectivo inicial
     * @return MovimientoCaja creado
     */
    public MovimientoCaja registrarApertura(
        Long idCaja,
        Long idUsuario,
        BigDecimal montoInicial
    ) throws Exception {
        return registrarMovimiento(
            idCaja, 
            idUsuario, 
            "APERTURA", 
            montoInicial, 
            "Apertura de caja", 
            null
        );
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Registrar cierre de caja
     * ============================================================
     * 
     * Se usa al final del turno
     * 
     * @param idCaja - ID de la caja
     * @param idUsuario - Usuario que cierra
     * @param montoFinal - Efectivo final contado
     * @return MovimientoCaja creado
     */
    public MovimientoCaja registrarCierre(
        Long idCaja,
        Long idUsuario,
        BigDecimal montoFinal
    ) throws Exception {
        return registrarMovimiento(
            idCaja, 
            idUsuario, 
            "CIERRE", 
            montoFinal, 
            "Cierre de caja", 
            null
        );
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Registrar venta
     * ============================================================
     * 
     * Llamada automáticamente desde VentaService
     * 
     * @param idCaja - ID de la caja
     * @param idUsuario - Usuario que vende
     * @param monto - Total de la venta
     * @param idVenta - ID de la venta
     * @return MovimientoCaja creado
     */
    public MovimientoCaja registrarVenta(
        Long idCaja,
        Long idUsuario,
        BigDecimal monto,
        Long idVenta
    ) throws Exception {
        return registrarMovimiento(
            idCaja, 
            idUsuario, 
            "VENTA", 
            monto, 
            "Venta #" + idVenta, 
            idVenta
        );
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Registrar ingreso
     * ============================================================
     * 
     * Para ingresos manuales (depósitos, abonos)
     * 
     * @param idCaja - ID de la caja
     * @param idUsuario - Usuario que registra
     * @param monto - Monto del ingreso
     * @param descripcion - Descripción
     * @return MovimientoCaja creado
     */
    public MovimientoCaja registrarIngreso(
        Long idCaja,
        Long idUsuario,
        BigDecimal monto,
        String descripcion
    ) throws Exception {
        return registrarMovimiento(idCaja, idUsuario, "INGRESO", monto, descripcion, null);
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Registrar egreso
     * ============================================================
     * 
     * Para salidas de efectivo (gastos, retiros)
     * 
     * @param idCaja - ID de la caja
     * @param idUsuario - Usuario que registra
     * @param monto - Monto del egreso
     * @param descripcion - Descripción
     * @return MovimientoCaja creado
     */
    public MovimientoCaja registrarEgreso(
        Long idCaja,
        Long idUsuario,
        BigDecimal monto,
        String descripcion
    ) throws Exception {
        return registrarMovimiento(idCaja, idUsuario, "EGRESO", monto, descripcion, null);
    }

    /**
     * ============================================================
     * FUNCIÓN: Calcular saldo actual
     * ============================================================
     * 
     * @param idCaja - ID de la caja
     * @return Saldo actual
     */
    public BigDecimal calcularSaldoActual(Long idCaja) {
        BigDecimal saldo = repository.calcularSaldoActual(idCaja);
        return saldo != null ? saldo : BigDecimal.ZERO;
    }

    /**
     * ============================================================
     * FUNCIÓN: Listar movimientos por rango de fechas
     * ============================================================
     * 
     * Para reportes y cierre de caja
     * 
     * @param idCaja - ID de la caja
     * @param fechaInicio - Fecha inicial
     * @param fechaFin - Fecha final
     * @return Lista de movimientos
     */
    public List<MovimientoCaja> listarPorFechas(Long idCaja, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return repository.findByIdCajaAndFechaMovimientoBetween(idCaja, fechaInicio, fechaFin);
    }

    /**
     * ============================================================
     * FUNCIÓN: Calcular ingresos/egresos del día
     * ============================================================
     * 
     * Para cierre de caja
     * 
     * @param idCaja - ID de la caja
     * @param fechaInicio - Inicio del día
     * @param fechaFin - Fin del día
     * @return Map con "ingresos", "egresos", "neto"
     */
    public Map<String, BigDecimal> calcularResumenDia(
        Long idCaja,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin
    ) {
        BigDecimal ingresos = repository.calcularIngresosPeriodo(idCaja, fechaInicio, fechaFin);
        BigDecimal egresos = repository.calcularEgresosPeriodo(idCaja, fechaInicio, fechaFin);
        BigDecimal neto = ingresos.subtract(egresos);
        
        return Map.of(
            "ingresos", ingresos,
            "egresos", egresos,
            "neto", neto
        );
    }

    /**
     * ============================================================
     * FUNCIÓN: Contar ventas del día
     * ============================================================
     * 
     * @param idCaja - ID de la caja
     * @param fechaInicio - Inicio del día
     * @param fechaFin - Fin del día
     * @return Cantidad de ventas
     */
    public Long contarVentasDia(Long idCaja, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return repository.contarVentasDia(idCaja, fechaInicio, fechaFin);
    }
}
