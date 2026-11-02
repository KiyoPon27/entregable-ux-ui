package tienda.posbackend.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "password_reset_codes", indexes = {
        @Index(name = "idx_password_reset_codes_correo", columnList = "correo", unique = true),
        @Index(name = "idx_password_reset_codes_expires_at", columnList = "expires_at")
})
public class PasswordResetCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String correo;

    @Column(nullable = false, length = 6)
    private String codigo;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime creadoEn;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "used_at")
    private LocalDateTime usadoEn;
}