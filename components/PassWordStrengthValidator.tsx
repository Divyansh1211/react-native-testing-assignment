// PasswordStrengthValidator.js
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

const commonPatterns = ["123456", "password", "qwerty", "letmein", "abc123"];

type CriteriaKeys =
  | "length"
  | "uppercase"
  | "lowercase"
  | "numbers"
  | "specialChars"
  | "noRepeatedChars"
  | "noCommonPatterns";

type StrengthCriteria = {
  [key in CriteriaKeys]: boolean;
};

export interface PasswordStrength {
  level: "Weak" | "Medium" | "Strong";
  score: number;
  maxScore: number;
  criteria: StrengthCriteria;
  feedback: string[];
}

interface PasswordStrengthValidatorProps {
  onStrengthChange?: (strength: PasswordStrength) => void;
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  preventRepeatedChars?: boolean;
  preventCommonPatterns?: boolean;
}

const PasswordStrengthValidator: React.FC<PasswordStrengthValidatorProps> = ({
  onStrengthChange,
  minLength = 8,
  requireUppercase = true,
  requireLowercase = true,
  requireNumbers = true,
  requireSpecialChars = true,
  preventRepeatedChars = true,
  preventCommonPatterns = true,
}) => {
  const [password, setPassword] = useState<string>("");
  const [strength, setStrength] = useState<PasswordStrength>({
    level: "Weak",
    score: 0,
    maxScore: 7,
    criteria: {
      length: false,
      uppercase: false,
      lowercase: false,
      numbers: false,
      specialChars: false,
      noRepeatedChars: false,
      noCommonPatterns: false,
    },
    feedback: [],
  });

  // TODO: Implement evaluatePassword function to check all criteria
  const evaluatePassword = (pwd: string): PasswordStrength => {
    const criteria = {
      length: pwd.length >= minLength,
      uppercase: !requireUppercase || /[A-Z]/.test(pwd),
      lowercase: !requireLowercase || /[a-z]/.test(pwd),
      numbers: !requireNumbers || /\d/.test(pwd),
      specialChars: !requireSpecialChars || /[^A-Za-z0-9]/.test(pwd),
      noRepeatedChars: !preventRepeatedChars || !/(.)\1{2,}/.test(pwd), // no 3+ repeated chars
      noCommonPatterns:
        !preventCommonPatterns ||
        !commonPatterns.some((pattern) => pwd.toLowerCase().includes(pattern)),
    };

    const feedback = [];
    if (!criteria.length)
      feedback.push(`Should be at least ${minLength} characters`);
    if (!criteria.uppercase) feedback.push("Include uppercase letters");
    if (!criteria.lowercase) feedback.push("Include lowercase letters");
    if (!criteria.numbers) feedback.push("Include numbers");
    if (!criteria.specialChars) feedback.push("Include special characters");
    if (!criteria.noRepeatedChars) feedback.push("Avoid repeated characters");
    if (!criteria.noCommonPatterns) feedback.push("Avoid common patterns");

    const passedCount = Object.values(criteria).filter(Boolean).length;
     let level: PasswordStrength["level"] = "Weak";
    if (passedCount >= 6) level = "Strong";
    else if (passedCount >= 4) level = "Medium";

    return {
      level,
      score: passedCount,
      maxScore: 7,
      criteria,
      feedback,
    };
  };

  const getReadableCriteria = (key: CriteriaKeys) => {
    const map: Record<CriteriaKeys, string> = {
      length: "Minimum length",
      uppercase: "Contains uppercase",
      lowercase: "Contains lowercase",
      numbers: "Contains numbers",
      specialChars: "Contains special characters",
      noRepeatedChars: "No repeated characters",
      noCommonPatterns: "No common patterns",
    };
    return map[key] || key;
  };

  // TODO: Implement useEffect hook to update strength whenever password changes
  useEffect(() => {
    const result = evaluatePassword(password);
    setStrength(result);
    onStrengthChange?.(result);
  }, [password]);

  // TODO: Implement UI for password input and strength feedback
  return (
    <View style={styles.container}>
      {/* Component UI */}
      <Text style={styles.header}>Password Strength Validator</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={[styles.strengthText, styles[strength.level.toLowerCase()]]}>
        Strength: {strength.level}
      </Text>

      <View style={styles.criteriaList}>
        {Object.entries(strength.criteria).map(([key, met]) => (
          <Text
            key={key}
            style={[styles.criteriaText, met ? styles.met : styles.unmet]}
          >
            {met ? "✓" : "✗"} {getReadableCriteria(key)}
          </Text>
        ))}
      </View>

      {strength.feedback.length > 0 && (
        <View style={styles.feedbackBox}>
          <Text style={styles.feedbackHeader}>Suggestions:</Text>
          {strength.feedback.map((tip, idx) => (
            <Text key={idx} style={styles.feedbackText}>
              - {tip}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Component styles
  container: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 10,
    margin: 16,
  },
  header: {
    color: "white",
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#2c2c2c",
    color: "white",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  strengthText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  weak: { color: "red" },
  medium: { color: "orange" },
  strong: { color: "green" },
  criteriaList: {
    marginBottom: 10,
  },
  criteriaText: {
    fontSize: 14,
    marginBottom: 2,
  },
  met: {
    color: "lightgreen",
  },
  unmet: {
    color: "lightcoral",
  },
  feedbackBox: {
    marginTop: 10,
    backgroundColor: "#2a2a2a",
    padding: 10,
    borderRadius: 8,
  },
  feedbackHeader: {
    color: "#fff",
    marginBottom: 4,
    fontWeight: "600",
  },
  feedbackText: {
    color: "#ccc",
    fontSize: 13,
  },
});

export default PasswordStrengthValidator;
