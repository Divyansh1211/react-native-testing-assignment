export type CriteriaKeys =
  | "length"
  | "uppercase"
  | "lowercase"
  | "numbers"
  | "specialChars"
  | "noRepeatedChars"
  | "noCommonPatterns";

export type StrengthCriteria = {
  [key in CriteriaKeys]: boolean;
};

export interface PasswordStrength {
  level: "Weak" | "Medium" | "Strong";
  score: number;
  maxScore: number;
  criteria: StrengthCriteria;
}

export interface PasswordStrengthValidatorProps {
  onStrengthChange?: (strength: PasswordStrength) => void;
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  preventRepeatedChars?: boolean;
  preventCommonPatterns?: boolean;
}