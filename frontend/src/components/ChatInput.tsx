export const ChatInput = ({
    inputValue, setInputValue, handleSubmit, isLoading, onboardingStage
  }: {
    inputValue: string,
    setInputValue: (val: string) => void,
    handleSubmit: (e: React.FormEvent) => void,
    isLoading: boolean,
    onboardingStage: string
  }) => (
    <form className="input-area" onSubmit={handleSubmit}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={onboardingStage === "welcome" ? "Type 'yes' to get started..." : "Type your message in Japanese or English..."}
        className="message-input"
        disabled={isLoading}
      />
      <button type="submit" className="send-button" disabled={isLoading || inputValue.trim() === ""}>Send</button>
    </form>
  );
  