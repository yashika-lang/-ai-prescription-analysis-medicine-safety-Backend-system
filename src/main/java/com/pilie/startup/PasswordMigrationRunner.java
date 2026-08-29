package com.pilie.startup;

import com.pilie.model.User;
import com.pilie.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Existing rows may have been created before password hashing was added
 * (see SecurityConfig). This re-hashes any password that isn't already a
 * BCrypt hash, in place, so no user data or accounts are lost - the row
 * count and every other field stay untouched.
 */
@Component
@Order(1)
public class PasswordMigrationRunner implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordMigrationRunner(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (User user : userRepository.findAll()) {
            String password = user.getPassword();
            if (password != null && !password.isBlank() && !isBcryptHash(password)) {
                user.setPassword(passwordEncoder.encode(password));
                userRepository.save(user);
            }
        }
    }

    private boolean isBcryptHash(String value) {
        return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$");
    }
}
