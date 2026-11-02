package tienda.posbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Servir archivos desde la carpeta uploads/products en tiempo de ejecución
        Path uploadsDir = Paths.get(System.getProperty("user.dir"), "uploads", "products");
        String uploadsPath = uploadsDir.toFile().getAbsolutePath() + "/";
        registry.addResourceHandler("/uploads/products/**")
                .addResourceLocations("file:" + uploadsPath)
                .setCachePeriod(3600);
    }
}
