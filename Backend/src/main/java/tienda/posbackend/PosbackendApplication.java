package tienda.posbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PosbackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(PosbackendApplication.class, args);
	}

}
