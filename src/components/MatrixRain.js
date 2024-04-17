import React, { useRef, useEffect, useState } from "react";
import './MatrixRain.css'; // Ensure you have this CSS file for styling

const renderMatrix = (ref, color) => {
    let canvas = ref.current;
    let context = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const katakana =
        "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン";
    const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nums = "0123456789";
    const alphabet = katakana + latin + nums;

    const fontSize = 28;
    const columns = canvas.width / fontSize;

    const rainDrops = [];

    for (let x = 0; x < columns; x++) {
        rainDrops[x] = 0.3;
    }

    const render = () => {
        context.fillStyle = "rgba(0, 0, 0, 0.05)"; // black w a tiny bit of alpha
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = color ? color : "#ff652f";
        context.font = fontSize + "px Press Start 2P";

        for (let i = 0; i < rainDrops.length; i++) {
            // randomize the string of characters to render
            const text = alphabet.charAt(
                Math.floor(Math.random() * alphabet.length)
            );
            context.fillText(text, i * fontSize, rainDrops[i] * fontSize);

            if (
                rainDrops[i] * fontSize > canvas.height &&
                Math.random() > 0.9
            ) {
                rainDrops[i] = 0;
            }
            rainDrops[i]++;
        }
    };
    return render;
};

const MatrixRainingLetters = ({ showSuccessMessage }) => {
    const ref = useRef();
    const [popOutScale, setPopOutScale] = useState(1);
  
    useEffect(() => {
      const render = renderMatrix(ref);
      const intervalId = setInterval(render, 60);
  
      if (showSuccessMessage) {
        setPopOutScale(1.5); // Initial scale
        return () => clearInterval(intervalId);
      }
  
      return () => clearInterval(intervalId);
    }, [showSuccessMessage]);

    return (
        <>
          {showSuccessMessage && (
            <div className="success-message-container" style={{ opacity: 1, transform: `scale(${popOutScale})` }}>
              <div className="success-message-overlay"></div>
              <div className="success-message">Transaction Successful!</div>
            </div>
          )}
          <div className="matrix-rain-container">
            <canvas className="matrix-rain-overlay" ref={ref} />
          </div>
        </>
      );
    };
    
    export default MatrixRainingLetters;