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
    if(pwd.length < 3) return {
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
    }
    const criteria = {
      length: pwd.length >= minLength,
      uppercase: !requireUppercase || /[A-Z]/.test(pwd),
      lowercase: !requireLowercase || /[a-z]/.test(pwd),
      numbers: !requireNumbers || /\d/.test(pwd),
      specialChars: !requireSpecialChars || /[^A-Za-z0-9]/.test(pwd),
      noRepeatedChars: !preventRepeatedChars || !/(.)\1{2,}/.test(pwd),
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
      length: `Minimum length (${minLength})`,
      uppercase: "Contains uppercase",
      lowercase: "Contains lowercase",
      numbers: "Contains numbers",
      specialChars: "Contains special characters",
      noRepeatedChars: "No repeated characters",
      noCommonPatterns: "No common patterns",
    };
    return map[key] || key;
  };

  const getStrengthColor = (level: "Weak" | "Medium" | "Strong") => {
    switch (level) {
      case "Weak":
        return "#e74c3c"; // red
      case "Medium":
        return "#f39c12"; // orange
      case "Strong":
        return "#2ecc71"; // green
      default:
        return "#aaa";
    }
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
      <Text style={styles.header}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.strengthBarContainer}>
        <View style={styles.strengthBarBackground}>
          <View
            style={[
              styles.strengthBarFill,
              {
                width: `${(strength.score / strength.maxScore) * 100}%`,
                backgroundColor: getStrengthColor(strength.level),
              },
            ]}
          />
        </View>
        <Text
          style={[
            styles.strengthLabel,
            { color: getStrengthColor(strength.level) },
          ]}
        >
          Strength: {strength.level}
        </Text>
      </View>
      <Text style={styles.feedbackText}>. Please enter a password</Text>
      <View style={styles.criteriaList}>
        {Object.entries(strength.criteria).map(([key, met]) => (
          <Text
            key={key}
            style={[styles.criteriaText, met ? styles.met : styles.unmet]}
          >
            {met ? "✓" : "✗"} {getReadableCriteria(key as CriteriaKeys)}
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
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    margin: 16,
  },
  header: {
    color: "black",
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "white",
    color: "black",
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "grey",
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
    marginVertical: 10,
  },
  criteriaText: {
    fontSize: 14,
    marginBottom: 2,
  },
  met: {
    color: "green",
  },
  unmet: {
    color: "red",
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
    color: "#B7B7B7",
    fontSize: 13,
  },
  strengthBarContainer: {
    marginVertical: 10,
  },
  strengthBarBackground: {
    height: 8,
    backgroundColor: "#ddd",
    borderRadius: 4,
    overflow: "hidden",
  },
  strengthBarFill: {
    height: 8,
    borderRadius: 4,
  },
  strengthLabel: {
    marginTop: 4,
    fontWeight: "bold",
  },
});

export default PasswordStrengthValidator;
