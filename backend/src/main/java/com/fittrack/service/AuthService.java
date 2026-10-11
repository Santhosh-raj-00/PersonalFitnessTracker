package com.fittrack.service;

import com.fittrack.dto.AuthDTOs;
import com.fittrack.model.User;
import com.fittrack.model.UserProfile;
import com.fittrack.model.enums.Role;
import com.fittrack.repository.UserProfileRepository;
import com.fittrack.repository.UserRepository;
import com.fittrack.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, UserProfileRepository userProfileRepository,
                       PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthDTOs.AuthResponse register(AuthDTOs.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email address is already in use.");
        }

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                Role.ROLE_USER
        );

        user = userRepository.save(user);

        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setAge(request.getAge());
        profile.setHeightCm(request.getHeightCm());
        profile.setWeightKg(request.getWeightKg());
        profile.setFitnessGoal(request.getFitnessGoal());
        profile.setExperienceLevel(request.getExperienceLevel());
        profile.setAvailableEquipment(request.getAvailableEquipment());

        userProfileRepository.save(profile);
        user.setProfile(profile);

        String token = tokenProvider.generateTokenFromEmail(user.getEmail());
        return new AuthDTOs.AuthResponse(
                token, user.getId(), user.getEmail(), user.getFullName(), user.getRole().name(), mapToProfileDto(profile)
        );
    }

    public AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String token = tokenProvider.generateToken(authentication);
        return new AuthDTOs.AuthResponse(
                token, user.getId(), user.getEmail(), user.getFullName(), user.getRole().name(), mapToProfileDto(user.getProfile())
        );
    }

    public AuthDTOs.UserProfileDto getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return mapToProfileDto(user.getProfile());
    }

    @Transactional
    public AuthDTOs.UserProfileDto updateProfile(String email, AuthDTOs.UserProfileDto dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserProfile profile = user.getProfile();
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
        }

        if (dto.getAge() != null) profile.setAge(dto.getAge());
        if (dto.getHeightCm() != null) profile.setHeightCm(dto.getHeightCm());
        if (dto.getWeightKg() != null) profile.setWeightKg(dto.getWeightKg());
        if (dto.getFitnessGoal() != null) profile.setFitnessGoal(dto.getFitnessGoal());
        if (dto.getExperienceLevel() != null) profile.setExperienceLevel(dto.getExperienceLevel());
        if (dto.getAvailableEquipment() != null) profile.setAvailableEquipment(dto.getAvailableEquipment());
        if (dto.getDailyCalorieTarget() != null) profile.setDailyCalorieTarget(dto.getDailyCalorieTarget());
        if (dto.getDailyProteinTargetGrams() != null) profile.setDailyProteinTargetGrams(dto.getDailyProteinTargetGrams());

        userProfileRepository.save(profile);
        return mapToProfileDto(profile);
    }

    private AuthDTOs.UserProfileDto mapToProfileDto(UserProfile profile) {
        if (profile == null) return null;
        AuthDTOs.UserProfileDto dto = new AuthDTOs.UserProfileDto();
        dto.setId(profile.getId());
        dto.setAge(profile.getAge());
        dto.setHeightCm(profile.getHeightCm());
        dto.setWeightKg(profile.getWeightKg());
        dto.setFitnessGoal(profile.getFitnessGoal());
        dto.setExperienceLevel(profile.getExperienceLevel());
        dto.setAvailableEquipment(profile.getAvailableEquipment());
        dto.setDailyCalorieTarget(profile.getDailyCalorieTarget());
        dto.setDailyProteinTargetGrams(profile.getDailyProteinTargetGrams());
        return dto;
    }
}
