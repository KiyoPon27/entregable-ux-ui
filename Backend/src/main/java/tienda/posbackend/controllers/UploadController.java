package tienda.posbackend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tienda.posbackend.entities.Producto;
import tienda.posbackend.repositories.ProductoRepository;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UploadController {

    private final ProductoRepository productoRepository;

    // Endpoint para subir imagen de producto y guardar la URL en productos.imagen
    @PostMapping("/productos/{id}/imagen")
    public ResponseEntity<?> uploadImagenProducto(@PathVariable Long id, @RequestParam("file") MultipartFile file, HttpServletRequest request) {
        try {
            Producto producto = productoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            String uploadsDir = System.getProperty("user.dir") + "/uploads/products"; // carpeta en el proyecto
            Path uploadsPath = Paths.get(uploadsDir);
            if (!Files.exists(uploadsPath)) {
                Files.createDirectories(uploadsPath);
            }

            String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String ext = "";
            int dot = original.lastIndexOf('.');
            if (dot >= 0) ext = original.substring(dot);

            String filename = "prod_" + id + "_" + System.currentTimeMillis() + ext;
            Path target = uploadsPath.resolve(filename);

            // Guardar archivo
            Files.copy(file.getInputStream(), target);

            // Construir URL accesible públicamente a través del backend
            String base = request.getScheme() + "://" + request.getServerName();
            if (request.getServerPort() != 80 && request.getServerPort() != 443) {
                base += ":" + request.getServerPort();
            }
            String url = base + "/uploads/products/" + filename;

            // También construir y guardar la representación base64 (data URI)
            String mime = file.getContentType() != null ? file.getContentType() : "image/*";
            String base64Data = null;
            try {
                byte[] bytes = file.getBytes();
                base64Data = "data:" + mime + ";base64," + Base64.getEncoder().encodeToString(bytes);
            } catch (IOException e) {
                // No abortar entero si falla convertir a base64; loggear
                System.err.println("[UploadController] Error convirtiendo imagen a base64: " + e.getMessage());
            }

            // Guardar en BD (URL + base64 si está disponible)
            System.out.println("[UploadController] Guardando imagen para producto id="+id+" url="+url);
            producto.setImagen(url);
            if (base64Data != null) {
                producto.setImagenBase64(base64Data);
            }
            Producto saved = productoRepository.save(producto);
            System.out.println("[UploadController] Imagen guardada en BD: " + saved.getImagen());

            Map<String, Object> resp = new HashMap<>();
            resp.put("url", url);
            resp.put("filename", filename);
            resp.put("producto", saved);
            return ResponseEntity.ok(resp);

        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
