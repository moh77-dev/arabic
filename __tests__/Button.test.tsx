import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders its label', () => {
    const { getByText } = render(<Button label="Continue" onPress={() => {}} />);
    expect(getByText('Continue')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Continue" onPress={onPress} />);
    fireEvent.press(getByText('Continue'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { queryByText } = render(<Button label="Continue" onPress={onPress} disabled />);
    const label = queryByText('Continue');
    if (label) fireEvent.press(label);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows a loading indicator instead of the label while loading', () => {
    const { queryByText } = render(<Button label="Continue" onPress={() => {}} loading />);
    expect(queryByText('Continue')).toBeNull();
  });
});
