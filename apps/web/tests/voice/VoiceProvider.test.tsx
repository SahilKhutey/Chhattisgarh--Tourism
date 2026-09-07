import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { VoiceProvider, useVoice } from '../../src/components/voice/VoiceProvider';
import { SpeakButton } from '../../src/components/voice/SpeakButton';

// Mock SpeechSynthesis
const mockSpeak = jest.fn();
const mockCancel = jest.fn();

class MockSpeechSynthesisUtterance {
  text: string;
  lang: string = 'en-US';
  rate: number = 1.0;
  pitch: number = 1.0;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

describe('VoiceProvider & Text-To-Speech (TTS)', () => {
  beforeAll(() => {
    (window as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
      },
      writable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should speak text with Indic voice tagging (hi-IN) for Chhattisgarhi and Hindi', () => {
    render(
      <VoiceProvider>
        <SpeakButton text="चित्रकोट झरना" langCode="hne" />
      </VoiceProvider>
    );

    const button = screen.getByRole('button', { name: /read aloud/i });
    act(() => {
      fireEvent.click(button);
    });

    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();
    const utterance = mockSpeak.mock.calls[0][0];
    expect(utterance.text).toBe('चित्रकोट झरना');
    expect(utterance.lang).toBe('hi-IN');
  });

  it('should speak text with Indian English tagging (en-IN) for English', () => {
    render(
      <VoiceProvider>
        <SpeakButton text="Welcome to Bastar" langCode="en" />
      </VoiceProvider>
    );

    const button = screen.getByRole('button', { name: /read aloud/i });
    act(() => {
      fireEvent.click(button);
    });

    const utterance = mockSpeak.mock.calls[0][0];
    expect(utterance.text).toBe('Welcome to Bastar');
    expect(utterance.lang).toBe('en-IN');
  });

  it('should stop speech synthesis when cancel/stop is called', () => {
    const TestComponent = () => {
      const { speak, stop } = useVoice();
      return (
        <div>
          <button onClick={() => speak('Test message')}>Speak</button>
          <button onClick={stop}>Stop</button>
        </div>
      );
    };

    render(
      <VoiceProvider>
        <TestComponent />
      </VoiceProvider>
    );

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Speak' }));
    });
    expect(mockSpeak).toHaveBeenCalled();

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    });
    expect(mockCancel).toHaveBeenCalled();
  });
});
