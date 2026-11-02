package tienda.posbackend.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.mail.from-name}")
    private String fromName;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetCode(String toEmail, String code) throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail, fromName);
        helper.setTo(toEmail);
        helper.setSubject("Recuperacion de contraseña - LT Sanchez");

        String htmlBody = buildHtmlBody(code);
        helper.setText(buildPlainTextBody(code), htmlBody);

        mailSender.send(message);
    }

    private String buildPlainTextBody(String code) {
        return "Hola,\n\n" +
                "Recibimos una solicitud para recuperar tu cuenta de LT Sanchez.\n\n" +
                "Tu codigo de 6 digitos es: " + code + "\n\n" +
                "Este codigo vence en 10 minutos.\n\n" +
                "Si no solicitaste este correo, puedes ignorarlo.";
    }

    private String buildHtmlBody(String code) {
        return """
                <div style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
                    <div style="max-width:620px;margin:0 auto;padding:32px 18px;">
                        <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(17,24,39,.08);">
                            <div style="background:linear-gradient(135deg,#111827,#374151);padding:28px 32px;color:#ffffff;">
                                <div style="font-size:14px;letter-spacing:.12em;text-transform:uppercase;opacity:.8;">LT Sanchez</div>
                                <div style="font-size:28px;font-weight:700;line-height:1.2;margin-top:10px;">Recuperacion de contraseña</div>
                                <div style="font-size:15px;opacity:.9;margin-top:8px;">Usa el codigo siguiente para continuar con el cambio de contraseña.</div>
                            </div>
                            <div style="padding:32px;">
                                <p style="font-size:16px;line-height:1.6;color:#111827;margin:0 0 18px;">Hola,</p>
                                <p style="font-size:16px;line-height:1.6;color:#374151;margin:0 0 24px;">Recibimos una solicitud para recuperar tu cuenta. Ingresa este codigo de 6 digitos en el formulario de recuperacion:</p>
                                <div style="text-align:center;margin:28px 0;">
                                    <div style="display:inline-block;padding:18px 28px;border:2px dashed #111827;border-radius:16px;background:#f9fafb;">
                                        <div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;margin-bottom:8px;">Codigo de verificacion</div>
                                        <div style="font-size:36px;letter-spacing:.28em;font-weight:700;color:#111827;">%s</div>
                                    </div>
                                </div>
                                <div style="background:#f9fafb;border-radius:16px;padding:18px 20px;color:#374151;font-size:14px;line-height:1.7;">
                                    <strong style="color:#111827;">Importante:</strong><br/>
                                    Este codigo expira en 10 minutos.<br/>
                                    Si no pediste este cambio, ignora este mensaje.
                                </div>
                            </div>
                            <div style="padding:0 32px 28px;color:#9ca3af;font-size:12px;line-height:1.6;">
                                Este es un correo automatizado. No respondas a este mensaje.
                            </div>
                        </div>
                    </div>
                </div>
                """.formatted(code);
        }
}
