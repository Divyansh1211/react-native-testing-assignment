import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import PasswordStrengthValidator from "../PassWordStrengthValidator";
import { PasswordStrength } from "../../types/Types";

const renderWithProps = (props = {}) => {
  const mockFn = jest.fn();
  const utils = render(
    <PasswordStrengthValidator onStrengthChange={mockFn} {...props} />
  );
  return { ...utils, mockFn };
};

describe("PasswordStrengthValidator - Full Suite", () => {
  it("matches snapshot", () => {
    const tree = renderWithProps().toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("initial state is weak", () => {
    const { getByText } = renderWithProps();
    expect(getByText("Strength: Weak")).toBeTruthy();
  });

  it("updates strength when password changes", () => {
    const { getByPlaceholderText, getByText } = renderWithProps();
    fireEvent.changeText(getByPlaceholderText("Enter password"), "Test123!");
    expect(getByText(/Strength:/)).toBeTruthy();
  });

  it("calls onStrengthChange with correct values", () => {
    const { getByPlaceholderText, mockFn } = renderWithProps();
    fireEvent.changeText(getByPlaceholderText("Enter password"), "Test123!");

    expect(mockFn).toHaveBeenCalled();
    const result: PasswordStrength = mockFn.mock.calls[1][0];
    expect(result).toHaveProperty("level");
    expect(result).toHaveProperty("score");
  });

  it("displays correct bar width and color for strong password", () => {
    const { getByPlaceholderText, getByTestId, getByText } = renderWithProps();
    fireEvent.changeText(getByPlaceholderText("Enter password"), "Abc123!@#");

    const bar = getByTestId("strength-bar-fill");
    const strengthLabel = getByText("Strength: Strong");

    expect(strengthLabel).toBeTruthy();
    expect(bar.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: expect.any(String),
          width: expect.stringMatching(/%/),
        }),
      ])
    );
  });

  it("does not require uppercase when requireUppercase = false", () => {
    const { getByPlaceholderText, mockFn } = renderWithProps({
      requireUppercase: false,
    });

    fireEvent.changeText(
      getByPlaceholderText("Enter password"),
      "lowercase123!"
    );

    expect(mockFn).toHaveBeenCalled(); // 💡 Make sure it actually got called

    const result: PasswordStrength = mockFn.mock.calls[1][0];

    expect(result.criteria.uppercase).toBe(true); // ✅ Satisfied because we turned off the requirement
    expect(result.score).toBeGreaterThanOrEqual(1); // ✅ Should have at least some score
  });

  it("handles empty password", () => {
    const { getByPlaceholderText, mockFn } = renderWithProps();
    fireEvent.changeText(getByPlaceholderText("Enter password"), "");

    const result: PasswordStrength = mockFn.mock.calls[0][0];
    expect(result.level).toBe("Weak");
    expect(result.score).toBe(0);
  });

  it("handles very long strong password", () => {
    const longPassword = "A1!a".repeat(30);
    const { getByPlaceholderText, mockFn } = renderWithProps();

    fireEvent.changeText(getByPlaceholderText("Enter password"), longPassword);
    const result: PasswordStrength = mockFn.mock.calls[1][0];

    expect(result.level).toBe("Strong");
    expect(result.score).toBe(result.maxScore);
  });

  it("handles passwords with emojis", () => {
    const password = "Abc123😊😊😊😊";
    const { getByPlaceholderText, mockFn } = renderWithProps();

    fireEvent.changeText(getByPlaceholderText("Enter password"), password);
    const result: PasswordStrength = mockFn.mock.calls[1][0];

    expect(result.criteria.specialChars).toBe(true);
    expect(result.criteria.noRepeatedChars).toBe(false); // emojis are repeated
  });

  it("renders UI at each strength level", () => {
    const { getByPlaceholderText, getByText } = renderWithProps();
    const input = getByPlaceholderText("Enter password");

    const samples = {
      weak: "abc",
      medium: "Abc123",
      strong: "Abc123!@#",
    };

    fireEvent.changeText(input, samples.weak);
    expect(getByText("Strength: Weak")).toBeTruthy();

    fireEvent.changeText(input, samples.medium);
    expect(getByText("Strength: Medium")).toBeTruthy();

    fireEvent.changeText(input, samples.strong);
    expect(getByText("Strength: Strong")).toBeTruthy();
  });

  it("resets state properly if password is cleared", () => {
    const { getByPlaceholderText, getByText, mockFn } = renderWithProps();
    const input = getByPlaceholderText("Enter password");

    fireEvent.changeText(input, "Abc123!@#");
    fireEvent.changeText(input, "");

    expect(getByText("Strength: Weak")).toBeTruthy();
    const result: PasswordStrength =
      mockFn.mock.calls[mockFn.mock.calls.length - 1][0];
    expect(result.score).toBe(0);
  });
});
