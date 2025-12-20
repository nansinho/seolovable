import { useState, useEffect } from "react";

interface TypingTextProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}

export const TypingText = ({ text, className = "", speed = 50, delay = 0 }: TypingTextProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span className={className}>
      {displayedText}
      <span className={`${showCursor ? "opacity-100" : "opacity-0"} text-primary transition-opacity`}>
        _
      </span>
    </span>
  );
};

export default TypingText;