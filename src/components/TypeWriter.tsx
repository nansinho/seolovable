import { useEffect, useState } from "react";

interface TypeWriterProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenWords?: number;
  className?: string;
}

export const TypeWriter = ({
  words,
  typingSpeed = 100,
  deletingSpeed = 50,
  delayBetweenWords = 2000,
  className = "",
}: TypeWriterProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    const currentWord = words[currentWordIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentText.length < currentWord.length) {
            setCurrentText(currentWord.slice(0, currentText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), delayBetweenWords);
          }
        } else {
          if (currentText.length > 0) {
            setCurrentText(currentText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentWordIndex((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, delayBetweenWords]);

  // Calculate the longest word to reserve space
  const longestWord = words.reduce((a, b) => (a.length > b.length ? a : b), "");

  return (
    <span className={`${className} inline-block`} style={{ minWidth: `${longestWord.length}ch` }}>
      {currentText}
      <span 
        className={`inline-block w-[3px] h-[0.9em] bg-current ml-1 align-middle transition-opacity ${
          showCursor ? "opacity-100" : "opacity-0"
        }`}
      />
    </span>
  );
};

export default TypeWriter;
