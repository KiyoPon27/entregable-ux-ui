package tienda.posbackend.services;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.entities.PasswordResetCode;
import tienda.posbackend.repositories.PasswordResetCodeRepository;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class PasswordResetCodeService {

    private static final int EXPIRATION_MINUTES = 10;
    private final Random random = new Random();
    private final PasswordResetCodeRepository passwordResetCodeRepository;

    public PasswordResetCodeService(PasswordResetCodeRepository passwordResetCodeRepository) {
        this.passwordResetCodeRepository = passwordResetCodeRepository;
    }

    @Transactional
    public String generateAndStoreCode(String correo) {
        String normalizedEmail = correo.trim().toLowerCase();
        String code = String.format("%06d", random.nextInt(1_000_000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES);

        PasswordResetCode entity = passwordResetCodeRepository.findByCorreo(normalizedEmail)
                .orElseGet(PasswordResetCode::new);
        entity.setCorreo(normalizedEmail);
        entity.setCodigo(code);
        entity.setExpiresAt(expiresAt);
        entity.setCreadoEn(LocalDateTime.now());
        entity.setUsadoEn(null);

        passwordResetCodeRepository.save(entity);
        return code;
    }

    public boolean isCodeValid(String correo, String code) {
        String normalizedEmail = correo.trim().toLowerCase();
        PasswordResetCode stored = passwordResetCodeRepository.findByCorreo(normalizedEmail).orElse(null);
        if (stored == null) {
            return false;
        }
        if (stored.getUsadoEn() != null) {
            return false;
        }
        if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            passwordResetCodeRepository.delete(stored);
            return false;
        }

        return stored.getCodigo().equals(code);
    }

    @Transactional
    public boolean consumeCodeIfValid(String correo, String code) {
        String normalizedEmail = correo.trim().toLowerCase();
        PasswordResetCode stored = passwordResetCodeRepository.findByCorreo(normalizedEmail).orElse(null);
        if (stored == null) {
            return false;
        }
        if (stored.getUsadoEn() != null) {
            return false;
        }
        if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            passwordResetCodeRepository.delete(stored);
            return false;
        }
        if (!stored.getCodigo().equals(code)) {
            return false;
        }

        stored.setUsadoEn(LocalDateTime.now());
        passwordResetCodeRepository.save(stored);
        return true;
    }

    @Transactional
    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredCodes() {
        passwordResetCodeRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}
