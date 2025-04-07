// PasswordStrengthValidator.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  CriteriaKeys,
  PasswordStrength,
  PasswordStrengthValidatorProps,
} from "../types/Types";
import Icon from "react-native-vector-icons/Feather";

const commonPatterns = ["123456", "password", "qwerty", "letmein", "abc123"];

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
  const [secure, setSecure] = useState(true);
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
  });

  const toggleSecure = () => setSecure(!secure);

  // TODO: Implement evaluatePassword function to check all criteria
  const evaluatePassword = (pwd: string): PasswordStrength => {
    if (pwd.length < 3) {
      return {
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
      };
    }

    const criteria = {
      length: pwd.length >= minLength,
      uppercase: !requireUppercase || /[A-Z]/.test(pwd),
      lowercase: !requireLowercase || /[a-z]/.test(pwd),
      numbers: !requireNumbers || /\d/.test(pwd),
      specialChars: !requireSpecialChars || /[^A-Za-z0-9]/.test(pwd),
      noRepeatedChars: !preventRepeatedChars || !/(.)\1{2,}/gu.test(pwd),
      noCommonPatterns:
        !preventCommonPatterns ||
        !commonPatterns.some((pattern) => pwd.toLowerCase().includes(pattern)),
    };

    const passedCount = Object.values(criteria).filter(Boolean).length;
    let level: PasswordStrength["level"] = "Weak";
    if (passedCount >= 6) level = "Strong";
    else if (passedCount >= 4) level = "Medium";

    return {
      level,
      score: passedCount,
      maxScore: 7,
      criteria,
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
        return "#e74c3c";
      case "Medium":
        return "#f39c12";
      case "Strong":
        return "#2ecc71";
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
      <View>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secure}
        />
        <TouchableOpacity onPress={toggleSecure} style={styles.iconContainer}>
          <Icon name={secure ? "eye-off" : "eye"} size={20} color="#888" />
        </TouchableOpacity>
      </View>
      <View style={styles.strengthBarContainer}>
        <View style={styles.strengthBarBackground}>
          <View
            testID="strength-bar-fill"
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
      <View style={styles.bulletContainer}>
        <Text style={styles.bullet}>{"\u2022"}</Text>
        <Text style={styles.text}> Please enter a password</Text>
      </View>
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
  bulletContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
  },
  bullet: {
    color: "#B7B7B7",
    fontSize: 14,
    marginTop: 2,
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
  iconContainer: {
    position: "absolute",
    right: 10,
    top: 10,
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
  text: {
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
